(function(){
  var view = document.getElementById("view");
  var position = 0;
  var speed = 0.1;
  var loadProgress = 0;
  var height, BGPosition, imgWidth, imgHeight, aspect;
  var images = [
    new Image(), // top
    new Image(), // north
    new Image(), // east
    new Image(), // south
    new Image(), // west
    new Image(), // bottom
  ]

  for(var n=0; n<images.length; n++){
    images[n].onload = () => {
      loadProgress++;
      refreshLoadProgress();
    }
    images[n].src = "./img/cubemap" + ("0"+n).splice(2) + ".jpg";
  }

  var spherical = {
    theta  : 0, // rad : horizonal
    phi    : 0, // rad : vertical
    radius : 0, // px
    getMatrix3D : (thetaOffset = 0, phiOffset = 0) => {
      translate = [
        this.radius *  Math.sin(this.theta) * Math.cos(this.phi),
        this.radius *  Math.sin(this.phi),
        this.radius * -Math.cos(this.theta) * Math.cos(this.phi),
      ];


    },
  }


  var DirBGI = "./img/bg/";
  var BGIfileType = ".jpg";
  var DirBGM = "./audio/bg/";
  var BGMfileType = ".mp3";

  var times = ["morning","daytime","night","midnight"];
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

  var BGMs = {};
  countries.forEach(function(name){
    BGMs[name] = new Audio(DirBGM+name+BGMfileType);
    BGMs[name].loop = true;
    BGMs[name].autoplay = true;
  });

  var relativePosition;
  document.addEventListener("mousewheel", function(e){
    position += e.wheelDelta * speed;
    relativePosition = (setBGPosition(parameter) * aspect / height);
    BGMPosition = relativePosition % 1;
    if(BGMPosition < 0) BGMPosition++;
    countries.forEach(function(name){
      BGMs[name].volume = applyRamp(BGMPosition, BGMRamp[name], BGMMargin);
    });
    TimePosition = (relativePosition + time) / 0.7 % 1;
    if(TimePosition < 0) TimePosition++;
    times.forEach(function(name){
      view[name].style.opacity = applyRamp(TimePosition, TimeRamp[name], TimeMargin) + 0.1;
    });

  });

  window.addEventListener("resize", function(e){
    setHeight(parameter);
    setBGPosition(parameter);
  });


  function setHeight(target){
    height = (window.innerHeight * 0.8 > aspect * window.innerWidth ? window.innerHeight * 0.8 : aspect * window.innerWidth);
    if(target.id === "parameter") target.style.height = height + "px";
    return height;
  }
  function setBGPosition(target){
    BGPosition = position * height / 100;
    if(target.id === "parameter") target.style.backgroundPosition = (BGPosition + window.innerWidth / 2) + "px center";
    return BGPosition;
  }

  var applyRamp = function(){
    var count;
    var result;
    return function(value, ramp, margin=0){
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
  }();

  refreshLoadProgress = () =>{

  }
  var element = view.morning;
  var test = (element.currentStyle || document.defaultView.getComputedStyle(element, ''));





})();
