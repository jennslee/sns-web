from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv, set_key
import os

router = APIRouter(prefix="/api/settings", tags=["settings"])
_sns_path = os.getenv("SNS_ANALYZER_PATH", os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "sns_analyzer")
))
ENV_PATH = os.path.join(_sns_path, ".env")


class SettingsBody(BaseModel):
    youtube_api_key:    str | None = None
    instagram_username: str | None = None
    instagram_password: str | None = None
    spreadsheet_id:     str | None = None
    drive_folder_id:    str | None = None
    max_posts:          int | None = None
    max_comments:       int | None = None
    default_platform:   str | None = None


def _read_env() -> dict:
    load_dotenv(ENV_PATH, override=True)
    return {
        "youtube_api_key":    "***" if os.getenv("YOUTUBE_API_KEY") else "",
        "instagram_username": os.getenv("INSTAGRAM_USERNAME", ""),
        "instagram_password": "",  # never expose
        "spreadsheet_id":     os.getenv("SPREADSHEET_ID", ""),
        "drive_folder_id":    os.getenv("DRIVE_FOLDER_ID", ""),
        "max_posts":          int(os.getenv("YOUTUBE_MAX_RESULTS", 30)),
        "max_comments":       int(os.getenv("YOUTUBE_MAX_COMMENTS", 100)),
        "default_platform":   os.getenv("DEFAULT_PLATFORM", "both"),
        "drive_connected":    os.path.exists(
            os.path.join(os.path.dirname(ENV_PATH), "drive_token.pickle")
        ),
    }


@router.get("/")
async def get_settings():
    return _read_env()


def _apply(body: SettingsBody):
    load_dotenv(ENV_PATH, override=True)
    mapping: dict[str, str | None] = {
        "YOUTUBE_API_KEY":    body.youtube_api_key,
        "INSTAGRAM_USERNAME": body.instagram_username,
        "INSTAGRAM_PASSWORD": body.instagram_password,
        "SPREADSHEET_ID":     body.spreadsheet_id,
        "DRIVE_FOLDER_ID":    body.drive_folder_id,
        "DEFAULT_PLATFORM":   body.default_platform,
        "YOUTUBE_MAX_RESULTS":  str(body.max_posts)    if body.max_posts    is not None else None,
        "YOUTUBE_MAX_COMMENTS": str(body.max_comments) if body.max_comments is not None else None,
    }
    os.makedirs(os.path.dirname(ENV_PATH), exist_ok=True)
    for key, val in mapping.items():
        if val is not None and val != "***":
            set_key(ENV_PATH, key, val)
    return _read_env()


@router.patch("/")
async def patch_settings(body: SettingsBody):
    return _apply(body)


@router.put("/")
async def put_settings(body: SettingsBody):
    return _apply(body)
