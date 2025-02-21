from fastapi import APIRouter,Request,Form,Depends,HTTPException,WebSocket,WebSocketDisconnect
import uuid

class ConnectionManager:
    def __init__(self):
        # active_connections dict k:v="sid":[roomname,username,websocket instance]
        self.active_connections: dict[str,list[str,str,WebSocket]] = {}
        self.rooms: dict[str,list[str]] = {}

# connect to server ,have to set params in join API. 
    async def connect(self, websocket: WebSocket):
        await websocket.accept()

    async def disconnect(self, websocket: WebSocket):
        for k,v in self.active_connections.items():
            if v[2]==websocket:
                sid=k
                break
        leave_roomname=self.active_connections[sid][0]
        self.rooms[leave_roomname].remove(sid)
        room_memberlist=[]
        room_canvassids=[]
        for membersid in self.rooms[leave_roomname]:
            room_memberlist.append(self.active_connections[membersid][1])
            room_canvassids.append(membersid)
        await ws_manager.event_send_filter(websocket,{"event":"updateMemberList","memberlist":room_memberlist,"sid":sid},leave_roomname)
        await ws_manager.event_send_filter(websocket,{"event":"removeLeaveCanvas","sid":sid},leave_roomname)
        await ws_manager.event_send_filter(websocket,{"event":"removeRoomCanvas","sid":sid})
        if not self.rooms[leave_roomname]:
            del self.rooms[leave_roomname]
        del self.active_connections[sid]


    async def send_personal_message(self, websocket: WebSocket,data: dict[str:str]):
        await websocket.send_json(data)

    async def broadcast(self, ws_data: dict[str:str],to:str,include_self:bool=None):
        for membersid in self.rooms[to]:
            if membersid != ws_data["sid"] or include_self:
                await self.active_connections[membersid][2].send_json(ws_data)
    
    async def event_receive_filter(self, websocket: WebSocket):
        ws_data=await websocket.receive_json()
        event=ws_data["event"]
        if event=="user_join":
            await ws_manager.join(websocket,ws_data)
            print("in user_join:"+str(ws_data["username"])+str(ws_data["roomname"]))
        elif event=="new_img":
            await ws_manager.newImg(websocket,ws_data)
            print("in new_img:"+str(ws_data["roomname"]))
        elif event=="leave_room":
            await ws_manager.disconnect(websocket)
            print("in leave_room:")
        elif event=="send_message":
            await ws_manager.sendMessage(websocket,ws_data)
            print("in leave_room:")

    # assign sid and join to specific room. 
    async def join(self, websocket: WebSocket,ws_data:dict[str:str]):
        sid=str(uuid.uuid4())
        roomname=ws_data["roomname"]
        username=ws_data["username"]
        self.active_connections[sid]=[roomname,username,websocket]
        if roomname not in self.rooms.keys():
            self.rooms[roomname]=[sid]
        else:
            self.rooms[roomname].append(sid)
        room_memberlist=[]
        room_canvassids=[]
        for membersid in self.rooms[roomname]:
                room_memberlist.append(self.active_connections[membersid][1])
                room_canvassids.append(membersid)
        await ws_manager.event_send_filter(websocket,{"event":"join","sid":sid})
        await ws_manager.event_send_filter(websocket,{"event":"updateMemberList","memberlist":room_memberlist,"sid":sid},roomname)
        await ws_manager.event_send_filter(websocket,{"event":"createRoomCanvas","canvassids":room_canvassids,"sid":sid},roomname)

    async def newImg(self, websocket: WebSocket,ws_data:dict[str:str]):
        img=ws_data['imgdata']
        roomname=ws_data['roomname']
        start_at=ws_data['start_at']
        request_sid=ws_data['sid']
        await ws_manager.event_send_filter(websocket,{"event":"updateImg","imgdata":img,"sid":request_sid,"start_at": start_at},roomname)
    
    async def sendMessage(self, websocket: WebSocket,ws_data:dict[str:str]):
        start_at=ws_data['start_at']
        request_sid=ws_data['sid']
        roomname=self.active_connections[request_sid][0]
        username=self.active_connections[request_sid][1]
        await ws_manager.event_send_filter(websocket,{"event":"sendMessage","message":ws_data['message'],"username":username,"sid":request_sid,"start_at": start_at},roomname)

    async def event_send_filter(self, websocket,ws_data,to:str=None):
        event=ws_data["event"]
        if event=="join":
            await ws_manager.send_personal_message(websocket,ws_data)
        elif event=="updateMemberList":
            await ws_manager.broadcast(ws_data,to,True)
        elif event=="createRoomCanvas":
            await ws_manager.broadcast(ws_data,to,True)
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
            await ws_manager.event_receive_filter(websocket)
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)


        
