from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from Database import Base
class Hospital(Base):
    __tablename__ = "hospitals"    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    hospital_name = Column(String(150), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    contact_phone = Column(String(20), nullable=False)
    city = Column(String(50), nullable=False)
    user = relationship("User", back_populates="hospital_profile")
    inventory = relationship("HospitalInventory", back_populates="hospital")