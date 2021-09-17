import { Button } from '@seismic/mantle';
import React, { ReactElement } from 'react';

interface SetupProp {
    onSetupComplete(): void;
    onCancel(): void;
}

export default function Setup(prop: SetupProp): ReactElement {
    function onCancel(): void {
        prop.onCancel();
    }

    function onSetupComplete(): void {
        prop.onSetupComplete();
    }

    return (
        <div className="setup-container">
            <div>TODO Need to put stuff in here</div>
            <div>
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                <Button label="Next" variant="primary" onClick={onSetupComplete} />
            </div>
        </div>
    );
}
