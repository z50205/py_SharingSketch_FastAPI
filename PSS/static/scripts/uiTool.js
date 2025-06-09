let layerTab=document.getElementById("layer-tab");
let chatTab=document.getElementById("chatroom-tab");
let bottomToolCloseIcon=document.getElementById("bottom-tool-close-icon");
let bottomToolTab=document.getElementById("bottom-tool-Tab");
let onlineSwitchImg=document.getElementById("online-switch-img");
let onlineSwitchText=document.getElementById("online-switch-text");
let onlineSwitchInput=document.getElementById("online-switch-input");
let onlineSwitchLabel=document.getElementById("online-switch-label");

let layer=document.getElementById("layer");
let chat=document.getElementById("chatroom");
let brush=document.getElementById("brush");
let eraser=document.getElementById("eraser");
let airbrush=document.getElementById("airbrush");
let bottomTool=document.getElementById("bottom-tool");
let rightToolBar=document.getElementById("right-toolbar");

let bottomToolHeightSlide=document.getElementById("bottom-tool-slide");
let bottomToolHeightSlideDiv=document.getElementById("bottom-tool-slidediv");

layerTab.addEventListener("click",()=>{
    updateTab();
    layer.style.display="flex";
})

chatTab.addEventListener("click",()=>{
    updateTab();
    chat.style.display="flex";
})

bottomToolCloseIcon.addEventListener("click",()=>{
    bottomToolCloseIcon.style.display="none";
    layer.style.display="none";
    chat.style.display="none";
    rightToolBar.style.height="fit-content";
    bottomTool.style.height="fit-content";
    bottomTool.style.right="0px";
    bottomToolHeightSlideDiv.style.display="none";
})
bottomToolTab.addEventListener("click",()=>{
    if (bottomTool.style.height=="fit-content")
    {
        rightToolBar.style.height="unset";
        bottomTool.style.height=initBottomToolHeight+"px";
        bottomToolCloseIcon.style.display="block";
        bottomTool.style.right="unset";
        bottomToolHeightSlideDiv.style.display="flex";
        if (layerTab.classList.contains('active')){
            layer.style.display="flex";
        }else{
            chat.style.display="flex";
        }
    }
})

function updateTab(){
    layer.style.display="none";
    chat.style.display="none";
}

function updateToolConfig(){
    brush.style.display="none";
    eraser.style.display="none";
    airbrush.style.display="none";
}

onlineSwitchLabel.addEventListener("click",()=>{
    if(online){
        bye();
    }
    else{
        reconnect();
    }
})

function onlineState(){
    if(online){
        onlineSwitchImg.src="static/icons/record.svg";
        onlineSwitchText.textContent="ONLINE";
        onlineSwitchText.style.color="red";
    }
    else{
        onlineSwitchImg.src="static/icons/offline.svg";
        onlineSwitchText.textContent="OFFLINE";
        onlineSwitchText.style.color="white";
    }
}
let bottomToolHeight=false;
let initBottomToolHeight=250;
bottomToolHeightSlide.addEventListener("pointerdown",bottomToolHeightSlideDown)
function bottomToolHeightSlideDown(event){
    initBottomToolHeight=initBottomToolHeight+event.clientY;
    bottomToolHeight=true;
    window.addEventListener("pointermove",bottomToolHeightSlideMove)
    window.addEventListener("pointerup",bottomToolHeightSlideUp)
}
function bottomToolHeightSlideMove(event){
    if (bottomToolHeight){
        bottomTool.style.height=((initBottomToolHeight-event.clientY))+"px";
    }
}
function bottomToolHeightSlideUp(event){
    initBottomToolHeight=(initBottomToolHeight-event.clientY);
    bottomToolHeight=false;
    window.removeEventListener("pointermove",bottomToolHeightSlideMove)
    window.removeEventListener("pointerup",bottomToolHeightSlideUp)
}