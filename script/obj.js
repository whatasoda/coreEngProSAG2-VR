var DHUCEPSAG2VR = {
  mouseOn: false,
  vr_on : 0,
  view : document.getElementById("view"),
  frames : document.getElementsByClassName("frame"),
  boxes : document.getElementsByClassName("box"),
  faces : document.getElementsByClassName("face"),
  spherical : {
    theta  : 0, // rad : vertical
    phi    : 0, // rad : horizonal
    spin   : 0, // rad : axis
    getMatrix3D : (() => {
      var matrix = [];
      var x = 0;
      var y = 0;
      var z = 0;
      return getMatrix3D = () => {
        x = DHUCEPSAG2VR.spherical.theta;
        y = DHUCEPSAG2VR.spherical.phi;
        z = DHUCEPSAG2VR.spherical.spin;
        matrix = [
          Math.cos(y) * Math.cos(z),
          Math.sin(x) * Math.sin(y) * Math.cos(z) + Math.cos(x) * Math.sin(z),
          -Math.cos(x) * Math.sin(y) * Math.cos(z) + Math.sin(x) * Math.sin(z),
          0,
          -Math.cos(y) * Math.sin(z),
          -Math.sin(x) * Math.sin(y) * Math.sin(z) + Math.cos(x) * Math.cos(z),
          Math.cos(x) * Math.sin(y) * Math.sin(z) + Math.sin(x) * Math.cos(z),
          0,
          Math.sin(y),
          -Math.sin(x) * Math.cos(y),
          Math.cos(x) * Math.cos(y),
          0,
          0,
          0,
          0,
          1,
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
      new Image(), // north
      new Image(), // east
      new Image(), // south
      new Image(), // west
      new Image(), // bottom
    ],
    [
      new Image(), // top
      new Image(), // north
      new Image(), // east
      new Image(), // south
      new Image(), // west
      new Image(), // bottom
    ],
    [
      new Image(), // top
      new Image(), // north
      new Image(), // east
      new Image(), // south
      new Image(), // west
      new Image(), // bottom
    ],

  ],

  initialize : (() => {
    var index_parent;
    var index;
    var style;
    return initialize = () => {
      for(var m=0; m<2; m++){
        for(var n=0; n<DHUCEPSAG2VR.boxes[m].children.length; n++){
          DHUCEPSAG2VR.boxes[m].children[n].innerHTML = "";
        }
      }
      for(var m=0; m<1+DHUCEPSAG2VR.vr_on; m++){
        DHUCEPSAG2VR.boxes[m].style.transform = "scale(" + DHUCEPSAG2VR.boxes[m].clientWidth/2 + ") " + DHUCEPSAG2VR.spherical.getMatrix3D();
        DHUCEPSAG2VR.frames[m].className = "frame" + (DHUCEPSAG2VR.vr_on?" frame-vr":"");
        for(var n=0; n<DHUCEPSAG2VR.images[m+DHUCEPSAG2VR.vr_on].length; n++){
          DHUCEPSAG2VR.images[m+DHUCEPSAG2VR.vr_on][n].onload = (e) => {
            index_parent = parseInt(e.path[0].src.slice(-8).slice(0,1)) - DHUCEPSAG2VR.vr_on;
            index = parseInt(e.path[0].src.slice(-6).slice(0,2));
            style = DHUCEPSAG2VR.box_transform[index%6 + (index/6 > 1?2:0)];
            DHUCEPSAG2VR.boxes[index_parent].children[index].appendChild(DHUCEPSAG2VR.images[index_parent+DHUCEPSAG2VR.vr_on][index]);
            DHUCEPSAG2VR.boxes[index_parent].children[index].innerHTML = DHUCEPSAG2VR.boxes[index_parent].children[index].innerHTML + DHUCEPSAG2VR.boxes[index_parent].children[index].innerHTML;
            DHUCEPSAG2VR.boxes[index_parent].children[index].children[0].style.transform = style[0] + (DHUCEPSAG2VR.boxes[index_parent].clientWidth/2) + style[1];
            DHUCEPSAG2VR.boxes[index_parent].children[index].children[1].style.transform = style[0] + (DHUCEPSAG2VR.boxes[index_parent].clientWidth/2) + style[1];
            // loadProgress++;
            // refreshLoadProgress();
          }
          DHUCEPSAG2VR.images[m+DHUCEPSAG2VR.vr_on][n].src = "./img/cubemap" + (m+DHUCEPSAG2VR.vr_on) + "_" + ("0"+n).slice(-2) + ".bmp";
        }
      }
    }
  })(),

  bgms : {
    items : [

    ],
  },

};
