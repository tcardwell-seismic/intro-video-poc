using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xabe.FFmpeg;
using Xabe.FFmpeg.Downloader;

namespace server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StreamController : Controller
    {
        private static string _mp4Path;
        private static string _gifPath;
        private static string _imagePath;
        private static string _trimPath;

        public StreamController()
        {
            FFmpegDownloader.GetLatestVersion(FFmpegVersion.Official);
            FFmpeg.SetExecutablesPath(Directory.GetCurrentDirectory());
        }

        [HttpGet]
        [Route("mp4")]
        public IActionResult GetMp4Video()
        {
            var stream = new FileStream(_mp4Path, FileMode.Open, FileAccess.Read);
            return File(stream, "video/mp4");
        }

        [HttpGet]
        [Route("trim")]
        public IActionResult GetTrimmedVideo()
        {
            var stream = new FileStream(_trimPath, FileMode.Open, FileAccess.Read);
            return File(stream, "video/webm");
        }

        [HttpGet]
        [Route("thumbnail")]
        public IActionResult GetThumbnail()
        {
            var stream = new FileStream(_imagePath, FileMode.Open, FileAccess.Read);
            return File(stream, "image/png");
        }

        [HttpGet]
        [Route("gif")]
        public IActionResult GetGif()
        {
            var stream = new FileStream(_gifPath, FileMode.Open, FileAccess.Read);
            return File(stream, "image/gif");
        }

        [HttpGet]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

                Console.WriteLine("WebSocket opened");
                using var fileStream = HandleStartRecord();

                var offset = 0;
                var buffer = new byte[1024 * 4];
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                while (!result.CloseStatus.HasValue)
                {
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        await HandleFinishRecord(fileStream, webSocket);

                        Console.WriteLine("Closing WebSocket");
                        await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
                        break;
                    }
                    else
                    {
                        Console.WriteLine($"Offset: {offset}, Count: {result.Count}, BufferSize: {buffer.Length}");
                        await fileStream.WriteAsync(buffer, 0, result.Count);
                        offset += result.Count;
                    }

                    result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                }

                if (webSocket.State != WebSocketState.Closed)
                {
                    Console.WriteLine("This should be closed...");
                }
            }
            else
            {
                HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            }
        }

        private async Task Echo(HttpContext context, WebSocket webSocket)
        {
            var buffer = new byte[1024 * 40];
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            while (!result.CloseStatus.HasValue)
            {
                await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);

                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }
            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }

        private FileStream HandleStartRecord()
        {
            return new FileStream($"{Directory.GetCurrentDirectory()}/temp/video_{DateTime.UtcNow.ToFileTimeUtc()}.webm", FileMode.OpenOrCreate);
        }

        private async Task HandleFinishRecord(FileStream fileStream, WebSocket webSocket)
        {
            fileStream.Close();

            var tasks = new Task[] {
                CreateMp4Video(fileStream),
                CreateGif(fileStream),
                CreateThumbnail(fileStream),
                CreateTrimmedVideo(fileStream)
            };

            await Task.WhenAll(tasks);
        }

        private async Task CreateMp4Video(FileStream fileStream)
        {
            _mp4Path = $"{Path.GetTempPath()}/IntroPoc/mp4_{DateTime.UtcNow.ToFileTimeUtc()}.mp4";
            var conversion = await FFmpeg.Conversions.FromSnippet.ToMp4(fileStream.Name, _mp4Path);
            var sw = new Stopwatch();
            sw.Start();
            var result = await conversion.Start();
            sw.Stop();
            Console.WriteLine($"Took {sw.ElapsedMilliseconds}ms to convert to mp4");
        }

        private async Task CreateGif(FileStream fileStream)
        {
            _gifPath = $"{Path.GetTempPath()}/IntroPoc/gif_{DateTime.UtcNow.ToFileTimeUtc()}.gif";
            var conversion = await FFmpeg.Conversions.FromSnippet.ToGif(fileStream.Name, _gifPath, 1, 3);
            var sw = new Stopwatch();
            sw.Start();
            var result = await conversion.Start();
            sw.Stop();
            Console.WriteLine($"Took {sw.ElapsedMilliseconds}ms to create gif");
        }

        private async Task CreateThumbnail(FileStream fileStream)
        {
            _imagePath = $"{Path.GetTempPath()}/IntroPoc/thumbnail_{DateTime.UtcNow.ToFileTimeUtc()}.png";
            var conversion = await FFmpeg.Conversions.FromSnippet.Snapshot(fileStream.Name, _imagePath, TimeSpan.FromSeconds(0));
            var sw = new Stopwatch();
            sw.Start();
            var result = await conversion.Start();
            sw.Stop();
            Console.WriteLine($"Took {sw.ElapsedMilliseconds}ms to create thumbnail");
        }

        private async Task CreateTrimmedVideo(FileStream fileStream)
        {
            _trimPath = $"{Path.GetTempPath()}/IntroPoc/trim_{DateTime.UtcNow.ToFileTimeUtc()}.webm";
            var conversion = await FFmpeg.Conversions.FromSnippet.Split(fileStream.Name, _trimPath, TimeSpan.FromSeconds(0), TimeSpan.FromSeconds(1));
            var sw = new Stopwatch();
            sw.Start();
            var result = await conversion.Start();
            sw.Stop();
            Console.WriteLine($"Took {sw.ElapsedMilliseconds}ms to trim video");
        }
    }
}
