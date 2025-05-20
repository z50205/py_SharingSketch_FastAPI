from sqlmodel import Field, Session, SQLModel,select,insert,update
from fastapi import UploadFile
import datetime
from typing import Optional
from . import engine,client,BUCKET_NAME
import uuid

class LayerData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    room_id: str = Field(default=None, foreign_key="roomdata.id",ondelete="CASCADE")
    layername:str=Field(nullable=False)
    creator_id: str = Field(default=None, foreign_key="userdata.id",ondelete="CASCADE")
    create_time: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    opacity:float=Field(nullable=False)     
    is_display:bool= Field(default=True)    
    z_index:int=Field(nullable=False)                     

    @classmethod
    def query_layers(self,room_id:str,creator_id:str):
        with Session(engine) as session:
            statement = select(LayerData).where(LayerData.room_id == room_id).where(LayerData.creator_id == creator_id).order_by(LayerData.z_index.desc())
            results = session.exec(statement).fetchall()
            layers_dict=[]
            for layer in results:
                layers_dict.append({"id":layer.id,"layername":layer.layername,"opacity":layer.opacity,"is_display":layer.is_display})
            return layers_dict
        
    @classmethod
    def query_layer(self,room_id:str,creator_id:str,layername:str):
        try:
            filename="rooms/"+room_id+"/"+creator_id+"/"+layername
            response = client.get_object(Bucket=BUCKET_NAME,Key=filename)
            return response['Body'].read()
        except Exception as e:
            return {"message":"get layer failed!"}
        
    @classmethod
    def update_layer_image(self,image:UploadFile,id:str):
        with Session(engine) as session:
            layer =session.exec(select(LayerData).where(LayerData.id == id)).one_or_none()
            filename="rooms/"+layer.room_id+"/"+creator_id+"/"+layer.layername
            try:
                contents=image.file.read()
                response = client.put_object(Body=contents,Bucket=BUCKET_NAME,Key=filename)
                return {"message":"upload success!"}
            except:
                return {"message":"upload failed!"}

    @classmethod
    def create_layer(self,image:UploadFile,room_id:str,layername:str,creator_id:str,opacity:str,is_display:str,z_index:str):
        dt = datetime.datetime.now(datetime.timezone.utc)
        dt_sec = dt.isoformat(timespec='seconds')
        dt_iso = dt_sec.replace("+00:00", "Z")
        statement = select(LayerData).where(LayerData.room_id==room_id).where(LayerData.layername==layername).where(LayerData.creator_id == creator_id)
        try:
            with Session(engine) as session:
                exist_layer = session.exec(statement).one_or_none()
                if exist_layer:
                    new_layer=LayerData(id=str(uuid.uuid4()),room_id=room_id,layername=layername,creator_id=creator_id,create_time=dt_iso,opacity=opacity,is_display=is_display,z_index=z_index)
                    session.delete(exist_layer)
                    session.add(new_layer)
                    session.commit()
                    contents=image.file.read()
                    filename="rooms/"+exist_layer.room_id+"/"+creator_id+"/"+exist_layer.layername
                    response = client.put_object(Body=contents,Bucket=BUCKET_NAME,Key=filename)
                    return {"message":"upload success!"}
                else:
                    new_layer=LayerData(id=str(uuid.uuid4()),room_id=room_id,layername=layername,creator_id=creator_id,create_time=dt_iso,opacity=opacity,is_display=is_display,z_index=z_index)
                    session.add(new_layer)
                    session.commit()
                    contents=image.file.read()
                    filename="rooms/"+new_layer.room_id+"/"+creator_id+"/"+new_layer.layername
                    response = client.put_object(Body=contents,Bucket=BUCKET_NAME,Key=filename)
                    return {"message":"upload success!"}
        except Exception as e:
            return {"message":"upload failed!"}
            
    @classmethod
    def delete_layer(self,id:str):
        try:
            with Session(engine) as session:
                layer =session.exec(select(LayerData).where(LayerData.id == id)).one_or_none()
                session.delete(layer)
                session.commit()
            return {"message":"delete success!"}
        except:
            return {"message":"delete failed!"}
        
    
SQLModel.metadata.create_all(engine)
