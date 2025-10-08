// The URL now only requests the 'solution' for a new board
const apiUrl = 'https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{solution}}}';

// Use fetch to make the request
fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON from the response
  })
  .then(data => {
    // Get the solution from the response data
    const solution = data.newboard.grids[0].solution;

    // Print only the solution
    console.log("Here is the solution: ✅");
    console.table(solution);
  })
  .catch(error => {
    // Handle any errors
    console.error('There was a problem fetching the Sudoku solution:', error);
  });