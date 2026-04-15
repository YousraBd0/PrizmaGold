from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class MetalPrice(Base):
    __tablename__ = "metal_prices"

    id           = Column(Integer, primary_key=True, index=True)
    metal_type   = Column(String, nullable=False)
    price_usd    = Column(Float, nullable=False)
    is_daily_snapshot = Column(Boolean, default=False)
    recorded_at  = Column(DateTime, default=datetime.utcnow)