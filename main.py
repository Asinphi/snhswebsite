from fastapi import Request, Depends

from app import app, render_template
from users import User, fastapi_users


@app.get("/")
async def root(request: Request, user: User = Depends(fastapi_users.current_user(active=True, optional=True))):
    return render_template("index.html", request, name=user.name if user else None, id=user.id if user else None)

@app.get("/nav-bar")
async def nav_bar(request: Request, user: User = Depends(fastapi_users.current_user(active=True, optional=True))):
    return render_template("/components/navbar.html", request, name=user.name if user else None, id=user.id if user else None)
