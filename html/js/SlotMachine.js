class SlotMachine {
    /**
     * @typedef {number[][]} payLine
     */

    /**
     * @param {Symbol[]} symbolList
     * @param {payLine[]} payLines
     */
    constructor(symbolList, payLines) {
        /** @type {Symbol[]} */
        this.symbolList = symbolList;

        /** @type {payLine[]} */
        this.payLines = payLines;

        /** @type {Reel[]} */
        this.reels = new Array(5).fill(null).map(() => new Reel());

        /** @type {boolean} */
        this.isSpinning = false;

        /**
         * number of coins in the machine
         * @type {number}
         */
        this.balance = 0;

        /**
         * number of coins player is betting
         * @type {number}
         */
        this.bet = 50;
    }

    initialize() {
        for (let i = 0; i < this.reels.length; i++) {
            const ringElement = document.getElementById("ring" + (i + 1));
            this.reels[i].initialize(ringElement);
        }
        this.randomizeSlots();
    }

    randomizeSlots() {
        const symbolPool = [];
        // pick a random selection of 3 reels worth of symbols
        // this is done to make it more likely that multiple reels have the same symbols
        for (let i = 0; i < (SLOTS_PER_REEL * 3); i++) {
            symbolPool.push(this._getRandomSymbol());
        }

        for (let reel of this.reels) {
            reel.randomizeSlots(symbolPool);
        }
    }

    /**
     * @return {Symbol}
     * @private
     */
    _getRandomSymbol() {
        let totalWeight = this.symbolList
            .map(symbol => symbol.weight)
            .reduce((acc, x) => acc + x, 0);

        const weightNumber = Math.floor(Math.random() * totalWeight);
        let currentWeight = 0;
        for (let symbol of this.symbolList) {
            currentWeight += symbol.weight;
            if (weightNumber < currentWeight) {
                return symbol;
            }
        }
        return this.symbolList[this.symbolList.length - 1];
    }

    checkCanBet() {
        if (this.isInsufficientBalance()) {
            return false;
        }
        return this.balance >= this.bet;
    }

    isInsufficientBalance() {
        return this.balance < 50;
    }

    insertCoins(coins) {
        this.balance += coins;
        $('#ownedCoins').empty().append(this.balance);
    }

    takeAllCoins() {
        const numCoins = this.balance;
        this.insertCoins(-numCoins);
        return numCoins;
    }

    allIn() {
        if (this.bet === this.balance) {
            return;
        }
        this.bet = this.balance;
        this._updateBet();
    }

    raiseBet() {
        this.bet += 50;
        if (this.bet > this.balance) {
            this.bet = 50;
        }
        this._updateBet();
    }

    lowerBet() {
        this.bet -= 50;
        if (this.bet < 50) {
            this.bet = this.balance;
        }
        this._updateBet();
    }

    /**
     * @private
     */
    _updateBet() {
        $('#ownedBet').empty().append(this.bet);
        audioFiles.changeBet.play();
    }

    /**
     * @typedef {Object} WinningLine
     * @property {Slot[]} line
     * @property {number} numMatchingSymbols
     * @property {number} rewardLevel
     */

    /**
     * @typedef {Object} SpinResult
     * @property {number} payoutMultiplier
     * @property {number} maxRewardLevel
     * @property {WinningLine[]} winningLines
     */

    /**
     * @return {SpinResult}
     */
    spinReels() {
        this.randomizeSlots();
        this.insertCoins(-this.bet);

        this.isSpinning = true;
        setTimeout((slotMachine) => {
            slotMachine.isSpinning = false
        }, 4500, this);

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].spinReel((i + 1) * 0.5);
        }

        return this._checkPayout();
    }

    /**
     * Do a simulated spin, used for balancing the payout
     * @return {SpinResult}
     */
    simulateSpin() {
        // simulate randomization, because updating the UI is slow
        const symbolPool = [];
        for (let i = 0; i < (SLOTS_PER_REEL * 3); i++) {
            symbolPool.push(this._getRandomSymbol());
        }
        for (let reel of this.reels) {
            shuffle(symbolPool);
            for (let slotIndex = 0; slotIndex < reel.slots.length; slotIndex++) {
                reel.slots[slotIndex].symbol = symbolPool[slotIndex];
            }
        }

        for (let reel of this.reels) {
            reel.simulateSpin();
        }
        return this._checkPayout();
    }

    /**
     * @return {SpinResult}
     * @private
     */
    _checkPayout() {
        let payoutMultiplier = 0;
        let maxRewardLevel = 0;
        /** @type WinningLine[] */
        const winningLines = [];

        for (let lineIndex = 0; lineIndex < this.payLines.length; lineIndex++) {
            // find slots hit by payLine
            const payLine = this.payLines[lineIndex];
            const lineSlots = payLine.map(screenIndex => this.reels[screenIndex[0]].getSlot(screenIndex[1]));

            // count number of matching symbols on payLine
            let numMatchingSymbols = 1;
            for (let i = 1; i < lineSlots.length; i++) {
                if (lineSlots[i - 1].symbol !== lineSlots[i].symbol) {
                    break;
                }
                numMatchingSymbols++;
            }

            // check the payout table
            const symbol = lineSlots[0].symbol;
            const symbolMultiplier = symbol.payoutMultipliers[numMatchingSymbols - 1];
            if (symbolMultiplier <= 0) {
                continue; // no payout, check next line
            }

            payoutMultiplier += symbolMultiplier;
            const lineRewardLevel = symbolMultiplier > 10 ? 2 : 1;
            maxRewardLevel = Math.max(maxRewardLevel, lineRewardLevel);
            winningLines.push({
                line: lineSlots,
                numMatchingSymbols: numMatchingSymbols,
                rewardLevel: lineRewardLevel,
            });
        }

        return {
            payoutMultiplier: payoutMultiplier,
            maxRewardLevel: maxRewardLevel,
            winningLines: winningLines,
        };
    }

}

/**
 * A single Reel of the SlotMachine
 */
class Reel {
    constructor() {
        /**
         * @type {HTMLElement}
         */
        this.htmlElement = null;

        /**
         * @type {Slot[]}
         */
        this.slots = [];

        /**
         * The slot at the top of the reel
         * @type {number}
         */
        this._topSlotIndex = 0;
    }

    initialize(ringElement) {
        this.htmlElement = ringElement;
        this.htmlElement.innerHTML = ''; // clear content

        const slotAngle = 360 / SLOTS_PER_REEL;
        for (let i = 0; i < SLOTS_PER_REEL; i++) {
            const slot = new Slot();
            this.slots[i] = slot;
            slot.initialize(this.htmlElement, slotAngle * i);
        }
    }

    /**
     * @param {Symbol[]} symbolPool
     */
    randomizeSlots(symbolPool) {
        shuffle(symbolPool);
        for (let i = 0; i < this.slots.length; i++) {
            this.slots[i].setSymbol(symbolPool[i]);
        }
    }

    spinReel(animationDelay) {
        this._topSlotIndex = this._getRandomSlotIndex();
        this._resetAnimation();

        this.htmlElement.style.animation = "back-spin 1s, spin-" + this._topSlotIndex + " " + (2 + animationDelay) + "s";
        this.htmlElement.className = "ring spin-" + this._topSlotIndex;
    }

    /**
     * Perform a simulated spin, for balancing the payouts
     */
    simulateSpin() {
        this._topSlotIndex = this._getRandomSlotIndex();
    }

    /**
     * @param screenYIndex number
     * @return {Slot}
     */
    getSlot(screenYIndex) {
        // note: '+3' assumes 12 slots, so this is bad code in disguise
        const slotIndex = (this._topSlotIndex + 3 + screenYIndex) % this.slots.length;
        return this.slots[slotIndex];
    }

    /**
     * @return {number}
     * @private
     */
    _getRandomSlotIndex() {
        return Math.floor(Math.random() * this.slots.length);
    }

    /**
     * @private
     */
    _resetAnimation() {
        this.htmlElement.style.animation = "none";
        this.htmlElement.offsetHeight; // reflow
    }
}

/**
 * A single Slot of a Reel
 */
class Slot {
    constructor() {
        /**
         * @type {HTMLElement}
         */
        this.htmlElement = null;

        /**
         * @type {HTMLImageElement}
         */
        this.imageElement = null;

        /**
         * @type {Symbol}
         */
        this.symbol = null;
    }

    /**
     * @param {HTMLElement} parent
     * @param {number} slotAngle
     */
    initialize(parent, slotAngle) {
        this.htmlElement = document.createElement('div');
        parent.appendChild(this.htmlElement);

        this.htmlElement.style.transform = 'rotateX(' + slotAngle + 'deg) translateZ(' + REEL_RADIUS + 'px)';

        this.imageElement = document.createElement('img');
        this.htmlElement.appendChild(this.imageElement);
        this.imageElement.style.borderRadius = "20px";
        this.imageElement.style.width = "100%";
        this.imageElement.style.height = "100%";
    }

    /**
     * @param {Symbol} symbol
     */
    setSymbol(symbol) {
        this.symbol = symbol;
        this.htmlElement.className = "slot fruit" + this.symbol.imageId;
        this.imageElement.src = "img/item" + this.symbol.imageId + ".png";
    }

    /**
     * @param rewardLevel {1 | 2}
     */
    markSlotOnLine(rewardLevel) {
        const rewardClass = (rewardLevel === 1) ? 'winner1' : 'winner2';
        this.htmlElement.classList.add(rewardClass);
    }
}

class Symbol {
    /**
     * @param {number[]} payoutMultipliers
     * @param {number} weight
     * @param {String} imageId
     */
    constructor(payoutMultipliers, weight, imageId) {
        this.payoutMultipliers = payoutMultipliers;
        this.weight = weight;
        this.imageId = imageId;
    }
}