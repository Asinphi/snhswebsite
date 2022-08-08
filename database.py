import os
from typing import Union, List, Tuple

import databases
import dotenv
import sqlalchemy
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from pydantic import BaseModel
from sqlalchemy import Column, Text, SmallInteger, Integer, select
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound

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


class AdminSettingsTable(Base):
    __tablename__ = 'admin_settings'

    name = Column(Text, primary_key=True)
    value = Column(Text, index=True, nullable=False)


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


class AdminSettings(BaseModel):
    # If you're a new webmaster editing this code, use the website admin panel to change these values
    join_form_enabled: bool = True
    join_form: str = "https://forms.gle/LN9vM4v513jUCn2e6"
    points: str = "https://docs.google.com/spreadsheets/d/1Hmm1MnhjReP4jJOZC8qroYx74z4Lq3e3VDKa4f6pYDc/edit?usp=sharing"


default_admin_settings = AdminSettings().dict()


def populate_default_admin_settings():
    with Session(engine) as session:
        settings = session.query(AdminSettingsTable).all()
        excluded_setting_names = set(default_admin_settings.keys()).difference({setting.name for setting in settings})
        if not excluded_setting_names:
            return
        for setting_name in excluded_setting_names:
            setting = AdminSettingsTable(name=setting_name, value=str(default_admin_settings[setting_name]))
            session.add(setting)
        session.commit()


populate_default_admin_settings()


def get_admin_settings():
    if not get_admin_settings.cache_invalid:
        return get_admin_settings.cache
    with Session(engine) as session:
        settings = session.query(AdminSettingsTable).all()
        get_admin_settings.cache = [(setting.name,
                                     setting.value if isinstance(default_admin_settings[setting.name], str)
                                     else setting.value == 'True')
                                    for setting in settings]
        get_admin_settings.cache_invalid = False
        return get_admin_settings.cache


get_admin_settings.cache = None
get_admin_settings.cache_invalid = True


def get_admin_setting(name: str):
    with Session(engine) as session:
        try:
            return session.query(AdminSettingsTable).filter(AdminSettingsTable.name == name).one().value
        except NoResultFound:
            setting = AdminSettingsTable(name=name, value=str(default_admin_settings[name]))
            session.add(setting)
            session.commit()
            return default_admin_settings[name]


def set_admin_setting(name: str, value: Union[str, bool]):
    setting_type = type(default_admin_settings[name])
    if not isinstance(value, setting_type):
        raise TypeError(f"Value type for setting {name} is not a {type(default_admin_settings[name])}! {value=}")
    assert(not (isinstance(setting_type, str) and value in ('True', 'False')), f"Str value type cannot be 'True' or 'False'")
    with Session(engine) as session:
        setting = session.query(AdminSettingsTable).get(name)
        setting.value = str(value)
        session.commit()
    get_admin_settings.cache_invalid = True


def set_admin_settings(new_settings: List[Tuple[str, Union[bool, str]]]):
    with Session(engine) as session:
        for name, value in new_settings:
            setting = session.query(AdminSettingsTable).get(name)
            setting.value = str(value)
        session.commit()
    get_admin_settings.cache_invalid = True
