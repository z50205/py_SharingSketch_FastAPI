from sqlmodel import Field, Session, SQLModel, create_engine, select,insert
import datetime
from passlib.hash import pbkdf2_sha256

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True) 

class UserData(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str= Field(unique=True)
    password_hash: str= Field()
    email: str = None
    about_me: str = None
    create_time: str = Field(default_factory=datetime.datetime.now)

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
        u=UserData(username=username,password_hash=self.set_pw(self,password))
        with Session(engine) as session:
            session.add(u)
            session.commit()
    
# SQLModel.metadata.create_all(engine)
