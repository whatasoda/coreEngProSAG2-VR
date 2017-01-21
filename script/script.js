(function(){
  PSAVR.initialize();
  var loadProgress = 0;
  var height, BGPosition, imgWidth, imgHeight, aspect;

  var DirBGM = "./audio/bg/";
  var BGMfileType = ".mp3";
  var countries = ["norway","malaysia","china","taiwan","sapporo","tokyo","kyoto"];

  var BGMPosition;
  var BGMMargin = 0.05;
  var BGMRamp = {
    norway   : [[0.95,"<<"],["<<",0.15],],
    malaysia : [[0.10,0.30],],
    china    : [[0.25,0.45],],
    taiwan   : [[0.40,0.60],],
    sapporo  : [[0.55,0.75],],
    tokyo    : [[0.70,0.90],],
    kyoto    : [[0.85,1.00],],
  };



  var applyRamp = (() => {
    var count;
    var result;
    return applyRamp = (value, ramp, margin=0) => {
      result = 0;
      if(!Array.isArray(ramp)) result = 1;
      if(!Array.isArray(ramp[0])) result = 1;
      if(typeof value !== "number") result = 1;
      if(typeof margin !== "number") result = 1;
      if(result === 1){
        console.log("input type is not correct!");
        return result;
      }
      for(count=0; count<ramp.length; count++){
        if(ramp[count][0] === undefined || typeof ramp[count][0] !== "number") ramp[count][0] = -Infinity;
        if(ramp[count][1] === undefined || typeof ramp[count][1] !== "number") ramp[count][1] =  Infinity;
        if(ramp[count][0] < value && value < ramp[count][1]){
          if(ramp[count][0]+margin > value) return result = 1 - (ramp[count][0]+margin - value) /  margin;
          if(ramp[count][1]-margin < value) return result = 1 - (ramp[count][1]-margin - value) / -margin;
          return result = 1;
        }
      }
      return result = 0;
    };
  })();

})();
