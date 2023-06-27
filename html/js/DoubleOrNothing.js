class DoubleOrNothing {
    /**
     * @param {number} maxAllowedWins
     */
    constructor(maxAllowedWins) {
        /**
         * The amount of coins at stake for 'double or nothing'
         * @type {number}
         */
        this.balance = 0;

        /**
         * The maximum amount of times the player can win 'double or nothing' in a row.
         * <p> This limits the maximum payout to 2^maxAllowedWins * bet
         * @type {number}
         */
        this.maxAllowedWins = maxAllowedWins;
        this.currentWins = 0;

        /**
         * List of outcomes of previous doubleOrNothing attempts.
         * <p> This should be treated as a fixed size queue.
         * @type {BetColor[]}
         */
        this.colorHistory = Array(8).fill(betColors.none);
    }

    /**
     * @param {number} payIn coins to put at stake
     */
    startGame(payIn) {
        this.balance += payIn;
        this._showDoubleOrNothing();
    }

    /**
     * @return {boolean} true if the player is currently playing 'double or nothing'
     */
    isActive() {
        return this.balance > 0;
    }

    /**
     * @param {BetColor} color
     */
    betOnColor(color) {
        const randomColor = BetColor.getRandomColor();
        this._updateColorHistory(randomColor);

        if (randomColor.colorId === color.colorId) {
            this.balance *= 2;
            this.currentWins++;
            if(this.currentWins >= this.maxAllowedWins) {
                pressROLL(); // TODO this is a nasty hack to forcibly make the player take the money
            }

            // TODO this maybe also belongs in the view controller ?
            // TODO at the very least, these should be passed in at the constructor or smth.
            audioFiles.winDouble.play();

            this._showDoubleOrNothing();
        } else {
            this.balance = 0; // you get NOTHING!
            this.currentWins = 0;
            this._hideDoubleOrNothing();
        }
    }

    /**
     * @return {number} payout
     */
    takePayout() {
        const payout = this.balance;
        this.balance = 0;
        this.currentWins = 0;
        this._hideDoubleOrNothing();
        return payout;
    }

    _showDoubleOrNothing() {
        // TODO this definitely belongs in the view controller
        $('#win').empty().append(this.balance);
        $('.win').show();
        $('.dblOrNothing').show();

        $('.betUp').empty().append("Rot");
        $('.AllIn').empty().append("Schwarz");
        $('.go').empty().append("Sammeln");
    }

    _hideDoubleOrNothing() {
        // TODO move to view controller
        // TODO separate bet/allIn buttons from dblOrNothing buttons
        $('.win').hide();
        $('.dblOrNothing').hide();

        $('.betUp').empty().append("+50");
        $('.AllIn').empty().append("Setzen Sie alles ein");
        $('.go').empty().append("Spielen");
    }

    /**
     * @param {BetColor} color
     * @private
     */
    _updateColorHistory(color) {
        this.colorHistory.pop();
        this.colorHistory.unshift(color);

        for (let i = 0; i < this.colorHistory.length; i++) {
            const historyId = '#hist' + (i + 1);
            const $historyPanel = $(historyId);
            $historyPanel.empty();
            this.colorHistory[i].appendColorElement($historyPanel);
        }
    }
}

class BetColor {
    static getRandomColor() {
        const randomColorId = Math.floor(Math.random() * 2);
        return randomColorId === 0 ? betColors.red : betColors.black;
    }

    constructor(colorId, imgPath) {
        this.colorId = colorId;
        this.imgPath = imgPath;
    }

    /**
     * @param {HTMLElement} $container
     */
    appendColorElement($container) {
        if (this.imgPath !== null) {
            $container.append(`<img src='${this.imgPath}' width=30px height=30px/>`)
        }
    }
}

const betColors = {
    none: new BetColor(-1, null),
    red: new BetColor(0, 'img/red.png'),
    black: new BetColor(1, 'img/black.png'),
}