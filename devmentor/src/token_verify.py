import jwt
from config.env import settings


def verify_token(token: str):

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload

    except jwt.ExpiredSignatureError:
        return {"message": "Token has expired"}

    except jwt.InvalidTokenError:
        return {"message": "Invalid token"}
