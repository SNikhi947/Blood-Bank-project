from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from Database import Base
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100), nullable=False)
    role = Column(String(20), default="user")
    donor_profile = relationship("Donor", back_populates="user", uselist=False)
    hospital_profile = relationship("Hospital", back_populates="user", uselist=False)
    requests = relationship("BloodRequest", foreign_keys="[BloodRequest.user_id]", back_populates="user")