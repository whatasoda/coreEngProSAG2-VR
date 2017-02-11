var onYoutubeIframeAPIReady, onPlayerReady, onPlayerStateChange;
const PSAVR = {
  TMB : ["t","m","b"],
  initialized : false,
  mouseOn : false,
  mobile : false,
  bgm_available : true,
  vr_on : 0,
  image_count : 24,
  _loadProgress : 0,
  bgm_ready : 0,
  interval : [],
  timeout : [],
  reqestFull : undefined,
  exitFull : undefined,
  BGMThetaAvailableZone : 0.8,
  division : [0,0],
  lap : 0,
  params : {
    x : (()=>{ar=[];while(ar.length<7)ar[ar.length]= [] ;return ar;})(),
    xBase : [],
    y : 0,
  },
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
  view : document.getElementById("view"),
  tap : document.getElementById("tap"),
  desc : document.getElementById("desc"),
  frames : document.getElementsByClassName("frame"),
  boxes : document.getElementsByClassName("box"),
  faces : document.getElementsByClassName("face"),
  loads : document.getElementsByClassName("load"),
  bgms : document.getElementsByClassName("bgm"),
  playings : document.getElementsByClassName("playing"),
  cardboard_icons : document.getElementsByClassName("cardboard-icon"),
  spherical : {
    theta  : 0, // rad : vertical
    phi    : 0, // rad : horizonal
    spin   : 0, // rad : axis
    theta_offset : 0, // rad : vertical
    phi_offset   : 0, // rad : horizonal
    spin_offset  : 0, // rad : axis
    theta_offset_abs : 0, // rad : vertical
    phi_offset_abs   : 0, // rad : horizonal
    spin_offset_abs  : 0, // rad : axis
    get theta_current(){return (this.theta + this.theta_offset)},
    get phi_current(){return (this.phi + this.phi_offset)},
    theta_compressed : (seq, offset=0,current=true) => {return ((((current?PSAVR.spherical.theta_current:PSAVR.spherical.theta)/Math.PI)%(2*seq)+2*seq+offset)%(2*seq)/(2*seq))},
    phi_compressed : (seq, offset=0,current=true) => {return ((((current?PSAVR.spherical.phi_current:PSAVR.spherical.phi)/Math.PI)%(2*seq)+2*seq+offset)%(2*seq)/(2*seq))},
    theta_stepped : (seq, step, offset=0,current=true) => {return parseInt(PSAVR.spherical.theta_compressed(seq,offset,current)*step)},
    phi_stepped : (seq, step, offset=0,current=true) => {return parseInt(PSAVR.spherical.phi_compressed(seq,offset,current)*step)},
    getMatrix3D : (() => {
      var matrix = [];
      var  x,  y,  z, sx, sy, sz, cx, cy, cz;
      return getMatrix3D = () => {
        x = PSAVR.spherical.theta + PSAVR.spherical.theta_offset + PSAVR.spherical.theta_offset_abs;
        y = PSAVR.spherical.phi   + PSAVR.spherical.phi_offset + PSAVR.spherical.phi_offset_abs;
        z = PSAVR.spherical.spin  + PSAVR.spherical.spin_offset + PSAVR.spherical.spin_offset_abs;
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
    (()=>{im=[];while(im.length<3*8)im[im.length]= [new Image(),new Image()] ;return im;})(),
    (()=>{im=[];while(im.length<3*8)im[im.length]= [new Image(),new Image()] ;return im;})(),
    (()=>{im=[];while(im.length<3*8)im[im.length]= [new Image(),new Image()] ;return im;})(),
  ],

  initialize : (() => {
    var style;
    var u;
    var tag, firstScriptTag;
    var availableQualityLevels;
    return initialize = () => {
      for(var n=0; n<PSAVR.interval.length; n++) clearInterval(PSAVR.interval[n]);
      for(var n=0; n<PSAVR.timeout.length; n++) clearTimeout(PSAVR.timeout[n]);
      PSAVR.initialized = false;
      PSAVR._loadProgress = PSAVR.image_count*(1+PSAVR.vr_on);
      if(u === undefined){
        u = window.navigator.userAgent.toLowerCase();
        if(window.location.hash === "#muted" || u.indexOf("iphone") != -1 || u.indexOf("ipod") != -1) PSAVR.bgm_available = false;
        else PSAVR._loadProgress = PSAVR.image_count*(1+PSAVR.vr_on)+6;
        if((u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
        || u.indexOf("iphone") != -1
        || u.indexOf("ipod") != -1
        || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
        || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
        || u.indexOf("blackberry") != -1){
          PSAVR.mobile = true;
          window.alert("画面の回転をロックした状態で御覧ください。\nOKをタップで先に進みます。");
          PSAVR.view.className = "mobile";
          window.addEventListener("deviceorientation", (e)=>{
            if(!PSAVR.started){
              PSAVR.spherical.phi_offset = -(-e.alpha + (Math.abs(e.beta)>90?180:0)) / 180 * Math.PI;
              PSAVR.started = true;
            }
            PSAVR.spherical.theta = (e.gamma + (Math.abs(e.beta)>90?90:-90)) / 180 * Math.PI;
            PSAVR.spherical.phi   = ((-e.alpha + (Math.abs(e.beta)>90?180:0)+1080)%360) / 180 * Math.PI;
            PSAVR.division[0] = PSAVR.spherical.phi_stepped(1,3,0,false);
            if(PSAVR.division[0] !== PSAVR.division[1] && (PSAVR.division[0]+PSAVR.division[1])%2 === 0) PSAVR.lap = (PSAVR.lap+1)%2;
            PSAVR.division[1] = PSAVR.division[0];
            PSAVR.spherical.phi += 2 * PSAVR.lap * Math.PI;
            PSAVR.refreshView();
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
        for(var b=0; b<2; b++) for(var m=0; m<3; m++) for(var n=0; n<PSAVR.image_count; n++) PSAVR.images[m][n][b].addEventListener("load", PSAVR.image_load);
        document.addEventListener("mousedown", (e)=>{ PSAVR.mouseOn = true; });
        document.addEventListener("mouseup", (e)=>{ PSAVR.mouseOn = false; });
        document.addEventListener("mousemove", (e)=>{
          if(PSAVR.mouseOn){
            PSAVR.spherical.theta_offset += e.movementY/100;
            PSAVR.spherical.phi_offset -= e.movementX/100;
            PSAVR.refreshView();
          }
        });
        window.addEventListener("resize", (e)=>{
          for(var m=0; m<1+PSAVR.vr_on; m++){
            for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++){
              style = PSAVR.box_transform[(n%3)%2?parseInt(n/3)%4+2:(n%3)/2];
              for(var b=0; b<2; b++) PSAVR.images[m+PSAVR.vr_on][n][b].style.transform = style[0] + (PSAVR.boxes[m].clientWidth/2) + style[1];
            }
            PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/scale\(.*?\)/,"scale(" + PSAVR.boxes[m].clientWidth/2 + ")");
          }
          if(PSAVR.mobile && PSAVR.bgm_available) for(var n=0; n<PSAVR.regions.items.length; n++) PSAVR.regions.items[n].a.style.transform = "scaleX("+ PSAVR.view.clientWidth/30 +") scaleY("+ PSAVR.view.clientHeight/30 +")";
        });
        if(PSAVR.bgm_available){
          tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          onYouTubeIframeAPIReady = ()=>{
            PSAVR.regions.items[0] = new YT.Player(PSAVR.regions.bgm_src[0][0], {height:'100', width:'140', videoId:PSAVR.regions.bgm_src[0][1], events:{'onReady': onPlayerReady,'onStateChange': onPlayerStateChange}});
          };
          onPlayerReady = (event)=>{
            availableQualityLevels = event.target.getAvailableQualityLevels()
            event.target.setPlaybackQuality(availableQualityLevels[availableQualityLevels.length]);
            if(!PSAVR.mobile) event.target.playVideo();
            else event.target.a.style.transform = "scaleX("+ PSAVR.view.clientWidth/30 +") scaleY("+ PSAVR.view.clientHeight/30 +")";
            event.target.seekTo(0);
            event.target.setVolume(0);
            PSAVR.loadProgress = 1;
            PSAVR.bgm_ready += 1;
            if(PSAVR.bgm_ready<PSAVR.regions.bgm_src.length) PSAVR.regions.items[PSAVR.bgm_ready] = new YT.Player(PSAVR.regions.bgm_src[PSAVR.bgm_ready][0], {height:'100', width:'140', videoId:PSAVR.regions.bgm_src[PSAVR.bgm_ready][1], events:{'onReady': onPlayerReady,'onStateChange': onPlayerStateChange}});
          };
          onPlayerStateChange = (event)=>{
            if([-1,0,2].indexOf(event.data)+1) event.target.seekTo(-event.target.getDuration());
            if(PSAVR.mobile && event.data===1){
              event.target.a.className = "playing";
              event.target.a.parentNode.style.zIndex = "-1";
            }
          }
        }
      }
      PSAVR.desc.className = "desc";
      for(var m=0; m<2; m++){
        PSAVR.frames[m].className = "frame" + (PSAVR.vr_on?" VR-on":"") + (m?" sub":" primary");
        PSAVR.loads[m].className = "load";
        for(var n=2; n<6; n++) PSAVR.loads[m].children[0].children[n].children[1].style.height = "100%";
        for(var n=0; n<PSAVR.boxes[m].children.length; n++) PSAVR.boxes[m].children[n].innerHTML = "";
      }
      for(var m=0; m<1+PSAVR.vr_on; m++){
        PSAVR.boxes[m].style.transform = (PSAVR.mobile?"rotate(-90deg) ":"") + "scale(" + PSAVR.boxes[m].clientWidth/2 + ") " + PSAVR.spherical.getMatrix3D();
        PSAVR.loads[m].className = "load loadstart";
        for(var b=0; b<2; b++) for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++) PSAVR.images[m+PSAVR.vr_on][n][b].src = "./img/cubemap/no" + (m+PSAVR.vr_on) + "/" + PSAVR.TMB[n%3] + ("0"+parseInt(n/3)).slice(-2) + ".png";
      }

      PSAVR.refreshView();
      PSAVR.timeout[0] = setTimeout(()=>{
        PSAVR.refreshLoadStatus();
      }, 1000);
      if(PSAVR.enableFull){
        if(PSAVR.vr_on && !PSAVR.fullElement) PSAVR.reqestFull();
        else if(PSAVR.fullElement) PSAVR.exitFull();
      }
    }
  })(),

  image_load : (()=>{
    var index_parent, index, style, position, src_match;
    return image_load = (e)=>{
      src_match = e.srcElement.src.match(/\/img\/cubemap\/no(\d)*\/(.)(\d*)\./);
      index_parent = parseInt(src_match[1]) - PSAVR.vr_on;
      position = PSAVR.TMB.indexOf(src_match[2]);
      index = parseInt(src_match[3]);
      style = PSAVR.box_transform[(position%2?(index%4)+2:position/2)];
      for(var b=0; b<2; b++){
        PSAVR.boxes[index_parent].children[(position%2?(index%4)+2:position/2)].appendChild(PSAVR.images[index_parent+PSAVR.vr_on][index*3+position][b]);
        PSAVR.images[index_parent+PSAVR.vr_on][index*3+position][b].style.transform = style[0] + (PSAVR.boxes[index_parent].clientWidth/2) + style[1];
      }
      PSAVR.images[index_parent+PSAVR.vr_on][index*3+position][0].style.width = "calc(100% + 1px)";
      PSAVR.loadProgress = 0.5;
    };
  })(),

  alert_for_iOS_mobile : ()=>{
    var message= "このページを「ホームに追加」してからページを見ると全画面で見ることが出来ます。※iPhoneでは現在BGMを再生することができません。\nOKをタップで先に進みます。";
    window.alert(message);
  },

  toggleVR : (click)=>{
    if(click && PSAVR.mobile) return;
    PSAVR.vr_on = (PSAVR.vr_on+1) % 2;
    PSAVR.initialize();
  },

  refreshLoadStatus : ()=>{
    PSAVR.interval[0] = setInterval(()=>{
      for(var m=0; m<1+PSAVR.vr_on; m++) for(var n=2; n<6; n++) PSAVR.loads[m].children[0].children[n].children[1].style.height = PSAVR.loadProgress + "%";
      if(PSAVR.loadProgress < 2.5){
        clearInterval(PSAVR.interval[0]);
        if(PSAVR.mobile && PSAVR.regions.bgm_src.length !== PSAVR.playings.length){
          PSAVR.tap.style.display = "block";
          if(PSAVR.bgm_available) for(var n=0; n<PSAVR.regions.bgm_src.length; n++) PSAVR.regions.items[n].a.parentNode.style.zIndex = "1";
        }
        PSAVR.interval[1] = setInterval(()=>{
          if(PSAVR.bgm_available && PSAVR.mobile && PSAVR.regions.bgm_src.length !== PSAVR.playings.length){
            PSAVR.tap.innerHTML = "Tap " + (PSAVR.regions.bgm_src.length-PSAVR.playings.length) + " more times!";
          } else {
            clearInterval(PSAVR.interval[1]);
            if(PSAVR.mobile) PSAVR.tap.style.display = "none";
            PSAVR.timeout[1] = setTimeout(()=>{
              for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.loads[m].className = "load loadstart loadend";
            }, 1200);
            PSAVR.timeout[2] = setTimeout(()=>{
              PSAVR.started = false;
              PSAVR.initialized = true;
              if(!PSAVR.vr_on) PSAVR.desc.className = "desc loaded";
              for(var n=0; n<2; n++) PSAVR.cardboard_icons[n].className.baseVal = "cardboard-icon loaded";
              for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.loads[m].className = "load";
            }, 3200);
          }
        }, 100);
      }
    }, 50);
  },

  refreshView : ()=>{
    for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,PSAVR.spherical.getMatrix3D());
    PSAVR.params.y = (PSAVR.spherical.theta_stepped(0.5,2,0.5)?1-PSAVR.spherical.theta_compressed(0.25,1):PSAVR.spherical.theta_compressed(0.25,1));
    PSAVR.params.xBase[0] = PSAVR.spherical.phi_compressed(2,(PSAVR.spherical.theta_stepped(1,2,0.5)?1:0));
    PSAVR.params.xBase[1] = 8-PSAVR.spherical.phi_stepped(2,8,(PSAVR.spherical.theta_stepped(1,2,0.5)?0.5:-0.5));
    for(var n=0; n<PSAVR.regions.ramp.length; n++){
      PSAVR.params.x[n][0] = PSAVR.applyRamp(PSAVR.params.xBase[0],PSAVR.regions.ramp[n],0.005,0) * (PSAVR.params.y<1-PSAVR.BGMThetaAvailableZone?PSAVR.params.y/(1-PSAVR.BGMThetaAvailableZone):1);
      PSAVR.params.x[n][1] = PSAVR.applyRamp(PSAVR.params.xBase[0],PSAVR.regions.ramp[n],-0.25,1) * (PSAVR.params.y<1-PSAVR.BGMThetaAvailableZone?PSAVR.params.y/(1-PSAVR.BGMThetaAvailableZone):1)+0.1;
    }
    for(var m=0; m<1+PSAVR.vr_on; m++) for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++){
      if(parseInt(n/3)%4===3){
        if((-2<parseInt(n/3)-PSAVR.params.xBase[1]&&parseInt(n/3)-PSAVR.params.xBase[1]<3) || parseInt(n/3)+8-PSAVR.params.xBase[1]<3 || -2<parseInt(n/3)-PSAVR.params.xBase[1]-8) for(var b=0; b<2; b++) PSAVR.images[m+PSAVR.vr_on][n][b].style.opacity = 1;
        else for(var b=0; b<2; b++) PSAVR.images[m+PSAVR.vr_on][n][b].style.opacity = 0;
      } else {
        if((-2<parseInt(n/3)-PSAVR.params.xBase[1]&&parseInt(n/3)-PSAVR.params.xBase[1]<3) || parseInt(n/3)+8-PSAVR.params.xBase[1]<3 || -2<parseInt(n/3)-PSAVR.params.xBase[1]-8) for(var b=0; b<2; b++) PSAVR.images[m+PSAVR.vr_on][n][b].style.opacity = 0;
        else for(var b=0; b<2; b++) PSAVR.images[m+PSAVR.vr_on][n][b].style.opacity = 1;
      }
    }
    if(!PSAVR.vr_on) for(var n=0; n<PSAVR.regions.ramp.length; n++){
      PSAVR.desc.children[n].style.height = (PSAVR.params.x[n][0] * 0.65 + 0.03) * (PSAVR.mobile?PSAVR.view.clientWidth:PSAVR.view.clientHeight) + "px";
      PSAVR.desc.children[n].className = (PSAVR.params.x[n][0]>0.95?"active":"");
      PSAVR.desc.children[n].style.width = (Math.pow(PSAVR.params.x[n][1],3) * 0.25 + 0.025) * (PSAVR.mobile?PSAVR.view.clientHeight:PSAVR.view.clientWidth) / (1+PSAVR.vr_on) + "px";
    }
    if(PSAVR.bgm_ready == PSAVR.regions.bgm_src.length) for(var n=0; n<6; n++) PSAVR.regions.items[n].setVolume(parseInt(PSAVR.params.x[n][0] * 100)*(PSAVR.initialized?1:0));
  },

  applyRamp : (() => {
    var count;
    var result;
    return applyRamp = (value, ramp, margin=0,id=0) => {
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
        if(!(ramp[count][3+id] === -1 || ramp[count][2] === -2)){
          if(ramp[count][0] === undefined || typeof ramp[count][0] !== "number") ramp[count][0] = -Infinity;
          if(ramp[count][1] === undefined || typeof ramp[count][1] !== "number") ramp[count][1] =  Infinity;
          if(margin<0){
            if(ramp[count][0]+margin<0&&ramp[count][0]+margin>-1) ramp[ramp.length] = [ramp[count][0]+1,Infinity,-2,id];
            if(ramp[count][1]-margin>1&&ramp[count][1]-margin<2) ramp[ramp.length] = [-Infinity,ramp[count][1]-1,-2,id];
          }
          ramp[count][3+id] = -1;
        }
        if(!(ramp[count][2]===-2&&ramp[count][3]!==id)){
          if(margin>0){
            if(ramp[count][0] < value && value < ramp[count][1]){
              if(ramp[count][0]+margin > value) return result = 1 - (ramp[count][0]+margin-value) /  margin;
              if(ramp[count][1]-margin < value) return result = 1 - (ramp[count][1]-margin-value) / -margin;
              return result = 1;
            }
          } else {
            if(ramp[count][0]+margin < value && value < ramp[count][1]-margin){
              if(ramp[count][0] > value) return result = 1 - (ramp[count][0]-value) / -margin;
              if(ramp[count][1] < value) return result = 1 - (ramp[count][1]-value) / margin;
              return result = 1;
            }
          }
        }
      }
      return result = 0;
    };
  })(),

  regions : {
    bgm_src : [
      ['kyoto'   , 'EUrhnp5y3k4'],
      ['tokyo'   , '-PXbz9DXn8s'],
      ['china'   , 'Lr2811Z25uo'],
      ['shanghai', 'VrOB2g_i7zo'],
      ['norway'  , 'bS67daZZre0'],
      ['malaysia', 'hwAOsnMqbcY'],
    ],
    items : [],
    ramp : [
      [[0.75-0.005,0.85],],
      [[0.56-0.005,0.75],],
      [[0.40-0.005,0.56],],
      [[0.22-0.005,0.40],],
      [[0.10-0.005,0.22],],
      [[0.95-0.005,">>"],[">>",0.1]],
      [[0.85-0.005,0.95]],
    ],
  },

};

PSAVR.initialize();
