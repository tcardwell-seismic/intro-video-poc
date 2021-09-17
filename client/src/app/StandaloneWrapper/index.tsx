// import 'core-js/stable'; // uncomment for IE11 polyfills
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';

ReactDOM.render(
    <React.StrictMode>
        <StandaloneAppWrapper />
    </React.StrictMode>,
    document.getElementById('root'),
);

function StandaloneAppWrapper() {
    return <App />;
}
