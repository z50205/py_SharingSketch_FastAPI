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
draw_flag = true; //pen or eraser
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

//Drawtool variables
line_widths = [2, 10, 0]; //Set tools linewidth 1.pen；2.eraser 3.other(no _use)
line_widths_max = [100, 200, 0]; //Set tools linewidth Maximum 1.pen；2.eraser 3.other(no _use)
pan_flag = false;
mirror_flag = false;
restore_max = 30;
var x = "black";

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
  top_key = (window.innerHeight / 2 - h / 2).toString() + "px";
  left_key = (window.innerWidth / 2 - w / 2).toString() + "px";
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
  custom_color = document.getElementById("favcolor");
  zoom_range = document.getElementById("zoom_range");
  revise_range = document.getElementById("revise_range");
  let opacity_range=document.getElementById("opacity_range");
  opacity_range.value=1;

  //Cancel defaultevent
  window.addEventListener("wheel", (e) => e.preventDefault(), {
    passive: false,
  });
  window.addEventListener("keydown", function (e) {
    if (e.keyCode == 32 && e.target == document.body) {
      e.preventDefault();
    }
  });

  window.addEventListener("resize", function () {
    top_key = (window.innerHeight / 2 - h / 2).toString() + "px";
    left_key = (window.innerWidth / 2 - w / 2).toString() + "px";
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
    var minelayers = document.getElementsByClassName("minelayer");
    for (let i = 0; i < minelayers.length; i++) {
      minelayers[i].style.top = top_key;
      minelayers[i].style.left = left_key;
    }
  });

  //Canvas Sketch/Pan eventlistener(pointer)
  const pointers = {};

  canvas.addEventListener(
    "pointermove",
    function (e) {
      mouse_position = [e.clientX, e.clientY];
      if (space_pivot)panCanvas("move", e);
      else if(Object.keys(pointers).length == 2)panCanvas("move", e);
      else findxy("move", e, draw_flag);
    },
    false
  );
  canvas.addEventListener(
    "pointerdown",
    function (e) {
      pointers[e.pointerId] = true;
      if (space_pivot) panCanvas("down", e);
      else if (Object.keys(pointers).length == 2) panCanvas("down", e);
      else findxy("down", e, draw_flag);
    },
    false
  );
  canvas.addEventListener(
    "pointerup",
    function (e) {
      delete pointers[e.pointerId];
      if (space_pivot) panCanvas("up", e);
      else if (pan_flag && Object.keys(pointers).length != 2) panCanvas("up", e);
      else findxy("up", e, draw_flag);
    },
    false
  );
  canvas.addEventListener(
    "pointerout",
    function (e) {
      delete pointers[e.pointerId];
      if (space_pivot) panCanvas("out", e);
      else if (pan_flag && Object.keys(pointers).length != 2)panCanvas("out", e);
      else findxy("out", e, draw_flag);
    },
    false
  );

  //Tool Change pointerwidth eventlistener
  width_range.addEventListener(
    "pointerup",
    function (e) {
      if (draw_flag) {
        line_widths[0] = width_range.value;
      } else line_widths[1] = width_range.value;
    },
    false
  );
  //Tool Change layer's opacity
  opacity_range.addEventListener("pointerup",
    function (e) {
      can_active.style.opacity=opacity_range.value;
      updateCanvas();
    },
    false
  );
  //Tool Undo/PAN eventlistener
  document.addEventListener(
    "keydown",
    function (e) {
      e.preventDefault;
      if (e.ctrlKey && e.keyCode == 90) backLastStep();
      //keycode-space
      if (e.keyCode == 32) {
        e.preventDefault;
        space_pivot = true;
      }
      //keycode-E
      if (e.keyCode == 69) {
        color(document.getElementById("erase"));
      }
      //keycode-M
      if (e.keyCode == 77) {
        mirror();
      }
      //keycode-P
      if (e.keyCode == 80) {
        color(document.getElementById(x));
      }
      //keycode-Q
      if (e.keyCode == 81) {
        mirror();
      }
      //keycode-[
      if (e.keyCode == 219) {
        line_width_change(-1);
      }
      //keycode-]
      if (e.keyCode == 221) {
        line_width_change(1);
      }
      // console.log(space_pivot);
    },
    false
  );
  //Tool PAN eventlistener
  document.addEventListener(
    "keyup",
    function (e) {
      if (e.keyCode == 32) {
        e.preventDefault;
        space_pivot = false;
        flag = false;
        panCanvas("out", e);
      }
      // console.log(space_pivot);
    },
    false
  );
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
    "pointerup",
    function () {
      range_zoom_in();
    },
    false
  );
  //Tool custom color eventlistener
  custom_color.addEventListener(
    "input",
    function (e) {
      x = custom_color.value.toString();
    },
    false
  );
  updateToolInfo();
  loadimage_gallery();
  //Tool load eventlistener
  fileUploader.addEventListener("change", (event) => {
    loadimage(event);
  });
}
//Tool change linewidth
function line_width_change(pivot) {
  width_range.value = parseInt(width_range.value) + pivot;
  if (draw_flag) {
    line_widths[0] = width_range.value;
  } else if (!draw_flag) {
    line_widths[1] = width_range.value;
  }
}
//Tool Undo
function backLastStep() {
  if (restore.length > 1) {
    if (
      document.getElementById(restore_active[restore_active.length - 2]) == null
    ) {
      add_minelayer_existed(
        delete_canvas_pivots[delete_canvas_pivots.length - 1],
        restore_active[restore_active.length - 2]
      );
      document
        .getElementById(restore_active[restore_active.length - 2])
        .getContext("2d")
        .putImageData(restore[restore.length - 2], 0, 0);
      var thumbnail_img = document.getElementById(
        "thumbnail_" + restore_active[restore_active.length - 2].slice(9)
      ).childNodes[1];
      thumbnail_img.src = document
        .getElementById(restore_active[restore_active.length - 2])
        .toDataURL("image/png");
      restore_active.length--;
      delete_canvas_pivots.length--;
      restore.length--;
      updateCanvas();
    } else {
      console.log(restore_active);
      console.log(restore);
      document
        .getElementById(restore_active[restore_active.length - 2])
        .getContext("2d")
        .putImageData(restore[restore.length - 2], 0, 0);
      var thumbnail_img = document.getElementById(
        "thumbnail_" + restore_active[restore_active.length - 2].slice(9)
      ).childNodes[1];
      thumbnail_img.src = document
        .getElementById(restore_active[restore_active.length - 2])
        .toDataURL("image/png");
      restore_active.length--;
      restore.length--;
      updateCanvas();
    }
  }
}
//Tool Zoom
function wheel_zoom_in(e) {
  if (0.1 <= scale <= 3) {
    scale += e.deltaY * -0.001;
    if (scale > 3) scale = 3;
    if (scale < 0.3) scale = 0.3;
  }
  zoom_in(scale);
}
function range_zoom_in() {
  scale=parseFloat(zoom_range.value);
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
  can_proj.style.transform = scaleKey;
  var minelayers = document.getElementsByClassName("minelayer");
  for (let i = 0; i < minelayers.length; i++) {
    minelayers[i].style.transform = scaleKey;
  }
}
function update_zoom_range() {
  zoom_range.value = scale;
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
    document.getElementById("mirror_pivot").checked = true;
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
    document.getElementById("mirror_pivot").checked = false;
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
  can_proj.style.transform = scaleKey;
  var minelayers = document.getElementsByClassName("minelayer");
  for (let i = 0; i < minelayers.length; i++) {
    minelayers[i].style.transform = scaleKey;
  }
}
//Tool Save image by default name
async function saveimage() {
  var link = document.createElement("a");
  link.download = "sharingsketch.png";
  link.href = document.getElementById("projection").toDataURL("image/png");
  link.click();
}

async function exportimage() {
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
  window.location.href = "/chooseroom";
}
//Tool Load image from gallery
async function loadimage_gallery() {
  const cookieValue = cookie_value("src");
  try {
    const imageResponse = await fetch(`/api${cookieValue}`);
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
      updateCanvas();
    };
  };
}
//Tool Pan
function panCanvas(res, e) {
  if (res == "down") {
    x_old_origin = e.clientX;
    y_old_origin = e.clientY;
    x_offset_origin = x_offset;
    y_offset_origin = y_offset;
    pan_flag = true;
  }
  if (res == "up" || res == "out") {
    if (pan_flag) {
      x_offset = x_offset_origin + x_offset / (scale * scale_xy[0]);
      y_offset = y_offset_origin + y_offset / (scale * scale_xy[1]);
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
      canvas.style.transform = scaleKey;
      can_mid.style.transform = scaleKey;
      background.style.transform = scaleKey;
      var othercanvasessetting = document.getElementsByClassName(
        "othermembercanvases"
      );
      for (let i = 0; i < othercanvasessetting.length; i++) {
        othercanvasessetting[i].style.transform = scaleKey;
      }
      can_proj.style.transform = scaleKey;
      var minelayers = document.getElementsByClassName("minelayer");
      for (let i = 0; i < minelayers.length; i++) {
        minelayers[i].style.transform = scaleKey;
      }
      pan_flag = false;
    }
  }
  if (res == "move") {
    if (pan_flag) {
      x_offset = e.clientX - x_old_origin;
      y_offset = e.clientY - y_old_origin;
      scaleKey =
        "scale(" +
        (scale * scale_xy[0]).toString() +
        "," +
        (scale * scale_xy[1]).toString() +
        ") " +
        "translate(" +
        (x_offset_origin + x_offset / (scale * scale_xy[0])).toString() +
        "px," +
        (y_offset_origin + y_offset / (scale * scale_xy[1])).toString() +
        "px)";
      canvas.style.transform = scaleKey;
      can_mid.style.transform = scaleKey;
      background.style.transform = scaleKey;
      var othercanvasessetting = document.getElementsByClassName(
        "othermembercanvases"
      );
      for (let i = 0; i < othercanvasessetting.length; i++) {
        othercanvasessetting[i].style.transform = scaleKey;
      }
      can_proj.style.transform = scaleKey;
      var minelayers = document.getElementsByClassName("minelayer");
      for (let i = 0; i < minelayers.length; i++) {
        minelayers[i].style.transform = scaleKey;
      }
    }
  }
}
//Tool Color Change
function color(obj) {
  draw_flag = true;
  document.getElementById("erase").checked = false;
  switch (obj.id) {
    case "green":
      x = "green";
      break;
    case "blue":
      x = "blue";
      break;
    case "red":
      x = "red";
      break;
    case "yellow":
      x = "yellow";
      break;
    case "orange":
      x = "orange";
      break;
    case "black":
      x = "black";
      break;
    case "black":
      x = "black";
      break;
    case "erase":
      draw_flag = false;
      document.getElementById("erase").checked = true;
      break;
  }
  updateToolInfo();
}
//Tool Change pointwidth(Pen/Eraser)
function updateToolInfo() {
  if (draw_flag) width_range.value = line_widths[0];
  else if (!draw_flag) width_range.value = line_widths[1];
}
//Sketch
function findxy(res, e, draw_flag) {
  if (res == "down") {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    flag = true;
    dot_flag = true;
    if (dot_flag) {
      ctx_active.beginPath();
      ctx_active.fillStyle = x;
      ctx_active.fillRect(
        currX * scale,
        currY * scale,
        2 * e.pressure,
        2 * e.pressure
      );
      ctx_active.closePath();
      dot_flag = false;
    }
  }
  if (res == "up" || res == "out") {
    if (flag) {
      if (restore.length >= restore_max) {
        restore.shift();
        restore_active.shift();
      }
      restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
      restore_active[restore_active.length] = can_active.id;
      updateCanvas();
    }
    flag = false;
  }
  if (res == "move") {
    if (flag) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      draw(e.pressure, draw_flag);
    }
  }
}
//Sketch sub draw function
function draw(pressure, draw_flag) {
  if (draw_flag) {
    ctx_active.globalCompositeOperation = "source-over";
    ctx_active.strokeStyle = x;
    ctx_active.lineCap = "round";
    ctx_active.lineWidth = line_widths[0] * pressure;
  } else {
    // ctx.strokeStyle = rgba(0,0,0,0.0);
    ctx_active.globalCompositeOperation = "destination-out";
    ctx_active.lineWidth = line_widths[1];
  }
  ctx_active.beginPath();
  ctx_active.moveTo(
    (prevX - scale_orgin[0]) / (scale * scale_xy[0]) +
      scale_orgin[0] -
      x_offset,
    (prevY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset
  );
  ctx_active.lineTo(
    (currX - scale_orgin[0]) / (scale * scale_xy[0]) +
      scale_orgin[0] -
      x_offset,
    (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset
  );
  // ctx.moveTo((prevX) / (scale * scale_xy[0]) - x_offset, (prevY) / (scale * scale_xy[1]) - y_offset);
  // ctx.lineTo((currX) / (scale * scale_xy[0]) - x_offset, (currY) / (scale * scale_xy[1]) - y_offset);
  ctx_active.stroke();
  ctx_active.closePath();
}

function erase_all() {
  var m = confirm("Want to clear");
  if (m) {
    ctx_active.clearRect(0, 0, w, h);
    updateCanvas();
  }
}
//Updatecanvas
function updateCanvas() {
  ctx_proj.clearRect(0, 0, w, h);
  var thumbnail_img = document.getElementById(
    "thumbnail_" + can_active.id.slice(9)
  ).childNodes[1];
  var minelayers = document.getElementsByClassName("minelayer");
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
  // console.log(thumbnail_img);
  thumbnail_img.src = can_active.toDataURL("image/png");
  const can_proj_data = can_proj.toDataURL("image/png");
  start_at =  Date.now();
  let ws_packet={"event":"new_img","sid":self_sid,"imgdata":can_proj_data,"roomname":room,"start_at":start_at}
  socket.send(JSON.stringify(ws_packet));
}
