let colorpickerSamples=document.getElementsByClassName("draw-colorpicker-sample");
let colorpickerSampleMenu=document.getElementById("colorpicker-sample-menu");
let currentSample = null;

for(let i=0;i<colorpickerSamples.length;i++){
    colorpickerSamples[i].addEventListener("contextmenu",colorpickerSampleActive);
    colorpickerSamples[i].addEventListener("click",colorpickerSampleGet)
}

function colorpickerSampleActive(e){
    e.preventDefault();
    currentSample=e.currentTarget;
    currentSample.appendChild(colorpickerSampleMenu);
    colorpickerSampleMenu.style.display="block";
    currentSample.style.border="1px solid red";
}
function colorpickerSampleGet(e){
    e.preventDefault();
    let currentSample=e.currentTarget;
    if(currentSample.style.background!=""){
        let rgbString=currentSample.style.background
        const rgbArray = rgbString.match(/\d+/g).map(Number);
        setPixelColor(rgbArray);
    }
}
colorpickerSampleMenu.addEventListener("click",(e)=>{
    currentSample.style.background=x;
    currentSample.style.border="1px solid white";
    colorpickerSampleMenu.style.display="none";

})
document.addEventListener("pointerdown",(e)=>{
    if(e.target!=colorpickerSampleMenu){
        if(currentSample){
            currentSample.style.border="1px solid white";
        }
        colorpickerSampleMenu.style.display="none";
    }
})