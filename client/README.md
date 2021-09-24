Recording Libraries:
https://recordrtc.org/
https://collab-project.github.io/videojs-record/#/install
https://github.com/0x006F/react-media-recorder

Video Editors:
https://npm.io/package/vidar
https://github.com/clabe45/vidar/wiki/Custom-Effects#hello-world

# Record
## Demo
- Existing JavaScript libraries ([videojs-record](https://github.com/collab-project/videojs-record) and [RecordRTC](https://github.com/muaz-khan/RecordRTC)) vs the [Media Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API)
- Supports the following recording types:
  - Audio only
  - Audio and Video
  - Audio and Screen
- Countdown timer
## Further Discussion
- Custom vs 3rd Party Libraries (i.e. Loom, Hippo, VidYard, etc...)
- Audio, Video, and Screen recording
- Browser and device limitations
  - [Media Recorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
  - [Media Stream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
  - [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
  - [getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)

### Supplementary Features
  - [Background blur](https://vinooniv.github.io/video-bg-blur/)
  - Custom backgrounds
  - Highlight mouse clicks
  - Duration / stopwatch
  - Video scripts
  - [Supported resolutions / aspect ratio / framerate](https://www.webrtc-experiment.com/getDisplayMedia/)
  - Max length / size

### Unlikely Features
- Highlight mouse clicks
- On screen annotations (This is possible, but will require a lot of work)

---- 

# Preview, Edit, Upload
## Demo
- Preview in UP
- Save / Redo
- Trim / Gif / Thumbnail / MP4 Conversion
- Immediately available video (currently using WebSockets)

## Further Discussion
- Dynamic save locations (as opposed to always workspace/recordings)
- Supported encodings
- Max file size? [Possible answer](https://stackoverflow.com/questions/28307789/is-there-any-limitation-on-javascript-max-blob-size)

Video Editing will be tough. There doesn't seem to be many (if any at all) JavaScript libraries that support editing Blob data directly through the browser. I see two approaches we can take to solve this, both with their pros and cons:
1. Creating custom server side video processing that allows us to perform things like adding text, adding filters, trim, etc... (This seems to be what Loom does)
2. Simulate editing the video by drawing the video to an HTML Canvas, and writing 2D graphics to the canvas at specific time intervals (This seems to be what Hippo does)

### The Video Editing Experience
I think we should follow a user experience that separates the creation of a video from the editing of a video. See samples from other vendors - they have an editing experience that is disparate from the recording experience. From a technical standpoint, I believe that will be significantly easier to implement and maintain in the long run.

---- 

# Share
## Demo
- Add Recording button
- Gif / Thumbnail creation

## Further Discussion
Not much to demo for this stage. Given these videos are treated just like any other piece of content within Seismic, there should be very little effort to embed video content in our existing Share pipelines (Email Blast, Outlook, etc..). Services that aren't already will need to integrate with the Content Asset Service to retrieve the Thumbnail/Gif file. From there, they just embed the file.

---- 

# Playback
## Demo
- Add Recording button
- Gif / Thumbnail creation

## Further Discussion
Not much to demo for this stage. Given these videos are treated just like any other piece of content within Seismic, there should be very little effort to embed video content in our existing Share pipelines (Email Blast, Outlook, etc..). Services that aren't already will need to integrate with the Content Asset Service to retrieve the Thumbnail/Gif file. From there, they just embed the file.

---- 

# Analyse
## Demo
- UP Events

## Further Discussions
Will require teams that integrate with the recorder component to upload the correct data to disc

Azure Speech Services while streaming the blob to the server
