const importimage = async (event) => {
  event.preventDefault();
  const img = document.getElementById("localimage");
  try {
    const img_src=document.cookie.split("=")[1];
    const imageResponse = await fetch("/image/"+img_src);
    if (!imageResponse.ok) throw new Error("Failed to fetch image");
    const blob = await imageResponse.blob();
    const imgURL = URL.createObjectURL(blob);
    img.src = imgURL;
    localStorage.setItem("importImage", imgURL);
  } catch (error) {
    console.error("Error downloading image:", error);
  }
};
window.onload = importimage;

const mask=document.getElementById("form-mask");
const formDiv=document.getElementById("createroom-div");

const showUserForm=(toggle)=>{
  if (toggle){
      mask.classList.add("active");
      formDiv.style.display="block";
  }else{
      mask.classList.remove("active");
      formDiv.style.display="none";
  }
}


document.addEventListener('click', function(event) {
if (event.target.classList.contains('mask') && event.target.classList.contains('active')) {
  showUserForm(false);}
  });

const postLiveRoom=(roomid)=>{
  let roomForm=document.getElementById("liveRoomForm-"+roomid);
  roomForm.submit();
}
const postFormerRoom=(roomid)=>{
  let roomForm=document.getElementById("formerRoomForm-"+roomid);
  roomForm.submit();
}
const postSelfRoom=(roomid)=>{
  let roomForm=document.getElementById("selfRoomForm-"+roomid);
  roomForm.submit();
}

let editRoom; 
async function showTool(event,roomid){
  event.stopPropagation();
  let tool=document.getElementById("roomTool");
  if(!editRoom||roomid!=editRoom){
    editRoom=roomid;
    const displayResponse=await fetch(`/api/room/${editRoom}/display`,{
      method:"GET"
    })
    let icon=document.getElementById("display-icon");
    let text=document.getElementById("display-text");
    const displayResult=await displayResponse.json();
    if (displayResult.status){
      icon.src="static/icons/eye.svg";
      text.textContent="Display";
    }else{
      icon.src="static/icons/eye-slash.svg";
      text.textContent="Hide";
    }
    tool.style.display="block";
    let activeRoom=document.getElementById("showTool-"+roomid);
    activeRoom.appendChild(tool);
  }else{
    tool.style.display="none";
    editRoom = null;  
  }
}
async function reviseRoomDisplay(event){
  event.stopPropagation();
  const displayResponse=await fetch(`/api/room/${editRoom}/display`,{
    method:"PATCH"
  })
  const displayResult=await displayResponse.json();
  if (displayResult.message=="Update display success!"){
    let icon=document.getElementById("display-icon");
    let text=document.getElementById("display-text");
    let roomIcon=document.getElementById(`displayicon-${displayResult.room_id}`);
    if (displayResult.status){
      icon.src="static/icons/eye.svg";
      text.textContent="Display";
      roomIcon.src="static/icons/eye_black.svg";
    }else{
      icon.src="static/icons/eye-slash.svg";
      text.textContent="Hide";
      roomIcon.src="static/icons/eye-slash_black.svg";
    }
  }
}

async function deleteRoom(event){
  event.stopPropagation();
  const deleteResponse=await fetch(`/api/room/${editRoom}`,{
    method:"DELETE"
  })
  const deleteResult=await deleteResponse.json();
  let tool=document.getElementById("roomTool");
  tool.style.display="none";
  let tempt=document.getElementById("form-mask");
  tempt.appendChild(tool);
  if (deleteResult.message=="Delete success!"){
    let deleteliveElement=document.getElementById(`liveRoomForm-${editRoom}`);
    if(deleteliveElement) deleteliveElement.remove();
    let deleteFormerElement=document.getElementById(`formerRoomForm-${editRoom}`);
    if(deleteFormerElement) deleteFormerElement.remove();
    let deleteSelfElement=document.getElementById(`selfRoomForm-${editRoom}`);
    if(deleteSelfElement) deleteSelfElement.remove();
    editRoom = null;  
  }
}
document.addEventListener("click",()=>{
  let tool=document.getElementById("roomTool");
  tool.style.display="none";
})

let lobby=document.getElementById("main-room-lobby");
let setting=document.getElementById("main-room-setting");
let toggle=document.getElementById("toggle-div");
let togglePivot=document.getElementById("toggle-title");
let toggleIcon=document.getElementById("toggle-icon");
let toggleText=document.getElementById("toggle-text");
let lobbyPivot=document.getElementsByClassName("left-sidebar-item")[0];
let settingPivot=document.getElementsByClassName("left-sidebar-item")[1];
showManagePanel("lobby");
toggleShowManagePanel();

function toggleShowManagePanel(){
  if (togglePivot.classList.contains("active")){
    togglePivot.classList.remove("active");
    toggle.style.display="none";
  }else{
    togglePivot.classList.add("active");
    toggle.style.display="block";
  }
}

function updateToggleTitle(panelName){
  if (panelName=="lobby"){
    toggleIcon.src="static/icons/people.svg";
    toggleText.textContent="Room Lobby";
  }else{
    toggleIcon.src="static/icons/stack.svg";
    toggleText.textContent="Room Setting";
  }
}


function showManagePanel(panelName){
  if (panelName=="lobby"){
    setting.style.display="none";
    lobby.style.display="block";
    lobbyPivot.classList.add("active");
    settingPivot.classList.remove("active");
  }else{
    setting.style.display="block";
    lobby.style.display="none";
    lobbyPivot.classList.remove("active");
    settingPivot.classList.add("active");
  }
  updateToggleTitle(panelName);
  toggleShowManagePanel();
}