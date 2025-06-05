let isActive=false;

let brushPivot=document.getElementById("draw-tab");
let eraserPivot=document.getElementById("eraser-tab");
let colorPickerPivot =document.getElementById("colorPicker_pivot");
let panPivot=document.getElementById("pan_pivot");
let airBrushPivot=document.getElementById("airbrush-tab");

let colorPickerTimer;
function changeTool(toolname){
    switch(toolname){
        case "colorpicker":
            colorPicker();
            break;
        case "brush":
            brushTool();
            break;
        case "eraser":
            eraserTool();
            break;
        case "pan":
            panTool();
            break;
        case "airbrush":
            airBrushTool();
            break;

    }
}

function updateTool(){
    updateToolConfig();
    canvas.removeEventListener("pointermove", defaultMove);
    switch(tool_pivot){
        case "colorpicker":
            colorPickerPivot.style.backgroundColor = "";
            canvas.removeEventListener("pointermove", getPixelColor);
            canvas.removeEventListener("pointerdown", addPixelColor);
            break;
        case "brush":
            brushPivot.style.backgroundColor = "";
            canvas.removeEventListener("pointerdown", addBrush);
            canvas.removeEventListener("pointerup", stopBrush);
            canvas.removeEventListener("pointermove", brushPack);
            canvas.removeEventListener("pointerout", outCanvasBrush);
            canvas.removeEventListener("pointerover", enterCanvasBrush);
            break;
        case "eraser":
            eraserPivot.style.backgroundColor = "";
            canvas.removeEventListener("pointermove", eraserPack);
            canvas.removeEventListener("pointerdown", addEraser);
            canvas.removeEventListener("pointerup", stopEraser);
            canvas.removeEventListener("pointerout", outCanvasEraser);
            canvas.removeEventListener("pointerover", enterCanvasEraser);
            break;
        case "airbrush":
            airBrushPivot.style.backgroundColor = "";
            canvas.removeEventListener("pointerdown", addAirBrush);
            canvas.removeEventListener("pointerup", stopAirBrush);
            canvas.removeEventListener("pointermove", airBrushPack);
            canvas.removeEventListener("pointerout", outCanvasAirBrush);
            canvas.removeEventListener("pointerover", enterCanvasAirBrush);
            break;
        case "pan":
            panPivot.style.backgroundColor = "";
            canvas.removeEventListener("pointermove", panPack);
            canvas.removeEventListener("pointerdown", addPan);
            break;
    }
    tool_pivot = "";
}

//Tool Change pointwidth(Pen/Eraser)
function updateToolInfo() {
  if (tool_pivot=="brush") width_range.value = line_widths[0];
  else if (tool_pivot=="eraser") eraser_width_range.value = line_widths[1];
  else if (tool_pivot=="airbrush") airbrush_width_range.value = line_widths[2];
}


function defaultMove(e){
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
}