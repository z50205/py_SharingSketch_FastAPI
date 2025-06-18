from sqlmodel import Field, Session, SQLModel,select,insert,update
import datetime
from typing import Optional
from . import engine
import uuid

class RoomData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    roomname:str=Field(nullable=False)
    description: Optional[str] = None
    creator_id: str = Field(default=None, foreign_key="userdata.id",ondelete="CASCADE")
    create_time: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    is_display:bool= Field(default=True)

    @classmethod
    def query_rooms(self,creator_id:str):
        with Session(engine) as session:
            statement = select(RoomData.id).where(RoomData.creator_id == creator_id).order_by(RoomData.create_time.desc())
            rooms = session.exec(statement).fetchall()
            return rooms
        
    @classmethod
    def query_room(self,id:str):
        with Session(engine) as session:
            statement = select(RoomData).where(RoomData.id == id)
            room = session.exec(statement).one_or_none()
            return room
        
    @classmethod
    def create_room(self,roomname:str,creator_id:str,description:Optional[str] = None):
        dt = datetime.datetime.now(datetime.timezone.utc)
        dt_sec = dt.isoformat(timespec='seconds') 
        dt_iso = dt_sec.replace("+00:00", "Z")
        room=RoomData(id=str(uuid.uuid4()),roomname=roomname,creator_id=creator_id,description=description,create_time=dt_iso)
        try:
            with Session(engine) as session:
                session.add(room)
                session.commit()
                return  room.id
        except Exception as e:
            return {"message": "Create failed!", "error": str(e)}
    @classmethod
    def delete_room(self,id:str,creator_id:str):
        try:
            with Session(engine) as session:
                room =session.exec(select(RoomData).where(RoomData.id == id).where(RoomData.creator_id == creator_id)).one_or_none()
                session.delete(room)
                session.commit()
                return {"message":"Delete success!"}
        except Exception as e:
            return {"message": "Delete failed!", "error": str(e)}
        
    @classmethod
    def toggle_room_display(self,id:str,creator_id:str):
        try:
            with Session(engine) as session:
                result=session.exec(select(RoomData).where(RoomData.creator_id == creator_id).where(RoomData.id == id)).one_or_none()
                if result:
                    statement=update(RoomData).where(RoomData.id == id).values(is_display=not result.is_display)
                    session.exec(statement)
                    session.commit()
                    return {"message":"Update display success!","room_id":result.id,"status":result.is_display}
                else:
                    return {"message":"Room not found!"}
        except Exception as e:
            return {"message":"Update display failed!", "error": str(e)}
        
    @classmethod
    def query_room_display(self,id:str,creator_id:str):
        try:
            with Session(engine) as session:
                result=session.exec(select(RoomData).where(RoomData.creator_id == creator_id).where(RoomData.id == id)).one_or_none()
                return {"message":"Get display success!","status":result.is_display}
        except Exception as e:
            return {"message":"Get display failed!", "error": str(e)}