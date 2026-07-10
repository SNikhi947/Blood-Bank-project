from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from Database import Base
class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    blood_group = Column(String(5), nullable=False)
    phone = Column(String(15), nullable=False)
    city = Column(String(50), nullable=False)
    available = Column(Boolean, default=True)
    last_donated = Column(Date, nullable=True) 
    user = relationship("User", back_populates="donor_profile")