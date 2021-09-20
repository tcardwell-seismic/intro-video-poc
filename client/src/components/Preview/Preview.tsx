/* eslint-disable jsx-a11y/media-has-caption */
import { Button, Input } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef } from 'react';
import './Preview.scss';

interface PreviewProp {
    video: Blob | null;
    onRetryRecording(): void;
    onSaveVideo(): void;
    onCancel(): void;
}

export default function Preview(prop: PreviewProp): ReactElement {
    const previewElement = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (previewElement && previewElement.current) {
            previewElement.current.src = URL.createObjectURL(prop.video);
        }
    }, [previewElement]);

    function onCancel(): void {
        prop.onCancel();
    }

    function onRedo(): void {
        prop.onRetryRecording();
    }

    function onSave(): void {
        // TODO Upload to BSS
    }

    return (
        <div className="preview-container">
            <div className="content">
                <div className="left">
                    <video id="preview" width="640" height="480" autoPlay controls ref={previewElement}></video>
                </div>
                <div className="right">
                    <h3>Save as</h3>
                    <label htmlFor="fileName">File name</label>
                    <Input id="fileName" />
                    <label htmlFor="saveTo">Save to</label>
                    <Input id="saveTo" />
                </div>
            </div>
            <div className="footer">
                <Button label="Redo" variant="secondary" onClick={onRedo} />
                &nbsp;
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                &nbsp;
                <Button label="Save" variant="primary" onClick={onSave} />
            </div>
        </div>
    );
}
