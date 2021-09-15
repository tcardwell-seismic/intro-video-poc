import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const data = [];
  const preview = useRef();
  const recording = useRef();

  const log = (msg) => console.log(msg);

  const [webSocket, setWebSocket] = useState(null);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/stream");
    ws.onopen = () => {
      console.log('connected');
    }

    ws.onmessage = evt => {
      console.log("server response", evt.data);
    }

    ws.onclose = () => {
      console.log('disconnected')
    }

    setWebSocket(ws);
    // if (!ws) {
    //   console.log("Creating socket connection!");
    //   setWebSocket(new WebSocket("ws://localhost:5000/stream"));
    // }
    // if (ws) {
    //   console.log("Configuring socket event handlers");
    //   ws.onopen = () => {
    //     console.log('connected');
    //   }

    //   ws.onmessage = evt => {
    //     console.log("server response", evt.data);
    //   }

    //   ws.onclose = () => {
    //     console.log('disconnected')
    //   }
    // }
  }, []);

  const wait = (delayInMS) => {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
  };

  const startRecording = (stream, lengthInMS) => {
    var options = {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000
    }
    let recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (event) => {
      data.push(event.data);
      webSocket.send(event.data);
    };

    recorder.start(1000);
    log(recorder.state + " for " + (lengthInMS / 1000) + " seconds...");

    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = () => {
        console.log("ON STOP");
        resolve();
        webSocket.close(1000, "Complete");
      };
      //recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
    });

    let recorded = wait(lengthInMS).then(
      () => recorder.state === "recording" && recorder.stop()
    );

    return Promise.all([
      stopped,
      recorded
    ])
      .then(() => data);
  };

  const stop = (stream) => {
    stream.getTracks().forEach(track => track.stop());
  };

  const handleStartClick = () => {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: true
    }).then(stream => {
      preview.current.srcObject = stream;
      //downloadButton.href = stream;
      preview.current.captureStream = preview.current.captureStream || preview.current.mozCaptureStream;
      return new Promise(resolve => preview.current.onplaying = resolve);
    }).then(() => startRecording(preview.current.captureStream(), 5000))
      .then(recordedChunks => {
        let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
        recording.current.src = URL.createObjectURL(recordedBlob);
        //downloadButton.href = recording.current.src;
        //downloadButton.download = "RecordedVideo.webm";

        log("Successfully recorded " + recordedBlob.size + " bytes of " +
          recordedBlob.type + " media.");
      })
      .catch(log);
  };

  const handleStopClick = (evt) => {
    stop(preview.current.srcObject);
  };

  return (
    <div className="App">
      <div className="left">
        <div>
          <h2>Preview</h2>
          <video id="preview" width="960" height="540" autoPlay muted ref={preview}></video>
        </div>
        <div>
          <button onClick={handleStartClick}>Start</button>
          <button onClick={handleStopClick}>Stop</button>
        </div>
      </div>
      <div className="right">
        <h2>Recording</h2>
        <video id="recording" width="960" height="540" controls ref={recording}></video>
      </div>
    </div>
  );
}

export default App;
