//Chatroom part

const roomInfo = document.getElementById("room-info");
roomInfo.textContent = `Room: ${room} | User: ${username}`;
// const socket = io("http://13.112.29.121", {
//   transports: ["websocket"],
//   autoConnect: false,
// });
// const socket = io("https://bizara.link", {
//   transports: ["websocket"],
//   autoConnect: false,
// });
// const socket = io({ transports: ["websocket"] });
const socket = io("http://localhost:8000", { transports: ["websocket"] });
document.getElementById("join-btn").addEventListener("click", function () {
  if (!socket.connected) {
    socket.connect();
    console.log("Connecting...");
  } else {
    console.log("Already connected");
  }
});
document.getElementById("message").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    sendMessage();
  }
});

socket.on("connect", function () {
  console.log("On Connect");
  document.getElementById("chat").style.display = "block";
  document.getElementById("members").style.display = "block";
  document.getElementById("landing").style.display = "none";
  socket.emit("user_join", { username, room });
  document.getElementById("bye_button").checked = true;
  document.getElementById("bye_button").disabled = false;
  document.getElementById("leave_room_button").checked = true;
  document.getElementById("leave_room_button").disabled = false;
  document.getElementById("gallery_button").checked = true;
  document.getElementById("gallery_button").disabled = false;
});

socket.on("createNewCanvas", function (data) {
  canvassids = data["canvassids"];
  console.log("canvassids" + canvassids);
  console.log("self_sid" + self_sid);
  var allcanvases = document.getElementsByTagName("canvas");
  var allcanvaseslength = allcanvases.length;
  var canvaseParentNode = document.getElementById("painting-area");
  for (i = 0; i < canvassids.length; i++) {
    var newone_pivot = true;
    for (ii = 0; ii < allcanvaseslength; ii++) {
      if (allcanvases[ii].id == canvassids[i] || self_sid == canvassids[i]) {
        newone_pivot = false;
      }
    }
    if (newone_pivot) {
      var newcanvas = document.createElement("canvas");
      newcanvas.style =
        "position:absolute;border:0px solid; touch-action: none;z-index: 1;";
      newcanvas.style.top = top_key;
      newcanvas.style.left = left_key;
      newcanvas.id = canvassids[i];
      newcanvas.height = h;
      newcanvas.width = w;
      newcanvas.className = "othermembercanvases";
      newcanvas.style.transform = scaleKey;
      canvaseParentNode.insertBefore(newcanvas, canvas);
    }
  }
  socket.emit("update_old_content", room);
});
socket.on("leaveRemoveCanvas", function (data) {
  leave_sid = data["LeaveSid"];
  console.log("leave_sid :" + leave_sid);
  console.log("self_sid :" + self_sid);
  if (leave_sid == self_sid) {
    var othercanvasessetting = document.getElementsByClassName(
      "othermembercanvases"
    );
    while (othercanvasessetting.length > 0) {
      othercanvasessetting[0].remove();
    }
  } else {
    document.getElementById(leave_sid).remove();
  }
});
socket.on("initUpdateImg", function (data) {
  const can_proj_data = can_proj.toDataURL("image/png");
  socket.emit("init_new_img", { can_proj_data, room });
});
socket.on("memberslistUpdate", function (data) {
  memberslist = data["memberslist"];
  console.log("roomname" + room + "memberslist" + memberslist);
  let ul = document.getElementById("members-list");
  ul.innerHTML = "";
  for (i = 0; i < memberslist.length; i++) {
    let li = document.createElement("li");
    li.appendChild(
      document.createTextNode("member " + i + ":" + memberslist[i])
    );
    ul.appendChild(li);
  }
});
socket.on("join", function (data) {
  self_sid = data["SelfSid"];
  console.log(self_sid);
  socket.emit("update_old_content", room);
  updateCanvas();
});
socket.on("chat", function (data) {
  let ul = document.getElementById("chat-messages");
  let li = document.createElement("li");
  li.appendChild(
    document.createTextNode(data["username"] + ":" + data["message"])
  );
  ul.appendChild(li);
  ul.scrollTop = ul.scrollHeight;
});
//Sketchboard part
socket.on("updateImg", function (data) {
  // var img=document.getElementById("update_img");
  // img.src=data["updateimg"];
  var img = new Image();
  img.src = data["updateimg"];
  img.onload = function () {
    ctx_others = document.getElementById(data["UpdateSid"]).getContext("2d");
    ctx_others.clearRect(0, 0, w, h);
    ctx_others.drawImage(img, 0, 0);
    document.getElementById(data["UpdateSid"]).style.transform = scaleKey;
  };
  // canvas.getContext("2d").drawImage(img, 0, 0);
});
//Redirect
socket.on("redirect", function (data) {
  socket.disconnect();
  console.log("disconnect()");
  window.location.href = data.url;
});
socket.on("disconnect", function (data) {
  socket.disconnect();
  document.getElementById("bye_button").checked = false;
  document.getElementById("bye_button").disabled = true;
  document.getElementById("chat").style.display = "none";
  document.getElementById("members").style.display = "none";
  document.getElementById("landing").style.display = "block";
  console.log("disconnect()");
});

function sendMessage() {
  let message = document.getElementById("message").value;
  socket.emit("new_message", { message, room });
  document.getElementById("message").value = "";
}
function bye() {
  socket.emit("bye", room);
}
function leave_room() {
  socket.emit("leave_room", room);
}
