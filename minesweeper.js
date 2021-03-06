let ROWS = 9;
let COLS = 9;
let SIZE = 24;
let canvas = document.getElementById('canvas');
let restartBtn = document.getElementById('restart');

let cells = new Map();

let failedBombKey;
let revealedKeys;
let flaggedKeys;
//pass bombs to generate map;
let map;

function toKey(row, col) {
    return row + '-' + col;
}

function fromKey(key) {
    return key.split('-').map(Number);
}

function createButtons() {
    canvas.style.width = ROWS * SIZE + 'px';
    canvas.style.height = COLS * SIZE + 'px';
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            let cell = document.createElement('button');
            cell.style.width = SIZE + 'px';
            cell.style.height = SIZE + 'px';
            cell.oncontextmenu = (e) => {
                e.preventDefault();
                toggleFlag(key);
                updateButtons();
            }
            cell.onclick = () => {
                if (failedBombKey !== null) {
                    return;
                }
                if (flaggedKeys.has(key)) {
                    return
                }
                revealCell(key);
                updateButtons();

            }
            canvas.appendChild(cell);
            cell.parentNode.style.display = 'flex';
            cell.parentNode.style.flexWrap = 'wrap';

            let key = toKey(i, j);
            cells.set(key, cell);
        }
    }
    restartBtn.onclick = startGame;
}

function startGame() {
    failedBombKey = null;
    revealedKeys = new Set();
    flaggedKeys = new Set();
    //pass bombs to generate map;
    map = generateMap(generateBombbs());
    if (cells) {
        updateButtons();
    } else {
        cells = new Map();
        createButtons();
    }
}

function updateButtons() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            let key = toKey(i, j);
            let cell = cells.get(key);

            cell.style.backgroundColor = '';
            cell.style.color = 'black';
            cell.textContent = '';
            cell.disabled = false;
            let value = map.get(key);
            // console.log(value)
            if (failedBombKey !== null && value === 'bomb') {
                cell.disabled = true;
                cell.textContent = '????';
                if (key === failedBombKey) {
                    cell.style.background = 'red';
                }

            } else if (revealedKeys.has(key)) {
                cell.disabled = true;
                if (value === undefined) {
                    // cell.textContent = '';
                } else if (value === 1) {
                    cell.textContent = '1';
                    cell.style.color = 'blue'
                } else if (value === 2) {
                    cell.textContent = '2';
                    cell.style.color = 'green';
                } else if (value >= 3) {
                    cell.textContent = value;
                    cell.style.color = 'red'
                } else {
                    throw Error("should never happen");
                }

            } else if (flaggedKeys.has(key)) {
                cell.textContent = '????'
            }
        }
    }
    if (failedBombKey !== null) {
        canvas.style.pointerEvents = 'none';
        restartBtn.style.display = 'block';
    } else {
        canvas.style.pointerEvents = '';
        restartBtn.style.display = '';
    }
}

function toggleFlag(key) {
    if (flaggedKeys.has(key)) {
        flaggedKeys.delete(key);
    } else {
        flaggedKeys.add(key)
    }
}

// function revealCells(key) {

// }

function revealCell(key) {
    if (map.get(key) === 'bomb') {
        failedBombKey = key
    } else {

        propagateReveal(key, new Set());
    }
}

function propagateReveal(key, visited) {
    revealedKeys.add(key);
    visited.add(key);
    let isEmpty = !map.has(key);
    if (isEmpty) {
        for (let neighborKey of getNeighbors(key)) {
            if (!visited.has(neighborKey)) {
                propagateReveal(neighborKey, visited);
            }
        }
    }

}

function isInbounds([row, col]) {
    if (row < 0 || col < 0) {
        return false;
    }
    if (row >= ROWS || col >= COLS) {
        return false;
    }
    return true;
}

function getNeighbors(key) {
    let [row, col] = fromKey(key);
    let neighborRowCols = [
        [row - 1, col - 1],
        [row - 1, col],
        [row - 1, col + 1],
        [row, col - 1],
        [row, col + 1],
        [row + 1, col - 1],
        [row + 1, col],
        [row + 1, col + 1]
    ]
    return neighborRowCols
        .filter(isInbounds)
        .map(([r, c]) => toKey(r, c));
}

function generateBombbs() {
    let count = Math.round(Math.sqrt(ROWS * COLS));
    let bombs = [];
    let allKeys = [];
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            allKeys.push(toKey(i, j));
        }
    }
    //shuffle an array 
    allKeys.sort(() => {
        let coinFlip = Math.random() > 0.5;
        return coinFlip ? 1 : -1;
    })
    return allKeys.slice(0, count);

}
// generateBombbs();

function generateMap(seedBombs) {
    let map = new Map();

    function incrementDanger(neighborKey) {
        if (!map.has(neighborKey)) {
            map.set(neighborKey, 1);
        } else {
            let oldVal = map.get(neighborKey);
            if (oldVal !== 'bomb') {
                map.set(neighborKey, oldVal + 1);
            }
        }
    }
    for (let key of seedBombs) {
        map.set(key, 'bomb');
        for (let neighborKey of getNeighbors(key)) {
            incrementDanger(neighborKey);
        }
    }
    console.log(map);
    return map;
}
createButtons();
startGame();