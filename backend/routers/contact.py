"""
Contact Us form submission — replaces the frontend's old mailto: link
(see frontend/src/pages/ContactUs.jsx) now that Resend is already wired
up for OTP email and reusing it here is a small addition.
"""
import re

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field, field_validator

from services.contact_email import send_contact_email
from services.rate_limit import limiter, CONTACT_LIMIT

router = APIRouter()

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class ContactSubmission(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=320)
    subject: str = Field(default="", max_length=300)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        # Same lightweight pattern the frontend already uses (see
        # PhoneOtpForm.jsx's isEmail()) rather than pulling in the
        # email-validator package for one form field.
        if not _EMAIL_RE.match(v.strip()):
            raise ValueError("Enter a valid email address")
        return v.strip()


@router.post("/contact")
@limiter.limit(CONTACT_LIMIT)
def submit_contact_form(request: Request, body: ContactSubmission):
    send_contact_email(
        name=body.name.strip(),
        email=body.email,
        subject=body.subject.strip(),
        message=body.message.strip(),
    )
    return {"sent": True}
