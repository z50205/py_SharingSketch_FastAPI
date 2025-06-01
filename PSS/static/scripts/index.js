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