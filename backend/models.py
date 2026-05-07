from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()


class JobStatus(str, enum.Enum):
    pending   = "pending"
    running   = "running"
    done      = "done"
    error     = "error"


class Keyword(Base):
    __tablename__ = "keywords"
    id         = Column(Integer, primary_key=True)
    keyword    = Column(String, nullable=False)
    platform   = Column(String, default="both")
    created_at = Column(DateTime, server_default=func.now())


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    id         = Column(Integer, primary_key=True)
    keyword    = Column(String, nullable=False)
    platform   = Column(String, default="youtube")
    max_posts  = Column(Integer, default=30)
    status     = Column(Enum(JobStatus), default=JobStatus.pending)
    progress   = Column(Integer, default=0)
    message    = Column(String, default="")
    result     = Column(JSON, nullable=True)
    error      = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id              = Column(Integer, primary_key=True)
    job_id          = Column(Integer, ForeignKey("analysis_jobs.id"))
    keyword         = Column(String, nullable=False)
    platform        = Column(String)
    total_posts     = Column(Integer, default=0)
    total_likes     = Column(Integer, default=0)
    total_views     = Column(Integer, default=0)
    total_comments  = Column(Integer, default=0)
    top_hashtags    = Column(JSON)
    sentiment       = Column(JSON)
    top_influencers = Column(JSON)
    top_words       = Column(JSON)
    chart_paths     = Column(JSON)
    excel_path      = Column(String)
    drive_folder    = Column(String)
    trend_summary   = Column(String, nullable=True)
    created_at      = Column(DateTime, server_default=func.now())
