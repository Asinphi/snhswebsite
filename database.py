import os

import databases
import dotenv
import sqlalchemy
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from sqlalchemy import Column, Text, SmallInteger, Integer, select
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import Session

dotenv.load_dotenv('.env')
DATABASE_URL = os.environ.get('DATABASE_URL')  # sqlite:///C:/Users/0610028472/Downloads/maowebsite.db
if DATABASE_URL.startswith('postgres'):
    DATABASE_URL = "postgresql" + DATABASE_URL[DATABASE_URL.find(":"):]
elif not DATABASE_URL:
    DATABASE_URL = "sqlite://"

database = databases.Database(DATABASE_URL)
Base: DeclarativeMeta = declarative_base()

engine = sqlalchemy.create_engine(
    DATABASE_URL  # , connect_args={'sslmode': 'require'}, pool_size=1,
    # max_overflow=0
)


class UserTable(Base, SQLAlchemyBaseUserTable):
    name = Column(Text, index=True, nullable=False)
    graduation_year = Column(SmallInteger, nullable=False)
    points = Column(SmallInteger, index=True, nullable=False)


class AnnouncementsTable(Base):
    __tablename__ = 'announcements'

    id = Column(Integer, primary_key=True)
    title = Column(Text, index=True, nullable=False)
    content = Column(Text, index=False, nullable=False)


Base.metadata.create_all(engine)


def get_announcements():
    with Session(engine) as session:
        result = session.query(AnnouncementsTable).order_by(AnnouncementsTable.id.desc()).all()
        return [(announcement.id, announcement.title, announcement.content) for announcement in result]


def add_announcement(title, content):
    with Session(engine) as session:
        announcement = AnnouncementsTable(title=title, content=content)
        session.add(announcement)
        session.commit()


def set_announcement(idx, title, content):
    with Session(engine) as session:
        announcement = session.query(AnnouncementsTable).get(idx)
        announcement.title = title
        announcement.content = content
        session.commit()


def delete_announcement(idx):
    with Session(engine) as session:
        session.query(AnnouncementsTable).filter(AnnouncementsTable.id == idx).delete()
        session.commit()
