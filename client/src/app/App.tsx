import React, { ReactElement } from 'react';
import { Theme, seismicTheme } from '@seismic/mantle';
import './App.scss';
import ErrorBoundary from 'src/components/ErrorBoundary';
import RecordingComponent from 'src/components/RecordingComponent';

const App: React.FC = (): ReactElement => {
    return (
        <Theme theme={seismicTheme({ useGlobal: true })}>
            <ErrorBoundary>
                <RecordingComponent />
            </ErrorBoundary>
        </Theme>
    );
};

export default App;
