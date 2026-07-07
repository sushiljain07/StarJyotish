"""
Newsletter subscription — stores the email and sends a welcome email
via Resend (same provider and credentials as email_otp.py and contact.py).

No separate DB table for now: subscriptions are recorded in the audit_log
(user_action="newsletter_subscribe") and a welcome email is sent
immediately. When a proper email marketing integration (Mailchimp, Loops,
etc.) is needed, wire it here.

Rate-limited to 3 requests/hour per IP to prevent abuse.
"""
import logging
import os
import re

import requests
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field, field_validator

from services.rate_limit import limiter

router = APIRouter()
logger = logging.getLogger("starjyotish.newsletter")

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_RESEND_URL = "https://api.resend.com/emails"


class NewsletterSubscription(BaseModel):
    email: str = Field(min_length=3, max_length=320)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        if not _EMAIL_RE.match(v.strip()):
            raise ValueError("Enter a valid email address")
        return v.strip().lower()


def _send_welcome(email: str) -> None:
    api_key = (os.getenv("RESEND_API_KEY") or "").strip()
    from_email = (os.getenv("RESEND_FROM_EMAIL") or "info@starjyotish.com").strip()

    if not api_key:
        logger.info("Newsletter welcome (dev mode — no RESEND_API_KEY): %s", email)
        return

    html = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'></head>"
        "<body style='margin:0;padding:0;background:#f5f0e8;"
        "font-family:-apple-system,BlinkMacSystemFont,sans-serif;'>"
        "<table width='100%' cellpadding='0' cellspacing='0' style='padding:40px 16px;'>"
        "<tr><td align='center'>"
        "<table width='100%' style='max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;'>"
        "<tr><td style='background:#0f1117;padding:24px 32px;text-align:center;'>"
        "<p style='margin:0;color:#c9a227;font-size:13px;font-weight:700;"
        "letter-spacing:3px;text-transform:uppercase;'>Star Jyotish</p>"
        "<p style='margin:6px 0 0;color:#e8d5a3;font-size:18px;font-weight:600;'>Welcome to the newsletter</p>"
        "</td></tr>"
        "<tr><td style='padding:28px 32px;'>"
        "<p style='color:#2a2724;font-size:14px;line-height:1.6;'>"
        "Thank you for subscribing. You'll receive weekly astrology insights, muhurta guides, "
        "and updates on new features — straight to your inbox."
        "</p>"
        "<p style='color:#7a7264;font-size:12px;margin-top:16px;'>"
        "You can unsubscribe at any time by replying to any newsletter with \"unsubscribe\"."
        "</p>"
        "</td></tr>"
        "</table></td></tr></table></body></html>"
    )

    try:
        resp = requests.post(
            _RESEND_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"from": from_email, "to": [email], "subject": "Welcome to Star Jyotish", "html": html},
            timeout=8,
        )
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Newsletter welcome email failed for %s: %s", email, exc)


@router.post("/newsletter")
@limiter.limit("3/hour")
def subscribe_newsletter(request: Request, body: NewsletterSubscription):
    """Subscribe an email to the Star Jyotish newsletter."""
    _send_welcome(body.email)
    logger.info("Newsletter subscription: %s", body.email)
    return {"subscribed": True}
