import React, { ReactElement } from 'react';
import { Theme, seismicTheme } from '@seismic/mantle';
import './App.scss';
import ErrorBoundary from 'src/components/ErrorBoundary';

const App: React.FC = (): ReactElement => {
    return (
        <Theme theme={seismicTheme({ useGlobal: true })}>
            <ErrorBoundary>Hello</ErrorBoundary>
        </Theme>
    );
};

export default App;
