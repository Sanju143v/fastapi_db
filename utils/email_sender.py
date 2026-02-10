import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
load_dotenv()
import os
app_password = os.getenv("APP_PASSWORD")
sender_email = os.getenv("SENDER_EMAIL")

if not app_password or not sender_email:
    raise ValueError("APP_PASSWORD or SENDER_EMAIL environment variable is not set.")
# Email details
def send_email(receiver_email: str, subject: str, content: str):
    """
    Send an email to a specified receiver.

    Args:
        receiver_email (str): The email address of the recipient.
        subject (str): The subject line of the email.
        content (str): The main body text of the email.
    """
    msg = EmailMessage()
    msg["From"] = sender_email
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.set_content(content)

    # Send email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, app_password)
        server.send_message(msg)

    print("Email sent successfully!")
if __name__ == "__main__":
    send_email(receiver_email="4mh23cs134@gmail.com",subject="Test Email from Python",content="Hello! This email was sent using Python.")