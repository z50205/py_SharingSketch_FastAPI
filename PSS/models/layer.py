from sqlmodel import Field, Session, SQLModel,select,insert,update
from fastapi import UploadFile
import datetime
from typing import Optional
from . import engine,client,BUCKET_NAME
from PIL import Image
import io,uuid

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
    def query_room_self_layers(self,room_id:str,creator_id:str):
        with Session(engine) as session:
            statement = select(LayerData).where(LayerData.room_id == room_id).where(LayerData.creator_id == creator_id).order_by(LayerData.z_index.asc())
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
    def query_room_participants(self,room_id:str):
        with Session(engine) as session:
            statement = select(LayerData.creator_id).where(LayerData.room_id == room_id).distinct()
            results = session.exec(statement).fetchall()
            return results
        
    @classmethod
    def query_user_rooms(self,user_id:str):
        with Session(engine) as session:
            statement = select(LayerData.room_id).where(LayerData.creator_id == user_id).distinct()
            results = session.exec(statement).fetchall()
            return results

    @classmethod
    def query_thumbnail(self,room_id:str,creator_id:str):
        try:
            filename="rooms/"+room_id+"/"+creator_id+"/"+"thumbnail.webp"
            response = client.get_object(Bucket=BUCKET_NAME,Key=filename)
            return response['Body'].read()
        except Exception as e:
            return {"message":"get layer failed!"}
        

    @classmethod
    def delete_room_layers(self,roomsid:str,id:str):
        try:
            with Session(engine) as session:
                statement=select(LayerData).where(LayerData.room_id == roomsid).where(LayerData.creator_id == id)
                layers =session.exec(statement).fetchall()
                for layer in layers:
                    session.delete(layer)
                session.commit()
            return {"message":"delete room success!"}
        except:
            return {"message":"delete room failed!"}

    @classmethod
    def create_layer(self,image:UploadFile,room_id:str,layername:str,creator_id:str,opacity:str,is_display:str,z_index:str):
        dt = datetime.datetime.now(datetime.timezone.utc)
        dt_sec = dt.isoformat(timespec='seconds')
        dt_iso = dt_sec.replace("+00:00", "Z")
        try:
            with Session(engine) as session:
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
    def create_room_self_thumbnail(self,room_id:str,creator_id:str):
        try:
            with Session(engine) as session:
                statement = select(LayerData).where(LayerData.room_id == room_id).where(LayerData.creator_id == creator_id).order_by(LayerData.z_index.asc())
                results = session.exec(statement).fetchall()
                base_image= None
                for layer in results:
                    if layer.is_display:
                        filename="rooms/"+layer.room_id+"/"+layer.creator_id+"/"+layer.layername
                        response = client.get_object(Bucket=BUCKET_NAME,Key=filename)
                        image_data=response['Body'].read()
                        current_image =Image.open(io.BytesIO(image_data)).convert("RGBA")
                        if base_image == None:
                            base_image=current_image
                        else:
                            base_image = Image.alpha_composite(base_image, current_image)
                
                webp_bytes = io.BytesIO()
                base_image.save(webp_bytes, format="WEBP", lossless=True)
                webp_bytes.seek(0)

                filename="rooms/"+layer.room_id+"/"+layer.creator_id+"/"+"thumbnail.webp"
                response = client.put_object(Body=webp_bytes,Bucket=BUCKET_NAME,Key=filename)
                return {"message":"create room thumbnail failed!"}
        except Exception as e:
            return {"message":"create room thumbnail failed!"}

SQLModel.metadata.create_all(engine)
