"""
Email service for sending FarmerConnect verification OTPs using Resend.
"""

import os
import resend

from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_verification_email(
    recipient_email: str,
    otp: str
):
    if not RESEND_API_KEY:
        raise RuntimeError(
            "RESEND_API_KEY is not configured."
        )

    params: resend.Emails.SendParams = {
        "from": "FarmerConnect <onboarding@resend.dev>",
        "to": [recipient_email],
        "subject": "FarmerConnect - Email Verification",
        "html": f"""
        <html>
            <body>
                <h2>Welcome to FarmerConnect!</h2>

                <p>Your email verification OTP is:</p>

                <h1>{otp}</h1>

                <p>This OTP is valid for <strong>10 minutes</strong>.</p>

                <p>
                    If you did not create a FarmerConnect account,
                    you can ignore this email.
                </p>

                <br>

                <p>
                    Regards,<br>
                    <strong>FarmerConnect Team</strong>
                </p>
            </body>
        </html>
        """
    }

    resend.Emails.send(params)