// import variables
// tool_pivot,isActive,updateTool
// currX,currY,x
// colorPickerPivot,canvas,colorHueIcon,colorHueIcon,colorBg


function colorPicker() {
    if(tool_pivot!="colorpicker"){
        updateTool();
        tool_pivot="colorpicker";
        colorPickerPivot.style.backgroundColor = "rgb(184, 184, 184)";
        colorPickerTimer=Date.now();
        canvas.addEventListener("pointermove", getPixelColor);
        canvas.addEventListener("pointerdown", addPixelColor);
    }else{
        updateTool();
        canvas.addEventListener("pointermove", defaultMove);
    }
}

function addPixelColor(e) {
    isActive = true;
    getPixelColor(e);
    canvas.addEventListener("pointerup", stopGetPixelColor, { once: true });
}

function stopGetPixelColor(e) {
    isActive = false;
}

function getPixelColor(e){
    if(Date.now()-colorPickerTimer>33){
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;
        if(isActive){
            let canvasX=(currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset;
            let canvasY=(currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset;

            let ColorInfo=getPixelColorAt(canvasX,canvasY)
            console.log("p="+ColorInfo);
            let hsv=rgbToHsv(ColorInfo);
            console.log("p="+hsv);
            x=hsvToHsl(hsv[0],hsv[1]/100,hsv[2]/100);
            colorpickerShow.style.backgroundColor=x;
            colorIcon.style.left=`${hsv[1]}%`;
            colorIcon.style.top=`${100-hsv[2]}%`;
            colorHueIcon.style.top=hsv[0]/360*colorHue.offsetHeight+"px";
            colorBg.style.backgroundColor=`hsl(${hsv[0]}, 100%, 50%)`;
        }
        colorPickerTimer=Date.now();
    }
}


function getPixelColorAt(x, y) {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 1;
    tmpCanvas.height = 1;
    const tmpCtx = tmpCanvas.getContext("2d");

    tmpCtx.fillStyle = 'rgba(255, 255, 255, 1)';
    tmpCtx.fillRect(0, 0, 1, 1);

    const layers = [
        ...document.getElementsByClassName('thumbnailcanvases'),
        ...document.getElementsByClassName('othermembercanvases'),
        ...document.getElementsByClassName('minelayer')
    ];

    for (let layer of layers) {
        if (layer.style.visibility !== "hidden") {
        const opacity = parseFloat(layer.style.opacity) || 1;
        tmpCtx.globalAlpha = opacity;
        // 將該層的 (x,y) 區域畫到暫存 canvas 的 (0,0)
        tmpCtx.drawImage(layer, x, y, 1, 1, 0, 0, 1, 1);
        }
    }

    return tmpCtx.getImageData(0, 0, 1, 1).data;
}

function rgbToHsv(ColorInfo) {
  let r = ColorInfo[0]/255;
  let g = ColorInfo[1]/255;
  let b = ColorInfo[2]/255;

  const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
  const d = max - min;

  let h, s, v = max;

  if (d === 0) {
    h = 0;
  } else {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }

  s = max === 0 ? 0 : d / max;

  return [
    Math.round(h),               // Hue: 0 - 360
    Math.round(s * 100),         // Saturation: 0 - 100
    Math.round(v * 100)          // Value: 0 - 100
  ];
}