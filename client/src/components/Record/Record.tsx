import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';

interface RecordProp {
    onRecordingCompleted(video: Blob): void;
    onCancel(): void;
}

export default function Record(prop: RecordProp): ReactElement {
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setMediaStream] = useState<MediaStream | null>(null);
    const recorderElement = useRef<HTMLVideoElement>(null);
    let chunks: BlobPart[] = [];

    useEffect(() => {
        async function getStream(): Promise<void> {
            const temp = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: true,
            });

            setMediaStream(temp);
        }

        getStream();
    }, []);

    function startRecording(): void {
        if (!stream) {
            throw "This isn't possible!!";
        }

        console.log('Stream is rocking!');

        if (!recorderElement.current) throw 'Do I need to use an effect here?';
        const video: HTMLMediaElementWithCaptureStream =
            recorderElement.current as unknown as HTMLMediaElementWithCaptureStream;
        video.srcObject = stream;
        video.captureStream = video.captureStream || video.mozCaptureStream;

        const recorder = new MediaRecorder(stream, {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
        });
        recorder.ondataavailable = (ev): void => {
            chunks.push(ev.data);
        };
        recorder.start();
        recorder.onstop = function (this: MediaRecorder, ev: Event): any {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            console.log('RECORDER.ONSTOP', this, ev);
            const video = new Blob(chunks, { type: 'video/webm' });
            prop.onRecordingCompleted(video);
            chunks = [];
        };
        recorder.onerror = () => console.log('RECORDER.ONERROR');
    }

    function stopRecording(): void {
        if (stream) {
            stream.getTracks().forEach((track) => {
                console.log('TRACK', track);
                track.stop();
            });
        } else {
            throw 'No stream to stop!';
        }
    }

    function onStartRecording(): void {
        startRecording();
        setIsRecording(true);
    }

    function onStopRecording(): void {
        stopRecording();
        setIsRecording(false);
    }

    function onCancel(): void {
        stopRecording();
        setIsRecording(true);
        prop.onCancel(); // TODO Do we need to cleanup and chunks here?
    }

    return (
        <div className="recording-container">
            <div>
                <video id="recorder" width="960" height="540" autoPlay muted ref={recorderElement}></video>
            </div>
            <div>
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                {!isRecording && <Button label="Start Recording" variant="primary" onClick={onStartRecording} />}
                {isRecording && <Button label="Stop Recording" variant="primary" onClick={onStopRecording} />}
            </div>
        </div>
    );
}

/**
 * TypeScript interface doesn't yet support the capture stream methods, so we interface them out here
 */
interface HTMLMediaElementWithCaptureStream extends HTMLMediaElement {
    captureStream(): MediaStream;
    mozCaptureStream(): MediaStream;
}
