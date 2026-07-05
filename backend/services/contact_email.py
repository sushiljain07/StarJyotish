"""
Email delivery for the Contact Us form, via Resend — same provider and
credentials as services/email_otp.py's OTP emails, but kept as its own
module rather than extending that one: OTP delivery is a hot, well-tested
path (every login goes through it), and this is a low-traffic form that
doesn't need to share code with it to stay simple. Some duplication of the
Resend HTTP call is the trade-off, and it's a small one.

Setup: same Resend account/domain as email_otp.py — RESEND_API_KEY and
RESEND_FROM_EMAIL are already configured for OTP and are reused here.
CONTACT_INBOX_EMAIL is the address that receives submissions (defaults to
the address already shown on the Contact page).
"""
import logging
import os

import requests
from fastapi import HTTPException

logger = logging.getLogger("starjyotish.contact_email")

_RESEND_URL = "https://api.resend.com/emails"


def _escape(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def _html(name: str, email: str, subject: str, message: str) -> str:
    safe_name, safe_email, safe_subject, safe_message = (
        _escape(name), _escape(email), _escape(subject), _escape(message).replace("\n", "<br>")
    )
    return (
        "<!DOCTYPE html><html><head><meta charset='utf-8'></head>"
        "<body style='margin:0;padding:0;background:#f5f0e8;"
        "font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>"
        "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f5f0e8;padding:40px 16px;'>"
        "<tr><td align='center'>"
        "<table width='100%' style='max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;'>"
        "<tr><td style='background:#0f1117;padding:24px 32px;'>"
        "<p style='margin:0;color:#c9a227;font-size:13px;font-weight:700;"
        "letter-spacing:3px;text-transform:uppercase;'>Star Jyotish</p>"
        "<p style='margin:6px 0 0;color:#e8d5a3;font-size:18px;font-weight:600;'>New contact form message</p>"
        "</td></tr>"
        "<tr><td style='padding:28px 32px;'>"
        f"<p style='margin:0 0 4px;color:#888078;font-size:12px;text-transform:uppercase;letter-spacing:1px;'>From</p>"
        f"<p style='margin:0 0 16px;color:#0f1117;font-size:14px;'>{safe_name} &lt;{safe_email}&gt;</p>"
        f"<p style='margin:0 0 4px;color:#888078;font-size:12px;text-transform:uppercase;letter-spacing:1px;'>Subject</p>"
        f"<p style='margin:0 0 16px;color:#0f1117;font-size:14px;'>{safe_subject}</p>"
        f"<p style='margin:0 0 4px;color:#888078;font-size:12px;text-transform:uppercase;letter-spacing:1px;'>Message</p>"
        f"<p style='margin:0;color:#0f1117;font-size:14px;line-height:1.6;'>{safe_message}</p>"
        "</td></tr>"
        "</table></td></tr></table></body></html>"
    )


def send_contact_email(name: str, email: str, subject: str, message: str) -> str:
    """Send a Contact Us submission to the support inbox. Returns provider label used."""
    api_key = (os.getenv("RESEND_API_KEY") or "").strip()
    from_email = (os.getenv("RESEND_FROM_EMAIL") or "info@starjyotish.com").strip()
    inbox = (os.getenv("CONTACT_INBOX_EMAIL") or "contact@starjyotish.com").strip()

    if not api_key:
        logger.warning(
            "RESEND_API_KEY not configured — logging contact submission to console. "
            "from=%s subject=%s", email, subject
        )
        return "dev-console"

    resp = requests.post(
        _RESEND_URL,
        json={
            "from": f"Star Jyotish Contact Form <{from_email}>",
            "to": [inbox],
            "reply_to": email,
            "subject": f"[Contact] {subject or 'New message from ' + name}",
            "html": _html(name, email, subject, message),
        },
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        timeout=10,
    )

    if resp.status_code >= 400:
        logger.error("Resend API error (contact form): %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(
            status_code=502,
            detail="Could not send your message right now. Please try again or email us directly.",
        )

    logger.info("Contact form email sent via Resend, from=%s", email)
    return "resend"
