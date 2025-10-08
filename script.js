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
    boardData.forEach(rowData => {
        const tr = document.createElement('tr');
        rowData.forEach(cellData => {
            const td = document.createElement('td');
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
 * Checks each cell, flips correct answers, and shakes incorrect ones.
 */
function checkSolution() {
    const tableRows = document.querySelectorAll('#problem-board tr');
    const resultMsg = document.getElementById('result-message');
    let incorrectCount = 0;
    
    tableRows.forEach((row, rowIndex) => {
        row.querySelectorAll('td').forEach((cell, cellIndex) => {
            const flipper = cell.querySelector('.cell-flipper');
            if (flipper && !flipper.classList.contains('is-flipped')) {
                const input = cell.querySelector('input');
                const userValue = parseInt(input.value) || 0;
                const correctValue = solutionGrid[rowIndex][cellIndex];
                
                if (userValue !== 0) {
                    if (userValue === correctValue) {
                        // Correct answer: set back, flip, and disable
                        const back = cell.querySelector('.cell-back');
                        back.textContent = correctValue;
                        flipper.classList.add('is-flipped');
                        input.disabled = true;
                    } else {
                        // Incorrect answer: shake the cell
                        cell.classList.add('shake');
                        setTimeout(() => cell.classList.remove('shake'), 500);
                        incorrectCount++;
                    }
                } else {
                    incorrectCount++; // Empty cells are also "incorrect" for winning purposes
                }
            }
        });
    });

    // Check if the board is fully solved
    const remainingInputs = document.querySelectorAll('.cell-flipper:not(.is-flipped)').length;
    if (remainingInputs === 0) {
        resultMsg.textContent = 'You solved it! Congratulations! 🎉';
        resultMsg.className = 'correct';
    } else {
        resultMsg.textContent = 'Keep going...';
        resultMsg.className = '';
    }
}

/**
 * Fetches data from the API and renders a new Sudoku board.
 */
function fetchAndRenderNewPuzzle() {
    // Clear previous results and show a loading message
    document.getElementById('result-message').textContent = '';
    document.getElementById('problem-board').innerHTML = '<p>Loading a new puzzle...</p>';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
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

/**
 * NEW: Checks if the user has entered any values into the grid.
 * @returns {boolean} True if at least one input has a value, false otherwise.
 */
function isProgressMade() {
    const userInputs = document.querySelectorAll('#problem-board input');
    for (const input of userInputs) {
        if (input.value.trim() !== '') {
            return true; // Found an entered value
        }
    }
    return false; // No values found
}


// --- Main execution ---
// When the page is fully loaded, set up the event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the first puzzle when the page loads
    fetchAndRenderNewPuzzle();

    // Attach event listener for the check button
    document.getElementById('check-button').addEventListener('click', checkSolution);
    
    // Attach event listener for the New Puzzle button
    document.getElementById('new-puzzle-button').addEventListener('click', () => {
        // Only ask for confirmation if the user has started playing
        if (isProgressMade()) {
            if (confirm("Are you sure you want a new puzzle? Your progress will be lost.")) {
                fetchAndRenderNewPuzzle();
            }
        } else {
            // If no progress, just get a new puzzle without asking
            fetchAndRenderNewPuzzle();
        }
    });
    
    // Attach event listener for the Home button
    document.getElementById('home-button').addEventListener('click', () => {
        // Only ask for confirmation if the user has started playing
        if (isProgressMade()) {
            if (confirm("Are you sure you want to go back home? Your progress will be lost.")) {
                window.location.href = 'index.html';
            }
        } else {
            // If no progress, just go home without asking
            window.location.href = 'index.html';
        }
    });
});