import { Banner, Button, Spinner } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import './Setup.scss';

interface SetupProp {
    onSetupComplete(ms: MediaStream): void;
    onCancel(): void;
}

export default function Setup(prop: SetupProp): ReactElement {
    const recorderElement = useRef<HTMLVideoElement>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        async function getUserMedia() {
            try {
                const ms = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setMediaStream(ms);
            } catch (err) {
                console.error(err);
                setPermissionError('Permissions were not correctly set');
            }
        }

        getUserMedia();
    }, []);

    useEffect(() => {
        if (mediaStream && recorderElement && recorderElement.current) {
            recorderElement.current.srcObject = mediaStream;
        }
    }, [mediaStream, recorderElement]);

    function onCancel(): void {
        if (mediaStream) {
            mediaStream.getTracks().forEach((t) => t.stop());
        }
        prop.onCancel();
    }

    function onSetupComplete(): void {
        if (!mediaStream) {
            throw 'Error occurred attempting to retrieve media stream';
        }

        prop.onSetupComplete(mediaStream);
    }

    return (
        <div className="setup-container">
            {permissionError && <Banner variant="error" message={permissionError} />}
            {!mediaStream && !permissionError && (
                <div className="loading-content">
                    <Spinner size={32} />
                </div>
            )}
            {mediaStream && (
                <div className="content">
                    <div className="left">
                        <label htmlFor="audio">Microphone</label>
                        <select id="audio">
                            {mediaStream.getAudioTracks().map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="video">Camera</label>
                        <select id="video">
                            {mediaStream.getVideoTracks().map((a) => (
                                <option key={a.id} value={a.id}>
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
