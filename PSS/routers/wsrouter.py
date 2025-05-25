from fastapi import APIRouter,Request,Form,Depends,HTTPException,WebSocket,WebSocketDisconnect
import uuid,asyncio
from models import RoomData,UserData

class ConnectionManager:
    def __init__(self):
        # active_connections dict k:v="sid":[roomsid,username,websocket instance,user_id]
        self.active_connections: dict[str,list[str,str,WebSocket,str]] = {}
        # rooms dict k:v="roomsid":[roomname,[member],room img thumbnail]
        self.rooms: dict[str,str,list[str],str] = {}

# connect to server ,have to set params in join API. 
    async def connect(self, websocket: WebSocket):
        await websocket.accept()

    async def disconnect(self, websocket: WebSocket):
        for k,v in self.active_connections.items():
            if v[2]==websocket:
                sid=k
                break
        leave_roomsid=self.active_connections[sid][0]
        self.rooms[leave_roomsid]["member"].remove(sid)
        room_memberlist=[]
        room_canvassids=[]
        for membersid in self.rooms[leave_roomsid]["member"]:
            room_memberlist.append(self.active_connections[membersid][1])
            room_canvassids.append(membersid)
        await ws_manager.event_send_filter(websocket,{"event":"updateMemberList","memberlist":room_memberlist,"sid":sid},leave_roomsid)
        await ws_manager.event_send_filter(websocket,{"event":"removeLeaveCanvas","user_id":self.active_connections[sid][3],"sid":sid},leave_roomsid)
        if not self.rooms[leave_roomsid]["member"]:
            del self.rooms[leave_roomsid]
        del self.active_connections[sid]
        await ws_manager.event_send_filter(websocket,{"event":"removeRoomCanvas","sid":sid})


    async def send_personal_message(self, websocket: WebSocket,data: dict[str:str]):
        await websocket.send_json(data)

    async def broadcast(self, ws_data: dict[str:str],to:str,include_self:bool=None):
        for membersid in self.rooms[to]["member"]:
            if membersid != ws_data["sid"] or include_self:
                await self.active_connections[membersid][2].send_json(ws_data)
    
    async def event_receive_filter(self, websocket: WebSocket,ws_data):
        event=ws_data["event"]
        if event=="user_join":
            await ws_manager.join(websocket,ws_data)
            print("in user_join:"+str(ws_data["username"])+str(ws_data["roomsid"]))
        elif event=="update_cursor_pos":
            await ws_manager.updateCursorPos(websocket,ws_data)
        elif event=="new_img":
            await ws_manager.newImg(websocket,ws_data)
            print("in new_img:"+str(ws_data["roomsid"]))        
        elif event=="leave_room":
            await ws_manager.disconnect(websocket)
            print("in leave_room:")
        elif event=="send_message":
            await ws_manager.sendMessage(websocket,ws_data)
            print("in leave_room:")
        elif event=="update_room_img":
            await ws_manager.updateRoomImage(websocket,ws_data)
            print("in update_room_img:")

    # assign sid and join to specific room. 
    async def join(self, websocket: WebSocket,ws_data:dict[str:str]):
        sid=str(uuid.uuid4())
        roomsid=ws_data["roomsid"]
        username=ws_data["username"]
        u=UserData.query_name(username)
        self.active_connections[sid]=[roomsid,username,websocket,u.id]
        # 改成把可見的canvas都繪在layer裡面，因此在「createRoomCanvasDatabase」中先渲染出房間中未在線的用戶thumbnail，再來是已在線的用戶，最後是database的圖層紀錄
        # 用戶進入時將thumbnail刪除，並製作已在線用戶畫布，然後同步；用戶離開刪除在線用戶畫布並重新製作用戶thumbnail

        # 1.因此當用戶進入房間時{"event":"createRoomCanvas","canvassids":room_canvassids([{canvassid:userID}]),"sid":sid}(傳給房間所有人)
        # 2.新用戶1.判斷哪些要取thumbnail，利用roomID+userID->取得thumbnail，製作離線畫布2.利用canvassids製作在線用戶畫布3.製作自己圖層紀錄的畫布
        #   原用戶1.找出新加入用戶的離線畫布並刪除2.利用canvassids製作在線用戶畫布
        # Verify whether the room exists in the database
        # Case1: roomsid is live
        if roomsid in self.rooms.keys():
            self.rooms[roomsid]["member"].append(sid)
        else:
            room=RoomData.query_room(roomsid)
            self.rooms[roomsid] = {"roomname":room.roomname,"member": [sid]}
        room_memberlist=[]
        room_canvassids=[]
        for membersid in self.rooms[roomsid]["member"]:
            room_memberlist.append(self.active_connections[membersid][1])
            room_canvassids.append([membersid,self.active_connections[membersid][3]])
        await ws_manager.event_send_filter(websocket,{"event":"join","sid":sid})
        await ws_manager.event_send_filter(websocket,{"event":"updateMemberList","memberlist":room_memberlist,"sid":sid},roomsid)
        await ws_manager.event_send_filter(websocket,{"event":"createRoomCanvas","canvassids":room_canvassids,"sid":sid},roomsid)

        
    async def newImg(self, websocket: WebSocket,ws_data:dict[str:str]):
        img=ws_data['imgdata']
        roomsid=ws_data['roomsid']
        start_at=ws_data['start_at']
        request_sid=ws_data.get("sid","try")
        await ws_manager.event_send_filter(websocket,{"event":"updateImg","imgdata":img,"sid":request_sid,"start_at": start_at},roomsid)
    
    async def sendMessage(self, websocket: WebSocket,ws_data:dict[str:str]):
        request_sid=ws_data['sid']
        roomsid=self.active_connections[request_sid][0]
        username=self.active_connections[request_sid][1]
        await ws_manager.event_send_filter(websocket,{"event":"sendMessage","message":ws_data['message'],"username":username,"sid":request_sid},roomsid)

    async def updateRoomImage(self, websocket: WebSocket,ws_data:dict[str:str]):
        roomsid=ws_data['roomsid']
        img=ws_data['imgdata']
        ws_manager.rooms[roomsid]["thumbnail"]=img


    async def updateCursorPos(self, websocket: WebSocket,ws_data:dict[str:str]):
        request_sid=ws_data['sid']
        roomsid=self.active_connections[request_sid][0]
        username=self.active_connections[request_sid][1]
        await ws_manager.event_send_filter(websocket,{"event":"updateCursorPos","username":username,"cursor_pos":ws_data['cursorPos'],"sid":request_sid},roomsid)

    async def event_send_filter(self, websocket,ws_data,to:str=None):
        event=ws_data["event"]
        if event=="join":
            await ws_manager.send_personal_message(websocket,ws_data)
        elif event=="updateCursorPos":
            await ws_manager.broadcast(ws_data,to,False)
        elif event=="updateMemberList":
            await ws_manager.broadcast(ws_data,to,True)
        elif event=="createRoomCanvas":
            await ws_manager.broadcast(ws_data,to,True)
        elif event=="createRoomCanvasDatabase":
            await ws_manager.send_personal_message(websocket,ws_data)
        elif event=="updateImg":
            await ws_manager.broadcast(ws_data,to,False)
        elif event=="removeLeaveCanvas":
            await ws_manager.broadcast(ws_data,to,False)
        elif event=="removeRoomCanvas":
            await ws_manager.send_personal_message(websocket,ws_data)
        elif event=="sendMessage":
            await ws_manager.broadcast(ws_data,to,True)

wsrouter = APIRouter()
ws_manager=ConnectionManager()

@wsrouter.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            ws_data=await websocket.receive_json()
            asyncio.create_task(ws_manager.event_receive_filter(websocket,ws_data))
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)


        
