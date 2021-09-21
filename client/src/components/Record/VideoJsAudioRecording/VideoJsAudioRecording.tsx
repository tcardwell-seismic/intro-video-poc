/* eslint-disable jsx-a11y/media-has-caption */
import React, { ReactElement, useEffect, useRef } from 'react';

import 'video.js/dist/video-js.css';
import videojs from 'video.js';

import 'webrtc-adapter';
import RecordRTC from 'recordrtc';

import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
WaveSurfer.microphone = MicrophonePlugin;

// Register videojs-wavesurfer plugin
import 'videojs-wavesurfer/dist/css/videojs.wavesurfer.css';
import 'videojs-wavesurfer/dist/videojs.wavesurfer.js';

import 'videojs-record/dist/css/videojs.record.css';
import 'videojs-record/dist/videojs.record.js';

interface VideoJsAudioRecordingProp {
    onCancel(): void;
}

export default function VideoJsAudioRecording(props: VideoJsAudioRecordingProp): ReactElement {
    const audioNode = useRef<HTMLAudioElement>(null);
    let player: any;

    const videoJsOptions = {
        controls: true,
        bigPlayButton: false,
        width: 600,
        height: 300,
        fluid: false,
        plugins: {
            wavesurfer: {
                backend: 'WebAudio',
                waveColor: '#36393b',
                progressColor: 'black',
                displayMilliseconds: true,
                debug: true,
                cursorWidth: 1,
                hideScrollbar: true,
                plugins: [
                    // enable microphone plugin
                    WaveSurfer.microphone.create({
                        bufferSize: 4096,
                        numberOfInputChannels: 1,
                        numberOfOutputChannels: 1,
                        constraints: {
                            video: false,
                            audio: true,
                        },
                    }),
                ],
            },
            record: {
                audio: true,
                video: false,
                maxLength: 20,
                displayMilliseconds: true,
                debug: true,
            },
        },
    };

    useEffect(() => {
        if (audioNode && audioNode.current) {
            console.log('VideoNode', audioNode);
            // instantiate Video.js
            player = videojs(audioNode.current, videoJsOptions, () => {
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
    }, [audioNode]);

    return (
        <div>
            Hello!
            <div data-vjs-player>
                <audio id="myAudio" ref={audioNode} className="video-js vjs-default-skin"></audio>
            </div>
        </div>
    );
}
