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

const observer = new IntersectionObserver((entries) => {
    let maxRatio = 0;
    let maxEntry = null;
    console.log(entries);
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        maxEntry = entry;
        }
    });
    if (maxEntry) {
        const id = maxEntry.target.id;
        if(id=="sync"){
            scrollActive(1);
        }else if(id=="sketch"){
            scrollActive(2);
        }else if(id=="manage"){
            scrollActive(3);
        }
    }
},
{
    threshold: 0.5
  });
let sync=document.getElementById("sync");
let sketch=document.getElementById("sketch");
let manage=document.getElementById("manage");
observer.observe(sync);
observer.observe(sketch);
observer.observe(manage);