class AudioFile {
    /**
     * @param fileName String
     * @param volume number
     */
    constructor(fileName, volume) {
        this.fileName = fileName;
        this.volume = volume;
        this.player = null;
    }

    /**
     * Add the audioFile to the document
     * @private
     */
    _load() {
        this.player = document.createElement('audio');
        this.player.setAttribute('src', 'audio/' + this.fileName + '.wav');
		this.player.crossOrigin = 'anonymous';
        this.player.volume = this.volume;
    }

    /**
     * @return {Promise<void> | null}
     */
    play() {
        if (!$('#sounds').is(':checked')) {
            return null;
        }

        if (this.player === null) {
            this._load();
        }
        return this.player.play();
    }
}