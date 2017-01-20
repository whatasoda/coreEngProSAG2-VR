var PSAVR = {
  mouseOn : false,
  vr_on : 0,
  mobile : false,
  view   : document.getElementById("view"),
  frames : document.getElementsByClassName("frame"),
  boxes  : document.getElementsByClassName("box"),
  faces  : document.getElementsByClassName("face"),
  buttons : document.getElementsByClassName("button"),
  spherical : {
    theta  : 0, // rad : vertical
    phi    : 0, // rad : horizonal
    spin   : 0, // rad : axis
    theta_offset : 0, // rad : vertical
    phi_offset   : 0, // rad : horizonal
    spin_offset  : 0, // rad : axis
    getMatrix3D : (() => {
      var matrix = [];
      var  x,  y,  z;
      var sx, sy, sz;
      var cx, cy, cz;
      return getMatrix3D = () => {
        x = PSAVR.spherical.theta + PSAVR.spherical.theta_offset;
        y = PSAVR.spherical.phi   + PSAVR.spherical.phi_offset;
        z = PSAVR.spherical.spin  + PSAVR.spherical.spin_offset;
        sx = Math.sin(x); sy = Math.sin(y); sz = Math.sin(z);
        cx = Math.cos(x); cy = Math.cos(y); cz = Math.cos(z);
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
    [
      new Image(), // top
      new Image(), // bottom
      new Image(), // north
      new Image(), // east
      new Image(), // south
      new Image(), // west
    ],
    [
      new Image(), // top
      new Image(), // bottom
      new Image(), // north
      new Image(), // east
      new Image(), // south
      new Image(), // west
    ],
    [
      new Image(), // top
      new Image(), // bottom
      new Image(), // north
      new Image(), // east
      new Image(), // south
      new Image(), // west
    ],

  ],

  initialize : (() => {
    var index_parent;
    var index;
    var style;
    var u;
    return initialize = () => {
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
        }
        for(var m=0; m<3; m++){ for(var n=0; n<PSAVR.images[m].length; n++){
          PSAVR.images[m][n].onload = (e)=>{
            index_parent = parseInt(e.path[0].src.slice(-8).slice(0,1)) - PSAVR.vr_on;
            index = parseInt(e.path[0].src.slice(-6).slice(0,2));
            style = PSAVR.box_transform[index%6 + (index/6 > 1?2:0)];
            PSAVR.boxes[index_parent].children[index].appendChild(PSAVR.images[index_parent+PSAVR.vr_on][index]);
            PSAVR.boxes[index_parent].children[index].innerHTML = PSAVR.boxes[index_parent].children[index].innerHTML + PSAVR.boxes[index_parent].children[index].innerHTML;
            PSAVR.boxes[index_parent].children[index].children[0].style.transform = style[0] + (PSAVR.boxes[index_parent].clientWidth/2) + style[1];
            PSAVR.boxes[index_parent].children[index].children[1].style.transform = style[0] + (PSAVR.boxes[index_parent].clientWidth/2) + style[1];
            // loadProgress++;
            // refreshLoadProgress();
          }
        }}
      }
      for(var m=0; m<2; m++) for(var n=0; n<PSAVR.boxes[m].children.length; n++) PSAVR.boxes[m].children[n].innerHTML = "";
      for(var m=0; m<2; m++) {
        PSAVR.frames[m].className = "frame" + (PSAVR.vr_on?" VR-on":"") + (m?" sub":" primary");
        PSAVR.frames[m];
      }
      for(var m=0; m<1+PSAVR.vr_on; m++){
        PSAVR.boxes[m].style.transform = (PSAVR.mobile?"rotate(-90deg) ":"") + "scale(" + PSAVR.boxes[m].clientWidth/2 + ") " + PSAVR.spherical.getMatrix3D();
        for(var n=0; n<PSAVR.images[m+PSAVR.vr_on].length; n++) PSAVR.images[m+PSAVR.vr_on][n].src = "./img/cubemap" + (m+PSAVR.vr_on) + "_" + ("0"+n).slice(-2) + ".bmp";
      }
    }
  })(),

  toggleVR : (click)=>{
    if(click && PSAVR.mobile) return;
    PSAVR.vr_on++;
    PSAVR.vr_on %= 2;
    PSAVR.initialize();
  },

  bgms : {
    items : [

    ],
  },

};
