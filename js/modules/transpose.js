//@author   : Dahoux Sami
//@file     : transpose.js
//@date     : 17/04/2018

function transpose(arr) {
  let ret;
  let rowNum;
  let maxCol = 0;

  if(arr != undefined) {
    rowNum = arr.length;
    if(rowNum > 1) {
      for(let i = 0; i < rowNum; i++) {
        if(arr[i].length > maxCol)
          maxCol = arr[i].length;
      }
      ret = new Array(maxCol);
      for(let j = 0; j < maxCol; j++) {
        ret[j] = new Array(rowNum);
        for(let i = 0; i < rowNum; i++)
          ret[j][i] = clone(arr[i][j]);
      }
      return ret;
    }
    else return arr;

  }
  else return arr;
}
