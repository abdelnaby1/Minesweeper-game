let ROWS = 9;
let COLS = 9;
let SIZE = 24;
let canvas = document.getElementById('canvas');

let cells = new Map();
let revealedKeys = new Set();
//pass bombs to generate map;
let map = generateMap(generateBombbs());

//values.set('0-0',1);
//values.set('0-1',1); 
//values.set('1-0',1); 
//values.set('1-1',1); 

//console.log(values)
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
            cell.onclick = () => {
                revealCell(key)
            }
            canvas.appendChild(cell);
            cell.parentNode.style.display = 'flex';
            cell.parentNode.style.flexWrap = 'wrap';

            let key = toKey(i, j);
            cells.set(key, cell);
        }
    }
}
//console.log(cells)
function updateButtons() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            let key = toKey(i, j);
            let cell = cells.get(key);

            if (revealedKeys.has(key)) {
                cell.disabled = true;
                let value = map.get(key);
                if (value === undefined) {
                    cell.textContent = '';
                } else if (value === 1) {
                    cell.textContent = '1';
                    cell.style.color = 'blue'
                } else if (value === 2) {
                    cell.textContent = '2';
                    cell.style.color = 'green';
                } else if (value === 3) {
                    cell.textContent = '3';
                    cell.style.color = 'red'
                } else if (value === 'bomb') {
                    cell.textContent = '💣'
                    cell.style.background = 'red'
                } else {
                    throw Error("Todo");
                }
            } else {
                cell.textContent = ''
            }
        }
    }
}

function revealCell(key) {
    revealedKeys.add(key);
    updateButtons();
}

function isInbounds([row, col]) {
    if (row < 0 || col < 0) {
        return false;
    }
    if (row > ROWS || col > COLS) {
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
generateBombbs();

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
            // console.log(key, '=>', neighborKey)
            incrementDanger(neighborKey);
        }
    }
    // console.log(map);
    return map;
}

createButtons();