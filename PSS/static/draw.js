//Canvas variables
var canvas,
  ctx,
  flag,
  pan_flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_flag = false;
var first_choose = true;
const worker = new Worker("/static/scripts/worker.js");
var canvas = document.getElementById("can"); //main canvas
var ctx = canvas.getContext("2d"); //canvas content
var can_mid = document.getElementById("middle"); //For modify tool using a middle layer
var ctx_mid = can_mid.getContext("2d");
var can_proj = document.getElementById("projection"); //For transfer to other member
var ctx_proj = can_proj.getContext("2d");
var can_active = document.getElementById("minelayer1"); //active layer (can be modified)
var ctx_active = can_active.getContext("2d");
var can_revise = document.createElement("canvas"); //For modify tool using a final revise layer
var revise_button = document.getElementById("revise_button");
var background = document.getElementById("bg"); //background
var region = new Path2D(); //For modify tool using a path
var scaleKey = ""; //For pan and scale information
var scale = 1.0;
var scale_xy = [1, 1];
var w = 2000;
var h = 2000;
var scale_orgin = [w / 2, h / 2];
var delete_canvas_pivots = [];

let room_cursors={};
let room_messages={};
let lastSendCursorPos=Date.now();
const CURSORUPDATERATE=100;
const CURSORSTAYTIME=10000;

let redoStack = []; //Redo Img
let redoStack_active = []; //Redo active layer name

//Drawtool variables
line_widths = [2, 10, 40,0]; //Set tools linewidth 1.pen；2.eraser;3.airbrush;4.other(no _use)
line_widths_max = [100, 200, 500]; //Set tools linewidth Maximum 1.pen；2.eraser 3.other(no _use)
pan_flag = false;
mirror_flag = false;
restore_max = 20;
var x = "hsl(0, 0%, 0%)";
let tool_pivot;

//Init
function init() {
  //Canvas variables
  x_old_origin = 0;
  y_old_origin = 0;
  self_sid = "";
  x_offset = 0;
  y_offset = 0;
  active_canvas_name = "can";
  fileUploader = document.getElementById("load_image");
  canvas.height = h;
  canvas.width = w;
  can_mid.height = h;
  can_mid.width = w;
  can_proj.height = h;
  can_proj.width = w;
  can_active.height = h;
  can_active.width = w;
  background.height = h;
  background.width = w;
  can_mid.style.display = "none";
  top_key = (window.visualViewport.height / 2 - h / 2).toString() + "px";
  left_key = (window.visualViewport.width / 2 - w / 2).toString() + "px";
  canvas.style.top = top_key;
  canvas.style.left = left_key;
  can_mid.style.top = top_key;
  can_mid.style.left = left_key;
  background.style.top = top_key;
  background.style.left = left_key;
  can_proj.style.top = top_key;
  can_proj.style.left = left_key;
  can_active.style.top = top_key;
  can_active.style.left = left_key;

  //Tool variables
  space_pivot = false;
  restore = [canvas.getContext("2d").getImageData(0, 0, w, h)]; //Undo record
  restore_active = ["minelayer1"]; //Undo record
  width_range = document.getElementById("width_range");
  width_range.value=line_widths[0];
  eraser_width_range = document.getElementById("eraser_width_range");
  eraser_width_range.value=line_widths[1];
  airbrush_width_range = document.getElementById("airbrush_width_range");
  airbrush_width_range.value=line_widths[2];
  zoom_range = document.getElementById("zoom_range");
  revise_range = document.getElementById("revise_range");
  let opacity_range=document.getElementById("opacity_range");
  opacity_range.value=1;

  //Cancel defaultevent
  window.addEventListener("wheel", (e) => e.preventDefault(), {
    passive: false,
  });
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space" && e.target == document.body) {
      e.preventDefault();
    }
  });

  window.addEventListener("resize", function () {
    top_key = (window.visualViewport.height / 2 - h / 2).toString() + "px";
    left_key = (window.visualViewport.width/ 2 - w / 2).toString() + "px";
    canvas.style.top = top_key;
    canvas.style.left = left_key;
    can_mid.style.top = top_key;
    can_mid.style.left = left_key;
    background.style.top = top_key;
    background.style.left = left_key;
    can_proj.style.top = top_key;
    can_proj.style.left = left_key;
    var othercanvasessetting = document.getElementsByClassName(
      "othermembercanvases"
    );
    for (let i = 0; i < othercanvasessetting.length; i++) {
      othercanvasessetting[i].style.top = top_key;
      othercanvasessetting[i].style.left = left_key;
    }
    let thumbnailcanvases = document.getElementsByClassName(
        "thumbnailcanvases"
      );
      for (let i = 0; i < thumbnailcanvases.length; i++) {
        thumbnailcanvases[i].style.top = top_key;
        thumbnailcanvases[i].style.left = left_key;
      }
    var minelayers = document.getElementsByClassName("minelayer");
    for (let i = 0; i < minelayers.length; i++) {
      minelayers[i].style.top = top_key;
      minelayers[i].style.left = left_key;
    }
  });

  //Canvas Sketch/Pan eventlistener(pointer)
  const pointers = {};

  canvas.addEventListener(
    "contextmenu", (e) => {
      e.preventDefault();}
  );

  //Tool Change pointerwidth eventlistener
  width_range.addEventListener(
    "change",
    function (e) {
        line_widths[0] = width_range.value;
    },
    false
  );
  eraser_width_range.addEventListener(
    "change",
    function (e) {
       line_widths[1] =  eraser_width_range.value;
    },
    false
  );
  airbrush_width_range.addEventListener(
    "change",
    function (e) {
       line_widths[2] =  airbrush_width_range.value;
    },
    false
  );
  //Tool Change layer's opacity
  opacity_range.addEventListener("change",
    function (e) {
      can_active.style.opacity=opacity_range.value;
      updateCanvas();
    },
    false
  );
  let keydown=false;
  //Tool Undo/PAN eventlistener
  document.addEventListener(
    "keydown",
    function (e) {
      e.preventDefault;

      if(!keydown){
        //keycode-space
        if (e.code == "Space") {
          if (tool_pivot!="pan"){
            temptToolName=tool_pivot;
            changeTool('pan');
            panKeyDownPivot=true;
          }
        }
        //keycode-E
        if (e.code == "KeyE") {
          changeTool('eraser');
        }
        //keycode-M
        if (e.code == "KeyM") {
          mirror();
        }
        //keycode-P
        if (e.code == "KeyP") {
          changeTool('brush');
        }
        if (e.code == "KeyB") {
          changeTool('airbrush');
        }
        //keycode-Q
        if (e.code == "KeyQ") {
            mirror();
        }
        keydown=true;
      }
      if (e.ctrlKey && e.code == "KeyZ") undo();
      if (e.ctrlKey && e.code == "KeyY") redo();
      //keycode-[
      if (e.code == "BracketLeft") {
        line_width_change(-1);
      }
      //keycode-]
      if (e.code == "BracketRight") {
        line_width_change(1);
      }
    },
    false
  );
  //Tool PAN eventlistener
  document.addEventListener(
    "keyup",
    function (e) {
      if (e.code == "Space") {
        changeTool('pan');
        changeTool(temptToolName);
        panKeyDownPivot=false;
        temptToolName="";
      }
      keydown=false;
    },
    false
  );
  //Tool eyedroper
  canvas.addEventListener("pointerdown",function(e){
    if(e.button==2){
      temptToolName=tool_pivot;
      updateTool();
      tool_pivot="colorpicker";
      colorPickerPivot.style.backgroundColor = "rgb(184, 184, 184)";
      colorPickerTimer=Date.now();
      canvas.addEventListener("pointermove", getPixelColor);
      isActive = true;
      getPixelColor(e);
      eyeDropperContextmenuPivot=true;
      canvas.addEventListener("pointerup",()=>{
        isActive = false;
        changeTool('colorpicker');
        changeTool(temptToolName);
        panKeyDownPivot=false;
        temptToolName="";
      }, { once: true })
    }
  }
  )
  //Tool Zoom-in eventlistener
  canvas.addEventListener(
    "wheel",
    function (e) {
      wheel_zoom_in(e);
      update_zoom_range();
    },
    false
  );
  zoom_range.addEventListener(
    "change",
    function () {
      range_zoom_in();
    },
    false
  );
  updateToolInfo();
  //Tool load eventlistener
  fileUploader.addEventListener("change", (event) => {
    loadimage(event);
  });
  initBrush();
}
//Tool change linewidth
function line_width_change(pivot) {
  if (tool_pivot=="brush"&&parseInt(width_range.value)+ pivot>=1) {
    line_widths[0] = parseInt(width_range.value) + pivot;
  } else if (tool_pivot=="eraser"&&parseInt(eraser_width_range.value)+ pivot>=1) {
    line_widths[1] = parseInt(eraser_width_range.value) + pivot;
  }else if(tool_pivot=="airbrush"&&parseInt(airbrush_width_range.value)+ pivot>=1){
    line_widths[2] = parseInt(airbrush_width_range.value) + pivot;
  }
  updateToolInfo();
  ws_sendCursorPos();
  drawWidth();
}
//Tool Redo
function redo() {
  if(redoStack.length>0){
    let redoLayer=redoStack_active.pop();
    let redoImg=redoStack.pop();
    document.getElementById(redoLayer).getContext("2d").putImageData(redoImg, 0, 0);
    let thumbnail_img = document.getElementById("thumbnail_" + redoLayer.slice(9)).childNodes[1];
    thumbnail_img.src = document.getElementById(redoLayer).toDataURL("image/png");
    restore_active.push(redoLayer);
    restore.push(redoImg);
    if(redoStack_active.at(-1)&&redoLayer!=redoStack_active.at(-1)){
      let thumbnailId="thumbnail_"+redoStack_active.at(-1).slice(9);
      change_minelayer_active(document.getElementById(thumbnailId));
    }
    Updatethumbnail();
    updateCanvas();
  }

}
//Tool Undo
function undo() {
  if (restore.length > 1) {
    let changedLayername=restore_active.at(-2);


    if (document.getElementById(changedLayername) == null) {
      add_minelayer_existed(
        delete_canvas_pivots.at(-1),
        changedLayername
      );
            delete_canvas_pivots.length--;
    }
    redoStack.push( document.getElementById(changedLayername).getContext("2d").getImageData(0, 0, w, h));
    redoStack_active.push(changedLayername);
    document.getElementById(changedLayername).getContext("2d").putImageData(restore.at(-2), 0, 0);
    let thumbnail_img = document.getElementById("thumbnail_" + changedLayername.slice(9)).childNodes[1];
    thumbnail_img.src = document.getElementById(changedLayername).toDataURL("image/png");
    restore_active.length--;
    restore.length--;
    Updatethumbnail();
    updateCanvas();
  }
}
//Tool Zoom
function wheel_zoom_in(e) {
  if (1< scale && scale <= 3) {
    scale += e.deltaY * -1*0.0003*scale;
    if (scale > 3) scale = 3;
    if (scale < 0.05) scale = 0.05;
  }
  if (0.05<= scale && scale <= 1) {
    scale += e.deltaY * -1*0.00003*Math.pow(10,scale);
    if (scale > 3) scale = 3;
    if (scale < 0.05) scale = 0.05;
  }
  zoom_in(scale);
}
function range_zoom_in() {
  scale=Math.pow(10,parseFloat(zoom_range.value));
  zoom_in(scale);
}
function zoom_in(scale) {
  if (!mirror_flag) {
    scaleKey =
      "scale(" +
      (scale * scale_xy[0]).toString() +
      "," +
      (scale * scale_xy[1]).toString() +
      ") " +
      "translate(" +
      x_offset.toString() +
      "px," +
      y_offset.toString() +
      "px)";
  } else if (mirror_flag) {
    scaleKey =
      "scale(" +
      (scale * scale_xy[0]).toString() +
      "," +
      (scale * scale_xy[1]).toString() +
      ") " +
      "translate(" +
      x_offset.toString() +
      "px," +
      y_offset.toString() +
      "px)";
  }
  canvas.style.transform = scaleKey;
  can_mid.style.transform = scaleKey;
  background.style.transform = scaleKey;
  var othercanvasessetting = document.getElementsByClassName(
    "othermembercanvases"
  );
  for (let i = 0; i < othercanvasessetting.length; i++) {
    othercanvasessetting[i].style.transform = scaleKey;
  }
  let thumbnailcanvases = document.getElementsByClassName(
        "thumbnailcanvases"
      );
      for (let i = 0; i < thumbnailcanvases.length; i++) {
        thumbnailcanvases[i].style.transform = scaleKey;
      }
  can_proj.style.transform = scaleKey;
  var minelayers = document.getElementsByClassName("minelayer");
  for (let i = 0; i < minelayers.length; i++) {
    minelayers[i].style.transform = scaleKey;
  }
}
function update_zoom_range() {
  zoom_range.value = Math.log10(scale);
}

//Tool Mirror
function mirror() {
  if (!mirror_flag) {
    scale_xy = [-1, 1];
    scaleKey =
      "scale(" +
      (scale * scale_xy[0]).toString() +
      "," +
      (scale * scale_xy[1]).toString() +
      ") " +
      "translate(" +
      x_offset.toString() +
      "px," +
      y_offset.toString() +
      "px)";
    mirror_flag = true;
    document.getElementById("mirror_pivot").style.backgroundColor = "rgb(184, 184, 184)";
  } else if (mirror_flag) {
    scale_x = scale;
    scale_xy = [1, 1];
    scaleKey =
      "scale(" +
      (scale * scale_xy[0]).toString() +
      "," +
      (scale * scale_xy[1]).toString() +
      ") " +
      "translate(" +
      x_offset.toString() +
      "px," +
      y_offset.toString() +
      "px)";
    mirror_flag = false;
    document.getElementById("mirror_pivot").style.backgroundColor = "";
  }
  canvas.style.transform = scaleKey;
  can_mid.style.transform = scaleKey;
  background.style.transform = scaleKey;
  var othercanvasessetting = document.getElementsByClassName(
    "othermembercanvases"
  );
  for (let i = 0; i < othercanvasessetting.length; i++) {
    othercanvasessetting[i].style.transform = scaleKey;
  }
  let thumbnailcanvases = document.getElementsByClassName(
        "thumbnailcanvases"
      );
      for (let i = 0; i < thumbnailcanvases.length; i++) {
        thumbnailcanvases[i].style.transform = scaleKey;
      }
  can_proj.style.transform = scaleKey;
  var minelayers = document.getElementsByClassName("minelayer");
  for (let i = 0; i < minelayers.length; i++) {
    minelayers[i].style.transform = scaleKey;
  }
  drawWidth();
}

//Tool Save image by default name
async function saveimage() {
  var link = document.createElement("a");
  link.download = "sharingsketch.png";
  link.href = document.getElementById("projection").toDataURL("image/png");
  link.click();
}

async function exportimage() {
  ctx_proj.clearRect(0, 0, w, h);
  let minelayers = document.getElementsByClassName("minelayer");
  if (minelayers.length == 0) can_proj = can_active;
  else {
    for (let i = 0; i < minelayers.length; i++) {
      if (minelayers[i].style.visibility=="visible"){
        let opacity=minelayers[i].style.opacity;
        ctx_proj.globalAlpha=opacity;
        ctx_proj.drawImage(minelayers[i], 0, 0);
        ctx_proj.globalAlpha=1;
      }
    }
  }
  const input = document.getElementById("fileInput");
  const file = document.getElementById("projection").toDataURL("image/png");
  const blob = await fetch(file).then((res) => res.blob());
  const dataURL = projection.toDataURL("image/png");
  if (file) {
    localStorage.setItem("savedImage", dataURL);
    bye();
    window.location.href = "export";
  }
}
async function gogallery() {
  bye();
  window.location.href = "/gallery";
}
async function reroomlist() {
  bye();
  window.location.href = "/";
}
//Tool Load image from gallery
async function loadimage_gallery(cookieValue) {
  try {
    const imageResponse = await fetch(`/image/${cookieValue}`);
    if (!imageResponse.ok) throw new Error("Failed to fetch image");

    const blob = await imageResponse.blob();
    console.log(blob);
    var img = new Image();
    const imgURL = URL.createObjectURL(blob);
    img.src = imgURL;
    img.onload = function () {
      ctx_active.globalCompositeOperation = "source-over";
      ctx_active.clearRect(0, 0, w, h);
      ctx_active.drawImage(img, 0, 0);
      restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
      restore_active[restore_active.length] = can_active.id;
      Updatethumbnail();
      updateCanvas();
    };
  } catch (error) {
    console.error("Error downloading image:", error);
  }
}
function cookie_value(cookname) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (cookname === name && value != "") {
      document.cookie = `${cookname}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      return value;
    }
  }
  return false;
}

//Tool Load image by upload png
async function loadimage(event) {
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.onload = function (Res) {
    var img = new Image();
    img.src = Res.target.result;
    img.onload = function () {
      ctx_active.globalCompositeOperation = "source-over";
      ctx_active.clearRect(0, 0, w, h);
      ctx_active.drawImage(img, 0, 0);
      restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
      restore_active[restore_active.length] = can_active.id;
      Updatethumbnail();
      updateCanvas();
    };
  };
}

function erase_all() {
  var m = confirm("Want to clear");
  if (m) {
    ctx_active.clearRect(0, 0, w, h);
    Updatethumbnail();
    updateCanvas();
  }
}
//Updatethumbnail
function Updatethumbnail() {
  let thumbnail_img = document.getElementById("thumbnail_" + can_active.id.slice(9)).childNodes[1];
  can_active.toBlob(function(blob) {
    if (blob) {
      if(thumbnail_img.src){
        URL.revokeObjectURL(thumbnail_img.src);
      }
      thumbnail_img.src = URL.createObjectURL(blob);
    }
  }, 'image/webp');
}



//Updatecanvas
function updateCanvas() {
  ctx_proj.clearRect(0, 0, w, h);
  let minelayers = document.getElementsByClassName("minelayer");
  if (minelayers.length == 0) can_proj = can_active;
  else {
    for (let i = 0; i < minelayers.length; i++) {
      if (minelayers[i].style.visibility=="visible"){
        let opacity=minelayers[i].style.opacity;
        ctx_proj.globalAlpha=opacity;
        ctx_proj.drawImage(minelayers[i], 0, 0);
        ctx_proj.globalAlpha=1;
      }
    }
  }
can_proj.toBlob(function(blob) {
  if (blob) {
  const reader = new FileReader();
  reader.onloadend=()=>{
    let start_at =  Date.now();
    let ws_packet={"event":"new_img","sid":self_sid,"imgdata":reader.result,"roomsid":roomsid,"start_at":start_at};
    socket.send(JSON.stringify(ws_packet));
  }
  reader.readAsDataURL(blob);
  }
}, 'image/webp');
  let otherlayers = document.getElementsByClassName("othermembercanvases");
      for (let i = 0; i < otherlayers.length; i++) {
        ctx_proj.drawImage(otherlayers[i], 0, 0);
        ctx_proj.globalAlpha=1;
    }

  can_proj.toBlob(function(blob) {
  if (blob) {
  const reader = new FileReader();
  reader.onloadend=()=>{
    let start_at =  Date.now();
    let ws_packet={"event":"update_room_img","sid":self_sid,"imgdata":reader.result,"roomsid":roomsid,"start_at":start_at};
    socket.send(JSON.stringify(ws_packet));
  }
  reader.readAsDataURL(blob);
  }
}, 'image/webp');
}
