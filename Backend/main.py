from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from Database import get_db
from utils.hashing import hash_password,password_verify
from utils.jwt import tokengen,token_verify
from Models.User import User
from Models.BloodRequest import BloodRequest
from Models.Donors import Donor
from Models.Hospital import Hospital
from Models.HospitalInventory import HospitalInventory
from datetime import date
from Database import Base, engine
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from Database import SessionLocal

Base.metadata.create_all(bind=engine)
security = HTTPBearer()

app=FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://blood-bank-omega-bay.vercel.app",
        "https://blood-link-lime-chi.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class user(BaseModel):
    username:str
    password:str
    role:str
class UserLogin(BaseModel):
    username: str
    password: str
class DonorCreate(BaseModel):
    name: str
    blood_group: str
    phone: str
    city: str
    available: bool = True
    last_donated: date | None = None
class Hospitalcreate(BaseModel):
    hospital_name:str
    license_number:str
    contact_phone:str
    city:str
class inventory(BaseModel):
    blood_group: str
    units_available: int 
    last_updated: date | None = None
class InventoryUpdate(BaseModel):
    units_available: int
class BloodRequestCreate(BaseModel):
    blood_group: str
    units_needed: int
    hospital: str
    reason: str
    request_type: str 
class RequestStatusUpdate(BaseModel):
    status: str 

@app.get("/")
def Hello():
    return {"message":"Hello wellcome to Blood bank server"}

@app.post("/register",status_code=201)
def register(u:user,db: Session = Depends(get_db)):
    exist=db.query(User).filter(User.username==u.username).first()
    if exist:
        raise HTTPException(status_code=401,detail="username already taken")
    new_user=User(
        username=u.username,
        hashed_password=hash_password(u.password),
        role=u.role
    )
    db.add(new_user)
    db.commit()
    return {"message":"User is register Sucessfully"}

@app.post("/login")
def login(u: UserLogin, db: Session = Depends(get_db)):
    found_user = db.query(User).filter(User.username == u.username).first()
    if not found_user or not password_verify(u.password, found_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")    
    token = tokengen(found_user.username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": found_user.role  # <-- THIS IS THE MISSING MAGIC LINE!
    }

@app.get("/users")
def display(db:Session=Depends(get_db)):
    return db.query(User).all()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = token_verify(token)
    except Exception: 
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    username = payload if isinstance(payload, str) else payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/donors", status_code=201)
def create_donor_profile(d: DonorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only standard users can register as donors")
        
    existing_profile = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Donor profile already exists")

    new_donor = Donor(
        user_id=current_user.id,
        name=d.name,
        blood_group=d.blood_group,
        phone=d.phone,
        city=d.city,
        available=d.available,
        last_donated=d.last_donated
    )
    
    db.add(new_donor)
    db.commit()
    
    return {"message": "Donor profile successfully created"}

@app.get("/donors")
def dis_donor(db:Session=Depends(get_db)):
    return db.query(Donor).all()

@app.post("/hospital", status_code=201)
def create_Hospital(h: Hospitalcreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user) ):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can register a hospital profile")    
    existing_profile = db.query(Hospital).filter(Hospital.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Hospital profile already exists")
        
    new_hospital = Hospital(
        user_id=current_user.id, 
        hospital_name=h.hospital_name, 
        license_number=h.license_number, 
        contact_phone=h.contact_phone,
        city=h.city
    )
    
    db.add(new_hospital)
    db.commit()
    return {"message": "Hospital details created successfully"}

@app.get("/hospitals")
def display_hos(db:Session=Depends(get_db)):
    return db.query(Hospital).all()


@app.post("/hospitalinventory", status_code=201)
def create_inventory(i: inventory, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can manage inventory")    
    
    hospital = db.query(Hospital).filter(Hospital.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found. Please create one first.")

    existing_item = db.query(HospitalInventory).filter(
        HospitalInventory.hospital_id == hospital.id,
        HospitalInventory.blood_group == i.blood_group
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=400, 
            detail=f"Inventory for {i.blood_group} already exists. Use the PUT route to update units."
        )

    new_item = HospitalInventory(
        hospital_id=hospital.id,
        blood_group=i.blood_group,
        units_available=i.units_available
    )
    
    db.add(new_item)
    db.commit()
    
    return {"message": f"Initial inventory for {i.blood_group} created successfully"}

@app.put("/hospitalinventory/{blood_group}")
def update_inventory(blood_group: str, update_data: InventoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can update inventory")
    hospital = db.query(Hospital).filter(Hospital.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found.")
    inventory_item = db.query(HospitalInventory).filter(
        HospitalInventory.hospital_id == hospital.id,
        HospitalInventory.blood_group == blood_group
    ).first()
    if not inventory_item:
        raise HTTPException(
            status_code=404, 
            detail=f"No inventory record found for {blood_group}. Please create it first."
        )
    inventory_item.units_available = update_data.units_available   
    db.commit()
    return {"message": f"Inventory for {blood_group} updated to {update_data.units_available} units"}

@app.get("/hospitalinventory")
def display_inventory(db: Session = Depends(get_db)):
    return db.query(HospitalInventory).all()

@app.get("/hospitalinventory/{hospital_id}")
def display_hospital_inventory(hospital_id: int, db: Session = Depends(get_db)):
    return db.query(HospitalInventory).filter(HospitalInventory.hospital_id == hospital_id).all()

@app.post("/requests", status_code=201)
def create_blood_request(req: BloodRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_request = BloodRequest(
        user_id=current_user.id,
        blood_group=req.blood_group,
        units_needed=req.units_needed,
        hospital=req.hospital,
        reason=req.reason,
        request_type=req.request_type,
        status="Pending"
    )
    db.add(new_request)
    db.commit()
    return {"message": "Blood request submitted successfully"}


@app.get("/requests/me")
def get_my_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = db.query(BloodRequest).filter(BloodRequest.user_id == current_user.id).all()
    return requests

@app.get("/requests")
def get_all_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "hospital"]:
        raise HTTPException(status_code=403, detail="Not authorized to view all requests")
    return db.query(BloodRequest).all()

@app.put("/requests/{request_id}/status")
def update_request_status(request_id: int, update_data: RequestStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update request status")
    blood_req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not blood_req:
        raise HTTPException(status_code=404, detail="Request not found")      
    blood_req.status = update_data.status
    db.commit()
    return {"message": f"Request ID {request_id} status updated to {update_data.status}"}

@app.get("/requests/eligible")
def get_eligible_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    eligible_blood_groups = []
    if current_user.role == "user":
        donor_profile = db.query(Donor).filter(Donor.user_id == current_user.id).first()
        if not donor_profile:
            raise HTTPException(status_code=400, detail="Create a donor profile first to see matches")
        if not donor_profile.available:
            return []
        eligible_blood_groups.append(donor_profile.blood_group)
    elif current_user.role == "hospital":
        hospital = db.query(Hospital).filter(Hospital.user_id == current_user.id).first()
        if not hospital:
            raise HTTPException(status_code=400, detail="Hospital profile not found")
        inventory = db.query(HospitalInventory).filter(
            HospitalInventory.hospital_id == hospital.id,
            HospitalInventory.units_available > 0
        ).all()
        eligible_blood_groups = [item.blood_group for item in inventory]
        if not eligible_blood_groups:
            return []
    elif current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admins should use the main /requests route")
        
    matching_requests = db.query(BloodRequest).filter(
        BloodRequest.status == "Pending",
        BloodRequest.blood_group.in_(eligible_blood_groups),
        BloodRequest.user_id != current_user.id
    ).all()
    return matching_requests

@app.put("/requests/{request_id}/accept")
def accept_blood_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "Pending":
        raise HTTPException(status_code=400, detail="Too late! This request has already been accepted.")
    if req.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot accept your own blood request.")
    req.status = "Accepted"
    req.accepted_by = current_user.id
    
    db.commit()
    
    return {"message": f"Success! You have accepted the request for {req.units_needed} units of {req.blood_group}."}