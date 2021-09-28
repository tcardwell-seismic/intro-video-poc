/* eslint-disable jsx-a11y/no-onchange */
import { Banner, Button, Spinner } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import './Setup.scss';

interface SetupProp {
    onSetupComplete(audioDeviceId: string | undefined, videoDeviceId: string | undefined): void;
    onCancel(): void;
}

export default function Setup(prop: SetupProp): ReactElement {
    const recorderElement = useRef<HTMLVideoElement>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [loadingDevices, setLoadingDevices] = useState<boolean>(true);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedAudioDevice, setSelectedAudioDevice] = useState<MediaDeviceInfo | null>(null);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<MediaDeviceInfo | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        navigator.mediaDevices.ondevicechange = function (e: Event): void {
            console.log('Device Changes!', e);
        };

        return () => console.log('Need to clean up on device change'); // (navigator.mediaDevices.ondevicechange = null);
    }, []);

    useEffect(() => {
        async function getMediaDevices() {
            const allDevices = await navigator.mediaDevices.enumerateDevices();

            let audioDevices = allDevices.filter((d) => d.kind === 'audioinput');
            audioDevices = audioDevices.filter((d, index) => {
                return (
                    index ===
                    audioDevices.findIndex((obj) => {
                        return obj.groupId === d.groupId;
                    })
                );
            });
            let videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
            videoDevices = videoDevices.filter((d, index) => {
                return (
                    index ===
                    videoDevices.findIndex((obj) => {
                        return obj.groupId === d.groupId;
                    })
                );
            });

            if (audioDevices.length > 0 && videoDevices.length > 0) {
                setAudioDevices(audioDevices);
                setVideoDevices(videoDevices);
                setSelectedAudioDevice(audioDevices[0]);
                setSelectedVideoDevice(videoDevices[0]);
            } else {
                setPermissionError('You are missing an audio or video device');
            }
        }

        getMediaDevices();
    }, []);

    useEffect(() => {
        if (!loadingDevices && mediaStream && recorderElement && recorderElement.current) {
            recorderElement.current.srcObject = mediaStream;
        }
    }, [mediaStream, recorderElement, loadingDevices]);

    useEffect(() => {
        async function getMediaStream() {
            try {
                releaseMediaStream();
                const ms = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: selectedVideoDevice?.deviceId },
                    audio: { deviceId: selectedAudioDevice?.deviceId },
                });

                setMediaStream(ms);
                setLoadingDevices(false);
            } catch (err) {
                console.error(err);
                setPermissionError('Permissions were not correctly set');
            }
        }

        if (selectedAudioDevice && selectedVideoDevice) {
            getMediaStream();
        }
    }, [selectedAudioDevice, selectedVideoDevice]);

    function releaseMediaStream() {
        if (mediaStream) {
            mediaStream.getTracks().forEach((t) => {
                console.log('cleaning up track', t);
                t.stop();
            });

            setMediaStream(null);
        }
    }

    function onCancel(): void {
        releaseMediaStream();
        prop.onCancel();
    }

    function onSetupComplete(): void {
        releaseMediaStream();
        prop.onSetupComplete(selectedAudioDevice?.deviceId, selectedVideoDevice?.deviceId);
    }

    return (
        <div className="setup-container">
            {permissionError && <Banner variant="error" message={permissionError} />}
            {!permissionError && loadingDevices && (
                <div className="loading-content">
                    <Spinner size={32} />
                </div>
            )}
            {!permissionError && !loadingDevices && (
                <div className="content">
                    <div className="left">
                        <label htmlFor="audio">Microphone</label>
                        <select id="audio" onChange={(e) => setSelectedAudioDevice(JSON.parse(e.target.value))}>
                            {audioDevices.map((a) => (
                                <option key={a.deviceId} value={JSON.stringify(a.toJSON())}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="video">Camera</label>
                        <select id="video" onChange={(e) => setSelectedVideoDevice(JSON.parse(e.target.value))}>
                            {videoDevices.map((a) => (
                                <option key={a.deviceId} value={JSON.stringify(a.toJSON())}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="right">
                        <video id="recorder" width="640" height="480" autoPlay muted ref={recorderElement}></video>
                    </div>
                </div>
            )}
            <div className="footer">
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                &nbsp;
                <Button label="Start Recording" variant="primary" onClick={onSetupComplete} />
            </div>
        </div>
    );
}
