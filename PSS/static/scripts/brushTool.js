// import variables
// tool_pivot,isActive,updateTool
// currX,currY,x
// canvas,ctx_active,......
function initBrush(){
        tool_pivot="brush";
        brushPivot.style.backgroundColor = "rgb(184, 184, 184)";
        brush.style.display="block";
        canvas.addEventListener("pointerdown", addBrush);
        canvas.addEventListener("pointerup", stopBrush);
        canvas.addEventListener("pointermove", brushPack);
        canvas.addEventListener("pointerout", outCanvasBrush);
        canvas.addEventListener("pointerover", enterCanvasBrush);
}


function brushTool(){
    if(tool_pivot!="brush"){
        updateTool();
        tool_pivot="brush";
        brushPivot.style.backgroundColor = "rgb(184, 184, 184)";
        brush.style.display="block";
        canvas.addEventListener("pointerdown", addBrush);
        canvas.addEventListener("pointerup", stopBrush);
        canvas.addEventListener("pointermove", brushPack);
        canvas.addEventListener("pointerout", outCanvasBrush);
        canvas.addEventListener("pointerover", enterCanvasBrush);
    }
}

function addBrush(e) {
    isActive = true;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
}

function stopBrush(e) {
    if (restore.length >= restore_max) {
        restore.shift();
        restore_active.shift();
    }
    restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
    restore_active[restore_active.length] = can_active.id;
    Updatethumbnail();
    updateCanvas();
    redoStack=[];
    redoStack_active=[];
    isActive = false;
}

function outCanvasBrush(e) {
    isActive = false;
}
function enterCanvasBrush(e) {
  if(e.buttons==1){
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      isActive = true;
    }
  else isActive=false;
}


function brushPack(e){
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    if (isActive) {
      draw(e.pressure, true);
    }
    ws_sendCursorPos();
    drawWidth(true);
}

//Tool Color Change
function color(obj) {
  updateToolInfo();
}
//Tool Change pointwidth(Pen/Eraser)
function updateToolInfo() {
  if (tool_pivot=="brush") width_range.value = line_widths[0];
  else if (tool_pivot=="eraser") eraser_width_range.value = line_widths[1];
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