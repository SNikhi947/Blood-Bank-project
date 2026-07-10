from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from Database import Base
class BloodRequest(Base):
    __tablename__ = "blood_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blood_group = Column(String(5), nullable=False)
    units_needed = Column(Integer, nullable=False)
    hospital = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="Pending")
    request_type = Column(String(50), nullable=False)
    accepted_by = Column(Integer, ForeignKey("users.id"), nullable=True) 
    user = relationship("User", foreign_keys=[user_id], back_populates="requests")
    acceptor = relationship("User", foreign_keys=[accepted_by])