from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from Database import Base
class HospitalInventory(Base):
    __tablename__ = "hospital_inventory"   
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    blood_group = Column(String(5), nullable=False)
    units_available = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    hospital = relationship("Hospital", back_populates="inventory")