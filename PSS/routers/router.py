from typing import Annotated

from fastapi import APIRouter,Request,Form,Depends,HTTPException,WebSocket,UploadFile
from fastapi.responses import HTMLResponse,RedirectResponse,JSONResponse,FileResponse,StreamingResponse
from starlette.templating import Jinja2Templates

from functools import wraps
import os
from io import BytesIO
from models import UserData,ImageData,TagData
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
        return template.TemplateResponse(request=request,name="index.html",context={"message":"請先登入"})
    elif message=="signup":
        return template.TemplateResponse(request=request,name="index.html",context={"message":"帳號已註冊完成，請登入"})
    elif "username" in request.session:
        redirect_url=request.url_for('roomlist') 
        return RedirectResponse(redirect_url,status_code=303)
    else:
        return template.TemplateResponse(request=request,name="index.html")

@router.post("/",response_class=HTMLResponse, tags=["login"])
async def login(request:Request,username:str=Form(),password:str=Form()):
    if username=="" or password=="":
        return template.TemplateResponse(request=request,name="index.html",context={"message":"帳號或密碼未輸入，請重新輸入"})
    u:UserData=UserData.query_name(username)
    if u==None:
        return template.TemplateResponse(request=request,name="index.html",context={"message":"此帳號名尚未註冊"})
    if u.check_pw(password):
        request.session["username"]=username
        redirect_url=request.url_for('roomlist') 
        return RedirectResponse(redirect_url,status_code=303)
    else:
        return template.TemplateResponse(request=request,name="index.html",context={"message":"帳號或密碼錯誤"})

@router.get("/logout",response_class=HTMLResponse, tags=["logout"])
async def logout(request:Request):
    if "username" in request.session:
        del request.session["username"]
    return RedirectResponse(request.headers.get('referer'),status_code=303)

@router.get("/chooseroom",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["roomlist"])
async def roomlist(request:Request):
    roominfo=get_roomInfo()
    return template.TemplateResponse(request=request,name="room_choose.html",context={"src":request.cookies.get('src'),"roominfo":roominfo, "username":request.session["username"]})

@router.post("/chooseroom",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["chooseroom"])
async def chooseroom(request:Request,roomname:str=Form()):
    request.session["roomname"]=roomname
    redirect_url=request.url_for('room') 
    if request.session["roomname"]:
        return RedirectResponse(redirect_url,status_code=303)
    else:
        roominfo=get_roomInfo()
        template.TemplateResponse(request=request,name="room_choose.html",context={"src":request.cookies.get('src'),"roominfo":roominfo, "username":request.session["username"]})

@router.get("/room",response_class=HTMLResponse,dependencies=[Depends(login_required)], tags=["room"])
async def room(request:Request):
    username = request.session.get('username')
    roomname = request.session.get('roomname')
    u=UserData.query_name(username)
    if not roomname:
        return RedirectResponse(request.headers.get('referer'),status_code=303)
    if u:
        return template.TemplateResponse(request=request,name="room.html",context={"roomname":roomname, "username":username,'avatar':u.src_avatar})
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

@router.post("/api/upload",response_class=HTMLResponse, tags=["uploadimage"])
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

@router.patch("/api/image/{id}/display",response_class=HTMLResponse, tags=["patch_image_display"])
async def patchImageDisplay(request:Request,id:str,page:int):
    jsonRes=ImageData.toggle_display(id,request.session['username'],page)
    return JSONResponse(status_code=200,content=jsonRes)

@router.patch("/api/user/profile",response_class=HTMLResponse, tags=["patch_user_aboutme"])
async def patchUserAboutme(request: Request, about_me: Optional[str] = Form(None), avatar= Form(None)):
    username = request.session.get('username')
    jsonRes=UserData.upload_profile(username,about_me,avatar)
    return JSONResponse(status_code=200,content=jsonRes)

@router.get("/api/tag/prefix",response_class=HTMLResponse, tags=["patch_user_aboutme"])
async def patchUserAboutme(request: Request, tag_prefix:str):
    jsonRes=TagData.query_prefix(tag_prefix)
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

def get_roomInfo():
    ws_manager.active_connections
    ws_manager.rooms
    room_dict={}
    for k,v in ws_manager.rooms.items():
        room_dict[k]=[]
        for member in v:
            room_dict[k].append(ws_manager.active_connections[member][1])

    return room_dict