from sqlmodel import Field, Session, SQLModel,select,insert,update
from fastapi import UploadFile
import datetime
from passlib.hash import pbkdf2_sha256
from typing import Optional
from . import engine,client,BUCKET_NAME
import uuid

class UserData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    username: str= Field(unique=True)
    password_hash: str= Field()
    email: Optional[str] = None
    about_me: Optional[str] = None
    src_avatar:Optional[str] = None
    create_time: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    def set_pw(self,password):
        return pbkdf2_sha256.hash(password)
    def check_pw(self,password):
        return pbkdf2_sha256.verify(password, self.password_hash)
    
    @classmethod
    def query_name(self,username:str):
        with Session(engine) as session:
            statement = select(UserData).where(UserData.username == username)
            users = session.exec(statement)
            return users.first()
    @classmethod
    def create_account(self,username:str,password:str):
        dt = datetime.datetime.now(datetime.timezone.utc)
        dt_sec = dt.isoformat(timespec='seconds') 
        dt_iso = dt_sec.replace("+00:00", "Z")
        u=UserData(id=uuid.uuid4(),username=username,password_hash=self.set_pw(self,password),create_time=dt_iso)
        with Session(engine) as session:
            session.add(u)
            session.commit()
    @classmethod
    def upload_profile(self,username:str,about_me:str,avatar:UploadFile):
        try:
            update_info={}
            if avatar !='':
                if (avatar.content_type =="image/png" or avatar.content_type =="image/jpeg" or avatar.content_type =="image/jpg") and avatar.size<=2000000:
                    filename="avatars/avatar-"+username+"."+str.split(avatar.filename,".")[1]
                    contents=avatar.file.read()
                    response = client.put_object(Body=contents,Bucket=BUCKET_NAME,Key=filename)
                    update_info["src_avatar"]=filename
                    avatar.file.close()
            if about_me !='':
                update_info["about_me"]=about_me
            with Session(engine) as session:
                statement = update(UserData).where(UserData.username == username).values(update_info)
                result=session.exec(statement)
                session.commit()
                return {"message":"upload success!"}
        except:
            return {"message":"upload failed!"}
    @classmethod
    def query_avatar(self,src_avatar:str):
        response = client.get_object(Bucket=BUCKET_NAME,Key=src_avatar)
        return response['Body'].read()
        
    
SQLModel.metadata.create_all(engine)
