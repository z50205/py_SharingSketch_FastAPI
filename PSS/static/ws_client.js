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
      let othercanvasessetting = document.getElementsByClassName("othermembercanvases");
      while (othercanvasessetting.length > 0) {othercanvasessetting[0].remove();}
      let othermembers = document.getElementsByClassName("othermember-online-item");
      while (othermembers.length > 0) {othermembers[0].remove();}

      let thumbnailcanvasessetting = document.getElementsByClassName("thumbnailcanvases");
      while (thumbnailcanvasessetting.length > 0) {thumbnailcanvasessetting[0].remove();}
      let thumbnailmembers = document.getElementsByClassName("thumbnailmember-online-item");
      while (thumbnailmembers.length > 0) {thumbnailmembers[0].remove();}

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
    const ws_createRoomCanvas= async (data)=>{
      let canvassids = data["canvassids"];
      let canvasParentNode = document.getElementById("painting-area");
      // 1.取得此房間所有參與者
      let response=await fetch("/api/room/"+roomsid+"/participants",{
        method:"GET"
      });
      let participants=await response.json();
      // 2.分離在線及離線使用者
      const onlineCanvasIds = canvassids.map(item =>({ id: item[1], username: item[2],wsSid:item[0]}));
      const onlineUserIdSet = new Set(onlineCanvasIds.map(item => item.id));

      const offlineParticipants = participants.filter(p => !onlineUserIdSet.has(p.id));
      // 3.初始MemberList
      let ul = document.getElementById("members-list");
      // 3.製作離線使用者thumbnail的canvas
      for(let i =0;i<offlineParticipants.length;i++){
        if (!document.getElementById(offlineParticipants[i].id)){
            let newThumbnailCanvas = document.createElement("canvas");
            newThumbnailCanvas.style =
              "position:absolute;border:0px solid; touch-action: none;z-index: 1;";
            newThumbnailCanvas.style.top = top_key;
            newThumbnailCanvas.style.left = left_key;
            newThumbnailCanvas.id = offlineParticipants[i].id;
            newThumbnailCanvas.height = h;
            newThumbnailCanvas.width = w;
            newThumbnailCanvas.className = "thumbnailcanvases";
            newThumbnailCanvas.style.transform = scaleKey;
            canvasParentNode.insertBefore(newThumbnailCanvas, canvas);
            const thumbnailResponse=await fetch("/thumbnail/room/"+roomsid+"/"+offlineParticipants[i].id,{
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
            let li = document.createElement("li");
            li.id=`memberlist-${offlineParticipants[i].id}`;
            li.style.display="flex";
            li.classList.add("thumbnailmember-online-item");
            let offlineIcon = document.createElement("div");
            offlineIcon.classList.add("memberlist-onlineicon");
            offlineIcon.classList.add("offline");
            let offlineDisplayIcon = document.createElement("img");
            offlineDisplayIcon.src="static/icons/eye.svg";
            bindShowSpecMemberCanvas(offlineParticipants[i].id,offlineDisplayIcon);
            let offlineUserName = document.createElement("div");
            offlineUserName.textContent=`User:${offlineParticipants[i].username}`;
            offlineUserName.classList.add("memberlist-username");
            li.appendChild(offlineIcon);
            li.appendChild(offlineDisplayIcon);
            li.appendChild(offlineUserName);
            ul.appendChild(li);
          }
        }
      // 3.移除已上線使用者的thumbnail canvas
      for(let i =0;i<onlineCanvasIds.length;i++){
        let removeThumbnailCanvas=document.getElementById(onlineCanvasIds[i].id)
        if (removeThumbnailCanvas){removeThumbnailCanvas.remove();}
        const leave_user_memberlist_item = document.getElementById(`memberlist-${onlineCanvasIds[i].id}`);
          if (leave_user_memberlist_item) {
            leave_user_memberlist_item.remove();
        }
      }

      // 4.製作上線使用者的canvas以供同步
        let allcanvases = document.getElementsByTagName("canvas");
        let allcanvaseslength = allcanvases.length;
        for (i = 0; i < onlineCanvasIds.length; i++) {
          if(!document.getElementById(onlineCanvasIds[i].wsSid)&&self_sid!=onlineCanvasIds[i].wsSid){
            var newcanvas = document.createElement("canvas");
            newcanvas.style =
              "position:absolute;border:0px solid; touch-action: none;z-index: 1;";
            newcanvas.style.top = top_key;
            newcanvas.style.left = left_key;
            newcanvas.id = onlineCanvasIds[i].wsSid;
            newcanvas.height = h;
            newcanvas.width = w;
            newcanvas.className = "othermembercanvases";
            newcanvas.style.transform = scaleKey;
            canvasParentNode.insertBefore(newcanvas, canvas);
            let li = document.createElement("li");
            li.id=`memberlist-${onlineCanvasIds[i].wsSid}`;
            li.style.display="flex";
            li.classList.add("othermember-online-item");
            let onlineIcon = document.createElement("div");
            onlineIcon.classList.add("memberlist-onlineicon");
            let onlineDisplayIcon = document.createElement("img");
            onlineDisplayIcon.src="static/icons/eye.svg";
            bindShowSpecMemberCanvas(onlineCanvasIds[i].wsSid,onlineDisplayIcon);
            let onlineUserName = document.createElement("div");
            onlineUserName.textContent=`User:${onlineCanvasIds[i].username}`;
            onlineUserName.classList.add("memberlist-username");
            li.appendChild(onlineIcon);
            li.appendChild(onlineDisplayIcon);
            li.appendChild(onlineUserName);
            ul.appendChild(li);
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
          let li = document.createElement("li");
          li.style.display="flex";
          let selfOnlineIcon = document.createElement("div");
          selfOnlineIcon.classList.add("memberlist-onlineicon");
          selfOnlineIcon.id="self-online-icon";
          let selfOnlineDisplayIcon = document.createElement("img");
          selfOnlineDisplayIcon.src="static/icons/eye.svg";
          selfOnlineDisplayIcon.style.opacity=0;
          let selfOnlineUserName = document.createElement("div");
          selfOnlineUserName.textContent=`You:${username}`;
          selfOnlineUserName.classList.add("memberlist-username");
          li.appendChild(selfOnlineIcon);
          li.appendChild(selfOnlineDisplayIcon);
          li.appendChild(selfOnlineUserName);
          ul.insertBefore(li, ul.firstChild);
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
      let leave_user_name = data["user_name"];
      const leave_user_thumbnail = document.getElementById(leave_user_id);
      if (leave_user_thumbnail) {
        leave_user_thumbnail.remove();
      }
      const leave_user_memberlist_item = document.getElementById(`memberlist-${leave_sid}`);
      if (leave_user_memberlist_item) {
        leave_user_memberlist_item.remove();
      }
      if (leave_user_id==usersid){
        return;
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
      let ul = document.getElementById("members-list");
      let li = document.createElement("li");
      li.id=`memberlist-${leave_user_id}`;
      li.style.display="flex";
      li.classList.add("thumbnailmember-online-item");
      let offlineIcon = document.createElement("div");
      offlineIcon.classList.add("memberlist-onlineicon");
      offlineIcon.classList.add("offline");
      let offlineDisplayIcon = document.createElement("img");
      offlineDisplayIcon.src="static/icons/eye.svg";
      bindShowSpecMemberCanvas(leave_user_id,offlineDisplayIcon);
      let offlineUserName = document.createElement("div");
      offlineUserName.textContent=`User:${leave_user_name}`;
      offlineUserName.classList.add("memberlist-username");
      li.appendChild(offlineIcon);
      li.appendChild(offlineDisplayIcon);
      li.appendChild(offlineUserName);
      ul.appendChild(li);
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
      room_messages[data["sid"]]={"message":data["message"],"updateTime":Date.now()};
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
