
module.exports = function solveSudoku(matrix) {
  return new Sudoku(matrix);
}

Sudoku = function(matrix) {

  var workMatrix = [];
  var initialMatrix = [];
  var steps = 0;
  var hasSolutions = 0;

  for (var i = 0; i < 9; i++) {
    initialMatrix[i] = new Array;
    for (var j = 0; j < 9; j++) {
        initialMatrix[i][j] = matrix[i][j];
    }
  }
  workMatrix = initWorkMatrix();
  while (steps < 81) {
    hasSolutions = lookForSolutions();
    steps++;
    if (!hasSolutions) {
      break;
    }
  }
  if (!isSolved(initialMatrix) && !isFailed(workMatrix)) {
    substitution();
  }
  return initialMatrix;

  

  /**
   * Out of intial matrix making a new one.
   * Each sell contains info either it's 'solved' or 'empty' 
   * + array of all possible solutions.
   */
  function initWorkMatrix() {
    var array = new Array;
    var allPossibleSolutions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (var i = 0; i < 9; i++) {
      array[i] = new Array;
      for (var j = 0; j < 9; j++) {
        array[i][j] = new Array;
        if (initialMatrix[i][j] == 0) {
          var data = ['empty', allPossibleSolutions];
          array[i][j] = data;
        } else {
          array[i][j] = ['solved', []];
        }
      }
    }
    return array;
  }

  /**
   * The following three functions ->
   * For all 'empty' cells getting arrays with all already  
   * exisiting values in appropriate row, column and square
   */
  
  function getRowValues(i) {
  var rowValues = [];
  for (var j = 0; j < 9; j++) {
    if (workMatrix[i][j][0] != 'empty') {
      rowValues.push(initialMatrix[i][j]);
    }
  }
  return rowValues;
}

  function getColValues(j) {
    var colValues = [];
    for (var i = 0; i < 9; i++) {
      if (workMatrix[i][j][0] != 'empty') {
        colValues.push(initialMatrix[i][j]);
      }
    }
    return colValues;
  }

  function getSquareValues(i, j) {
    var squareValues = [];
    var squareX = Math.floor(i/3);
    var squareY = Math.floor(j/3);
    for (var x = squareX * 3; x < squareX * 3 + 3; x++) {
      for (var y = squareY * 3; y < squareY * 3 + 3; y++) {
        if (workMatrix[x][y][0] != "empty") {
          squareValues.push(initialMatrix[x][y]);
        }
      }
    }
    return squareValues;
  }

  /**
   * Applying either single or hidden sungle methods for "empty" cells
   */
  function lookForSolutions () {
  var isChanged = 0;
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (workMatrix[i][j][0] != "empty") {
          continue;
        }
        isChanged += singleMethod(i, j);
        isChanged += hiddenSingleMethod(i, j);
      }
    }
    return isChanged;
  }

  /**
   * Returning difference between arrray of all possible values for 'empty' cell
   * and values in appropriate row, column or square
   */
  function findArraysDifference (array1, array2) {
    var arraysDifference = [];
    for (var i = 0; i < array1.length; i++) {
      var isSolutionFound = true;
      for (var j = 0; j < array2.length; j++) {
        if (array1[i] == array2[j]) {
          isSolutionFound = false;
          break;
        }
      }
      if (isSolutionFound) {
        arraysDifference.push(array1[i]);
      }
    }
    return arraysDifference;
  }

  /**
   * Calling findArrayDifference method for row, column and square that match a certain 'empty' cell.
   * If unique value lefts cell becomes 'solved'.
   */
  function singleMethod(i, j) {
    workMatrix[i][j][1] = findArraysDifference(workMatrix[i][j][1], getRowValues(i));
    workMatrix[i][j][1] = findArraysDifference(workMatrix[i][j][1], getColValues(j));
    workMatrix[i][j][1] = findArraysDifference(workMatrix[i][j][1], getSquareValues(i, j));
    if (workMatrix[i][j][1].length == 1) {
      workMatrix[i][j][0] = 'solved';
      initialMatrix[i][j] = workMatrix[i][j][1][0];
      return 1;
    }
    return 0;
  }

  /**
   * If single method wasn't helpful use hidden single method which consists of 3 minufication steps. ->
   * Compare all possible solutions for neibour cells in row /column / square 'empty' respectively.
   * If they differ with only one value then that's a solution.
   */

  function rowMinify(i, j) {
    var rowMinification = workMatrix[i][j][1];
    for (var k = 0; k < 9; k++) {
      if (k == j || workMatrix[i][k][0] == 'solved') {
        continue;
      }
      rowMinification = findArraysDifference(rowMinification, workMatrix[i][k][1]);
    }
    return rowMinification;
  }

  function colMinify(i, j) {
  var colMinification = workMatrix[i][j][1];
  for (var k = 0; k < 9; k++) {
    if (k == i || workMatrix[k][j][0] == 'solved') {
      continue;
    }
    colMinification = findArraysDifference(colMinification, workMatrix[k][j][1]);
  }
  return colMinification;
}

  function squareMinify(i, j) {
    var squareMinification = workMatrix[i][j][1];
    var squareX = Math.floor(i/3);
    var squareY = Math.floor(j/3);
    for (var x = squareX * 3; x < squareX * 3 + 3; x++) {
      for (var y = squareY * 3; y < squareY * 3 + 3; y++) {
        if ((x == i && y == j) || workMatrix[x][y][0] == 'solved') {
          continue;
        }
        squareMinification = findArraysDifference(squareMinification, workMatrix[x][y][1]);
      }    
    }
    return squareMinification;
  }


  function hiddenSingleMethod(i, j) {
    var minified = rowMinify(i, j);
    var numbOfChanged = 0;
    if (minified.length == 1) {
      workMatrix[i][j][0] = 'solved';
      initialMatrix[i][j] = minified[0];
      numbOfChanged++;
    }
    var minified = colMinify(i, j);
    if (minified.length == 1) {
      workMatrix[i][j][0] = 'solved';
      initialMatrix[i][j] = minified[0];
      numbOfChanged++;
    }
    var minified = squareMinify(i, j);
    if (minified.length == 1) {
      workMatrix[i][j][0] = 'solved';
      initialMatrix[i][j] = minified[0];
      numbOfChanged++;
    }
    return numbOfChanged;
  }


/**
 * If single and hidden single methods didn't help to solve the whole matrix.
 * Using substitution method. -->
 * Accepting like one of the possible solutions 
 * (starting with the shortest array of possible solutions) for 'empty' cell is the right one.
 * Solving the whole matrix using this acception untill the matrix is solved.
 */
  function substitution() {
    var newMatrix = initialMatrix.slice(0);
    var leastPossibleDecisions = 12;
    var x = 0;
    var y = 0;
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++)
        if (workMatrix[i][j][1].length < leastPossibleDecisions && workMatrix[i][j][0] == 'empty') {
          x = i;
          y = j;
          leastPossibleDecisions = workMatrix[i][j][1].length;
        }
    }

    for (var k = 0; k < leastPossibleDecisions; k++) {
      newMatrix[x][y] = workMatrix[x][y][1][k];
      var newWorkMatrix = new Sudoku(newMatrix);
      if (isSolved(newWorkMatrix)) {
        initialMatrix = newWorkMatrix.slice(0);
        return;
      }
    }


  }

  /** 
   * Checking if sudoku is solved 
   */

  function isSolved(testMatrix) {
        var is_solved = true;
        for ( var i=0; i<9; i++) {
            for ( var j=0; j<9; j++ ) {
                if (testMatrix[i][j] == 0 ) {
                    is_solved = false;
                }
            }
        }
        return is_solved;
  }

/**
 * Checking that in work matrix there's no cell which array of possible solutions is empty.
 */

  function isFailed(testWorkMatrix) {
    var is_failed = false;
    for ( var i=0; i<9; i++) {
        for ( var j=0; j<9; j++ ) {
            if (testWorkMatrix[i][j][0] == 'empty' && !testWorkMatrix[i][j][1].length ) {
                is_failed = true;
            }
        }
    }
    return is_failed;
  }


}


