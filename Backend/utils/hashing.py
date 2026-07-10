from passlib.context import CryptContext
pwd=CryptContext(schemes=["bcrypt"],deprecated="auto")
def hash_password(password : str) ->str:
    return pwd.hash(password)
def password_verify(p:str,h:str) -> str:
    return pwd.verify(p,h)