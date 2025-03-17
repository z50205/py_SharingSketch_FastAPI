from fastapi import FastAPI,Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from routers import router,wsrouter
from starlette.middleware.sessions import SessionMiddleware
import os

load_dotenv()
SECRET_KEY=os.environ.get("SECRET_KEY")

app=FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(router)
app.include_router(wsrouter)
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)


@app.exception_handler(401)
async def unauthorized_401(request:Request, exc: Exception):
    redirect_url=request.url_for('index').include_query_params(message="unauthorized") 
    return RedirectResponse(redirect_url,status_code=302)
    
