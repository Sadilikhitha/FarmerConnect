"""
Email service for sending Gmail verification OTPs.
"""

import os
import smtplib

from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_verification_email(
    recipient_email: str,
    otp: str
):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_EMAIL and SMTP_PASSWORD are not configured."
        )

    message = EmailMessage()

    message["Subject"] = "FarmerConnect - Email Verification"
    message["From"] = SMTP_EMAIL
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

Welcome to FarmerConnect!

Your email verification OTP is:

{otp}

This OTP is valid for 10 minutes.

If you did not create a FarmerConnect account, you can ignore this email.

Regards,
FarmerConnect Team
"""
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(message)