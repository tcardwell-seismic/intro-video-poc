import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import useCountDown from 'react-countdown-hook';
import * as utilityFunction from 'fix-webm-duration';
import './Record.scss';

interface RecordProp {
    audioDeviceId: string | undefined;
    videoDeviceId: string | undefined;
    includeScreen: boolean;
    webSocket: WebSocket | null;
    onRecordingCompleted(video: Blob): void;
    onCancel(): void;
}

export default function Record(prop: RecordProp): ReactElement {
    const [isRecording, setIsRecording] = useState(false);
    const [useCountdownInitialized, setUseCountdownInitialized] = useState(false);
    const [timeLeft, { start }] = useCountDown(3000, 1000);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recorderElement = useRef<HTMLVideoElement>(null);
    let chunks: BlobPart[] = [];

    useEffect(() => {
        async function getAudioVideoStream() {
            const ms = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: prop.videoDeviceId },
                audio: { deviceId: prop.audioDeviceId },
            });

            setMediaStream(ms);
            start();
        }

        async function getAudioVideoScreenStream() {
            const ms = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            setMediaStream(ms);
            start();
        }

        prop.includeScreen ? getAudioVideoScreenStream() : getAudioVideoStream();
    }, []);

    useEffect(() => {
        if (mediaStream) {
            if (timeLeft === 0) {
                if (!useCountdownInitialized) setUseCountdownInitialized(true);
                else startRecording();
            }
        }
    }, [mediaStream, timeLeft, useCountdownInitialized]);

    useEffect(() => {
        if (recorderElement && recorderElement.current && mediaStream) {
            recorderElement.current.srcObject = mediaStream;
        }
    }, [recorderElement, mediaStream]);

    function startRecording(): void {
        const startTime = performance.now();
        if (!mediaStream || !mediaStream.active) {
            console.error('Media stream is either null or closed', mediaStream);
            throw "This isn't possible!!";
        }

        const video: HTMLMediaElementWithCaptureStream =
            recorderElement.current as unknown as HTMLMediaElementWithCaptureStream;
        video.srcObject = mediaStream;
        video.captureStream = video.captureStream || video.mozCaptureStream;

        const options: MediaRecorderOptions = {
            mimeType: 'video/webm',
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
        };
        const recorder = new MediaRecorder(mediaStream, options);
        recorder.ondataavailable = (ev): void => {
            console.log('RECORDER.ONDATAAVAILABLE');
            chunks.push(ev.data);
            if (prop.webSocket) {
                prop.webSocket.send(ev.data);
            }
        };
        recorder.onstop = () => {
            console.log('RECORDER.ONSTOP');

            if (prop.webSocket) {
                prop.webSocket.send('Complete');
            }

            const video = new Blob(chunks, { type: 'video/webm' });
            // https://bugs.chromium.org/p/chromium/issues/detail?id=642012
            // https://stackoverflow.com/questions/63640361/how-to-add-duration-to-metadata-of-files-recorder-by-mediarecorder
            // Blob here does not include duration - here is a possible fix
            // https://github.com/yusitnikov/fix-webm-duration
            console.log('UtilityFunction', utilityFunction);
            if (false) {
                const duration = performance.now() - startTime;
                console.log('Running utility function', duration);
                utilityFunction(video, duration, () => {
                    chunks = [];
                    prop.onRecordingCompleted(video);
                });
            } else {
                chunks = [];
                prop.onRecordingCompleted(video);
            }
        };
        recorder.onerror = () => console.log('RECORDER.ONERROR');
        recorder.onpause = () => console.log('RECORDER.ONPAUSE');
        recorder.onresume = () => console.log('RECORDER.ONRESUME');
        recorder.onstart = () => console.log('RECORDER.ONSTART');
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
    }

    function stopRecording(): void {
        setIsRecording(false);
        if (mediaRecorder) {
            mediaRecorder.stop();
        }

        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => {
                console.log('Stopping tracks!');
                track.stop();
            });
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
                {timeLeft > 0 && (
                    <div>
                        <div className="grey-background"></div>
                        <div className="countdown">{timeLeft / 1000}</div>
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
