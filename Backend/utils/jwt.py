from jose import jwt,JWTError
from datetime import datetime,timedelta,timezone

s_k="this-my-secreate-key-which-is-developed-for-the-token"
algo="HS256"
def tokengen(username:str) -> str:
    payload={
        "sub":username,
        "exp":datetime.now(timezone.utc)+timedelta(minutes=30)
    }
    return jwt.encode(payload,s_k,algorithm=algo)

def token_verify(token: str) ->str:
    try:
        payload=jwt.decode(token,s_k,algorithms=[algo])
        username=payload.get("sub")
        if not username:
            raise JWTError("invaild token")
        return username
    except JWTError:
        raise JWTError("token exipered")
    