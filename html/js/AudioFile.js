class AudioFile {
    /**
     * @param fileName String
     * @param volume number
     */
    constructor(fileName, volume) {
        this.fileName = fileName;
        this.isPlaying = false;

        /** @type {HTMLAudioElement} */
        this.player = document.getElementById(this.fileName);
        this.player.volume = volume;
        this.player.load();
    }

    /**
     * @return {Promise<void> | null}
     */
    play() {
        if (!$('#sounds').is(':checked')) {
            return null;
        }

        if (this.isPlaying) {
            this.player.pause();
            this.player.currentTime = 0;
        }

        this.isPlaying = true;
        this.player.play()
            .catch(() => {
                this.isPlaying = false;
            })
    }
}