/* eslint-disable jsx-a11y/media-has-caption */
import React, { ReactElement, useEffect, useRef } from 'react';

import 'video.js/dist/video-js.css';
import videojs from 'video.js';

import 'webrtc-adapter';
import RecordRTC from 'recordrtc';

import 'videojs-record/dist/css/videojs.record.css';
import 'videojs-record/dist/videojs.record.js';

interface VideoJsAudioVideoScreenRecordingProp {
    onCancel(): void;
}

export default function VideoJsAudioVideoScreenRecording(props: VideoJsAudioVideoScreenRecordingProp): ReactElement {
    const videoNode = useRef<HTMLVideoElement>(null);
    let player: any;

    const videoJsOptions = {
        controls: true,
        width: 800,
        height: 450,
        fluid: false,
        bigPlayButton: false,
        controlBar: {
            volumePanel: false,
            fullscreenToggle: false,
        },
        plugins: {
            record: {
                audio: true,
                screen: true,
                video: true,
                debug: true,
                displayMilliseconds: true,
            },
        },
    };

    useEffect(() => {
        if (videoNode && videoNode.current) {
            console.log('VideoNode', videoNode);
            // instantiate Video.js
            player = videojs(videoNode.current, videoJsOptions, () => {
                // print version information at startup
                const version_info =
                    'Using video.js ' +
                    videojs.VERSION +
                    ' with videojs-record ' +
                    videojs.getPluginVersion('record') +
                    ' and recordrtc ' +
                    RecordRTC.version;
                videojs.log(version_info);
            });

            // device is ready
            player.on('deviceReady', () => {
                console.log('device is ready!');
            });

            // user clicked the record button and started recording
            player.on('startRecord', () => {
                console.log('started recording!');
            });

            // user completed recording and stream is available
            player.on('finishRecord', () => {
                // recordedData is a blob object containing the recorded data that
                // can be downloaded by the user, stored on server etc.
                console.log('finished recording: ', player.recordedData);
            });

            // error handling
            player.on('error', (element: any, error: any) => {
                console.warn(error);
            });

            player.on('deviceError', () => {
                console.error('device error:', player.deviceErrorCode);
            });

            return () => player.dispose();
        }
    }, [videoNode]);

    return (
        <div>
            Hello!
            <div data-vjs-player>
                <video id="myVideo" ref={videoNode} className="video-js vjs-default-skin" playsInline></video>
            </div>
        </div>
    );
}
