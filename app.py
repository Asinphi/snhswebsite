from fastapi import FastAPI, Request
from fastapi.exception_handlers import http_exception_handler
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

templates = Jinja2Templates(directory="templates")


def render_template(path: str, request: Request, **kwargs):
    return templates.TemplateResponse(path, {"request": request, **kwargs})


@app.exception_handler(StarletteHTTPException)
async def error_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return render_template("404.html", request)
    elif exc.status_code == 401:
        return render_template("401.html", request, name=None)
    return await http_exception_handler(request, exc)
