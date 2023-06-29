/**
 * @param {number} numTrials
 * @param {number} numSpins
 * @param {SlotMachine} slotMachine
 */
function simulateSlotsPayout(numTrials, numSpins, slotMachine) {
    let avgSpinPayout = 0;
    let spinPayouts = [];
    let timesPentaSeven = 0;
    let timesQuadSeven = 0;

    for(let trialNumber = 0; trialNumber < numTrials; trialNumber++) {

        let totalPayout = 0;
        for(let spinNumber = 0; spinNumber < numSpins; spinNumber++) {
            let spinResult = slotMachine.simulateSpin();
            totalPayout = totalPayout - 1 + spinResult.payoutMultiplier;

            for (let winningLine of spinResult.winningLines) {
                if(winningLine.line[0].symbol.imageId === "7") {
                    if(winningLine.numMatchingSymbols === 4) {
                        timesQuadSeven++;
                    }else if(winningLine.numMatchingSymbols === 5) {
                        timesPentaSeven++;
                    }
                }
            }
        }
        console.log("totalPayout: " + totalPayout + " = $" + (totalPayout * 50) + " at $50 bets");
        let spinPayout = totalPayout / numSpins;
        avgSpinPayout += (spinPayout / numTrials);
        spinPayouts.push(spinPayout);

    }

    spinPayouts.sort();
    console.log(spinPayouts);
    console.log("avg payout: " + avgSpinPayout);
    console.log("timesPenta: " + timesPentaSeven + " | timesQuad: " + timesQuadSeven);
}

function testPayout() {
    simulateSlotsPayout(250, 25000, slotMachine);
}
