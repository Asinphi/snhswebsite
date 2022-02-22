from fastapi import Request, Depends, Query

from app import app, render_template
from users import User, fastapi_users, user_dict


optional_user = Depends(fastapi_users.current_user(active=True, optional=True))
required_user = Depends(fastapi_users.current_user(active=True))


@app.get("/")
async def root(request: Request, user: User = optional_user):
    return render_template("index.html", request, **user_dict(user), include_logo=False)


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
