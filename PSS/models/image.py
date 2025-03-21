from fastapi import UploadFile
from sqlmodel import Field, Session, SQLModel,select,insert
import datetime
from passlib.hash import pbkdf2_sha256
from typing import Optional
from . import engine,UserData,client,BUCKET_NAME
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
    def create_image(self,image:UploadFile,description,title,creator):
        filename="image-"+str(int(time.time()*math.pow(10,6)))+"."+str.split(image.filename,".")[1]
        try:
            contents=image.file.read()
            response = client.put_object(Body=contents,Bucket=BUCKET_NAME,Key=filename)
            user=UserData.query_name(creator)
            dt = datetime.datetime.now(datetime.timezone.utc)
            dt_sec = dt.isoformat(timespec='seconds') 
            dt_iso = dt_sec.replace("+00:00", "Z")
            img=ImageData(id=uuid.uuid4(),creator_id=user.id,description=description,src=filename,title=title,create_time=dt_iso)
            with Session(engine) as session:
                session.add(img)
                session.commit()
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
                result_img =session.exec(select(ImageData).where(ImageData.id == imageid)).one()
                if result_img.creator_id==user.id:
                    response = client.delete_object(Bucket=BUCKET_NAME,Key=result_img.src)
                    session.delete(result_img)
                    session.commit()
                    results=session.exec(select(ImageData,UserData.username).where(ImageData.creator_id == UserData.id).where(ImageData.is_display == True).offset((page-1)*per_page).limit(per_page+1).order_by(ImageData.create_time.desc())).fetchall()
                    min_perpage=min(per_page,len(results))
                    images_dict = [{"id":res[0].id,"description":res[0].description,"src":res[0].src,"title":res[0].title,"create_time":res[0].create_time,"creator":res[1]} for i,res in enumerate(results[0:min_perpage])]
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
            results=session.exec(select(ImageData,UserData.username).where(ImageData.creator_id == UserData.id).where(ImageData.is_display == True).offset((page-1)*per_page).limit(per_page+1).order_by(ImageData.create_time.desc())).fetchall()
            min_perpage=min(per_page,len(results))
            images_dict = [{"id":res[0].id,"description":res[0].description,"src":res[0].src,"title":res[0].title,"create_time":res[0].create_time,"creator":res[1]} for i,res in enumerate(results[0:min_perpage])]
            if per_page<len(results):
                nextPage=page+1
            else:
                nextPage=None
            return {"nextPage":nextPage,"imageData":images_dict}
    @classmethod
    def query_image(self,filename:str):
        response = client.get_object(Bucket=BUCKET_NAME,Key=filename)
        return response['Body'].read()


SQLModel.metadata.create_all(engine)
