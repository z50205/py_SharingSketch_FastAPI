const roomInfo = document.getElementById("room-info");
roomInfo.textContent = `Room: ${room} | User: ${username}`;

let self_sid;
let online;
let selfLayerPivot=false;


const connectWebSocket=()=>{
    const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${wsProtocol}://${location.host}/ws`);
    socket.onopen=(ev)=>{
        if (socket.readyState!=1){
            reconnect();
        }
        else{
            console.log("Already connected");
            let ws_packet={"event":"user_join","username":username,"roomsid":roomsid}
            socket.send(JSON.stringify(ws_packet));
            online=true;
            onlineSwitchInput.checked=true;
            onlineState();
        }
    }
    socket.onmessage=(ev)=>{
      let data=JSON.parse(ev.data);
        switch(data["event"]){
          case "join":
            ws_join(data);
            break;
          case "updateCursorPos":
            ws_updateCursorPos(data);
            break;
          case "updateMemberList":
            ws_updateMemberList(data);
            break;
          case "createRoomCanvas":
            ws_createRoomCanvas(data);
            break;
          case "createRoomCanvasDatabase":
            ws_createRoomCanvasDatabase(data);
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
      onlineSwitchInput.checked=false;
      online=false;
      onlineState();
  }
    const ws_join=(data)=>{
        self_sid = data["sid"];
    }
    const ws_updateCursorPos=(data)=>{
      // update
      room_cursors[data["sid"]]={"username":data["username"],"cursorPos":data["cursor_pos"],"updateTime":Date.now()};
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
    const ws_createRoomCanvas= async (data)=>{
      let canvassids = data["canvassids"];
      let canvasParentNode = document.getElementById("painting-area");
      // 1.取得此房間所有參與者
      let response=await fetch("/api/room/"+roomsid+"/participants",{
        method:"GET"
      });
      let participants=await response.json();
      // 2.分離在線及離線使用者
      const onlineCanvassIds = canvassids.map(item => item[1]);
      const offlineParticipants = participants.filter(participant => !onlineCanvassIds.includes(participant));
      // 3.製作離線使用者thumbnail的canvas
      for(let i =0;i<offlineParticipants.length;i++){
        if (!document.getElementById(offlineParticipants[i])){
            let newThumbnailCanvas = document.createElement("canvas");
            newThumbnailCanvas.style =
              "position:absolute;border:0px solid; touch-action: none;z-index: 1;";
            newThumbnailCanvas.style.top = top_key;
            newThumbnailCanvas.style.left = left_key;
            newThumbnailCanvas.id = offlineParticipants[i];
            newThumbnailCanvas.height = h;
            newThumbnailCanvas.width = w;
            newThumbnailCanvas.className = "thumbnailcanvases";
            newThumbnailCanvas.style.transform = scaleKey;
            canvasParentNode.insertBefore(newThumbnailCanvas, canvas);
            const thumbnailResponse=await fetch("/thumbnail/room/"+roomsid+"/"+offlineParticipants[i],{
              method:"GET"
            });
            const blob = await thumbnailResponse.blob();
            let img = new Image();
            const imgURL = URL.createObjectURL(blob);
            img.src = imgURL;
            img.onload = function () {
                let newThumbnailCtx=newThumbnailCanvas.getContext("2d");
                newThumbnailCtx.globalCompositeOperation = "source-over";
                newThumbnailCtx.drawImage(img, 0, 0);
            }
          }
        }
      // 3.移除已上線使用者的thumbnail canvas
      for(let i =0;i<onlineCanvassIds.length;i++){
        let removeThumbnailCanvas=document.getElementById(onlineCanvassIds[i])
        if (removeThumbnailCanvas){
          removeThumbnailCanvas.remove();
        }
      }

      // 4.製作上線使用者的canvas以供同步
        let allcanvases = document.getElementsByTagName("canvas");
        let allcanvaseslength = allcanvases.length;
        for (i = 0; i < canvassids.length; i++) {
          var newone_pivot = true;
          for (ii = 0; ii < allcanvaseslength; ii++) {
            if (allcanvases[ii].id == canvassids[i][0] || self_sid == canvassids[i][0]) {
              newone_pivot = false;
            }
          }
          if (newone_pivot) {
            var newcanvas = document.createElement("canvas");
            newcanvas.style =
              "position:absolute;border:0px solid; touch-action: none;z-index: 1;";
            newcanvas.style.top = top_key;
            newcanvas.style.left = left_key;
            newcanvas.id = canvassids[i][0];
            newcanvas.height = h;
            newcanvas.width = w;
            newcanvas.className = "othermembercanvases";
            newcanvas.style.transform = scaleKey;
            canvasParentNode.insertBefore(newcanvas, canvas);
          }
        }
      // 5.取得過去自己的畫布資訊
      if (selfLayerPivot!=true){
        if(data["sid"]==self_sid){
          let selfLayerResponse=await fetch("api/layers",{
            method:"POST"
          });
          let selfLayerResult=await selfLayerResponse.json();
          init_layer_database(selfLayerResult);
        }
        selfLayerPivot=true;
      }
      updateCanvas();
    }
    const ws_createRoomCanvasDatabase= async (data)=>{
      let response=await fetch("api/layers",{
        method:"POST"
      });
      let result=await response.json();
      init_layer_database(result);
    }
    const ws_updateImg=(data)=>{
      // var img=document.getElementById("update_img");
      // img.src=data["updateimg"];
      let img = new Image();
      img.src = data["imgdata"];
      img.onload = function () {
        ctx_others = document.getElementById(data["sid"]).getContext("2d");
        ctx_others.clearRect(0, 0, w, h);
        ctx_others.drawImage(img, 0, 0);
        document.getElementById(data["sid"]).style.transform = scaleKey;
      };
      // canvas.getContext("2d").drawImage(img, 0, 0);
    };
    const ws_removeLeaveCanvas=async (data)=>{
      let leave_sid = data["sid"];
      console.log("leave_sid :" + leave_sid);
      console.log("self_sid :" + self_sid);
      document.getElementById(leave_sid).remove();
      let canvasParentNode = document.getElementById("painting-area");
      let leave_user_id = data["user_id"];
      const leave_user_thumbnail = document.getElementById(leave_user_id);
      if (leave_user_thumbnail) {
        leave_user_thumbnail.remove();
      }
      let newThumbnailCanvas = document.createElement("canvas");
      newThumbnailCanvas.style =
        "position:absolute;border:0px solid; touch-action: none;z-index: 1;";
      newThumbnailCanvas.style.top = top_key;
      newThumbnailCanvas.style.left = left_key;
      newThumbnailCanvas.id = leave_user_id;
      newThumbnailCanvas.height = h;
      newThumbnailCanvas.width = w;
      newThumbnailCanvas.className = "thumbnailcanvases";
      newThumbnailCanvas.style.transform = scaleKey;
      canvasParentNode.insertBefore(newThumbnailCanvas, canvas);
      const thumbnailResponse=await fetch("/thumbnail/room/"+roomsid+"/"+leave_user_id,{
        method:"GET"
      });
      const blob = await thumbnailResponse.blob();
      let img = new Image();
          const imgURL = URL.createObjectURL(blob);
          img.src = imgURL;
          img.onload = function () {
              let newThumbnailCtx=newThumbnailCanvas.getContext("2d");
              newThumbnailCtx.globalCompositeOperation = "source-over";
              newThumbnailCtx.drawImage(img, 0, 0);
          }
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

    // send self mouse_postition to ws server per second
    const ws_sendCursorPos =() => {
      let current=Date.now();
      if(current-lastSendCursorPos>=CURSORUPDATERATE){
        if (socket.readyState === WebSocket.OPEN) {
          const ws_packet={"event":"update_cursor_pos","sid":self_sid,"cursorPos":[(currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset,(currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset]}
          socket.send(JSON.stringify(ws_packet));
          lastSendCursorPos=current;
        }
      }
    };
    return {socket,ws_sendCursorPos}
}

function bye() {
  let ws_packet={"event":"leave_room","sid":self_sid};
  socket.send(JSON.stringify(ws_packet));
}

function reconnect(){
  if (socket) {
    socket.close(); // 關閉舊的WebSocket連接
  }
  const connectionInfo = connectWebSocket();
  socket = connectionInfo.socket;
  ws_sendCursorPos = connectionInfo.ws_sendCursorPos;
}

function sendMessage() {
  let message = document.getElementById("message").value;
  let ws_packet={"event":"send_message","message":message,"sid":self_sid};
  socket.send(JSON.stringify(ws_packet));
  document.getElementById("message").value = "";
}


  
let {socket,ws_sendCursorPos}=connectWebSocket();
