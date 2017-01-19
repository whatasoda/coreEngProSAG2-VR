(function(){
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


  PSAVR.initialize();

  if(PSAVR.mobile){
    window.addEventListener("deviceorientation", function(e){
      PSAVR.spherical.theta = (e.gamma + (Math.abs(e.beta)>90?90:-90)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
      PSAVR.spherical.phi   = (-e.alpha + (Math.abs(e.beta)>90?180:0)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
      for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,PSAVR.spherical.getMatrix3D());
    });
  }

  document.addEventListener("mousedown", (e) => { PSAVR.mouseOn = true; });
  document.addEventListener("mouseup", (e) => { PSAVR.mouseOn = false; });
  document.addEventListener("mousemove", (e) => {
    if(PSAVR.mouseOn){
      PSAVR.spherical.theta_offset += e.movementY/100;
      PSAVR.spherical.phi_offset -= e.movementX/100;
      for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,PSAVR.spherical.getMatrix3D());
    }
  });

  var style;
  window.addEventListener("resize", function(e){
    for(var m=0; m<1+PSAVR.vr_on; m++){
      for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++){
        style = PSAVR.box_transform[n%6 + ((n/6)>1?2:0)];
        PSAVR.boxes[m].children[n].children[0].style.transform = style[0] + (PSAVR.boxes[m].clientWidth/2) + style[1];
        PSAVR.boxes[m].children[n].children[1].style.transform = style[0] + (PSAVR.boxes[m].clientWidth/2) + style[1];
      }
      PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/scale\(.*?\)/,"scale(" + PSAVR.boxes[m].clientWidth/2 + ")");
    }
  });

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

  refreshLoadProgress = () =>{

  }

})();
