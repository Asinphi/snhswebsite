import os

import databases
import sqlalchemy
from fastapi import Request
from fastapi_users import FastAPIUsers, models
from fastapi_users.authentication import CookieAuthentication, JWTAuthentication
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy import Column, Text, SmallInteger
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base

from app import app

DATABASE_URL = os.environ['DATABASE_URL']
SECRET = "sadwasd"


class User(models.BaseUser):
    name: str
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
    DATABASE_URL, connect_args={'sslmode': 'require'}, pool_size=1, max_overflow=0
)
Base.metadata.create_all(engine)

users = UserTable.__table__
user_db = SQLAlchemyUserDatabase(UserDB, database, users)


def on_after_register(user: UserDB, request: Request):
    print(f"User {user.id} has registered.")


def on_after_forgot_password(user: UserDB, token: str, request: Request):
    print(f"User {user.id} has forgot their password. Reset token: {token}")


def after_verification_request(user: UserDB, token: str, request: Request):
    print(f"Verification requested for user {user.id}. Verification token: {token}")


cookie_authentication = CookieAuthentication(secret=SECRET, lifetime_seconds=3600, cookie_secure=False)

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
app.include_router(
    fastapi_users.get_register_router(on_after_register), prefix="/auth", tags=["auth"]
)
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
