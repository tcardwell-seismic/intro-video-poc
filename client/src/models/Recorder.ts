import * as fixWebmDuration from 'fix-webm-duration'; // TODO Add types for this

export class Recorder {
    private readonly audioDeviceId: string;
    private readonly videoDeviceId: string;
    private readonly encodingType: string;
    private blob: Blob | null;
    private chunks: BlobPart[];
    private recorder: MediaRecorder | null;
    private stream: MediaStream | null;
    private startTime: number | null;
    private endTime: number | null;
    onStart!: (evt: Event) => void;
    onStop!: (evt: Event) => void;
    onComplete!: (blob: Blob) => void;
    onChunkAvailable!: (chunk: BlobEvent) => void;
    onError!: (err: Event) => void;

    /**
     * Available constraints: https://www.w3.org/TR/mediacapture-streams/#media-track-constraints
     */
    constructor(audioDeviceId: string, videoDeviceId: string, encodingType: string) {
        this.audioDeviceId = audioDeviceId;
        this.videoDeviceId = videoDeviceId;
        this.encodingType = encodingType;
        this.blob = null;
        this.chunks = [];
        this.recorder = null;
        this.stream = null;
        this.startTime = null;
        this.endTime = null;
    }

    getBlob(): Blob | null {
        return this.blob;
    }

    getSupportedEncodings(): string[] {
        throw 'Not Implemented';
    }

    async initializeRecorder(): Promise<MediaStream> {
        if (this.recorder) {
            this.recorder = null;
        }

        this.stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: this.videoDeviceId },
            audio: { deviceId: this.audioDeviceId },
        });

        this.recorder = new MediaRecorder(this.stream);
        this._initializeRecorder();

        return this.stream;
    }

    startRecording(): void {
        if (!this.recorder) {
            throw 'Recorder must be initialized with initializeRecorder';
        }

        this.recorder.start();
    }

    stopRecording(): void {
        if (!this.recorder || !this.stream) {
            throw 'Recorder must be initialized with initializeRecorder';
        }

        this.recorder.stop();
        this.stream.getTracks().forEach((t) => t.stop());
    }

    _initializeRecorder(): void {
        if (!this.recorder) {
            throw 'Recorder must be initialized with initializeRecorder';
        }

        this.recorder.ondataavailable = (evt) => {
            if (this.onChunkAvailable) {
                this.onChunkAvailable(evt);
            }

            this.chunks.push(evt.data);
        };

        this.recorder.onerror = (evt) => {
            if (this.onError) {
                this.onError(evt);
            }
            this.blob = null;
            this.chunks = [];

            if (this.recorder) {
                this.recorder.stop();
                this.recorder = null;
            }

            if (this.stream) {
                this.stream.getTracks().forEach((t) => t.stop());
                this.stream = null;
            }
        };

        this.recorder.onpause = () => {
            throw 'Not Implemented';
        };

        this.recorder.onresume = () => {
            throw 'Not Implemented';
        };

        this.recorder.onstart = (evt) => {
            if (this.onStart) {
                this.onStart(evt);
            }
            this.startTime = Date.now();
            this.blob = null;
            this.chunks = [];
        };

        this.recorder.onstop = (evt) => {
            if (this.onStop) {
                this.onStop(evt);
            }
            this.endTime = Date.now();

            const badBlob = new Blob(this.chunks, { type: this.encodingType });

            if (this.startTime && this.endTime) {
                const totalTime = this.endTime - this.startTime;

                /**
                 * Chrome has a bug where the Blob does not include duration - this breaks the preview (UP) and the uploaded asset doesn't have the correct metadata
                 * https://bugs.chromium.org/p/chromium/issues/detail?id=642012
                 * https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome/39971175#39971175
                 * https://stackoverflow.com/questions/63640361/how-to-add-duration-to-metadata-of-files-recorder-by-mediarecorder
                 * https://github.com/yusitnikov/fix-webm-duration
                 */
                fixWebmDuration(badBlob, totalTime, (fixedBlob: Blob) => {
                    this.blob = fixedBlob;

                    if (this.onComplete) {
                        this.onComplete(fixedBlob);
                    }

                    this.chunks = [];
                });
            } else {
                this.blob = badBlob;

                if (this.onComplete) {
                    this.onComplete(badBlob);
                }

                this.chunks = [];
            }
        };
    }
}
