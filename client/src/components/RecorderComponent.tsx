/* eslint-disable jsx-a11y/media-has-caption */
import React, { ReactElement, useEffect, useState } from 'react';
import WorkflowSteps from './WorkflowSteps';
import Setup from './Setup/Setup';
import Record from './Record/Record';
import Preview from './Preview/Preview';
import VideoJsAudioRecording from './Record/VideoJsAudioRecording/VideoJsAudioRecording';
import VideoJsAudioVideoRecording from './Record/VideoJsAudioVideoRecording/VideoJsAudioVideoRecording';
import VideoJsAudioVideoScreenRecording from './Record/VideoJsAudioVideoScreenRecording/VideoJsAudioVideoScreenRecording';
import './RecorderComponent.scss';
import RecordingType from './RecordingType';
import TypeSelection from './TypeSelection/TypeSelection';
import Edit from './Edit/Edit';

interface RecordingComponentProp {
    onCancel(): void;
}

/**
 * TODO We should encapsulate the Audio/Video/Screen state in a separate object
 */
export default function RecordingComponent(prop: RecordingComponentProp): ReactElement {
    const [step, setStep] = useState(WorkflowSteps.TypeSelection);
    const [recordingType, setRecordingType] = useState<RecordingType>(RecordingType.CustomAudioVideo);
    const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>(undefined);
    const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>(undefined);
    const [video, setVideo] = useState<Blob | null>(null);
    const [areEditedVideosReady, setAreEditedVideosReady] = useState(false);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

    // useEffect(() => {
    //     initializeWebSocket();
    // }, []);

    // useEffect(() => {
    //     console.log('WebSocket hook!', webSocket);
    //     if (webSocket) {
    //         webSocket.onclose = () => {
    //             console.log('SOCKET CLOSE');
    //             setAreEditedVideosReady(true);
    //         };

    //         return () => {
    //             console.log('Manually closing web socket');
    //             webSocket.close();
    //         };
    //     }
    // }, [webSocket]);

    // function initializeWebSocket() {
    //     const ws = new WebSocket('wss://localhost:5001/stream');
    //     setWebSocket(ws);
    // }

    function getContent(): ReactElement {
        console.log('GetContent', step, recordingType, audioDeviceId, videoDeviceId);
        switch (step) {
            case WorkflowSteps.TypeSelection:
                return <TypeSelection onCancel={onCancel} onTypeSelected={onTypeSelected} />;
            case WorkflowSteps.Setup:
                return <Setup onSetupComplete={onSetupComplete} onCancel={onCancel} />;
            case WorkflowSteps.Recording:
                switch (recordingType) {
                    case RecordingType.CustomAudioVideo:
                        return (
                            <Record
                                onRecordingCompleted={onRecordingCompleted}
                                onCancel={onCancel}
                                audioDeviceId={audioDeviceId}
                                videoDeviceId={videoDeviceId}
                                includeScreen={false}
                                webSocket={webSocket}
                            />
                        );
                    case RecordingType.CustomAudioScreen:
                        return (
                            <Record
                                onRecordingCompleted={onRecordingCompleted}
                                onCancel={onCancel}
                                audioDeviceId={audioDeviceId}
                                videoDeviceId={videoDeviceId}
                                includeScreen={true}
                                webSocket={webSocket}
                            />
                        );
                    case RecordingType.Audio:
                        return <VideoJsAudioRecording onCancel={onCancel} />;
                    case RecordingType.AudioVideo:
                        return <VideoJsAudioVideoRecording onCancel={onCancel} />;
                    case RecordingType.AudioScreen:
                        return <VideoJsAudioVideoScreenRecording onCancel={onCancel} />;
                    case RecordingType.AudioVideoScreen:
                        return <VideoJsAudioVideoScreenRecording onCancel={onCancel} />;
                }
            case WorkflowSteps.Preview:
                return (
                    <Preview
                        video={video}
                        onRetryRecording={onRetryRecording}
                        onEditVideo={onEditVideo}
                        onSaveVideo={onSaveVideo}
                        onCancel={onCancel}
                        areEditedVideosReady={areEditedVideosReady}
                    />
                );
            case WorkflowSteps.Edit:
                return <Edit onEditComplete={onSaveVideo} onCancel={onCancel} />;
            default:
                return <div></div>;
        }
    }

    function onCancel(): void {
        prop.onCancel();
    }

    function onTypeSelected(recordingType: RecordingType): void {
        setRecordingType(recordingType);
        switch (recordingType) {
            case RecordingType.CustomAudioVideo:
            case RecordingType.CustomAudioScreen:
                setStep(WorkflowSteps.Setup);
                break;
            case RecordingType.Audio:
            case RecordingType.AudioVideo:
            case RecordingType.AudioScreen:
            case RecordingType.AudioVideoScreen:
                setStep(WorkflowSteps.Recording);
                break;
        }
    }

    function onSetupComplete(audioDeviceId: string, videoDeviceId: string): void {
        setAudioDeviceId(audioDeviceId);
        setVideoDeviceId(videoDeviceId);
        setStep(WorkflowSteps.Recording);
    }

    function onRecordingCompleted(blob: Blob): void {
        console.log('Recording Complete!', blob.size);
        setVideo(blob);
        setStep(WorkflowSteps.Preview);
    }

    function onRetryRecording(): void {
        //initializeWebSocket();
        setStep(WorkflowSteps.Recording);
        setVideo(null);
    }

    function onEditVideo(): void {
        setStep(WorkflowSteps.Edit);
    }

    function onSaveVideo(): void {
        return;
    }

    return <div className="container">{getContent()}</div>;
}
