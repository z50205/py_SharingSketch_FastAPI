from sqlmodel import Field, Session, SQLModel,select,insert
import datetime
from passlib.hash import pbkdf2_sha256
from typing import Optional
from . import engine
import uuid

class UserData(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    username: str= Field(unique=True)
    password_hash: str= Field()
    email: Optional[str] = None
    about_me: Optional[str] = None
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
    
SQLModel.metadata.create_all(engine)
