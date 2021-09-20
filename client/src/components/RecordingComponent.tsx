import React, { ReactElement, useState } from 'react';
import WorkflowSteps from './WorkflowSteps';
import Setup from './Setup/Setup';
import Record from './Record/Record';
import Preview from './Preview/Preview';
import './RecordingComponent.scss';

interface RecordingComponentProp {
    onCancel(): void;
}

export default function RecordingComponent(prop: RecordingComponentProp): ReactElement {
    const [step, setStep] = useState(WorkflowSteps.Setup);
    const [video, setVideo] = useState<Blob | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    function getContent(): ReactElement {
        switch (step) {
            case WorkflowSteps.Setup:
                return <Setup onSetupComplete={onSetupComplete} onCancel={onCancel} />;
            case WorkflowSteps.Recording:
                return (
                    <Record onRecordingCompleted={onRecordingCompleted} onCancel={onCancel} mediaStream={mediaStream} />
                );
            case WorkflowSteps.Preview:
                return (
                    <Preview
                        video={video}
                        onRetryRecording={onRetryRecording}
                        onSaveVideo={onSaveVideo}
                        onCancel={onCancel}
                    />
                );
            default:
                return <div></div>;
        }
    }

    function onCancel(): void {
        prop.onCancel();
    }

    function onSetupComplete(ms: MediaStream): void {
        setMediaStream(ms);
        setStep(WorkflowSteps.Recording);
    }

    function onRecordingCompleted(blob: Blob): void {
        setVideo(blob);
        setStep(WorkflowSteps.Preview);
    }

    function onRetryRecording(): void {
        setVideo(null);
        setStep(WorkflowSteps.Recording);
    }

    function onSaveVideo(): void {
        return;
    }

    return <div className="container">{getContent()}</div>;
}
