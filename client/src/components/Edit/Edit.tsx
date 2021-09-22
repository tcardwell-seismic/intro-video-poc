/* eslint-disable jsx-a11y/media-has-caption */
import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
// import { Cloudinary, CloudinaryVideo, } from '@cloudinary/url-gen';
// // import { Transformation } from '@cloudinary/url-gen';
// import { scale } from '@cloudinary/url-gen/actions/resize';
// import { byAngle } from '@cloudinary/url-gen/actions/rotate';
// import { source } from '@cloudinary/url-gen/actions/overlay';
// import { opacity } from '@cloudinary/url-gen/actions/adjust';
// import { image } from '@cloudinary/url-gen/qualifiers/source';
// import { Position } from '@cloudinary/url-gen/qualifiers/position';
// import { compass } from '@cloudinary/url-gen/qualifiers/gravity';
import './Edit.scss';

interface EdgeProp {
    video: Blob | null;
    onEditComplete(): void;
    onCancel(): void;
}

export default function Edge(prop: EdgeProp): ReactElement {
    const previewElement = useRef<HTMLVideoElement>(null);
    const otherElement = useRef<HTMLVideoElement>(null);
    const canvasElement = useRef<HTMLCanvasElement>(null);
    const chunks: BlobPart[] = [];

    useEffect(() => {
        async function something(canvas: HTMLCanvasElement, other: HTMLVideoElement, chunks: BlobPart[]) {
            var stream = canvas.captureStream(25 /*fps*/);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp9',
            });

            //ondataavailable will fire in interval of `time || 4000 ms`
            mediaRecorder.start(1000);

            mediaRecorder.ondataavailable = function (event) {
                chunks.push(event.data);
                // after stop `dataavilable` event run one more time
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            };

            mediaRecorder.onstop = function () {
                var blob = new Blob(chunks, { type: 'video/webm' });
                var url = URL.createObjectURL(blob);
                other.src = url;
            };
        }

        if (
            previewElement &&
            previewElement.current &&
            canvasElement &&
            canvasElement.current &&
            otherElement &&
            otherElement.current
        ) {
            something(canvasElement.current, otherElement.current, chunks);
        }
    }, [previewElement, canvasElement]);

    useEffect(() => {
        if (previewElement && previewElement.current && prop.video) {
            const url = URL.createObjectURL(prop.video);
            previewElement.current.src = url;
            return () => URL.revokeObjectURL(url);
        }
    }, [previewElement]);

    function onCancel(): void {
        prop.onCancel();
    }

    function onSave(): void {
        prop.onEditComplete();
    }

    return (
        <div className="edit-container">
            <div className="content">
                <div className="left">
                    <video id="preview" width="640" height="480" autoPlay controls ref={previewElement}></video>
                </div>
                <div className="right">
                    <canvas id="preview" width="640" height="480" ref={canvasElement}></canvas>
                    <video id="other" width="640" height="480" autoPlay controls ref={otherElement}></video>
                </div>
            </div>
            <div className="footer">
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                &nbsp;
                <Button label="Save" variant="primary" onClick={onSave} />
            </div>
        </div>
    );
}
