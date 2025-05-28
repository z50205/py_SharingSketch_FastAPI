// import variables
// tool_pivot,isActive,updateTool
// currX,currY,x
// canvas,ctx_active,......


function panTool(){
    if(tool_pivot!="pan"){
        updateTool();
        tool_pivot="pan";
        panPivot.style.backgroundColor = "rgb(184, 184, 184)";
        canvas.addEventListener("pointermove", panPack);
        canvas.addEventListener("pointerdown", addPan);
    }else{
        updateTool();
        canvas.addEventListener("pointermove", defaultMove);
    }
}

function addPan(e) {
    isActive = true;
    x_old_origin = e.clientX;
    y_old_origin = e.clientY;
    x_offset_origin = x_offset;
    y_offset_origin = y_offset;
    canvas.addEventListener("pointerup", stopBrush, { once: true });
}

function stopPan(e) {
    isActive = false;
}


function panPack(e){
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    if (isActive) {
        x_offset = x_offset_origin + (e.clientX - x_old_origin) / (scale * scale_xy[0]);
        y_offset = y_offset_origin + (e.clientY - y_old_origin) / (scale * scale_xy[1]);
        pan();
    }
}

//Sketch sub draw function
function pan() {
    scaleKey =
    "scale(" +
    (scale * scale_xy[0]).toString() +
    "," +
    (scale * scale_xy[1]).toString() +
    ") " +
    "translate(" +
    (x_offset).toString() +
    "px," +
    (y_offset).toString() +
    "px)";
    canvas.style.transform = scaleKey;
    can_mid.style.transform = scaleKey;
    background.style.transform = scaleKey;
    let othercanvasessetting = document.getElementsByClassName(
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
    let minelayers = document.getElementsByClassName("minelayer");
    for (let i = 0; i < minelayers.length; i++) {
    minelayers[i].style.transform = scaleKey;
    }
}