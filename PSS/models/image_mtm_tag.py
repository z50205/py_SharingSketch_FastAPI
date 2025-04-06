from sqlmodel import Field, Session, SQLModel,select,insert,update
import datetime
from . import engine,TagData
from typing import Optional
import uuid

class ImageTagData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    image_id: str= Field(nullable=False, foreign_key="imagedata.id",ondelete="CASCADE")
    tag_id: str= Field(nullable=False, foreign_key="tagdata.id")
    
    @classmethod
    def create_imagetags(self,image_id:str,tagList:list[str]):
        with Session(engine) as session:
            for tagname in tagList:
                tagid=session.exec(select(TagData.id).where(TagData.tag==tagname)).one_or_none()
                if not tagid:
                    tagid=TagData.create_tag(tagname)
                imagetag=ImageTagData(id=uuid.uuid4(),image_id=image_id,tag_id=tagid)
                session.add(imagetag)
            session.commit()

    @classmethod
    def delete_imagetag(self,image_id:str,tagname:str):
        with Session(engine) as session:
            tagid_record=session.exec(select(TagData.id).where(TagData.tag==tagname))
            imagetag_record=session.exec(select(ImageTagData.id).where(ImageTagData.tag_id==tagid_record).where(ImageTagData.image_id==image_id)).one_or_none
            session.delete(imagetag_record)
            session.commit()

    @classmethod
    def query_tagAll(self,image_id:str):
        with Session(engine) as session:
            tag_records = session.exec(select(TagData.tag).where(ImageTagData.image_id== image_id).where(ImageTagData.tag_id== TagData.id)).fetchall()
            return tag_records
            
    @classmethod
    def query_imageAll(self,image_id:str):
        with Session(engine) as session:
            tag_records = session.exec(select(TagData.tag).where(ImageTagData.image_id== image_id).where(ImageTagData.tag_id== TagData.id))
            return tag_records
        
SQLModel.metadata.create_all(engine)

