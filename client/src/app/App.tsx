import React, { ReactElement, useState } from 'react';
import { Theme, seismicTheme, IconVideo, Modal } from '@seismic/mantle';
import './App.scss';
import ErrorBoundary from 'src/components/ErrorBoundary';
import RecordingComponent from 'src/components/RecordingComponent';

const App: React.FC = (): ReactElement => {
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
                <ul>
                    <li>Demo audio/video recording with custom code</li>
                    <li>
                        Demo audio/video recording with{' '}
                        <a href="https://github.com/collab-project/videojs-record" target="_blank" rel="noreferrer">
                            videojs-record
                        </a>
                    </li>
                    <li>Identify how we can implement trim</li>
                    <li>
                        Other features to demo, if we have time
                        <ul>
                            <li>Upload to workspace</li>
                            <li>Audio only recording</li>
                            <li>Screen recording</li>
                            <li>Select input devices</li>
                            <li>Use Universal Player for preview</li>
                            <li>Accessibility</li>
                            <li>Go over list of features and identify how they will be added in the future</li>
                        </ul>
                    </li>
                </ul>
            </ErrorBoundary>
        </Theme>
    );
};

export default App;
