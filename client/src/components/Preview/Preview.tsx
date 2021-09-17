/* eslint-disable jsx-a11y/media-has-caption */
import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef } from 'react';

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

    function onSave(): void {
        // TODO Upload to BSS
    }

    return (
        <div className="preview-container">
            <div>
                <video id="preview" width="960" height="540" autoPlay controls ref={previewElement}></video>
            </div>
            <div>
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                <Button label="Save" variant="primary" onClick={onSave} />
            </div>
        </div>
    );
}
