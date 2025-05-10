from fastapi import UploadFile
from sqlmodel import Field, Session, SQLModel,select,insert,update
import datetime
from passlib.hash import pbkdf2_sha256
from typing import Optional
from . import engine,UserData,ImageTagData,client,BUCKET_NAME
import os,uuid,time,math,json


per_page=6
class ImageData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    description: str= Field()
    src: str = None
    title: str= None
    create_time: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    creator_id: str = Field(default=None, foreign_key="userdata.id",ondelete="CASCADE")
    is_display:bool= Field(default=True)

    @classmethod
    def create_image(self,image:UploadFile,description,title,creator,tagsList):
        tags = json.loads(tagsList)
        filename="images/image-"+str(int(time.time()*math.pow(10,6)))+"."+str.split(image.filename,".")[1]+"/"
        try:
            contents=image.file.read()
            response = client.put_object(Body=contents,Bucket=BUCKET_NAME,Key=filename)
            user=UserData.query_name(creator)
            dt = datetime.datetime.now(datetime.timezone.utc)
            dt_sec = dt.isoformat(timespec='seconds') 
            dt_iso = dt_sec.replace("+00:00", "Z")
            img_id=uuid.uuid4()
            img=ImageData(id=img_id,creator_id=user.id,description=description,src=filename,title=title,create_time=dt_iso)
            with Session(engine) as session:
                session.add(img)
                session.commit()
            ImageTagData.create_imagetags(img_id,list(set(tags)))
            return {"message":"upload sucess!"}
        except:
            return {"message":"upload failed!"}
        finally:
            image.file.close()
    @classmethod
    def delete_image(self,imageid:str,username,page):
        try:
            user=UserData.query_name(username)
            with Session(engine) as session:
                result_img =session.exec(select(ImageData).where(ImageData.id == imageid)).one_or_none()
                if result_img.creator_id==user.id:
                    ImageTagData.delete_imagetags(imageid)
                    response = client.delete_object(Bucket=BUCKET_NAME,Key=result_img.src)
                    session.delete(result_img)
                    session.commit()
                    results=session.exec(select(ImageData,UserData.username).where(ImageData.creator_id == UserData.id).where(UserData.username == username).offset((page-1)*per_page).limit(per_page+1).order_by(ImageData.create_time.desc())).fetchall()
                    min_perpage=min(per_page,len(results))
                    images_dict=[]
                    for i,res in enumerate(results[0:min_perpage]):
                        images_dict.append({"id":res[0].id,"description":res[0].description,"src":res[0].src,"title":res[0].title,"create_time":res[0].create_time,"is_display":res[0].is_display,"tags":ImageTagData.query_tagAll(res[0].id)})
                    if per_page<len(results):
                        nextPage=page+1
                    else:
                        nextPage=None
            return {"nextPage":nextPage,"imageData":images_dict}
        except:
            return {"message":"delete failed!"}
    @classmethod
    def query_images(self,page):
        with Session(engine) as session:
            results=session.exec(select(ImageData,UserData.username,UserData.src_avatar).where(ImageData.creator_id == UserData.id).where(ImageData.is_display == True).offset((page-1)*per_page).limit(per_page+1).order_by(ImageData.create_time.desc())).fetchall()
            min_perpage=min(per_page,len(results))
            images_dict=[]
            for i,res in enumerate(results[0:min_perpage]):
                images_dict.append({"id":res[0].id,"src":res[0].src,"title":res[0].title,"create_time":res[0].create_time,"creator":res[1],"avatar":res[2],"tags":ImageTagData.query_tagAll(res[0].id)})
            if per_page<len(results):
                nextPage=page+1
            else:
                nextPage=None
            return {"nextPage":nextPage,"imageData":images_dict}
    @classmethod
    def query_portfolio_images(self,username,page):
        with Session(engine) as session:
            results=session.exec(select(ImageData,UserData.username).where(ImageData.creator_id == UserData.id).where(UserData.username == username).offset((page-1)*per_page).limit(per_page+1).order_by(ImageData.create_time.desc())).fetchall()
            min_perpage=min(per_page,len(results))
            images_dict=[]
            for i,res in enumerate(results[0:min_perpage]):
                images_dict.append({"id":res[0].id,"description":res[0].description,"src":res[0].src,"title":res[0].title,"create_time":res[0].create_time,"is_display":res[0].is_display,"tags":ImageTagData.query_tagAll(res[0].id)})
            if per_page<len(results):
                nextPage=page+1
            else:
                nextPage=None
            return {"nextPage":nextPage,"imageData":images_dict}
    @classmethod
    def toggle_display(self,imageid:str,username,page):
        try:
            with Session(engine) as session:
                results=session.exec(select(ImageData).where(ImageData.creator_id == UserData.id).where(UserData.username == username).where(ImageData.id == imageid)).one_or_none()
                if results:
                    session.exec(update(ImageData).where(ImageData.id == imageid).values(is_display=not results.is_display) )
                    session.commit()
                    results=session.exec(select(ImageData,UserData.username).where(ImageData.creator_id == UserData.id).where(UserData.username == username).offset((page-1)*per_page).limit(per_page+1).order_by(ImageData.create_time.desc())).fetchall()
                    min_perpage=min(per_page,len(results))
                    images_dict=[]
                    for i,res in enumerate(results[0:min_perpage]):
                        images_dict.append({"id":res[0].id,"description":res[0].description,"src":res[0].src,"title":res[0].title,"create_time":res[0].create_time,"is_display":res[0].is_display,"tags":ImageTagData.query_tagAll(res[0].id)})
                    if per_page<len(results):
                        nextPage=page+1
                    else:
                        nextPage=None
            return {"nextPage":nextPage,"imageData":images_dict}
        except:
            return {"message":"toggle failed!"}
    @classmethod
    def query_image(self,username,filename:str):
        with Session(engine) as session:
            results=session.exec(select(ImageData.is_display,UserData.username).where(ImageData.creator_id == UserData.id).where(ImageData.src == filename)).one_or_none()
            if results:
                is_display, username_from_db = results
                if is_display or username_from_db==username:
                    response = client.get_object(Bucket=BUCKET_NAME,Key=filename)
                    return response['Body'].read()

SQLModel.metadata.create_all(engine)
