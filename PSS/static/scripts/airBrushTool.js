
// 快取不同顏色的貼圖
const sprayStamp = createSprayStamp(100);
let tintedStamp;


function airBrushTool(){
        if(tool_pivot!="airbrush"){
        updateTool();
        tool_pivot="airbrush";
        airBrushPivot.style.backgroundColor = "rgb(184, 184, 184)";
        airbrush.style.display="block";
        canvas.addEventListener("pointerdown", addAirBrush);
        canvas.addEventListener("pointerup", stopAirBrush);
        canvas.addEventListener("pointermove", airBrushPack);
        canvas.addEventListener("pointerout", outCanvasAirBrush);
        canvas.addEventListener("pointerover", enterCanvasAirBrush);
    }
}
function addAirBrush(e) {
    isActive = true;
    
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
}

function stopAirBrush(e) {
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

function outCanvasAirBrush(e) {
    isActive = false;
}
function enterCanvasAirBrush(e) {
  if(e.buttons==1){
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      isActive = true;
    }
  else isActive=false;
}


function airBrushPack(e){
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    if (isActive) {
        tintedStamp = tintSprayStamp(sprayStamp,x);
        sprayBrushLine(currX, currY,e.pressure);
    }
    ws_sendCursorPos();
    drawWidth(true);
}






function createSprayStamp(radius) {
    const canvas = document.createElement("canvas");
    canvas.width = radius * 2;
    canvas.height = radius * 2;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,0.3)');               // 中心：不透明
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fill();
    return canvas;
}


// 將黑白貼圖著色成任意顏色
function tintSprayStamp(stampCanvas, color) {
  const tinted = document.createElement("canvas");
  tinted.width = stampCanvas.width;
  tinted.height = stampCanvas.height;
  const ctx = tinted.getContext("2d");

  // Step 1: 填色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, tinted.width, tinted.height);

  // Step 2: 保留 alpha（原圖形狀）
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(stampCanvas, 0, 0);

  return tinted;
}

// 線段插值繪製
function sprayBrushLine(currX, currY,pressure) {
  const spacing = line_widths[2]/9;
  const dx = currX - prevX;
  const dy = currY - prevY;
  const distance = Math.hypot(dx, dy);
  if(distance>spacing){
    const steps = Math.floor(distance / spacing);

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interX = prevX + dx * t;
        const interY = prevY + dy * t;
        sprayStampAt(interX, interY,pressure);
    }

    prevX = currX;
    prevY = currY;
  }
}

// 噴刷一個 stamp（含縮放、偏移、著色）
function sprayStampAt(interX, interY,pressure) {
    const size = line_widths[2];

    const drawX =
        (interX - scale_orgin[0]) / (scale * scale_xy[0]) +
        scale_orgin[0] -
        x_offset -
        size / 2;
    const drawY =
        (interY - scale_orgin[1]) / (scale * scale_xy[1]) +
        scale_orgin[1] -
        y_offset -
        size / 2;
    ctx_active.save();
    ctx_active.globalAlpha = pressure;
    ctx_active.globalCompositeOperation = "source-over";
    ctx_active.drawImage(tintedStamp, drawX, drawY, size, size);
    ctx_active.restore();
}
