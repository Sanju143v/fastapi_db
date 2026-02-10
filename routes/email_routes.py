from fastapi import APIRouter,Depends 
from utils.email_sender import send_email
from sqlalchemy.orm import session
from db import get_db

router=APIRouter()

@router.post("/send-email")
def send_email_route(receiver_email:str,subject:str,content:str,db:session=Depends(get_db)):
    """send email to a specific receiver"""
    send_email(receiver_email,subject,content)
    return {"message":"Email sent successfully"}