from fastapi import Request, Depends, Query

from app import app, render_template
from users import User, fastapi_users


@app.get("/")
async def root(request: Request, user: User = Depends(fastapi_users.current_user(active=True, optional=True))):
    return render_template("index.html", request, name=user.name if user else None, id=user.id if user else None,
                           include_logo=False)

@app.get("/nav-bar")
async def nav_bar(request: Request, user: User = Depends(fastapi_users.current_user(active=True, optional=True)),
                  include_logo: bool = Query(True, alias="include-logo")):
    return render_template("/components/navbar.html", request, name=user.name if user else None, id=user.id if user else None,
                           include_logo=include_logo)

@app.get("/community")
async def community_page(request: Request, user: User = Depends(fastapi_users.current_user(active=True, optional=True))):
    return render_template("community.html", request, name=user.name if user else None, id=user.id if user else None)

@app.get("/community/discussion/{discussion_id}")
async def discussion_page(request: Request, user: User = Depends(fastapi_users.current_user(active=True))):
    return render_template("discussion.html", request, name=user.name if user else None, id=user.id if user else None)
