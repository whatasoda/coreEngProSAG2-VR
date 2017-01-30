var onYoutubeIframeAPIReady, onPlayerReady, onPlayerStateChange;
const PSAVR = {
  mouseOn : false,
  mobile : false,
  vr_on : 0,
  image_count : 6,
  _loadProgress : 0,
  bgm_ready : 0,
  interval : undefined,
  timeout : [],
  reqestFull : undefined,
  exitFull : undefined,
  BGMThetaAvailableZone : 0.8,
  BGMTheta : 0,
  fullElementType : undefined,
  get fullElement (){
    switch(PSAVR.fullElementType){
      case 0b00: return undefined; break;
      case 0b01: return document.fullscreenElement; break;
      case 0b10: return document.webkitFullscreenElement; break;
      case 0b11: return document.mozFullScreenElement; break;
    }
  },
  set loadProgress(val){
    this._loadProgress -= val;
  },
  get loadProgress(){
    return ((this._loadProgress/(this.image_count*(1+this.vr_on)))*100);
  },
  view   : document.getElementById("view"),
  debug   : document.getElementById("debug"),
  frames : document.getElementsByClassName("frame"),
  boxes  : document.getElementsByClassName("box"),
  faces  : document.getElementsByClassName("face"),
  loads  : document.getElementsByClassName("load"),
  spherical : {
    theta  : 0, // rad : vertical
    phi    : 0, // rad : horizonal
    spin   : 0, // rad : axis
    theta_offset : 0, // rad : vertical
    phi_offset   : 0, // rad : horizonal
    spin_offset  : 0, // rad : axis
    get theta_current(){return (this.theta + this.theta_offset)},
    get phi_current(){return (this.phi + this.phi_offset)},
    theta_compressed : (seq, offset=0) => {return (((PSAVR.spherical.theta_current/Math.PI)%(2*seq)+2*seq+offset)%(2*seq)/(2*seq))},
    phi_compressed : (seq, offset=0) => {return (((PSAVR.spherical.phi_current/Math.PI)%(2*seq)+2*seq+offset)%(2*seq)/(2*seq))},
    theta_stepped : (seq, step, offset=0) => {return parseInt(PSAVR.spherical.theta_compressed(seq,offset)*step)},
    phi_stepped : (seq, step, offset=0) => {return parseInt(PSAVR.spherical.phi_compressed(seq,offset)*step)},
    getMatrix3D : (() => {
      var matrix = [];
      var  x,  y,  z, sx, sy, sz, cx, cy, cz;
      return getMatrix3D = () => {
        x = PSAVR.spherical.theta + PSAVR.spherical.theta_offset;
        y = PSAVR.spherical.phi   + PSAVR.spherical.phi_offset;
        z = PSAVR.spherical.spin  + PSAVR.spherical.spin_offset;
        [sx, sy, sz] = [Math.sin(x), Math.sin(y), Math.sin(z)];
        [cx, cy, cz] = [Math.cos(x), Math.cos(y), Math.cos(z)];
        matrix = [
           cy*cz,  sx*sy*cz+cx*sz, -cx*sy*cz+sx*sz, 0,
          -cy*sz, -sx*sy*sz+cx*cz,  cx*sy*sz+sx*cz, 0,
              sy,          -sx*cy,           cx*cy, 0,
          0,0,0,1,
        ];
        return "matrix3d(" + matrix.toString() + ")";
      };
    })(),
  },

  box_transform : [
    ["rotateX(90deg) translateZ(","px) rotateY(180deg)"],
    ["rotateX(-90deg) translateZ(","px) rotateY(180deg)"],
    ["translateZ(","px) rotateY(180deg)"],
    ["rotateY(90deg) translateZ(","px) rotateY(180deg)"],
    ["rotateY(180deg) translateZ(","px) rotateY(180deg)"],
    ["rotateY(-90deg) translateZ(","px) rotateY(180deg)"],
  ],

  images : [
    (()=>{im=[];while(im.length<6)im[im.length]= new Image() ;return im;})(),
    (()=>{im=[];while(im.length<6)im[im.length]= new Image() ;return im;})(),
    (()=>{im=[];while(im.length<6)im[im.length]= new Image() ;return im;})(),
  ],

  initialize : (() => {
    var index_parent, index;
    var style;
    var u;
    var tag, firstScriptTag;
    var availableQualityLevels;
    return initialize = () => {
      clearInterval(PSAVR.interval);
      for(var n=0; n<PSAVR.timeout.length; n++) clearTimeout(PSAVR.timeout[n]);
      PSAVR._loadProgress = PSAVR.image_count*(1+PSAVR.vr_on);
      if(u === undefined){
        u = window.navigator.userAgent.toLowerCase();
        if((u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
        || u.indexOf("iphone") != -1
        || u.indexOf("ipod") != -1
        || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
        || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
        || u.indexOf("blackberry") != -1){
          PSAVR.mobile = true;
          window.alert("画面の自動回転をオフにした状態で御覧ください。");
          PSAVR.view.className = "mobile";
          window.addEventListener("deviceorientation", (e)=>{
            if(!PSAVR.started){
              PSAVR.spherical.phi_offset = -(-e.alpha + (Math.abs(e.beta)>90?180:0)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
              PSAVR.started = true;
            }
            PSAVR.spherical.theta = (e.gamma + (Math.abs(e.beta)>90?90:-90)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
            PSAVR.spherical.phi   = (-e.alpha + (Math.abs(e.beta)>90?180:0)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
            for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,PSAVR.spherical.getMatrix3D());
            if(PSAVR.bgm_ready == PSAVR.bgm.items.length) for(var n=0; n<6; n++){
              PSAVR.bgm.items[n].setVolume(parseInt(PSAVR.bgm.applyRamp(PSAVR.spherical.phi_compressed(1,PSAVR.spherical.theta_stepped(1,2,0.5)?1:0),PSAVR.bgm.ramp[n],0.05) * (PSAVR.BGMTheta<1-PSAVR.BGMThetaAvailableZone?PSAVR.BGMTheta/(1-PSAVR.BGMThetaAvailableZone):1) * 100));
            }
          });
        }
        PSAVR.reqestFull =
          (PSAVR.view.requestFullscreen && (()=>{PSAVR.view.requestFullscreen();}) ) ||
          (PSAVR.view.webkitRequestFullscreen && (()=>{PSAVR.view.webkitRequestFullscreen();}) ) ||
          (PSAVR.view.mozRequestFullScreen && (()=>{PSAVR.view.mozRequestFullScreen();}) ) || undefined;
        PSAVR.exitFull =
          (document.exitFullscreen && (()=>{document.exitFullscreen();}) ) ||
          (document.webkitExitFullscreen && (()=>{document.webkitExitFullscreen();}) ) ||
          (document.mozCancelFullScreen && (()=>{document.mozCancelFullScreen();}) ) || undefined;
        if(document.fullscreenElement === null) PSAVR.fullElementType = 0b01;
        else if(document.webkitFullscreenElement === null) PSAVR.fullElementType = 0b10;
        else if(document.mozFullScreenElement === null) PSAVR.fullElementType = 0b11;
        else PSAVR.fullElementType = 0b00;
        if(PSAVR.reqestFull === undefined || PSAVR.exitFull === undefined || PSAVR.fullElement === undefined){
          PSAVR.enableFull = false;
          PSAVR.alert_for_iOS_mobile();
        } else {
          PSAVR.enableFull = true;
        }
        for(var m=0; m<3; m++){ for(var n=0; n<PSAVR.image_count; n++){
          PSAVR.images[m][n].onload = (e)=>{
            index_parent = parseInt(e.srcElement.src.slice(-8).slice(0,1)) - PSAVR.vr_on;
            index = parseInt(e.srcElement.src.slice(-6).slice(0,2));
            style = PSAVR.box_transform[index%6 + (index/6 > 1?2:0)];
            PSAVR.boxes[index_parent].children[index].appendChild(PSAVR.images[index_parent+PSAVR.vr_on][index]);
            PSAVR.boxes[index_parent].children[index].innerHTML = PSAVR.boxes[index_parent].children[index].innerHTML + PSAVR.boxes[index_parent].children[index].innerHTML;
            PSAVR.boxes[index_parent].children[index].children[0].style.transform = style[0] + (PSAVR.boxes[index_parent].clientWidth/2) + style[1];
            PSAVR.boxes[index_parent].children[index].children[1].style.transform = style[0] + (PSAVR.boxes[index_parent].clientWidth/2) + style[1];
            PSAVR.loadProgress = 1;
          }
        }}
        document.addEventListener("mousedown", (e)=>{ PSAVR.mouseOn = true; });
        document.addEventListener("mouseup", (e)=>{ PSAVR.mouseOn = false; });
        document.addEventListener("mousemove", (e)=>{
          if(PSAVR.mouseOn){
            PSAVR.spherical.theta_offset += e.movementY/100;
            PSAVR.spherical.phi_offset -= e.movementX/100;
            for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,PSAVR.spherical.getMatrix3D());
            PSAVR.BGMTheta = (PSAVR.spherical.theta_stepped(0.5,2,0.5)?1-PSAVR.spherical.theta_compressed(0.25,1):PSAVR.spherical.theta_compressed(0.25,1));
            if(PSAVR.bgm_ready == PSAVR.bgm.items.length) for(var n=0; n<6; n++){
              PSAVR.bgm.items[n].setVolume(parseInt(PSAVR.bgm.applyRamp(PSAVR.spherical.phi_compressed(1,PSAVR.spherical.theta_stepped(1,2,0.5)?1:0),PSAVR.bgm.ramp[n],0.05) * (PSAVR.BGMTheta<1-PSAVR.BGMThetaAvailableZone?PSAVR.BGMTheta/(1-PSAVR.BGMThetaAvailableZone):1) * 100));
            }
          }
        });
        window.addEventListener("resize", (e)=>{
          for(var m=0; m<1+PSAVR.vr_on; m++){
            for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++){
              style = PSAVR.box_transform[n%6 + ((n/6)>1?2:0)];
              PSAVR.boxes[m].children[n].children[0].style.transform = style[0] + (PSAVR.boxes[m].clientWidth/2) + style[1];
              PSAVR.boxes[m].children[n].children[1].style.transform = style[0] + (PSAVR.boxes[m].clientWidth/2) + style[1];
            }
            PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/scale\(.*?\)/,"scale(" + PSAVR.boxes[m].clientWidth/2 + ")");
          }
        });
        tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        onYouTubeIframeAPIReady = ()=>{
          for(var n=0; n<6; n++) PSAVR.bgm.items[n] = new YT.Player(PSAVR.bgm.src[n][0], {height:'200', width:'200', videoId:PSAVR.bgm.src[n][1], events:{'onReady': onPlayerReady,'onStateChange': onPlayerStateChange}});
        };
        onPlayerReady = (event)=>{
          event.target.setVolume(0);
          event.target.setLoop(true);
          availableQualityLevels = event.target.getAvailableQualityLevels()
          event.target.setPlaybackQuality(availableQualityLevels[availableQualityLevels.length]);
          event.target.playVideo();
          PSAVR.bgm_ready += 1;
        };
      }
      for(var m=0; m<2; m++){
        PSAVR.frames[m].className = "frame" + (PSAVR.vr_on?" VR-on":"") + (m?" sub":" primary");
        PSAVR.loads[m].className = "load";
        for(var n=2; n<6; n++) PSAVR.loads[m].children[0].children[n].children[1].style.height = "100%";
        for(var n=0; n<PSAVR.boxes[m].children.length; n++) PSAVR.boxes[m].children[n].innerHTML = "";
      }
      for(var m=0; m<1+PSAVR.vr_on; m++){
        PSAVR.boxes[m].style.transform = (PSAVR.mobile?"rotate(-90deg) ":"") + "scale(" + PSAVR.boxes[m].clientWidth/2 + ") " + PSAVR.spherical.getMatrix3D();
        PSAVR.loads[m].className = "load loadstart";
        for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++) PSAVR.images[m+PSAVR.vr_on][n].src = "./img/cubemap" + (m+PSAVR.vr_on) + "_" + ("0"+n).slice(-2) + ".bmp";
      }

      PSAVR.timeout[0] = setTimeout(()=>{
        PSAVR.refreshLoadStatus();
      }, 1000);
      if(PSAVR.enableFull){
        if(PSAVR.vr_on && !PSAVR.fullElement) PSAVR.reqestFull();
        else if(PSAVR.fullElement) PSAVR.exitFull();
      }
    }
  })(),

  alert_for_iOS_mobile : ()=>{
    var message= "iPhoneでは自動で全画面表示ができません。\nこのページをホームに追加してからページを表示して下さい。";
    window.alert(message);
  },

  toggleVR : (click)=>{
    if(click && PSAVR.mobile) return;
    PSAVR.vr_on = (PSAVR.vr_on+1) % 2;
    PSAVR.initialize();
  },

  refreshLoadStatus : ()=>{
    PSAVR.interval = setInterval(()=>{
      for(var m=0; m<1+PSAVR.vr_on; m++) for(var n=2; n<6; n++) PSAVR.loads[m].children[0].children[n].children[1].style.height = PSAVR.loadProgress + "%";
      if(PSAVR.loadProgress < 2.5){
        PSAVR.timeout[1] = setTimeout(()=>{
          for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.loads[m].className = "load loadstart loadend";
        }, 1200);
        PSAVR.timeout[2] = setTimeout(()=>{
          PSAVR.started = false;
          for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.loads[m].className = "load";
        }, 3200);
        clearInterval(PSAVR.interval);
      }
    }, 50);
  },

  refreshVisible : ()=>{
    PSAVR.spherical.phi
  },

  bgm : {
    src : [
      ['kyoto'   , 'EUrhnp5y3k4'],
      ['tokyo'   , '3BOMFNPe3f0'],
      ['china'   , '3BOMFNPe3f0'],
      ['shanghai', 'VrOB2g_i7zo'],
      ['norway'  , '3BOMFNPe3f0'],
      ['malaysia', 'hwAOsnMqbcY'],
    ],
    items : [],
    ramp : [
        [[0.10,0.30],],
        [[0.25,0.45],],
        [[0.40,0.60],],
        [[0.55,0.75],],
        [[0.70,0.90],],
        [[0.85,1.00],],
    ],
    applyRamp : (() => {
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
    })(),
  },

};

PSAVR.initialize();
