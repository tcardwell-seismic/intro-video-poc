/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/media-has-caption */
import { Button } from '@seismic/mantle';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SeismicPlayer from '@seismic/universal-player';
import './Edit.scss';

interface EdgeProp {
    onEditComplete(): void;
    onCancel(): void;
}

export default function Edge(prop: EdgeProp): ReactElement {
    const previewElement = useRef<HTMLVideoElement>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [trimmedUrl, setTrimmedUrl] = useState('');
    const trimmedElement = useRef<HTMLVideoElement>(null);
    const thumbnail = useRef<HTMLImageElement>(null);
    const gifElement = useRef<HTMLImageElement>(null);

    useEffect(() => {
        async function getMp4Video() {
            try {
                var result = await fetch('https://localhost:5001/stream/mp4');
                var video = await result.blob();
                const url = URL.createObjectURL(video);
                setPreviewUrl(url);
                if (previewElement && previewElement.current) {
                    previewElement.current.src = url;
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function getTrimmedVideo() {
            try {
                var result = await fetch('https://localhost:5001/stream/trim');
                var video = await result.blob();
                const url = URL.createObjectURL(video);
                setTrimmedUrl(url);
                if (trimmedElement && trimmedElement.current) {
                    trimmedElement.current.src = url;
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function getThumbnail() {
            try {
                var result = await fetch('https://localhost:5001/stream/thumbnail');
                var image = await result.blob();
                const url = URL.createObjectURL(image);
                if (thumbnail && thumbnail.current) {
                    thumbnail.current.src = url;
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function getGif() {
            try {
                var result = await fetch('https://localhost:5001/stream/gif');
                var gif = await result.blob();
                const url = URL.createObjectURL(gif);
                if (gifElement && gifElement.current) {
                    gifElement.current.src = url;
                }
            } catch (err) {
                console.error(err);
            }
        }

        getMp4Video();
        getTrimmedVideo();
        getThumbnail();
        getGif();
    }, []);

    // useEffect(() => {
    //     const url = URL.createObjectURL(prop.video);
    //     setPreviewUrl(url);
    //     if (previewElement && previewElement.current && prop.video) {
    //         previewElement.current.src = url;
    //         return () => URL.revokeObjectURL(url);
    //     }
    // }, [previewElement]);

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

    function onSave(): void {
        prop.onEditComplete();
    }

    return (
        <div className="edit-container">
            <div className="content">
                <div className="left">
                    <div>Original</div>
                    {previewUrl && (
                        <div className="up-container">
                            <SeismicPlayer config={buildFakeUPManifest(previewUrl)} />
                        </div>
                    )}
                    {/* <video id="preview" width="384" height="260" controls ref={previewElement}></video> */}
                    <div>Trimmed</div>
                    {trimmedUrl && (
                        <div className="up-container">
                            <SeismicPlayer config={buildFakeUPManifest(trimmedUrl)} />
                        </div>
                    )}
                    {/* <video id="trim" width="384" height="260" controls ref={trimmedElement}></video> */}
                </div>
                <div className="right">
                    <div>Thumbnail</div>
                    <img id="thumbnail" width="384" height="260" ref={thumbnail}></img>
                    <div>Gif</div>
                    <img id="gif" width="384" height="260" ref={gifElement}></img>
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
