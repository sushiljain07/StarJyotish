"""
Email delivery for OTP codes via Resend (https://resend.com).

Follows the exact same pattern as otp_provider.py (SMS):
  - RESEND_API_KEY set   -> sends a real email via the Resend API
  - RESEND_API_KEY unset -> logs the code to console (dev mode)

The OTP generate / hash / verify logic lives entirely in
db/repositories/otp_repository.py. This module only sends.

Setup:
  1. resend.com -> add domain starjyotish.com -> verify DNS
  2. Create an API key (Sending access only)
  3. Railway env vars: RESEND_API_KEY=re_xxx  RESEND_FROM_EMAIL=info@starjyotish.com
"""
import logging
import os

import requests
from fastapi import HTTPException

logger = logging.getLogger("starjyotish.email_otp")

_RESEND_URL = "https://api.resend.com/emails"


def _html(code: str) -> str:
    return (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'></head>"
        "<body style='margin:0;padding:0;background:#f5f0e8;"
        "font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>"
        "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f5f0e8;padding:40px 16px;'>"
        "<tr><td align='center'>"
        "<table width='100%' style='max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;'>"
        "<tr><td style='background:#0f1117;padding:28px 32px;text-align:center;'>"
        "<p style='margin:0;color:#c9a227;font-size:13px;font-weight:700;"
        "letter-spacing:3px;text-transform:uppercase;'>Star Jyotish</p>"
        "<p style='margin:6px 0 0;color:#e8d5a3;font-size:20px;font-weight:600;'>Your login code</p>"
        "</td></tr>"
        "<tr><td style='padding:40px 32px;text-align:center;'>"
        "<p style='margin:0 0 8px;color:#4a4540;font-size:14px;'>Use this code to sign in to Star Jyotish:</p>"
        "<div style='display:inline-block;background:#f5f0e8;border:2px solid #c9a227;"
        "border-radius:12px;padding:20px 40px;margin:16px 0;'>"
        f"<span style='font-size:40px;font-weight:700;letter-spacing:12px;"
        f"color:#0f1117;font-family:monospace;'>{code}</span>"
        "</div>"
        "<p style='margin:8px 0 0;color:#888078;font-size:13px;'>This code expires in 10 minutes.</p>"
        "</td></tr>"
        "<tr><td style='background:#f5f0e8;padding:20px 32px;border-top:1px solid #e8e0d0;'>"
        "<p style='margin:0;color:#888078;font-size:12px;text-align:center;'>"
        "If you did not request this code, you can safely ignore this email.</p>"
        "<p style='margin:12px 0 0;color:#aaa098;font-size:11px;text-align:center;'>"
        "Star Jyotish &middot; Ancient Wisdom, AI Intelligence</p>"
        "</td></tr>"
        "</table></td></tr></table></body></html>"
    )


def send_otp_email(email: str, code: str) -> str:
    """Send OTP to email via Resend. Returns provider label used."""
    api_key = (os.getenv("RESEND_API_KEY") or "").strip()
    from_email = (os.getenv("RESEND_FROM_EMAIL") or "info@starjyotish.com").strip()

    if not api_key:
        logger.warning(
            "RESEND_API_KEY not configured — logging OTP to console. "
            "email=%s code=%s", email, code
        )
        return "dev-console"

    resp = requests.post(
        _RESEND_URL,
        json={
            "from": f"Star Jyotish <{from_email}>",
            "to": [email],
            "subject": f"{code} is your Star Jyotish login code",
            "html": _html(code),
        },
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        timeout=10,
    )

    if resp.status_code >= 400:
        logger.error("Resend API error: %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(
            status_code=502,
            detail="Could not send OTP email. Please try again or use a phone number.",
        )

    logger.info("OTP email sent via Resend to %s", email)
    return "resend"
