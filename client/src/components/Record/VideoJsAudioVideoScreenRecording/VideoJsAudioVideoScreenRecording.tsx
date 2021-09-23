/* eslint-disable jsx-a11y/media-has-caption */
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import RecordRTC, { MediaStreamRecorder } from 'recordrtc';
import SeismicPlayer from '@seismic/universal-player';
import { v4 as uuidv4 } from 'uuid';

interface VideoJsAudioVideoScreenRecordingProp {
    onCancel(): void;
}

export default function VideoJsAudioVideoScreenRecording(props: VideoJsAudioVideoScreenRecordingProp): ReactElement {
    const videoNode = useRef<HTMLVideoElement>(null);
    const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(null);
    const [recorder, setRecorder] = useState<RecordRTC | null>(null);
    const [video, setVideo] = useState<Blob | null>(null);

    useEffect(() => {
        async function init() {
            const ms = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setUserMediaStream(ms);
        }

        init();
    }, []);

    useEffect(() => {
        async function init() {
            const ms = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });

            setUserMediaStream(ms);
        }

        init();
    }, []);

    useEffect(() => {
        if (videoNode && videoNode.current && userMediaStream) {
            videoNode.current.srcObject = userMediaStream;
            const rec = new RecordRTC(userMediaStream, {
                type: 'video',
                recorderType: MediaStreamRecorder,
                mimeType: 'audio/webm',
            });

            rec.startRecording();
            setRecorder(rec);
        }
    }, [videoNode, userMediaStream]);

    function onStop() {
        const video = videoNode.current;
        if (video && recorder) {
            recorder.stopRecording(() => {
                // video.src = video.srcObject = null;
                // video.muted = false;
                // video.volume = 1;
                // video.src = URL.createObjectURL(recorder.getBlob());
                setVideo(recorder.getBlob());
                //recorder.camera.stop();
                recorder.destroy();
                setRecorder(null);
            });
        }
    }

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

    return (
        <div>
            {!video && <video id="recorder" width="960" height="540" controls autoPlay muted ref={videoNode}></video>}
            {video && <SeismicPlayer config={buildFakeUPManifest(URL.createObjectURL(video))} />}
            <button onClick={onStop}>Stop</button>
        </div>
    );
}
