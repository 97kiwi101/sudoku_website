// Updated API URL to fetch a new board with difficulty
const apiUrl = 'https://sudoku-api.vercel.app/api/dosuku';
let solutionGrid = [];

/**
 * Creates and renders a Sudoku grid with flippable input cells.
 */
function renderBoard(boardData, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('sudoku-grid');

    const tbody = document.createElement('tbody');
    boardData.forEach((rowData, rowIndex) => {
        const tr = document.createElement('tr');
        rowData.forEach((cellData, colIndex) => {
            const td = document.createElement('td');
            // Store coordinates on the cell for easy access
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;

            if (cellData === 0) {
                // Create the flipper structure
                const flipper = document.createElement('div');
                flipper.classList.add('cell-flipper');

                const front = document.createElement('div');
                front.classList.add('cell-front');

                const back = document.createElement('div');
                back.classList.add('cell-back');

                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^1-9]/g, '');
                });

                front.appendChild(input);
                flipper.appendChild(front);
                flipper.appendChild(back);
                td.appendChild(flipper);

            } else {
                td.textContent = cellData;
                td.classList.add('pre-filled');
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

/**
 * Removes all highlights from the board.
 */
function clearHighlights() {
    document.querySelectorAll('.sudoku-grid td').forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

/**
 * Highlights the row, column, and 3x3 box for a selected cell.
 * @param {HTMLElement} cell The table cell (<td>) that was clicked or focused.
 */
function highlightGuides(cell) {
    clearHighlights();
    
    const rowIndex = parseInt(cell.dataset.row);
    const colIndex = parseInt(cell.dataset.col);
    const allCells = document.querySelectorAll('.sudoku-grid td');

    allCells.forEach(c => {
        const row = parseInt(c.dataset.row);
        const col = parseInt(c.dataset.col);

        // Check for same row or column
        if (row === rowIndex || col === colIndex) {
            c.classList.add('highlighted');
        }

        // Check for same 3x3 box
        const boxStartRow = Math.floor(rowIndex / 3) * 3;
        const boxStartCol = Math.floor(colIndex / 3) * 3;
        if (row >= boxStartRow && row < boxStartRow + 3 && col >= boxStartCol && col < boxStartCol + 3) {
            c.classList.add('highlighted');
        }
    });
}

/**
 * Checks each cell, flips correct answers, and shakes incorrect ones.
 */
function checkSolution() {
    const tableRows = document.querySelectorAll('#problem-board tr');
    const resultMsg = document.getElementById('result-message');
    
    tableRows.forEach((row, rowIndex) => {
        row.querySelectorAll('td').forEach((cell, cellIndex) => {
            const flipper = cell.querySelector('.cell-flipper');
            if (flipper && !flipper.classList.contains('is-flipped')) {
                const input = cell.querySelector('input');
                const userValue = parseInt(input.value) || 0;
                const correctValue = solutionGrid[rowIndex][cellIndex];

                if (userValue !== 0) {
                    if (userValue === correctValue) {
                        const back = cell.querySelector('.cell-back');
                        back.textContent = correctValue;
                        flipper.classList.add('is-flipped');
                        input.disabled = true;
                    } else {
                        cell.classList.add('shake');
                        setTimeout(() => cell.classList.remove('shake'), 500);
                    }
                }
            }
        });
    });

    const remainingInputs = document.querySelectorAll('.cell-flipper:not(.is-flipped)').length;
    if (remainingInputs === 0) {
        resultMsg.textContent = 'You solved it! Congratulations!';
        resultMsg.className = 'correct';
        clearHighlights();
    } else {
        resultMsg.textContent = 'Keep going...';
        resultMsg.className = '';
    }
}


function fetchAndRenderNewPuzzle() {
    document.getElementById('result-message').textContent = '';
    document.getElementById('problem-board').innerHTML = '<p>Loading a new puzzle...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const gridData = data.newboard.grids[0];
            const problem = gridData.value;
            solutionGrid = gridData.solution;
            const difficulty = gridData.difficulty;

            document.getElementById('difficulty-display').textContent = `Difficulty: ${difficulty}`;
            console.log("Here is the complete solution for debugging: ✅");
            console.table(solutionGrid);

            renderBoard(problem, 'problem-board');
        })
        .catch(error => {
            console.error('There was a problem fetching the Sudoku data:', error);
            document.getElementById('problem-board').innerHTML = '<p>Could not load a new puzzle. Please try again later.</p>';
        });
}


function isProgressMade() {
    const userInputs = document.querySelectorAll('#problem-board input');
    return Array.from(userInputs).some(input => input.value.trim() !== '');
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderNewPuzzle();

    document.getElementById('check-button').addEventListener('click', checkSolution);

    document.getElementById('new-puzzle-button').addEventListener('click', () => {
        if (!isProgressMade() || confirm("Are you sure? Your progress will be lost.")) {
            fetchAndRenderNewPuzzle();
        }
    });

    document.getElementById('home-button').addEventListener('click', () => {
        if (!isProgressMade() || confirm("Are you sure? Your progress will be lost.")) {
            window.location.href = 'index.html';
        }
    });

    const boardContainer = document.getElementById('problem-board');


    boardContainer.addEventListener('click', (event) => {
        const cell = event.target.closest('td');
        if (cell) {
            highlightGuides(cell);
        }
    });
    

    boardContainer.addEventListener('focusin', (event) => {
        const cell = event.target.closest('td');
        if (cell) {
            highlightGuides(cell);
        }
    });


    boardContainer.addEventListener('focusout', (event) => {

        if (!boardContainer.contains(event.relatedTarget)) {
            clearHighlights();
        }
    });
});