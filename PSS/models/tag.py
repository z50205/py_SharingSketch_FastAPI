from sqlmodel import Field, Session, SQLModel,select,insert,update
import datetime
from . import engine
from typing import Optional
import uuid

class TagData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    tag: str= Field(unique=True,nullable=False)
    tag_en: Optional[str]= Field(unique=True)
    tag_ja: Optional[str]= Field(unique=True)
    
    @classmethod
    def create_tag(self,tag:str):
        with Session(engine) as session:
            try:
                tagid=uuid.uuid4()
                tag=TagData(id=tagid,tag=tag)
                with Session(engine) as session:
                    session.add(tag)
                    session.commit()
                    return tagid
            except:
                return {"result":"Oops."}
            
    @classmethod
    def delete_tag(self,tag:str):
        with Session(engine) as session:
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
            statement = select(TagData.tag).filter(TagData.tag.like(f"{prefix}%"))
            tag = session.exec(statement).fetchall()
            return {"tags_list":tag}

SQLModel.metadata.create_all(engine)