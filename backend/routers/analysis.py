import asyncio, os, sys
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Literal, List
from database import get_db, AsyncSessionLocal
from models import AnalysisJob, AnalysisResult, JobStatus

SNS_ANALYZER_PATH = os.getenv("SNS_ANALYZER_PATH", "../sns_analyzer")
sys.path.insert(0, SNS_ANALYZER_PATH)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

_connections: dict[int, list[WebSocket]] = {}


class AnalysisRequest(BaseModel):
    keywords:  List[str]
    platform:  Literal["youtube", "instagram", "both"] = "youtube"
    max_posts: int = 30


@router.get("/jobs")
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AnalysisJob).order_by(AnalysisJob.created_at.desc()).limit(50)
    )
    return result.scalars().all()


@router.get("/jobs/{job_id}")
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    job = await db.get(AnalysisJob, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.post("/run", status_code=202)
async def run_analysis(
    body: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    if not body.keywords:
        raise HTTPException(400, "키워드를 선택해주세요")

    platforms = ["instagram", "youtube"] if body.platform == "both" else [body.platform]
    first_job_id: int | None = None

    for kw in body.keywords:
        job = AnalysisJob(
            keyword=kw.lstrip("#").strip(),
            platform=body.platform,
            max_posts=body.max_posts,
            status=JobStatus.pending,
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        if first_job_id is None:
            first_job_id = job.id
        background_tasks.add_task(_run_job, job.id, platforms, body.max_posts)

    return {"job_id": first_job_id}


async def _broadcast(job_id: int, data: dict):
    for ws in _connections.get(job_id, []):
        try:
            await ws.send_json(data)
        except Exception:
            pass


async def _run_job(job_id: int, platforms: list, max_posts: int):
    async with AsyncSessionLocal() as db:
        job = await db.get(AnalysisJob, job_id)
        job.status = JobStatus.running
        await db.commit()

        async def progress(pct: int, msg: str, log_type: str = "info"):
            job.progress = pct
            job.message  = msg
            await db.commit()
            await _broadcast(job_id, {"progress": pct, "log": msg, "log_type": log_type})

        try:
            await progress(5, f"[{job.keyword}] 수집 시작...")

            df = await asyncio.to_thread(_collect, job.keyword, platforms, max_posts)

            await progress(60, f"[{job.keyword}] 분석 중...", "info")
            result_data = await asyncio.to_thread(_analyze, df, job.keyword)

            await progress(90, f"[{job.keyword}] Drive 업로드 중...", "info")
            await asyncio.to_thread(_upload_drive, job.keyword, result_data.get("chart_paths", []))

            result = AnalysisResult(
                job_id=job_id,
                keyword=job.keyword,
                platform=job.platform,
                total_posts=result_data.get("total_posts", 0),
                total_likes=result_data.get("total_likes", 0),
                total_views=result_data.get("total_views", 0),
                total_comments=result_data.get("total_comments", 0),
                top_hashtags=result_data.get("top_hashtags"),
                sentiment=result_data.get("sentiment"),
                top_influencers=result_data.get("top_influencers"),
                top_words=result_data.get("top_words"),
                chart_paths=result_data.get("chart_paths", []),
                excel_path=result_data.get("excel_path"),
            )
            db.add(result)
            job.status   = JobStatus.done
            job.progress = 100
            job.message  = "완료"
            await db.commit()
            await _broadcast(job_id, {
                "progress": 100, "log": f"[{job.keyword}] 분석 완료!", "log_type": "success", "status": "done"
            })

        except Exception as e:
            job.status = JobStatus.error
            job.error  = str(e)
            await db.commit()
            await _broadcast(job_id, {"progress": 0, "log": f"오류: {e}", "log_type": "error", "status": "error"})


def _collect(keyword, platforms, max_posts):
    import pandas as pd
    frames = []
    if "youtube" in platforms:
        from collectors.youtube_collector import YouTubeCollector
        yt = YouTubeCollector()
        df = yt.search_videos(keyword, max_results=max_posts)
        df = yt.enrich_channel_subscribers(df)
        if not df.empty:
            frames.append(df)
    if "instagram" in platforms:
        from collectors.instagram_collector import InstagramCollector
        ig = InstagramCollector()
        df = ig.collect_by_hashtag(keyword, max_posts)
        if not df.empty:
            frames.append(df)
    if not frames:
        raise ValueError("수집된 데이터가 없습니다")
    return pd.concat(frames, ignore_index=True)


def _analyze(df, keyword):
    import os
    from analyzers.trend_analyzer      import TrendAnalyzer
    from analyzers.hashtag_analyzer    import HashtagAnalyzer
    from analyzers.sentiment_analyzer  import SentimentAnalyzer
    from analyzers.influencer_analyzer import InfluencerAnalyzer
    from analyzers.wordcloud_generator import WordCloudGenerator
    from utils.data_handler import export_excel
    from config import REPORT_DIR
    os.makedirs(REPORT_DIR, exist_ok=True)

    chart_paths = []
    chart_paths.append(TrendAnalyzer(df).plot_all(keyword))

    ha = HashtagAnalyzer(df)
    chart_paths.append(ha.plot_all(keyword))
    chart_paths.append(ha.plot_network(keyword))
    top_hashtags = ha.top_hashtags(30, exclude=keyword)

    sa = SentimentAnalyzer(use_model=False)
    df = sa.analyze_dataframe(df)
    chart_paths.append(sa.plot_all(df, keyword))
    sentiment_stats = sa.summary_stats(df)

    ia = InfluencerAnalyzer(df)
    chart_paths.append(ia.plot_all(keyword))
    top_influencers = ia.top_influencers(20)

    wc = WordCloudGenerator(df)
    chart_paths += wc.generate_all_platforms(keyword)
    top_words = wc.top_words(50)

    excel_path = export_excel(keyword, df, top_influencers, top_hashtags, sentiment_stats, top_words)

    return {
        "total_posts":      len(df),
        "total_likes":      int(df["likes"].sum()),
        "total_views":      int(df.get("views", df["likes"] * 0).sum()),
        "total_comments":   int(df["comments_count"].sum()),
        "top_hashtags":     top_hashtags.head(20).to_dict("records") if hasattr(top_hashtags, "to_dict") else top_hashtags,
        "sentiment":        sentiment_stats.to_dict("records") if hasattr(sentiment_stats, "to_dict") else sentiment_stats,
        "top_influencers":  top_influencers.head(10).to_dict("records") if hasattr(top_influencers, "to_dict") else top_influencers,
        "top_words":        top_words.head(30).to_dict() if hasattr(top_words, "to_dict") else top_words,
        "chart_paths":      [p for p in chart_paths if p],
        "excel_path":       excel_path,
    }


def _upload_drive(keyword, chart_paths):
    try:
        from drive_uploader import upload_reports
        upload_reports(keyword, chart_paths)
    except Exception:
        pass


@router.get("/results")
async def list_results(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(50)
    )
    return result.scalars().all()


@router.get("/results/{result_id}")
async def get_result(result_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.get(AnalysisResult, result_id)
    if not r:
        raise HTTPException(404, "Result not found")
    return r


@router.websocket("/ws/{job_id}")
async def ws_job(job_id: int, websocket: WebSocket):
    await websocket.accept()
    _connections.setdefault(job_id, []).append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in _connections.get(job_id, []):
            _connections[job_id].remove(websocket)
