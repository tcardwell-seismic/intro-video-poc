import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import './Record.scss';

interface RecordProp {
    mediaStream: MediaStream | null;
    onRecordingCompleted(video: Blob): void;
    onCancel(): void;
}

export default function Record(prop: RecordProp): ReactElement {
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState<number>(3);
    const recorderElement = useRef<HTMLVideoElement>(null);
    let chunks: BlobPart[] = [];
    let interval: NodeJS.Timer;

    useEffect(() => {
        interval = setInterval(() => {
            setCountdown((curr) => {
                const newValue = curr - 1;
                if (newValue == 0) {
                    clearInterval(interval);
                    startRecording();
                }

                return newValue;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (recorderElement && recorderElement.current) {
            recorderElement.current.srcObject = prop.mediaStream;
        }
    }, [recorderElement]);

    function startRecording(): void {
        setIsRecording(true);
        if (!prop.mediaStream) {
            throw "This isn't possible!!";
        }

        const video: HTMLMediaElementWithCaptureStream =
            recorderElement.current as unknown as HTMLMediaElementWithCaptureStream;
        video.srcObject = prop.mediaStream;
        video.captureStream = video.captureStream || video.mozCaptureStream;

        const recorder = new MediaRecorder(prop.mediaStream, {
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
        setIsRecording(false);
        if (prop.mediaStream) {
            prop.mediaStream.getTracks().forEach((track) => {
                track.stop();
            });
        } else {
            throw 'No stream to stop!';
        }
    }

    function onStopRecording(): void {
        stopRecording();
    }

    function onCancel(): void {
        stopRecording();
        chunks = [];
        prop.onCancel();
    }

    return (
        <div className="recording-container">
            <div className="content">
                {countdown > 0 && (
                    <div>
                        <div className="grey-background"></div>
                        <div className="countdown">{countdown}</div>
                    </div>
                )}
                <video id="recorder" width="960" height="540" autoPlay muted ref={recorderElement}></video>
            </div>
            <div className="footer">
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                &nbsp;
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
