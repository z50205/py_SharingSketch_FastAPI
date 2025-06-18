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
            tagids=session.exec(select(ImageTagData.tag_id).where(ImageTagData.image_id==image_id)).all()
            for tagid in tagids:
                times=ImageTagData.get_tag_times(tagid)
                TagData.update_tag_times(tagid,times)

    @classmethod
    def delete_imagetags(self,image_id:str):
        with Session(engine) as session:
            tagids=session.exec(select(ImageTagData.tag_id).where(ImageTagData.image_id==image_id)).all()
            imagetag_records=session.exec(select(ImageTagData).where(ImageTagData.image_id==image_id)).all()
            for imagetag_record in imagetag_records:
                session.delete(imagetag_record)
            session.commit()
            for tagid in tagids:
                times=ImageTagData.get_tag_times(tagid)
                TagData.update_tag_times(tagid,times)

    @classmethod
    def get_tag_times(self,tag_id:str):
            with Session(engine) as session:
                tag_times=session.exec(select(ImageTagData).where(ImageTagData.tag_id==tag_id)).all()
                return len(tag_times)

    @classmethod
    def query_tagAll(self,image_id:str):
        with Session(engine) as session:
            try:
                tag_records = session.exec(select(TagData.tag).where(ImageTagData.image_id== image_id).where(ImageTagData.tag_id== TagData.id)).fetchall()
            except Exception as e:
                print(e)
            return tag_records
            
    @classmethod
    def query_imageAll(self,image_id:str):
        with Session(engine) as session:
            tag_records = session.exec(select(TagData.tag).where(ImageTagData.image_id== image_id).where(ImageTagData.tag_id== TagData.id))
            return tag_records