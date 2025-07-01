from sqlmodel import Field, Session, SQLModel,select,insert,update
import datetime
from . import engine
from typing import Optional,TYPE_CHECKING
import uuid


class TagData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    tag: str= Field(unique=True,nullable=False)
    tag_en: Optional[str]= Field(unique=True)
    tag_ja: Optional[str]= Field(unique=True)
    times:int = Field(default=0, nullable=False)
    
    @classmethod
    def create_tag(self,tag:str):
        with Session(engine) as session:
            try:
                tagid=uuid.uuid4()
                tag=TagData(id=tagid,tag=tag)
                session.add(tag)
                session.commit()
                return tagid
            except Exception as e:
                print(e)
                return {"result":"Oops."}
    @classmethod
    def update_tag_times(self,tagid:str,times:int):
        with Session(engine) as session:
            try:
                session.exec(update(TagData).where(TagData.id==tagid).values(times=times))
                session.commit()
                return {"result":"update tagTimes successfully."}
            except:
                return {"result":"Oops."}
        
            
    @classmethod
    def delete_tag(self,tag:str):
        try:
            with Session(engine) as session:
                delete_tag =session.exec(select(TagData).where(TagData.tag == tag)).one_or_none()
                session.delete(delete_tag)
                session.commit()
                return {"result":"delete tagName successfully."}
        except:
            return {"result":"Oops."}
            
            
    @classmethod
    def query_tag(self,id:str):
        with Session(engine) as session:
            statement = select(TagData.tag).where(TagData.id== id)
            tag = session.exec(statement).one_or_none
            if tag:
                return tag
            else:
                return None
    @classmethod
    def query_prefix(self,prefix:str):
        with Session(engine) as session:
            statement = select(TagData.tag).where(TagData.tag.like(f"{prefix}%")).order_by(TagData.times.desc()).limit(5)
            tag = session.exec(statement).fetchall()
            return {"tags_list":tag}