"""
Email service for sending FarmerConnect verification OTPs using Resend.
"""

import os
import resend

from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY_1 = os.getenv("RESEND_API_KEY_1")
RESEND_API_KEY_2 = os.getenv("RESEND_API_KEY_2")


def send_verification_email(
    recipient_email: str,
    otp: str
):
    if not RESEND_API_KEY_1 and not RESEND_API_KEY_2:
        raise RuntimeError(
            "RESEND_API_KEY_1 and RESEND_API_KEY_2 are not configured."
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

    # Try Resend account/key 1 first
    if RESEND_API_KEY_1:
        try:
            resend.api_key = RESEND_API_KEY_1
            resend.Emails.send(params)
            print("Email sent using RESEND_API_KEY_1")
            return

        except Exception as e:
            print("RESEND_API_KEY_1 failed:", repr(e))

    # Try Resend account/key 2 if key 1 fails
    if RESEND_API_KEY_2:
        try:
            resend.api_key = RESEND_API_KEY_2
            resend.Emails.send(params)
            print("Email sent using RESEND_API_KEY_2")
            return

        except Exception as e:
            print("RESEND_API_KEY_2 failed:", repr(e))

    raise RuntimeError(
        "Email could not be sent using either Resend API key."
    )