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

  DHUCEPSAG2VR.initialize();

  window.addEventListener("deviceorientation", function(e){
    DHUCEPSAG2VR.spherical.theta = event.beta / 180 * Math.PI;
    DHUCEPSAG2VR.spherical.phi   = event.gamma  / 180 * Math.PI;
    DHUCEPSAG2VR.spherical.spin  = event.alpha / 180 * Math.PI;
    for(var m=0; m<1+DHUCEPSAG2VR.vr_on; m++) DHUCEPSAG2VR.boxes[m].style.transform = DHUCEPSAG2VR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,DHUCEPSAG2VR.spherical.getMatrix3D());
  });

  document.addEventListener("mousedown", (e) => { DHUCEPSAG2VR.mouseOn = true; });
  document.addEventListener("mouseup", (e) => { DHUCEPSAG2VR.mouseOn = false; });
  document.addEventListener("mousemove", (e) => {
    if(DHUCEPSAG2VR.mouseOn){
      DHUCEPSAG2VR.spherical.theta += e.movementY/100;
      DHUCEPSAG2VR.spherical.phi -= e.movementX/100;
      for(var m=0; m<1+DHUCEPSAG2VR.vr_on; m++) DHUCEPSAG2VR.boxes[m].style.transform = DHUCEPSAG2VR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,DHUCEPSAG2VR.spherical.getMatrix3D());
    }
  });

  var style;
  window.addEventListener("resize", function(e){
    for(var m=0; m<1+DHUCEPSAG2VR.vr_on; m++){
      for(var n=0; n<DHUCEPSAG2VR.images[m+DHUCEPSAG2VR.vr_on].length; n++){
        style = DHUCEPSAG2VR.box_transform[n%6 + ((n/6)>1?2:0)];
        DHUCEPSAG2VR.boxes[m].children[n].children[0].style.transform = style[0] + (DHUCEPSAG2VR.boxes[m].clientWidth/2) + style[1];
        DHUCEPSAG2VR.boxes[m].children[n].children[1].style.transform = style[0] + (DHUCEPSAG2VR.boxes[m].clientWidth/2) + style[1];
      }
      DHUCEPSAG2VR.boxes[m].style.transform = DHUCEPSAG2VR.boxes[m].style.transform.replace(/scale\(.*?\)/,"scale(" + DHUCEPSAG2VR.boxes[m].clientWidth/2 + ")");
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
