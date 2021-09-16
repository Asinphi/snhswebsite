import os
from typing import Set

import databases
import sqlalchemy
from fastapi import Request
from fastapi_users import FastAPIUsers, models
from fastapi_users.authentication import CookieAuthentication
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy import Column, Text, SmallInteger
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base

from app import app

DATABASE_URL = os.environ['DATABASE_URL']
SECRET = os.environ['TOKEN']
IS_DEVELOPMENT = os.environ['NODE_ENV'] == "development"


class User(models.BaseUser):
    name: str  # TODO Prevent JavaScript in this since it's directly injected into the HTML
    graduation_year: int
    points = 0


class UserCreate(models.BaseUserCreate):
    name: str
    graduation_year: int
    points = 0


class UserUpdate(User, models.BaseUserUpdate):
    points = 0


class UserDB(User, models.BaseUserDB):
    name: str
    graduation_year: int
    points = 0


database = databases.Database(DATABASE_URL)
Base: DeclarativeMeta = declarative_base()


class UserTable(Base, SQLAlchemyBaseUserTable):
    name = Column(Text, index=True, nullable=False)
    graduation_year = Column(SmallInteger, nullable=False)
    points = Column(SmallInteger, index=True, nullable=False)


engine = sqlalchemy.create_engine(
    "postgresql" + DATABASE_URL[DATABASE_URL.find(":"):], connect_args={'sslmode': 'require'}, pool_size=1,
    max_overflow=0
)
Base.metadata.create_all(engine)

users = UserTable.__table__
user_db = SQLAlchemyUserDatabase(UserDB, database, users)


def user_dict(user: User, include: Set[str] = set(), exclude: Set[str] = set(), *args, defaults=True, **kwargs):
    if user is None:
        return {}
    to_include = {'name', 'points', 'is_superuser'}.union(include) - exclude if defaults else include - exclude
    return user.dict(include=to_include, *args, **kwargs)


"""
def on_after_register(user: UserDB, request: Request):
    print(f"User {user.id} has registered.")
"""


def on_after_forgot_password(user: UserDB, token: str, request: Request):
    print(f"User {user.id} has forgot their password. Reset token: {token}")


def after_verification_request(user: UserDB, token: str, request: Request):
    print(f"Verification requested for user {user.id}. Verification token: {token}")


cookie_authentication = CookieAuthentication(secret=SECRET, cookie_secure=not IS_DEVELOPMENT)

fastapi_users = FastAPIUsers(
    user_db,
    [cookie_authentication],
    User,
    UserCreate,
    UserUpdate,
    UserDB,
)
app.include_router(
    fastapi_users.get_auth_router(cookie_authentication), prefix="/auth/cookie", tags=["auth"]
)
"""
app.include_router(
    fastapi_users.get_register_router(on_after_register), prefix="/auth", tags=["auth"]
)
"""
app.include_router(
    fastapi_users.get_reset_password_router(
        SECRET, after_forgot_password=on_after_forgot_password
    ),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(
        SECRET, after_verification_request=after_verification_request
    ),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(fastapi_users.get_users_router(), prefix="/users", tags=["users"])


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
