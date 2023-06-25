/// This resource was made by plesalex100#7387
/// Please respect it, don't sell it or post it without my permission
/// This resource started from: https://codepen.io/AdrianSandu/pen/MyBQYz
// I know you don't put 3 slashes :)

// You can add or remove lines here
// each line represents the sequence of corrugations that form a line,
// lines that start from 0 and end at 1
const lines = [
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],

    [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
    [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]]
];

// You can change the win multipliers for each fruit
// the first 0 has no importance
// each line represents the sequence of multiplications depending on how many fruits of the same time are caught in a row in a line
// For example: in Oranges if you get 3 in a row the multiply will be x4, if you get 5 then it will be x40.
const winTable = [
    [0],
    [1, 1, 3, 5, 10], // Cherries
    [1, 1, 4, 10, 15], // Prune (Plum)
    [1, 1, 4, 10, 15], // Lemon
    [1, 1, 4, 10, 15], // Oranges
    [1, 1, 10, 20, 50], // Grapes
    [1, 1, 10, 20, 50], // Melon
    [1, 1, 20, 150, 600] // Seven
];

/// From here on down, be careful what you modify, do it at your own risk
const SLOTS_PER_REEL = 12;
const REEL_RADIUS = 209;

class AudioFile {
    /**
     * @param fileName String
     * @param volume number
     */
    constructor(fileName, volume) {
        this.fileName = fileName;
        this.player = null;
    }

    /**
     * Add the audioFile to the document
     */
    _load() {
        this.player = document.createElement('audio');
        this.player.setAttribute('src', 'audio/' + this.fileName + '.wav');
        this.player.volume = volume;
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

/**
 * @type {Object<String, AudioFile>}
 */
const audioFiles = {
    changeBet: new AudioFile("changeBet", 0.6),
    startSlotMachine: new AudioFile("pornestePacanele", 0.6),
    alarm: new AudioFile("alarma", 0.6),
    winLine: new AudioFile("winLine", 0.6),
    collect: new AudioFile("collect", 0.6),
    winDouble: new AudioFile("winDouble", 0.6),
    spinNoise: new AudioFile("seInvarte", 0.09),
    buttonNoise: new AudioFile("apasaButonul", 0.6)
}

let coins = 0;
let bet = 50;

let backCoins = coins * 2;
let backBet = bet * 2;

let machineIsRolling = false;

function insertCoin(amount) {
    coins += amount;
    backCoins = coins * 2;
    $('#ownedCoins').empty().append(coins);
}

function setBet(amount) {
    if (amount > 0) {
        if (amount > coins) {
            amount = 50;
        }
        bet = amount;
        backBet = bet * 2;
        $('#ownedBet').empty().append(bet);
        audioFiles.changeBet.play();
    }
}

const tbl1 = [], tbl2 = [], tbl3 = [], tbl4 = [], tbl5 = [];
const crd1 = [], crd2 = [], crd3 = [], crd4 = [], crd5 = [];

function createSlots(ring, id) {
    const slotAngle = 360 / SLOTS_PER_REEL;
    let seed = getSeed();

    for (let i = 0; i < SLOTS_PER_REEL; i++) {
        const slot = document.createElement('div');
        slot.style.transform = 'rotateX(' + (slotAngle * i) + 'deg) translateZ(' + REEL_RADIUS + 'px)';

        let imgID = (seed + i) % 7 + 1;
        seed = getSeed();
        if (imgID == 7) {
            imgID = (seed + i) % 7 + 1;
        }

        slot.className = 'slot' + ' fruit' + imgID;
        slot.id = id + 'id' + i;
        $(slot).empty().append('<p>' + createImage(imgID) + '</p>');
// add the poster to the row
        ring.append(slot);
    }
}

function createImage(id) {
    return '<img src="img/item' + id + '.png" style="border-radius: 20px;" width=100 height=100>';
}

function getSeed() {
    return Math.floor(Math.random() * (SLOTS_PER_REEL));
}

function setWinner(cls, level) {
    if (level >= 1) {
        const cl = (level == 1) ? 'winner1' : 'winner2';
        $(cls).addClass(cl);
    }
}

function reverseStr(str) {
    return str.split("").reverse().join("");
}

let canDouble = 0;
const colorHistory = Array(8).fill(-1);

let timesPayoutDoubled = 0;

function endWithWin(x, sound) {
    $('#win').empty().append(x);
    $('.win').show();
    $('.dblOrNothing').show();

    $('.betUp').empty().append("Rot");
    $('.AllIn').empty().append("Schwarz");
    $('.go').empty().append("Sammeln");

    canDouble = x;

    if (sound == 1) { // WinAtDouble
        audioFiles.winDouble.play();
        timesPayoutDoubled++;
        if (timesPayoutDoubled >= 4) {
            pressROLL();
        }
    }
}

function looseDouble() {
    canDouble = 0;
    timesPayoutDoubled = 0;
    $('.win').hide();
    $('.dblOrNothing').hide();

    $('.betUp').empty().append("+50");
    $('.AllIn').empty().append("Setzen Sie alles ein");
    $('.go').empty().append("Spielen");
}

function voteColor(x, color) {
    const randomColor = Math.floor(Math.random() * (2));
    colorHistory.shift(); // remove the oldest entry
    colorHistory.push(randomColor);

    for (let i = 0; i < colorHistory.length; i++) {
        const panelId = '#h' + (i + 1);
        const $historyPanel = $(panelId)
        $historyPanel.empty();

        let historyColor = null;
        if (colorHistory[i] === 0) {
            historyColor = 'black';
        } else if (colorHistory[i] === 1) {
            historyColor = 'red';
        }

        if (historyColor !== null) {
            $historyPanel.append("<img src='img/" + historyColor + ".png' width=30px height=30px/>");
        }
    }

    if (randomColor == color) {
        endWithWin(x * 2, 1);
    } else {
        looseDouble();
    }
}

function spin(timer) {
    let winnings = 0;
    audioFiles.spinNoise.play();
    for (let i = 1; i < 6; i++) {
        let z = 2;
        let oldSeed = -1;

        let $ringElement = $('#ring' + i);
        const oldClass = $ringElement.attr('class');
        if (oldClass.length > 4) {
            oldSeed = parseInt(oldClass.slice(10));
        }
        let seed = getSeed();
        while (oldSeed == seed) {
            seed = getSeed();
        }

        let pSeed = seed;
        for (let j = 1; j <= 5; j++) {
            pSeed += 1;
            if (pSeed == 12) {
                pSeed = 0;
            }
            if (j >= 3) {
                const msg = $('#' + i + 'id' + pSeed).attr('class');
                switch (i) {
                    case 1:
                        tbl1[z] = reverseStr(msg)[0];
                        crd1[z] = '#' + i + 'id' + pSeed
                        break;
                    case 2:
                        tbl2[z] = reverseStr(msg)[0];
                        crd2[z] = '#' + i + 'id' + pSeed
                        break;
                    case 3:
                        tbl3[z] = reverseStr(msg)[0];
                        crd3[z] = '#' + i + 'id' + pSeed
                        break;
                    case 4:
                        tbl4[z] = reverseStr(msg)[0];
                        crd4[z] = '#' + i + 'id' + pSeed
                        break;
                    case 5:
                        tbl5[z] = reverseStr(msg)[0];
                        crd5[z] = '#' + i + 'id' + pSeed
                        break;
                }
                z -= 1;
            }
        }

        $ringElement
            .css('animation', 'back-spin 1s, spin-' + seed + ' ' + (timer + i * 0.5) + 's')
            .attr('class', 'ring spin-' + seed);
    }
    const table = [tbl1, tbl2, tbl3, tbl4, tbl5];
    const cords = [crd1, crd2, crd3, crd4, crd5];

    for (const k in lines) {
        let wins = 0;
        let last = table[lines[k][0][0]][lines[k][0][1]];
        let lvl = 0;

        for (const x in lines[k]) {
            if (last == table[lines[k][x][0]][lines[k][x][1]]) {
                wins++;
                last = table[lines[k][x][0]][lines[k][x][1]];
            } else {
                break;
            }
        }

        switch (wins) {
            case 2:
                if (last == 1) {
                    lvl = 1;
                    setTimeout(audioFiles.winLine.play, 3950);
                }
                break;
            case 3:
                lvl = 1;
                setTimeout(audioFiles.winLine.play, 3950);
                break;
            case 4:
                lvl = 2;
                setTimeout(audioFiles.alarm.play, 3200 + 700 + 0.3 * k * 1000);
                break;
            case 5:
                lvl = 2;
                setTimeout(audioFiles.alarm.play, 3200 + 0.3 * k * 1000);
                break;
        }
        if (lvl > 0) {
            winnings = winnings + bet * winTable[table[lines[k][wins - 1][0]][lines[k][wins - 1][1]]][wins - 1];
            setTimeout(endWithWin, 4400, winnings, 0);
        }

        for (let p = wins - 1; p >= 0; p--) {
            setTimeout(setWinner, 3200 + 0.4 * p * 1000 + 0.3 * k * 1000, cords[lines[k][p][0]][lines[k][p][1]], lvl);
        }
    }
    setTimeout(function () { machineIsRolling = false; }, 4500);
}

function pressROLL() {
    if (machineIsRolling) {
        return; // ignore input while rolling
    }

    if (canDouble == 0) {
        if (backCoins / 2 !== coins) {
            coins = backCoins / 2;
        }
        if (backBet / 2 !== bet) {
            bet = backBet / 2;
        }

        audioFiles.button.play();
        $('.slot').removeClass('winner1 winner2');
        if (coins >= bet && coins !== 0) {
            insertCoin(-bet);

            machineIsRolling = true;
            const timer = 2;
            spin(timer);
        } else if (bet != coins && bet != 50) {
            setBet(coins);
        }
    } else {
        setTimeout(insertCoin, 200, canDouble);
        audioFiles.collect.play();
        looseDouble();
    }
}

function pressBLACK() {
    if (canDouble == 0) {
        setBet(coins);
    } else {
        voteColor(canDouble, 1);
    }
}

function pressRED() {
    if (canDouble == 0) {
        setBet(bet + 50);
    } else {
        voteColor(canDouble, 0);
    }
}

let allFile;

function resetRings() {
    const rng1 = $("#ring1"),
        rng2 = $("#ring2"),
        rng3 = $("#ring3"),
        rng4 = $("#ring4"),
        rng5 = $("#ring5");

    rng1.empty()
        .removeClass()
        .addClass("ring")
        .removeAttr('id')
        .attr('id', 'ring1');

    rng2.empty()
        .removeClass()
        .addClass("ring")
        .removeAttr('id')
        .attr('id', 'ring2');

    rng3.empty()
        .removeClass()
        .addClass("ring")
        .removeAttr('id')
        .attr('id', 'ring3');

    rng4.empty()
        .removeClass()
        .addClass("ring")
        .removeAttr('id')
        .attr('id', 'ring4');

    rng5.empty()
        .removeClass()
        .addClass("ring")
        .removeAttr('id')
        .attr('id', 'ring5');

    createSlots($('#ring1'), 1);
    createSlots($('#ring2'), 2);
    createSlots($('#ring3'), 3);
    createSlots($('#ring4'), 4);
    createSlots($('#ring5'), 5);
}

function toggleSlotMachine(start, numCoins) {
    if (start == true) {
        allFile.css("display", "block");
        audioFiles.startSlotMachine.play();
        coins = 0;
        insertCoin(numCoins);

        resetRings();

        machineIsRolling = true;
        setTimeout(function () { machineIsRolling = 0; }, 4000);
    } else {
        allFile.css("display", "none");
        $.post("http://empire_slotovi/exitWith", JSON.stringify({
            coinAmount: backCoins / 2
        }));
        insertCoin(-coins); // Take all the money out of the machine
    }
}

window.addEventListener('message', function (event) {
    if (event.data['showSlotMachine'] == "open") {
        toggleSlotMachine(true, event.data.coinAmount);
    }
});

/// know that everything was done with passion and love by plesalex100#7387
/// I write this here because I know that only those who care what
/// what happened here, you will read something. Total working time: ~15 hours
/// Where we started: https://codepen.io/AdrianSandu/pen/MyBQYz
/// Everything it's possible !

jQuery(function () {
    allFile = $("#stage");
    allFile.css("display", "none");
    createSlots($('#ring1'), 1);
    createSlots($('#ring2'), 2);
    createSlots($('#ring3'), 3);
    createSlots($('#ring4'), 4);
    createSlots($('#ring5'), 5);

    $('.win').hide();
    $('.dblOrNothing').hide();

    $('#ownedCoins').empty().append(coins);
    $('#ownedBet').empty().append(bet);

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
                setBet(bet + 50); // raise BET
                break;
            case 40:
                setBet(bet - 50); // lower BET
                break;
            case 27:
                toggleSlotMachine(false, 0); // ESC
                break;
            case 80:
                toggleSlotMachine(false, 0); // P - Pause Menu
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
