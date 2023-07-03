/// This resource was completely rewritten by blazingtwist
/// It is based on a resource made by plesalex100#7387
/// Whose resource is based on: https://codepen.io/AdrianSandu/pen/MyBQYz

// ===========================
// Safely Configurable Stuff

const slotMachine = new SlotMachine([
    // These symbols contain a list of bet-multipliers, e.g. 3 melons in a row give 10x bet.
    new Symbol([0, 1, 2, 3, 5], 10, "1"), // cherry
    new Symbol([0, 0, 3, 6, 15], 8, "2"), // plum
    new Symbol([0, 0, 3, 6, 15], 8, "3"), // lemon
    new Symbol([0, 0, 3, 6, 15], 8, "4"), // orange
    new Symbol([0, 0, 5, 10, 25], 5, "5"), // grape
    new Symbol([0, 0, 5, 10, 25], 5, "6"), // melon
    new Symbol([0, 0, 7, 77, 777], 3, "7"), // seven
], [
    // You can add or remove payLines here
    // each line (of text) represents the sequence of coordinates that form a payLine.
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],

    [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
    [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]],

//    [[0, 1], [1, 0], [2, 1], [3, 2], [4, 1]],
//    [[0, 1], [1, 2], [2, 1], [3, 0], [4, 1]],

//    [[0, 2], [1, 2], [2, 1], [3, 0], [4, 0]],
//    [[0, 0], [1, 0], [2, 1], [3, 2], [4, 2]],
]);

const doubleOrNothing = new DoubleOrNothing(4);

/**
 * @type {Object<String, AudioFile>}
 */
const audioFiles = {
    alarm: new AudioFile("alarm", 0.4),
    buttonNoise: new AudioFile("buttonNoise", 0.4),
    changeBet: new AudioFile("changeBet", 0.4),
    collect: new AudioFile("collect", 0.4),
    startSlotMachine: new AudioFile("startSlotMachine", 0.4),
    spinNoise: new AudioFile("spinNoise", 0.06),
    winDouble: new AudioFile("winDouble", 0.4),
    winLine: new AudioFile("winLine", 0.4),
}

// End of Safely Configurable Stuff
// ==================================

const SLOTS_PER_REEL = 12; // change this and everything breaks, because the original author has hard-coded everything around this being 12
const REEL_RADIUS = 209;

let allFile;
let payIn = 0;

function spin() {
    audioFiles.spinNoise.play();
    const spinResult = slotMachine.spinReels();
    const rewardLevel = spinResult.payoutMultiplier > 10 ? 2 : 1;

    // queue slots for being marked as "winning" slots
    for (let winningLine of spinResult.winningLines) {
        for (let slotIndex = 0; slotIndex < winningLine.numMatchingSymbols; slotIndex++) {
            const slotTimeOffset = 0.4 * slotIndex * 1000;
            setTimeout((slot, lvl) => slot.markSlotOnLine(lvl), 3500 + slotTimeOffset, winningLine.line[slotIndex], rewardLevel);
        }
    }

    if (spinResult.payoutMultiplier > 0) {
        setTimeout((audio) => audio.play(), 3950, rewardLevel >= 2 ? audioFiles.alarm : audioFiles.winLine);
    }

    if (spinResult.payoutMultiplier > 0) {
        setTimeout((payout) => {
            doubleOrNothing.startGame(payout);
        }, 4400, (spinResult.payoutMultiplier * slotMachine.bet));
    }
}

function pressROLL() {
    if (slotMachine.isSpinning) {
        return; // ignore input while spinning
    }

    if (doubleOrNothing.isActive()) {
        slotMachine.insertCoins(doubleOrNothing.takePayout());
        audioFiles.collect.play();
        return;
    }

    if (slotMachine.checkCanBet()) {
        $.post("http://CasinoSlots/pressedSpinReels", "{}");
        audioFiles.buttonNoise.play();
        $('.slot').removeClass('winner1 winner2');
        spin();
    } else {
        if (slotMachine.isInsufficientBalance()) {
            audioFiles.changeBet.play();
        } else {
            slotMachine.allIn();
        }
    }
}

function pressBLACK() {
    if (doubleOrNothing.balance === 0) {
        slotMachine.allIn();
    } else {
        doubleOrNothing.betOnColor(betColors.black);
    }
}

function pressRED() {
    if (doubleOrNothing.balance === 0) {
        slotMachine.raiseBet();
    } else {
        doubleOrNothing.betOnColor(betColors.red);
    }
}

/**
 * @param {number} numCoins
 */
function showSlotMachine(numCoins) {
    payIn = numCoins;
    slotMachine.initialize();
    allFile.css("display", "block");
    audioFiles.startSlotMachine.play();
    slotMachine.insertCoins(numCoins);
}

function stopSlotMachine() {
    allFile.css("display", "none");

    for (let reel of slotMachine.reels) {
        reel.resetAnimation();
    }

    const payoutCoins = slotMachine.takeAllCoins() + doubleOrNothing.takePayout();
    const payInCache = payIn;
    payIn = 0;
    $.post("http://CasinoSlots/exitWith", JSON.stringify({
        payOut: payoutCoins,
        payIn: payInCache,
    }));
}

window.addEventListener('message', function (event) {
    // noinspection EqualityComparisonWithCoercionJS not sure if this is intentionally coerced
    if (event.data['action'] == "showSlotMachine") {
        showSlotMachine(event.data['coinAmount']);
    }

    // noinspection EqualityComparisonWithCoercionJS not sure if this is intentionally coerced
    if (event.data['action'] == "stopSlotMachine") {
        stopSlotMachine();
    }
});

/// know that everything was done with passion and love by plesalex100#7387
/// I write this here because I know that only those who care what
/// what happened here, you will read something. Total working time: ~15 hours
/// Where we started: https://codepen.io/AdrianSandu/pen/MyBQYz
/// Everything it's possible !

jQuery(function () {
    allFile = $("#stage");

    $('.win').hide();
    $('.dblOrNothing').hide();

    $('#ownedCoins').empty().append(slotMachine.balance);
    $('#ownedBet').empty().append(slotMachine.bet);

    $('body').keyup(function (e) {
        $(':focus').blur();
        switch (e.keyCode) {
            case 32:
                pressROLL(); // space
                break;
            case 13:
                pressROLL(); // enter
                break;
            case 37:
                pressRED(); // left-arrow
                break;
            case 39:
                pressBLACK(); // right-arrow
                break;
            case 38:
                slotMachine.raiseBet(); // arrow-up
                break;
            case 40:
                slotMachine.lowerBet(); // arrow-down
                break;
            case 27:
                stopSlotMachine(); // ESC
                break;
            case 80:
                stopSlotMachine(); // P - Pause Menu
                break;
        }
    });

    $('.betUp').on('click', function () { // RED
        pressRED();
    })

    $('.AllIn').on('click', function () { // BLACK
        pressBLACK();
    })

    $('.go').on('click', function () { // COLLECT
        pressROLL();
    })
});
