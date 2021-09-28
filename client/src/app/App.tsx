/* eslint-disable jsx-a11y/alt-text */
import React, { ReactElement, useState } from 'react';
import { Theme, seismicTheme, IconVideo, Modal } from '@seismic/mantle';
import './App.scss';
import ErrorBoundary from 'src/components/ErrorBoundary';
import RecordingComponent from 'src/components/RecorderComponent';

export default function App(): ReactElement {
    const [showModal, setShowModal] = useState(false);

    function handleVideoClick(): void {
        setShowModal(true);
    }

    return (
        <Theme theme={seismicTheme({ useGlobal: true })}>
            <ErrorBoundary>
                <div id="icon-container">
                    <span>Click here to start... </span>
                    <IconVideo size={24} onClick={handleVideoClick} />
                </div>
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    header="Record video"
                    closeOnOutsideClick={false}
                    size="lg"
                >
                    <RecordingComponent onCancel={() => setShowModal(false)} />
                </Modal>
            </ErrorBoundary>
        </Theme>
    );
}
