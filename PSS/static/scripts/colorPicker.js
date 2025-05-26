let colorHue =document.getElementById("colorpicker-hue");
let colorBg =document.getElementById("colorpicker-bg");
let colorHueIcon =document.getElementById("colorpicker-hue-icon");
let colorPickerImg =document.getElementById("colorpicker-img");
let hueProp=0;
let colorXProp=1;
let colorYProp=0;

//Tool variables
let colorPickerPivot =document.getElementById("colorPicker_pivot");
let color_pivot = false;
let colorPickerTimer;

colorHue.addEventListener("mousedown",(ev)=>{
    hueProp=ev.offsetX/colorHue.offsetWidth;
    colorBg.style.backgroundColor=`hsl(${hueProp*360}, 100%, 50%)`;
    colorHueIcon.style.left=`${hueProp*100}%`;
    x=hsvToHsl(hueProp*360,colorXProp,1-colorYProp);
    function mouseMove(ev){
        let hueProp=ev.offsetX/colorHue.offsetWidth;
        colorBg.style.backgroundColor=`hsl(${hueProp*360}, 100%, 50%)`;
        colorHueIcon.style.left=`${hueProp*100}%`;
        x=hsvToHsl(hueProp*360,colorXProp,1-colorYProp);
    }
    function mouseLeave(){
        colorHue.removeEventListener("mousemove",mouseMove);
        colorHue.removeEventListener("mouseup",mouseLeave);
        colorHue.removeEventListener("mouseleave",mouseLeave);
    }
    colorHue.addEventListener("mousemove",mouseMove);
    colorHue.addEventListener("mouseup",mouseLeave);
    colorHue.addEventListener("mouseleave",mouseLeave);
})


let colorPickerDiv =document.getElementById("colorpickerdiv");
let colorIcon =document.getElementById("colorpicker-icon");
colorPickerDiv.addEventListener("mousedown",(ev)=>{
    let colorXProp=ev.offsetX/colorPickerDiv.offsetWidth;
    let colorYProp=ev.offsetY/colorPickerDiv.offsetHeight;
    x=hsvToHsl(hueProp*360,colorXProp,1-colorYProp);
    colorIcon.style.left=`${colorXProp*100}%`;
    colorIcon.style.top=`${colorYProp*100}%`;
    function mouseMove(ev){
        let colorXProp=ev.offsetX/colorPickerDiv.offsetWidth;
        let colorYProp=ev.offsetY/colorPickerDiv.offsetHeight;
        x=hsvToHsl(hueProp*360,colorXProp,1-colorYProp);
        colorIcon.style.left=`${colorXProp*100}%`;
        colorIcon.style.top=`${colorYProp*100}%`;
    }
    function mouseLeave(){
        colorPickerDiv.removeEventListener("mousemove",mouseMove);
        colorPickerDiv.removeEventListener("mouseup",mouseLeave);
        colorPickerDiv.removeEventListener("mouseleave",mouseLeave);
    }
    colorPickerDiv.addEventListener("mousemove",mouseMove);
    colorPickerDiv.addEventListener("mouseup",mouseLeave);
    colorPickerDiv.addEventListener("mouseleave",mouseLeave);
})
function hsvToHsl(h,s,v){
    let l = v * (1 - s / 2);
    let sl = 0;

    if (l !== 0 && l !== 1) {
        sl = (v - l) / Math.min(l, 1 - l);
    }
    return `hsl(${h}, ${sl*100}%,  ${l*100}%)`;
}


function colorPicker() {
  if (!color_pivot) {
    colorPickerPivot.style.backgroundColor = "rgb(184, 184, 184)";
    canvas.addEventListener("pointerdown", addPixelColor, { once: true });
    canvas.addEventListener("pointerup", removePixelColor, { once: true });
  }
}

function addPixelColor(e) {
    color_pivot = true;
    getPixelColor(e);
    colorPickerTimer=Date.now();
    canvas.addEventListener("pointermove", getPixelColor);
}

function removePixelColor(e) {
    color_pivot = false;
    colorPickerPivot.style.backgroundColor = "";
    canvas.removeEventListener("pointermove", getPixelColor);
}

function getPixelColor(e){
    if(Date.now()-colorPickerTimer>33){
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;
        let canvasX=(currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset;
        let canvasY=(currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset;

        let ColorInfo=getPixelColorAt(canvasX,canvasY)
        console.log("p="+ColorInfo);
        let hsv=rgbToHsv(ColorInfo);
        console.log("p="+hsv);
        x=hsvToHsl(hsv[0],hsv[1]/100,hsv[2]/100);
        colorIcon.style.left=`${hsv[1]}%`;
        colorIcon.style.top=`${100-hsv[2]}%`;
        colorHueIcon.style.left =hsv[0]/360*colorHue.offsetWidth+"px";
        colorBg.style.backgroundColor=`hsl(${hsv[0]}, 100%, 50%)`;
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