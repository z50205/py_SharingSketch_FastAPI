from typing import Annotated

from fastapi import APIRouter,Request,Form,Depends,HTTPException,WebSocket,UploadFile
from fastapi.responses import HTMLResponse,RedirectResponse,JSONResponse,FileResponse,StreamingResponse

from functools import wraps
import os
from io import BytesIO
from models import RoomData,LayerData,UserData
from typing import Optional

from . import login_required

roomrouter = APIRouter()


@roomrouter.post("/api/room/thumbnail",response_class=HTMLResponse, tags=["resources"])
async def uploadLayer(request:Request):
    username = request.session.get('username')
    roomsid = request.session.get('roomsid')
    u=UserData.query_name(username)
    jsonRes=LayerData.create_room_self_thumbnail(roomsid,u.id)
    return JSONResponse(status_code=200,content=jsonRes)

@roomrouter.post("/api/layers",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["getDatabaselayers"])
async def getLayers(request:Request):
    username = request.session.get('username')
    roomsid = request.session.get('roomsid')
    u=UserData.query_name(username)
    jsonRes=LayerData.query_room_self_layers(roomsid,u.id)
    return JSONResponse(status_code=200,content=jsonRes)

@roomrouter.delete("/api/layers",response_class=HTMLResponse, tags=["resources"])
async def deleteLayers(request:Request):
    username = request.session.get('username')
    roomsid = request.session.get('roomsid')
    u=UserData.query_name(username)
    jsonRes=LayerData.delete_room_layers(roomsid,u.id)
    return JSONResponse(status_code=200,content=jsonRes)

@roomrouter.patch("/api/layer",response_class=HTMLResponse, tags=["resources"])
async def uploadLayer(request:Request,image=Form(...),layername:str=Form(...),opacity:float=Form(...),is_display:bool=Form(...),z_index:int=Form(...)):
    username = request.session.get('username')
    roomsid = request.session.get('roomsid')
    u=UserData.query_name(username)
    jsonRes=LayerData.create_layer(image,roomsid,layername,u.id,opacity,is_display,z_index)
    return JSONResponse(status_code=200,content=jsonRes)


@roomrouter.get("/api/layer/{layername}",response_class=HTMLResponse, tags=["resources"])
async def getLayer(request:Request,layername:str):
    username = request.session.get('username')
    roomsid = request.session.get('roomsid')
    u=UserData.query_name(username)
    file=LayerData.query_layer(roomsid,u.id,layername)
    if file:
        return StreamingResponse(BytesIO(file), media_type="image/webp")
    else:
        return JSONResponse(status_code=404,content={
            'status': 'error',
            'message': 'Not found'
            })


@roomrouter.get("/thumbnail/room/{room_id}/{creator_id}",response_class=HTMLResponse, tags=["resources"])
async def getLayer(request:Request,room_id:str,creator_id:str):
    file=LayerData.query_thumbnail(room_id,creator_id)
    if file:
        return StreamingResponse(BytesIO(file), media_type="image/webp")
    else:
        return JSONResponse(status_code=404,content={
            'status': 'error',
            'message': 'Not found'
            })