import React, { MouseEventHandler, ReactElement, useState } from 'react';
import { Button } from '@seismic/mantle';
import WorkflowSteps from './WorkflowSteps';
import Setup from './Setup/Setup';
import Record from './Record/Record';
import Preview from './Preview/Preview';
import './RecordingComponent.scss';

export default function RecordingComponent(): ReactElement {
    const [step, setStep] = useState(WorkflowSteps.Setup);
    const [video, setVideo] = useState<Blob | null>(null);

    function getHeader(): string {
        switch (step) {
            case WorkflowSteps.Setup:
                return 'Setup';
            case WorkflowSteps.Recording:
                return 'Recording';
            case WorkflowSteps.Preview:
                return 'Preview';
            default:
                return '';
        }
    }

    function getContent(): ReactElement {
        switch (step) {
            case WorkflowSteps.Setup:
                return <Setup onSetupComplete={onSetupComplete} />;
            case WorkflowSteps.Recording:
                return <Record onRecordingCompleted={onRecordingCompleted} />;
            case WorkflowSteps.Preview:
                return <Preview video={video} onRetryRecording={onRetryRecording} onSaveVideo={onSaveVideo} />;
            default:
                return <div></div>;
        }
    }

    function previousStep(): MouseEventHandler<HTMLButtonElement> | undefined {
        switch (step) {
            case WorkflowSteps.Recording:
                setStep(WorkflowSteps.Setup);
                break;
            case WorkflowSteps.Preview:
                setStep(WorkflowSteps.Recording);
                break;
        }

        return;
    }

    function nextStep(): MouseEventHandler<HTMLButtonElement> | undefined {
        switch (step) {
            case WorkflowSteps.Setup:
                setStep(WorkflowSteps.Recording);
                break;
            case WorkflowSteps.Recording:
                setStep(WorkflowSteps.Preview);
                break;
        }

        return;
    }

    function onSetupComplete(): void {
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

    return (
        <div className="container">
            <div className="header">{getHeader()}</div>
            <div className="content">{getContent()}</div>
            <div className="footer">
                <Button label="Back" variant="secondary" onClick={previousStep} />
                <Button label="Next" variant="primary" onClick={nextStep} />
            </div>
        </div>
    );
}
