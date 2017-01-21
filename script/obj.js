const PSAVR = {
  mouseOn : false,
  mobile : false,
  vr_on : 0,
  image_count : 6,
  _loadProgress : 0,
  interval : undefined,
  timeout : [],
  set loadProgress(val){
    this._loadProgress -= val;
  },
  get loadProgress(){
    return ((this._loadProgress/(this.image_count*(1+this.vr_on)))*100);
  },
  view   : document.getElementById("view"),
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
          PSAVR.view.className = "mobile";
          window.addEventListener("deviceorientation", (e)=>{
            PSAVR.spherical.theta = (e.gamma + (Math.abs(e.beta)>90?90:-90)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
            PSAVR.spherical.phi   = (-e.alpha + (Math.abs(e.beta)>90?180:0)) / 180 * Math.PI * (PSAVR.mobile?1:-1);
            for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.boxes[m].style.transform = PSAVR.boxes[m].style.transform.replace(/matrix3d\(.*?\)/,PSAVR.spherical.getMatrix3D());
          });
        }
        for(var m=0; m<3; m++){ for(var n=0; n<PSAVR.image_count; n++){
          PSAVR.images[m][n].onload = (e)=>{
            index_parent = parseInt(e.path[0].src.slice(-8).slice(0,1)) - PSAVR.vr_on;
            index = parseInt(e.path[0].src.slice(-6).slice(0,2));
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
    }
  })(),

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
          for(var m=0; m<1+PSAVR.vr_on; m++) PSAVR.loads[m].className = "load";
        }, 3200);
        clearInterval(PSAVR.interval);
      }
    }, 50);
  },

  bgms : {
    items : [

    ],
  },

};
