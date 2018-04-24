  function clone(obj){
      if(obj == null || typeof(obj) != 'object'){
          return obj;
      }

      let temp = new obj.constructor();
      for(let key in obj){
          temp[key] = clone(obj[key]);
      }
      return temp;
  }
