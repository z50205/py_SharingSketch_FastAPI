
// 快取不同顏色的貼圖
const sprayStamp = createSprayStamp(100);


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
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    if (isActive) {
        sprayBrushLine(prevX, prevY, currX, currY,e.pressure*2);
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
    gradient.addColorStop(0, 'rgba(0,0,0,0.5)');               // 中心：不透明
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fill();
    return canvas;
}


// 將黑白貼圖著色成任意顏色
function tintSprayStamp(stampCanvas, color,pressure) {
  const tinted = document.createElement("canvas");
  tinted.width = stampCanvas.width;
  tinted.height = stampCanvas.height;
  const ctx = tinted.getContext("2d");

  // Step 1: 填色
  color=hslToHsla(color, pressure);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, tinted.width, tinted.height);

  // Step 2: 保留 alpha（原圖形狀）
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(stampCanvas, 0, 0);

  return tinted;
}

// 線段插值繪製
function sprayBrushLine(prevX, prevY, currX, currY,pressure) {
  const spacing = 2;
  const dx = currX - prevX;
  const dy = currY - prevY;
  const distance = Math.hypot(dx, dy);
  const steps = Math.floor(distance / spacing);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const interX = prevX + dx * t;
    const interY = prevY + dy * t;
    sprayStampAt(interX, interY,pressure);
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
    ctx_active.globalCompositeOperation = "source-over";
    const tintedStamp = tintSprayStamp(sprayStamp,x,pressure);
    ctx_active.drawImage(tintedStamp, drawX, drawY, size, size);
}

function hslToHsla(hsl, alpha) {
  return hsl.replace(/^hsl\(([^)]+)\)/, `hsla($1, ${alpha})`);
}