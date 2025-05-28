// import variables
// tool_pivot,isActive,updateTool
// currX,currY,x
// canvas,ctx_active,......


function eraserTool(){
    if(tool_pivot!="eraser"){
        updateTool();
        tool_pivot="eraser";
        eraserPivot.style.backgroundColor = "rgb(184, 184, 184)";
        canvas.addEventListener("pointerdown", addEraser);
        canvas.addEventListener("pointerup", stopEraser);
        canvas.addEventListener("pointermove", eraserPack);
        canvas.addEventListener("pointerout", outCanvasEraser);
        canvas.addEventListener("pointerover", enterCanvasEraser);
    }else{
        updateTool();
        canvas.addEventListener("pointermove", defaultMove);
    }
}

function addEraser(e) {
    isActive = true;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
}

function stopEraser(e) {
    if (restore.length >= restore_max) {
        restore.shift();
        restore_active.shift();
    }
    restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
    restore_active[restore_active.length] = can_active.id;
    Updatethumbnail();
    updateCanvas();
    isActive = false;
}
function outCanvasEraser(e) {
    isActive = false;
}
function enterCanvasEraser(e) {
  if(e.buttons==1){
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      isActive = true;
    }
  else isActive=false;
}

function eraserPack(e){
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    if (isActive) {
      draw(e.pressure, false);
    }
    ws_sendCursorPos();
    drawWidth(false);
}