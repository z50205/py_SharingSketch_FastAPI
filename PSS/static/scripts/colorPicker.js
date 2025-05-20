let colorHue =document.getElementById("colorpicker-hue");
let colorBg =document.getElementById("colorpicker-bg");
let colorHueIcon =document.getElementById("colorpicker-hue-icon");
let colorPickerImg =document.getElementById("colorpicker-img");
let hueProp=0;
let colorXProp=1;
let colorYProp=0;
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