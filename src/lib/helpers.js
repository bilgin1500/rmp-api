const isNumeric = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/*
    Sort array by object name
    https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
   */
/*const sortByName = function(arr) {
    return arr.sort(function(a, b) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  };*/

export { isNumeric };
