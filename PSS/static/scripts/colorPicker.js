let colorHue =document.getElementById("colorpicker-hue");
let colorBg =document.getElementById("colorpicker-bg");
let colorHueIcon =document.getElementById("colorpicker-hue-icon");
let colorPickerDiv =document.getElementById("colorpickerdiv");
let colorIcon =document.getElementById("colorpicker-icon");
let colorpickerShow=document.getElementById("colorpicker-show");
let hue=0;
let colorXProp=1;
let colorYProp=0;
colorHue.addEventListener("pointerdown",colorHueDown);
colorHue.addEventListener("pointermove",colorHueMove);
colorHue.addEventListener("pointerover", colorHueDown);

function colorHueDown(ev){
    if (ev.buttons === 1) {
        hue=ev.offsetY/colorHue.offsetHeight*360;
        colorBg.style.backgroundColor=`hsl(${hue}, 100%, 50%)`;
        colorHueIcon.style.top=`${hue/360*100}%`;
        x=hsvToHsl(hue,colorXProp,1-colorYProp);
        colorpickerShow.style.backgroundColor=x;
    }
}

function colorHueMove(ev){
    if (ev.buttons === 1) {
        hue=ev.offsetY/colorHue.offsetHeight*360;
        colorBg.style.backgroundColor=`hsl(${hue}, 100%, 50%)`;
        colorHueIcon.style.top=`${hue/360*100}%`;
        x=hsvToHsl(hue,colorXProp,1-colorYProp);
        colorpickerShow.style.backgroundColor=x;
    }
}

colorPickerDiv.addEventListener("pointerdown",colorPickerDown);
colorPickerDiv.addEventListener("pointermove",colorPickerMove);
colorPickerDiv.addEventListener("pointerover", colorPickerDown);

function colorPickerDown(ev){
    if (ev.buttons === 1) {
        colorXProp=ev.offsetX/colorPickerDiv.offsetWidth;
        colorYProp=ev.offsetY/colorPickerDiv.offsetHeight;
        x=hsvToHsl(hue,colorXProp,1-colorYProp);
        colorpickerShow.style.backgroundColor=x;
        colorIcon.style.left=`${colorXProp*100}%`;
        colorIcon.style.top=`${colorYProp*100}%`;
    }
}

function colorPickerMove(ev){
    if (ev.buttons === 1) {
        colorXProp=ev.offsetX/colorPickerDiv.offsetWidth;
        colorYProp=ev.offsetY/colorPickerDiv.offsetHeight;
        x=hsvToHsl(hue,colorXProp,1-colorYProp);
        colorpickerShow.style.backgroundColor=x;
        colorIcon.style.left=`${colorXProp*100}%`;
        colorIcon.style.top=`${colorYProp*100}%`;
    }
}

function colorPickerLeave(ev){
    if (ev.buttons === 1) {
        let lastX=ev.offsetX;
        let lastY=ev.offsetY;
        function outDivColorPicker(ev) {
            colorXProp=(ev.clientX+lastX)/colorPickerDiv.offsetWidth;
            colorYProp=(ev.clientY+lastY)/colorPickerDiv.offsetHeight;
            colorXProp = Math.max(0, Math.min(1, colorXProp));
            colorYProp = Math.max(0, Math.min(1, colorYProp));
            x=hsvToHsl(hue,colorXProp,1-colorYProp);
            colorpickerShow.style.backgroundColor=x;
            colorIcon.style.left=`${colorXProp*100}%`;
            colorIcon.style.top=`${colorYProp*100}%`;
        }
        function upColorPicker() {
            document.addEventListener("pointermove",outDivColorPicker);
            document.addEventListener("pointerup",upColorPicker);
        }
        document.addEventListener("pointermove",outDivColorPicker);
        document.addEventListener("pointerup",upColorPicker);
    }
}

function hsvToHsl(h,s,v){
    let l = v * (1 - s / 2);
    let sl = 0;

    if (l !== 0 && l !== 1) {
        sl = (v - l) / Math.min(l, 1 - l);
    }
    return `hsl(${h}, ${sl*100}%,  ${l*100}%)`;
}