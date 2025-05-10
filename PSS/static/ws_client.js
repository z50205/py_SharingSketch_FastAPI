const roomInfo = document.getElementById("room-info");
roomInfo.textContent = `Room: ${room} | User: ${username}`;

let self_sid;


const connectWebSocket=()=>{
    const socket = new WebSocket("http://127.0.0.1:8000/ws");
    socket.onopen=(ev)=>{
        if (socket.readyState!=1){
            reconnect();
        }
        else{
            console.log("Already connected");
            document.getElementById("chat").style.display = "block";
            document.getElementById("members").style.display = "block";
            document.getElementById("landing").style.display = "none";
            let ws_packet={"event":"user_join","username":username,"roomname":room}
            socket.send(JSON.stringify(ws_packet));
            document.getElementById("bye_button").checked = true;
            document.getElementById("bye_button").disabled = false;
        }
    }
    socket.onmessage=(ev)=>{
      let data=JSON.parse(ev.data);
        switch(data["event"]){
          case "join":
            ws_join(data);
            break;
          case "updateMemberList":
            ws_updateMemberList(data);
            break;
          case "createRoomCanvas":
            ws_createRoomCanvas(data);
            break;
          case "updateImg":
            ws_updateImg(data);
            break;
          case "tryUpdateImg":
            ws_updateImg(data);
            break;
          case "removeLeaveCanvas":
            ws_removeLeaveCanvas(data);
            break;
          case "removeRoomCanvas":
            ws_removeRoomCanvas(data);
            break;
          case "sendMessage":
            ws_sendMessage(data);
            break;
        }

    }
    socket.onclose=(ev)=>{
      let othercanvasessetting = document.getElementsByClassName(
        "othermembercanvases"
      );
      while (othercanvasessetting.length > 0) {
        othercanvasessetting[0].remove();
      }
      // disconnect
      document.getElementById("bye_button").checked = false;
      document.getElementById("bye_button").disabled = true;
      document.getElementById("chat").style.display = "none";
      document.getElementById("members").style.display = "none";
      document.getElementById("landing").style.display = "block";
  }
    const ws_join=(data)=>{
        self_sid = data["sid"];
    }
    const ws_updateMemberList=(data)=>{
      // memberlist
        memberlist = data["memberlist"];
        console.log("roomname" + room + "memberlist" + memberlist);
        let ul = document.getElementById("members-list");
        ul.textContent = "";
        for (i = 0; i < memberlist.length; i++) {
          let li = document.createElement("li");
          li.appendChild(
            document.createTextNode("member " + i + ":" + memberlist[i])
          );
          ul.appendChild(li);
        }
    }
    const ws_createRoomCanvas=(data)=>{
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
        updateCanvas();
    }
    const ws_updateImg=(data)=>{
      // var img=document.getElementById("update_img");
      // img.src=data["updateimg"];
      var img = new Image();
      img.src = data["imgdata"];
      img.onload = function () {
        ctx_others = document.getElementById(data["sid"]).getContext("2d");
        ctx_others.clearRect(0, 0, w, h);
        ctx_others.drawImage(img, 0, 0);
        document.getElementById(data["sid"]).style.transform = scaleKey;
      };
      // canvas.getContext("2d").drawImage(img, 0, 0);
    };
    const ws_removeLeaveCanvas=(data)=>{
      leave_sid = data["sid"];
      console.log("leave_sid :" + leave_sid);
      console.log("self_sid :" + self_sid);
      document.getElementById(leave_sid).remove();
    };
    const ws_removeRoomCanvas=(data)=>{
      leave_sid = data["sid"];
      console.log("leave_sid :" + leave_sid);
      console.log("self_sid :" + self_sid);
      socket.close();
    };
    const ws_sendMessage=(data)=>{

      let ul = document.getElementById("chat-messages");
      let li = document.createElement("li");
      li.style.display="flex";
      let p1=document.createElement("p");
      let p2=document.createElement("p");
      p1.appendChild(
        document.createTextNode(data["username"] + ":")
      );
      p1.style.marginBottom="0px";
      p2.appendChild(
        document.createTextNode(data["message"])
      );
      p2.style.overflowWrap="anywhere";
      p2.style.marginBottom="0px";
      li.appendChild(p1);
      li.appendChild(p2);
      ul.appendChild(li);
      ul.scrollTop = ul.scrollHeight;
    };
    
    return socket
}

function bye() {
  let ws_packet={"event":"leave_room","sid":self_sid}
  socket.send(JSON.stringify(ws_packet));
}

function reconnect(){
  if (socket) {
    socket.close(); // 關閉舊的WebSocket連接
  }
  socket=connectWebSocket();
}

function sendMessage() {
  let message = document.getElementById("message").value;
  let ws_packet={"event":"send_message","message":message,"sid":self_sid}
  socket.send(JSON.stringify(ws_packet));
  document.getElementById("message").value = "";
}



let socket=connectWebSocket();

// document.getElementById("join-btn").addEventListener("click", function () {
//     if (socket.readyState!=1) {
//       socket.connect();
//       console.log("Connecting...");
//     } else {
//       console.log("Already connected");
//     }
//   });
