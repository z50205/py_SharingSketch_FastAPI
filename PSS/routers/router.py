from typing import Annotated

from fastapi import APIRouter,Request,Form,Depends,HTTPException,WebSocket,UploadFile
from fastapi.responses import HTMLResponse,RedirectResponse,JSONResponse,FileResponse,StreamingResponse
from starlette.templating import Jinja2Templates

from functools import wraps
import os
from io import BytesIO
from models import UserData,ImageData,TagData,RoomData,LayerData
from typing import Optional


from .wsrouter import ws_manager


templates_path=os.path.join("..",os.path.split(os.path.dirname(os.path.abspath(__file__)))[0],"templates")
template=Jinja2Templates(directory=templates_path)

router = APIRouter()

def login_required(request:Request):
    if "username" not in request.session:
        redirect_loc='/'
        raise HTTPException(status_code=401, detail="Authorization Failed.", headers={"Location": redirect_loc})

@router.get("/",response_class=HTMLResponse, tags=["index"])
async def index(request:Request,message:str=None):
    if message=="unauthorized":
        return template.TemplateResponse(request=request,name="index.html",context={"message":"Please log in to continue."})
    elif message=="signup":
        return template.TemplateResponse(request=request,name="index.html",context={"message":"Sign-up successful! You can now log in."})
    elif "username" in request.session:
        redirect_url=request.url_for('roomlist') 
        return RedirectResponse(redirect_url,status_code=303)
    else:
        return template.TemplateResponse(request=request,name="index.html")

@router.post("/",response_class=HTMLResponse, tags=["login"])
async def login(request:Request,username:str=Form(),password:str=Form()):
    if username=="" or password=="":
        return template.TemplateResponse(request=request,name="index.html",context={"message":"Please enter both your username and password."})
    u:UserData=UserData.query_name(username)
    if u==None:
        return template.TemplateResponse(request=request,name="index.html",context={"message":"Invalid username or password."})
    if u.check_pw(password):
        request.session["username"]=username
        redirect_url=request.url_for('roomlist') 
        return RedirectResponse(redirect_url,status_code=303)
    else:
        return template.TemplateResponse(request=request,name="index.html",context={"message":"Invalid username or password."})

@router.get("/logout",response_class=HTMLResponse, tags=["logout"])
async def logout(request:Request):
    if "username" in request.session:
        del request.session["username"]
    response=RedirectResponse(request.headers.get('referer'),status_code=303)
    response.delete_cookie("src")
    return response

@router.get("/chooseroom",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["roomlist"])
async def roomlist(request:Request):
    username=request.session["username"]
    u=UserData.query_name(username)
    rooms_id=LayerData.query_user_rooms(u.id)
    self_rooms_id=RoomData.query_rooms(u.id)
    avatar=None
    if u.src_avatar:
        avatar="/image/"+u.src_avatar
    live_roominfo_dict=[]
    former_roominfo_dict=[]
    self_roominfo_dict=[]
    for room_id in ws_manager.rooms:
        room=RoomData.query_room(room_id)
        if room.is_display:
            live_roominfo_dict.append({"roomname":room.roomname,"id":room.id,"members":len(ws_manager.rooms[room_id]["member"]),"thumbnail":ws_manager.rooms[room_id]["thumbnail"]})
    live_ids = {live["id"] for live in live_roominfo_dict}
    for room_id in rooms_id:
        room=RoomData.query_room(room_id)
        if room.id not in live_ids and room.is_display:
            participants=LayerData.query_room_participants(room.id)
            former_roominfo_dict.append({"roomname":room.roomname,"id":room.id,"participants":participants})
    for self_room_id in self_rooms_id:
        room=RoomData.query_room(self_room_id)
        participants=LayerData.query_room_participants(room.id)
        self_roominfo_dict.append({"roomname":room.roomname,"id":room.id,"participants":participants,"is_display":room.is_display})
    return template.TemplateResponse(request=request,name="room_choose.html",context={"src":request.cookies.get('src'),"roominfolive":live_roominfo_dict,"roominfo":former_roominfo_dict,"self_roominfo":self_roominfo_dict,"user":u,"avatar":avatar})

@router.post("/chooseroom",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["chooseroom"])
async def chooseroom(request:Request,roomsid:str=Form(...)):
    room=RoomData.query_room(roomsid)
    if room:
        request.session["roomsid"]=roomsid
        redirect_url=request.url_for('room')
        return RedirectResponse(redirect_url,status_code=303)
    else:
        return JSONResponse(status_code=401,content={'status': 'error','message': 'Room Not Found.'})
    
@router.post("/createroom",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["chooseroom"])
async def createroom(request:Request,roomname:str=Form(...)):
    username = request.session.get('username')
    u=UserData.query_name(username)
    roomsid=RoomData.create_room(roomname,u.id)
    request.session["roomsid"]=roomsid
    redirect_url=request.url_for('room')
    return RedirectResponse(redirect_url,status_code=303)

@router.get("/room",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["room"])
async def room(request:Request):
    username = request.session.get('username')
    roomsid = request.session.get('roomsid')
    u=UserData.query_name(username)
    room=RoomData.query_room(roomsid)
    if not roomsid:
        return RedirectResponse(request.headers.get('referer'),status_code=303)
    if (u and room.is_display) or (u.id==room.creator_id and not room.is_display):
        return template.TemplateResponse(request=request,name="room.html",context={"roomname":room.roomname,"roomsid":roomsid,"username":username,"usersid":u.id,'avatar':u.src_avatar})
    else:
        return JSONResponse(status_code=401,content={
            'status': 'error',
            'message': 'Not authenticated'
        })

@router.get("/export",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["export"])
async def export(request:Request):
    return template.TemplateResponse(request=request,name="gallery_export.html",context={"username":request.session["username"]})

@router.get("/membership",response_class=HTMLResponse, tags=["membership"])
async def membership(request:Request):
    username = request.session.get('username')
    u=UserData.query_name(username)
    if u:
        return JSONResponse(status_code=200,content={
            'status': 'success',
            'username': u.username,
            'aboutme': u.about_me,
            'avatar':u.src_avatar,
        })
    else:
        return JSONResponse(status_code=401,content={
            'status': 'error',
            'message': 'Not authenticated'
        })

@router.get("/error",response_class=HTMLResponse, tags=["error"])
async def error(request:Request,message:str):
    if message=="404":
        showMessage="頁面未找到"
    elif message=="405":
        showMessage="未開放此功能"
    return template.TemplateResponse(request=request,name="error.html",context={ "message":showMessage})

@router.get("/register",response_class=HTMLResponse, tags=["register_page"])
async def getRegister(request:Request):
    return template.TemplateResponse(request=request,name="register.html")


@router.post("/register",response_class=HTMLResponse, tags=["register"])
async def register(request:Request,username:str=Form(...),password:str=Form(...)):
    if username=="" or password=="":
        return template.TemplateResponse(request=request,name="register.html",context={"message":"註冊帳號或密碼未輸入，請重新輸入"})
    u=UserData.query_name(username)
    if u==None:
        u=UserData.create_account(username=username,password=password)
        redirect_url=request.url_for('index').include_query_params(message="signup") 
        return RedirectResponse(redirect_url,status_code=302)
    else:
        return template.TemplateResponse(request=request,name="register.html",context={"message":"帳號已使用過"})

@router.post("/api/upload",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["uploadimage"])
async def uploadImage(request:Request,image=Form(...),description:str=Form(...),title:str=Form(...),creator:str=Form(...),tagsList:str=Form(...)):
    jsonRes=ImageData.create_image(image,description,title,creator,tagsList)
    return JSONResponse(status_code=200,content=jsonRes)

@router.delete("/api/image/{id}",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["deleteimage"])
async def deleteImage(request:Request,id:str,page:int):
    jsonRes=ImageData.delete_image(id,request.session['username'],page)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/resources",response_class=HTMLResponse, tags=["resources"])
async def getGalleryImages(request:Request,page:int):
    jsonRes=ImageData.query_images(page)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/portfolio/resources",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["resources"])
async def getUserImages(request:Request,page:int):
    username = request.session.get('username')
    jsonRes=ImageData.query_portfolio_images(username,page)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/user/{username}",response_class=HTMLResponse, tags=["resources"])
async def getUserImages(request:Request,page:int,username:str):
    jsonRes=ImageData.query_user_images(username,page)
    return JSONResponse(status_code=200,content=jsonRes)

@router.patch("/api/image/{id}/display",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["patch_image_display"])
async def patchImageDisplay(request:Request,id:str,page:int):
    jsonRes=ImageData.toggle_display(id,request.session['username'],page)
    return JSONResponse(status_code=200,content=jsonRes)

@router.patch("/api/user/profile",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["patch_user_aboutme"])
async def patchUserAboutme(request: Request, about_me: Optional[str] = Form(None), avatar= Form(None)):
    username = request.session.get('username')
    jsonRes=UserData.upload_profile(username,about_me,avatar)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/tag/prefix",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["patch_user_aboutme"])
async def patchUserAboutme(request: Request, tag_prefix:str):
    jsonRes=TagData.query_prefix(tag_prefix)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/room/thumbnail/{roomname}",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["get_room_avatar"])
async def getRoomThumbnail(request: Request,roomname:str):
    jsonRes={"roomThumbnailImg":ws_manager.rooms[roomname]["thumbnail"]}
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/image/avatars/{src}",response_class=HTMLResponse, tags=["resources"])
async def getImages(request:Request,src:str):
    file=UserData.query_avatar("avatars/"+src)
    if file:
        return StreamingResponse(BytesIO(file), media_type="image/png")
    else:
        return JSONResponse(status_code=404,content={
            'status': 'error',
            'message': 'Not found'
            })

@router.get("/image/{src:path}",response_class=HTMLResponse, tags=["resources"])
async def getImages(request:Request,src:str):
    username = request.session.get('username')
    file=ImageData.query_image(username,src)
    if file:
        return StreamingResponse(BytesIO(file), media_type="image/png")
    else:
        return JSONResponse(status_code=404,content={
            'status': 'error',
            'message': 'Not found'
            })

@router.patch("/api/room/{id}/display",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["patch_room_display"])
async def patchRoomDisplay(request:Request,id:str):
    username = request.session.get('username')
    u=UserData.query_name(username)
    jsonRes=RoomData.toggle_room_display(id,u.id)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/room/{id}/display",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["patch_room_display"])
async def patchRoomDisplay(request:Request,id:str):
    username = request.session.get('username')
    u=UserData.query_name(username)
    jsonRes=RoomData.query_room_display(id,u.id)
    return JSONResponse(status_code=200,content=jsonRes)

@router.delete("/api/room/{id}",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["delete_room"])
async def deleteRoom(request:Request,id:str):
    username = request.session.get('username')
    u=UserData.query_name(username)
    jsonRes=LayerData.delete_room_layers(id,u.id)
    if jsonRes["status"]:
        jsonRes=RoomData.delete_room(id,u.id)
    return JSONResponse(status_code=200,content=jsonRes)