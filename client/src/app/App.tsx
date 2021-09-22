import React, { ReactElement, useState } from 'react';
import { Theme, seismicTheme, IconVideo, Modal } from '@seismic/mantle';
import './App.scss';
import ErrorBoundary from 'src/components/ErrorBoundary';
import RecordingComponent from 'src/components/RecordingComponent';

export default function App(): ReactElement {
    const [showModal, setShowModal] = useState(false);

    function handleVideoClick(): void {
        setShowModal(true);
    }

    return (
        <Theme theme={seismicTheme({ useGlobal: true })}>
            <ErrorBoundary>
                <IconVideo size={24} onClick={handleVideoClick} />
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    header="Record video"
                    closeOnOutsideClick={false}
                    size="lg"
                >
                    <RecordingComponent onCancel={() => setShowModal(false)} />
                </Modal>
                <article>
                    <h3>Today&apos;s goals</h3>
                    <ul>
                        <li>Get videojs-record working (until 12:00pm)</li>
                        <li>Screen recording (until 1:00pm)</li>
                        <li>Get all input devices (until 1:30pm)</li>
                        <li>Trim (until 4:00pm)</li>
                        <li>Image overlay (until 5:00pm)</li>
                    </ul>
                    <h3>
                        Solutions for Recording Audio / Video / Screen{' '}
                        <a
                            href="https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Media Streams API
                        </a>
                    </h3>
                    <ul>
                        <li>Fully Custom - Quick to implement, fairly straightforward - see demo</li>
                        <li>
                            <a href="https://github.com/muaz-khan/RecordRTC" target="_blank" rel="noreferrer">
                                RecordRTC
                            </a>{' '}
                            - Provides a nice wrapper around the Media and Streams API, but development looks dead and
                            there are a lot of issues with it.
                        </li>
                        <li>
                            <a href="https://github.com/collab-project/videojs-record" target="_blank" rel="noreferrer">
                                videojs-record
                            </a>{' '}
                            - What seems to be the most promising wrapper around the Media and Streams API, however
                            I&apos;m currently running into issues trying to get it integrated. See the{' '}
                            <a
                                href="https://collab-project.github.io/videojs-record/#/examples"
                                target="_blank"
                                rel="noreferrer"
                            >
                                demo
                            </a>{' '}
                            page for more info.
                        </li>
                    </ul>
                    <h3>Solutions for Video Manipulation</h3>
                    <ul>
                        <li>Fully Custom using ffmpeg</li>
                        <li>
                            <a href="https://github.com/muaz-khan/RecordRTC" target="_blank" rel="noreferrer">
                                RecordRTC
                            </a>{' '}
                            - Provides a nice wrapper around the Media and Streams API, but development looks dead and
                            there are a lot of issues with it.
                        </li>
                        <li>
                            <a href="https://github.com/collab-project/videojs-record" target="_blank" rel="noreferrer">
                                videojs-record
                            </a>{' '}
                            - What seems to be the most promising wrapper around the Media and Streams API, however
                            I&apos;m currently running into issues trying to get it integrated. See the{' '}
                            <a
                                href="https://collab-project.github.io/videojs-record/#/examples"
                                target="_blank"
                                rel="noreferrer"
                            >
                                demo
                            </a>{' '}
                            page for more info.
                        </li>
                    </ul>
                    <h3>Additional work to do</h3>
                    <ul>
                        <li>Identify how we can implement trim</li>
                        <li>
                            Other features to demo, if we have time
                            <ul>
                                <li>Upload to workspace</li>
                                <li>Audio only recording</li>
                                <li>Screen recording</li>
                                <li>Select input devices</li>
                                <li>Overlay image</li>
                                <li>Use Universal Player for preview</li>
                                <li>Accessibility</li>
                                <li>Go over list of features and identify how they will be added in the future</li>
                            </ul>
                        </li>
                    </ul>
                    <h3>Open Questions</h3>
                    <ul>
                        <li>
                            Understand video types and codecs{' '}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter"
                                target="_blank"
                                rel="noreferrer"
                            >
                                here
                            </a>
                            and
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/Media/Formats#media_file_types_and_codecs"
                                target="_blank"
                                rel="noreferrer"
                            >
                                here
                            </a>
                        </li>
                        <li>Understand scaling issues</li>
                    </ul>
                </article>
            </ErrorBoundary>
        </Theme>
    );
}
