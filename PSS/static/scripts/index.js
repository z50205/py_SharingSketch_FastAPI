let toggleCloseIcon=document.getElementById("login-close");
let toggleShowButton=document.getElementById("login-show");
let overlay=document.getElementById("overlay");

function toggleLogin(){
    if(overlay.classList.contains("active")){
        overlay.classList.remove("active");
    }else{
        overlay.classList.add("active");
    }
}

toggleCloseIcon.addEventListener('click', toggleLogin);
toggleShowButton.addEventListener('click', toggleLogin);


function scrollActive(index){
    let lines=document.getElementsByClassName("feature-main-timeline-line");
    let circles=document.getElementsByClassName("feature-main-timeline-circle");
    let texts=document.getElementsByClassName("feature-main-timeline-text");
    for (let i=0;i<texts.length;i++){
        texts[i].classList.remove("active");
    }
    texts[index-1].classList.add("active");
    for (let i=0;i<circles.length;i++){
        circles[i].classList.remove("active");
    }
    for (let i=0;i<index;i++){
        circles[i].classList.add("active");
    }
    for (let i=0;i<lines.length;i++){
        lines[i].classList.remove("active");
    }
    for (let i=0;i<index-1;i++){
        lines[i].classList.add("active");
    }
}

const ratios = new Map(); // 紀錄所有元素的最新交叉比例

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        ratios.set(entry.target.id, entry.intersectionRatio);
    });

    let maxId = null;
    let maxRatio = 0;

    ratios.forEach((ratio, id) => {
        if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
        }
    });

    if (maxId) {
        if (maxId === "sync") {
            scrollActive(1);
        } else if (maxId === "sketch") {
            scrollActive(2);
        } else if (maxId === "manage") {
            scrollActive(3);
        }
    }
}, {
    threshold: [0, 0.25, 0.5, 0.75, 1], // 更多 threshold 讓觀察更細膩
});
let sync=document.getElementById("sync");
let sketch=document.getElementById("sketch");
let manage=document.getElementById("manage");
observer.observe(sync);
observer.observe(sketch);
observer.observe(manage);



let featureDiv=document.getElementById("feature-div");
let aboutDiv=document.getElementById("about-div");
let tabText=document.getElementById("tab-title");

let feature=document.getElementById("feature");
let about=document.getElementById("about");
feature.addEventListener("click",()=>{
    tabText.textContent="Features";
    featureDiv.style.display="flex";
    feature.classList.add("active");
    aboutDiv.style.display="none";
    about.classList.remove("active");
})
about.addEventListener("click",()=>{
    tabText.textContent="About";
    featureDiv.style.display="none";
    feature.classList.remove("active");
    aboutDiv.style.display="flex";
    about.classList.add("active");
})


let chatMessage=document.getElementById("chat-message");
let chatArrow=document.getElementById("chat-arrow");
let chatMessageDiv=document.getElementById("chat-message-div");
let messages=[
    "Hi!\n I'm Biz, a developer who enjoys building useful tools and fun web apps.",
    "SharingSketch was built as a personal experiment to explore a real-time sketching tool using FastAPI and WebSocket.",
    "If you have questions or suggestions, feel free to reach out!"
]
let messagePivot=0;
let isFinish=false;

async function messageAnimate(Pivot,i){
    if(Pivot==messagePivot && !isFinish){
        let message=messages[Pivot];
        if (i < message.length) {
            chatMessage.textContent += message[i];
            i++;
            let time=(Math.random()*50-25)+40;
            setTimeout(() => messageAnimate(Pivot,i), time);
        }else{
            isFinish=true;
            chatArrow.style.display="block";
        }
    }
}

chatMessageDiv.addEventListener("click",()=>{
    if(isFinish){
        chatMessage.textContent = "";
        messagePivot = (messagePivot + 1) % 3;
        isFinish=false;
        chatArrow.style.display="none";
        messageAnimate(messagePivot,0);
    }else{
        chatMessage.textContent =messages[messagePivot];
        isFinish=true;
        chatArrow.style.display="block";
    }
})

messageAnimate(messagePivot,0);

