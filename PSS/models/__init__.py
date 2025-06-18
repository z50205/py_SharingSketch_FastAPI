from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv
import os
import boto3
import io

load_dotenv()

DB_HOST=os.environ.get("DB_HOST")
DB_PORT=os.environ.get("DB_PORT")
DB_DATABASE=os.environ.get("DB_DATABASE")
DB_USERNAME=os.environ.get("DB_USERNAME")
DB_PASSWORD=os.environ.get("DB_PASSWORD")

S3_KEYID=os.environ.get("S3_KEYID")
S3_KEY=os.environ.get("S3_KEY")
REGION=os.environ.get("REGION")
BUCKET_NAME=os.environ.get("BUCKET_NAME")


url_object="mysql+pymysql://%s:%s@%s:%s/%s" %(DB_USERNAME,DB_PASSWORD,DB_HOST,int(DB_PORT),DB_DATABASE)
client = boto3.client('s3',aws_access_key_id = S3_KEYID,aws_secret_access_key = S3_KEY,region_name=REGION)

engine = create_engine(url_object)

from .user import UserData
from .tag import TagData
from .image_mtm_tag import ImageTagData
from .image import ImageData
from .room import RoomData
from .layer import LayerData


SQLModel.metadata.create_all(engine)

