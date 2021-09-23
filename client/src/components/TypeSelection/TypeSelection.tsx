/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, Radio } from '@seismic/mantle';
import React, { ReactElement, useState } from 'react';
import RecordingType from '../RecordingType';
import './TypeSelection.scss';

interface TypeSelectionProps {
    onTypeSelected(selectedType: RecordingType): void;
    onCancel(): void;
}

export default function TypeSelection(props: TypeSelectionProps): ReactElement {
    const [checkedValue, setCheckedValue] = useState<RecordingType>(RecordingType.CustomAudioVideo);

    function onCancel() {
        props.onCancel();
    }

    function onNext() {
        props.onTypeSelected(checkedValue);
    }

    return (
        <div className="type-selection-container">
            <div className="content">
                <label>
                    <Radio
                        checked={checkedValue === RecordingType.CustomAudioVideo}
                        onChange={() => setCheckedValue(RecordingType.CustomAudioVideo)}
                    />{' '}
                    Custom Audio and Video
                </label>
                <label>
                    <Radio
                        checked={checkedValue === RecordingType.CustomAudioScreen}
                        onChange={() => setCheckedValue(RecordingType.CustomAudioScreen)}
                    />{' '}
                    Custom Audio and Screen
                </label>
                <label>
                    <Radio
                        checked={checkedValue === RecordingType.Audio}
                        onChange={() => setCheckedValue(RecordingType.Audio)}
                    />{' '}
                    video.js Audio Only
                </label>
                <label>
                    <Radio
                        checked={checkedValue === RecordingType.AudioVideoScreen}
                        onChange={() => setCheckedValue(RecordingType.AudioVideoScreen)}
                    />{' '}
                    Record RTC
                </label>
            </div>
            <div className="footer">
                <Button label="Cancel" variant="secondary" onClick={onCancel} />
                &nbsp;
                <Button label="Next" variant="primary" onClick={onNext} />
            </div>
        </div>
    );
}
