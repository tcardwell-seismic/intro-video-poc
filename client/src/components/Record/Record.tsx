/* eslint-disable jsx-a11y/alt-text */
import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import useCountDown from 'react-countdown-hook';
import { Recorder } from '../../models/Recorder';
//import '@tensorflow/tfjs-backend-webgl';
//import { load, BodyPix, drawBokehEffect, toMask, drawMask } from '@tensorflow-models/body-pix';
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
    const videoElement = useRef<HTMLVideoElement>(null);
    const canvasElement = useRef<HTMLCanvasElement>(null);
    const imageElement = useRef<HTMLImageElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [useCountdownInitialized, setUseCountdownInitialized] = useState(false);
    const [timeLeft, { start }] = useCountDown(3000, 1000);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [recorder] = useState<Recorder>(
        new Recorder(prop.audioDeviceId || 'Default', prop.videoDeviceId || 'Default', 'video/webm'),
    ); // TODO Not sure if we can use Default here
    //const [net, setNet] = useState<BodyPix>();

    if (!prop.audioDeviceId || !prop.videoDeviceId) {
        throw 'Need to specify Audio and Video devices';
    }

    // useEffect(() => {
    //     async function loadBodyPix() {
    //         const result = await load();
    //         setNet(result);
    //     }

    //     loadBodyPix();
    // }, []);

    useEffect(() => {
        //     async function blurBackground() {
        //         if (
        //             canvasElement &&
        //             canvasElement.current &&
        //             imageElement &&
        //             imageElement.current &&
        //             videoElement &&
        //             videoElement.current &&
        //             net
        //         ) {
        //             while (true) {
        //                 const segmentation = await net.segmentPerson(videoElement.current);

        //                 const backgroundBlurAmount = 0;
        //                 const edgeBlurAmount = 0;
        //                 const flipHorizontal = false;

        //                 drawBokehEffect(
        //                     canvasElement.current,
        //                     imageElement.current,
        //                     segmentation,
        //                     backgroundBlurAmount,
        //                     edgeBlurAmount,
        //                     flipHorizontal,
        //                 );
        //             }
        //         }
        //     }

        //     // I couldn't get this to quite work, but it should be possible:
        //     // https://towardsdatascience.com/virtual-background-in-webcam-with-body-segmentation-technique-fc8106ca3038
        //     async function customBackground() {
        //         if (
        //             canvasElement &&
        //             canvasElement.current &&
        //             imageElement &&
        //             imageElement.current &&
        //             videoElement &&
        //             videoElement.current &&
        //             net
        //         ) {
        //             while (true) {
        //                 const segmentation = await net.segmentPerson(videoElement.current);

        //                 const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
        //                 const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
        //                 const backgroundDarkeningMask = toMask(segmentation, foregroundColor, backgroundColor);

        //                 const opacity = 0.7;
        //                 const maskBlurAmount = 3;
        //                 const flipHorizontal = false;
        //                 drawMask(
        //                     canvasElement.current,
        //                     videoElement.current,
        //                     backgroundDarkeningMask,
        //                     opacity,
        //                     maskBlurAmount,
        //                     flipHorizontal,
        //                 );
        //             }
        //         }
        //     }

        if (mediaStream && videoElement.current) {
            const video: HTMLMediaElementWithCaptureStream =
                videoElement.current as unknown as HTMLMediaElementWithCaptureStream;
            video.srcObject = mediaStream;
            video.captureStream = video.captureStream || video.mozCaptureStream;
            //video.onloadeddata = async () => blurBackground();
        }
    }, [mediaStream, videoElement, imageElement, canvasElement]);

    useEffect(() => {
        async function initRecorder() {
            recorder.onComplete = (video: Blob) => {
                prop.onRecordingCompleted(video);
            };
            const ms = await recorder.initializeRecorder();
            console.log('Recorder after init', recorder);
            setMediaStream(ms);
            start();
        }

        initRecorder();
    }, [recorder]);

    useEffect(() => {
        if (mediaStream) {
            if (timeLeft === 0) {
                if (!useCountdownInitialized) {
                    setUseCountdownInitialized(true);
                } else {
                    setIsRecording(true);
                    recorder.startRecording();
                    console.log('Recorder after start', recorder);
                }
            }
        }
    }, [mediaStream, timeLeft, useCountdownInitialized]);

    function onStopRecording(): void {
        setIsRecording(false);
        recorder.stopRecording();
    }

    function onCancel(): void {
        setIsRecording(false);
        recorder.stopRecording();
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
                <video id="video" width="960" height="540" autoPlay muted ref={videoElement}></video>

                {/* Canvas here is for supporting effects, like background blur */}
                <canvas id="canvas" width="960" height="540" ref={canvasElement} style={{ display: 'none' }} />

                {/* Image here is for testing virtual background */}
                <img
                    src="https://t3.ftcdn.net/jpg/02/98/94/38/360_F_298943877_A4W7tVyZPCu6gNGuGXJUerZbXsWmblLb.jpg"
                    ref={imageElement}
                    style={{ display: 'none' }}
                />
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
