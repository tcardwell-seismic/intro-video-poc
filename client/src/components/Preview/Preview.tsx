/* eslint-disable jsx-a11y/media-has-caption */
import { Button, Input } from '@seismic/mantle';
import React, { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SeismicPlayer from '@seismic/universal-player';
import './Preview.scss';

interface PreviewProp {
    video: Blob | null;
    areEditedVideosReady: boolean;
    onRetryRecording(): void;
    onEditVideo(): void;
    onSaveVideo(): void;
    onCancel(): void;
}

export default function Preview(prop: PreviewProp): ReactElement {
    //const previewElement = useRef<HTMLVideoElement>(null);

    // useEffect(() => {
    //     //if (previewElement && previewElement.current && prop.video) {
    //     const url = ;
    //     setConfig(buildFakeUPManifest(url));
    //     // previewElement.current.src = url;
    //     // return () => URL.revokeObjectURL(url);
    //     // }
    // }, []);

    function buildFakeUPManifest(url: string): any {
        return {
            ContentManifestId: uuidv4(),
            AllowDownload: true,
            AllowPrint: true,
            Content: {
                TeamsiteId: '',
                Id: uuidv4(),
                VersionId: uuidv4(),
                Repository: 'library',
                Type: 'file',
            },
            CoverImageUrl: '',
            Manifests: [
                {
                    FormatType: 'Video',
                    NativeFormat: 'webm',
                    Url: url,
                    DownloadUrl: url,
                    Mode: 'read',
                    Title: 'Mp4',
                    ViewerDetail: {},
                    Permissions: {
                        AllowDownload: false,
                        AllowPrint: false,
                    },
                    Error: null,
                    ErrorReason: 'None',
                    DowngradeReason: null,
                    IsCacheable: true,
                },
            ],
            Modes: ['read'],
            LogUrl: 'https://localhost/logs',
        };
    }

    function onCancel(): void {
        prop.onCancel();
    }

    function onEdit(): void {
        prop.onEditVideo();
    }

    function onRedo(): void {
        prop.onRetryRecording();
    }

    function onSave(): void {
        // TODO Upload to BSS
    }
    /**
     * config	The unaltered manifests retrieved from the player service	NULL
        subplayerConfig	See the section Subplayer Config below	NULL
        mode	read or present	present
        lang	ISO 639-1 standard language code	en-US
        autoplay	Autoplay control for videos	false
        enableAnnotations	Boolean that indicates if the annotations feature should be turned on	false
        getAccessToken	A function that can be used to return a valid bearer token - required for Annotations support	NULL
        playerServiceApi	The API endpoint for the player service, fetched using Matrix - required for Annotations support	NULL
        seismicEvents$
     */
    return (
        <div className="preview-container">
            <div className="content">
                <div className="left">
                    {/* <video id="preview" width="640" height="480" controls ref={previewElement}></video> */}
                    <SeismicPlayer config={buildFakeUPManifest(URL.createObjectURL(prop.video))} />
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
                <Button label="Edit" variant="primary" onClick={onEdit} disabled={!prop.areEditedVideosReady} />
                &nbsp;
                <Button label="Save" variant="primary" onClick={onSave} />
            </div>
        </div>
    );
}
