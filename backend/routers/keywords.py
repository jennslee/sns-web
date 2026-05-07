from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from database import get_db
from models import Keyword

router = APIRouter(prefix="/api/keywords", tags=["keywords"])


class KeywordCreate(BaseModel):
    keyword:  str
    platform: str = "both"


@router.get("/")
async def list_keywords(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Keyword).order_by(Keyword.created_at.desc()))
    return result.scalars().all()


@router.post("/", status_code=201)
async def create_keyword(body: KeywordCreate, db: AsyncSession = Depends(get_db)):
    kw_text = body.keyword.strip().lstrip("#")
    if not kw_text:
        raise HTTPException(400, "키워드를 입력해주세요")
    existing = await db.execute(
        select(Keyword).where(Keyword.keyword == kw_text, Keyword.platform == body.platform)
    )
    if existing.scalar():
        raise HTTPException(409, "이미 존재하는 키워드입니다")
    kw = Keyword(keyword=kw_text, platform=body.platform)
    db.add(kw)
    await db.commit()
    await db.refresh(kw)
    return kw


@router.delete("/{keyword_id}")
async def delete_keyword(keyword_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Keyword).where(Keyword.id == keyword_id))
    await db.commit()
    return {"ok": True}
