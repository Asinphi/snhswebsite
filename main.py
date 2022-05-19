import os
from typing import Optional

from fastapi import Request, Depends, Query, Body
from pydantic import BaseModel

from app import app, render_template
from users import User, fastapi_users, user_dict
from database import get_announcements, add_announcement, set_announcement, delete_announcement


optional_user = Depends(fastapi_users.current_user(active=True, optional=True))
required_user = Depends(fastapi_users.current_user(active=True))
admin_user = Depends(fastapi_users.current_user(superuser=True))


@app.get("/")
async def root(request: Request, user: User = optional_user):
    return render_template("index.html", request, **user_dict(user), include_logo=False,
                           announcements=get_announcements())


@app.get("/nav-bar")
async def nav_bar(request: Request, user: User = optional_user, include_logo: bool = Query(True, alias="include-logo")):
    return render_template("/components/navbar.html", request, **user_dict(user), include_logo=include_logo)


@app.get("/community")
async def community_page(request: Request, user: User = optional_user):
    return render_template("community.html", request, **user_dict(user))


@app.get("/community/discussion/{discussion_id}")
async def discussion_page(request: Request, user: User = required_user):
    return render_template("discussion.html", request, **user_dict(user))


@app.get("/tutoring")
async def tutoring_page(request: Request, user: User = optional_user):
    return render_template("tutoring.html", request, **user_dict(user))


@app.get("/officers")
async def officers_page(request: Request, user: User = optional_user):
    return render_template("officers.html", request, **user_dict(user))


@app.get("/competitions")
async def competitions_page(request: Request, user: User = optional_user):
    return render_template("competitions.html", request, **user_dict(user))


@app.get('/points')
async def points_page(request: Request, user: User = optional_user):
    return render_template("points.html", request, **user_dict(user))


@app.get('/events')
async def events_page(request: Request, user: User = optional_user):
    return render_template('events.html', request, **user_dict(user), announcements=get_announcements())


@app.get('/album')
async def album_page(request: Request, user: User = optional_user):
    return render_template('album.html', request, **user_dict(user), photos=os.listdir("assets/PhotosPage"))


@app.get('/admin')
async def admin_page(request: Request, user: User = admin_user):
    return render_template('admin.html', request, **user_dict(user), announcements=get_announcements())


class Announcement(BaseModel):
    idx: Optional[int]
    title: str
    content: str


@app.post('/announcements/add')
async def announcement_add(request: Request, user: User = admin_user, announcement: Announcement = Body(...)):
    add_announcement(announcement.title, announcement.content)


@app.post('/announcements/edit')
async def announcement_edit(request: Request, user: User = admin_user, announcement: Announcement = Body(...)):
    set_announcement(announcement.idx, announcement.title, announcement.content)


@app.post('/announcements/delete')
async def announcement_delete(request: Request, user: User = admin_user, idx: int = Query(...)):
    delete_announcement(idx)
