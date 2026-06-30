"""
SMS delivery for OTP codes — MSG91 or 2Factor, both India-first SMS
providers chosen for low per-SMS cost. The OTP itself is generated and
verified entirely in db/repositories/otp_repository.py; this module's only
job is "send this 6-digit string to this phone number by SMS". That split
means swapping providers later, or adding a third one, never touches the
generate/verify/security logic at all.

Provider selection mirrors services/ai.py's _call_llm: presence of a key
decides the provider, with MSG91 preferred if both are configured (set
OTP_PROVIDER=2factor to force the other way around without removing
either key, e.g. while comparing delivery rates between the two).

In local dev with neither key set, send_otp_sms logs the code to the
console instead of calling out to a provider — the same "degrade
gracefully without optional config" pattern db/session.py uses for
DATABASE_URL, so OTP login is testable end-to-end on a laptop with zero
SMS spend.
"""
import logging
import os

import requests
from fastapi import HTTPException

logger = logging.getLogger("starjyotish.otp")

_MSG91_URL = "https://control.msg91.com/api/v5/flow/"
_TWOFACTOR_URL = "https://2factor.in/API/V1"


def _send_via_msg91(phone_number: str, code: str) -> None:
    auth_key = os.environ["MSG91_AUTH_KEY"]
    template_id = os.environ["MSG91_TEMPLATE_ID"]
    # MSG91's DLT-compliant "flow" API sends a pre-approved template with
    # variables filled in, rather than a freeform message body — required
    # for sending OTP SMS to Indian numbers under TRAI/DLT regulations.
    resp = requests.post(
        _MSG91_URL,
        json={
            "template_id": template_id,
            "short_url": "0",
            "recipients": [{"mobiles": phone_number.lstrip("+"), "OTP": code}],
        },
        headers={"authkey": auth_key, "Content-Type": "application/json"},
        timeout=10,
    )
    if resp.status_code >= 400:
        logger.error("MSG91 send failed: %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="Could not send OTP SMS. Please try again.")


def _send_via_2factor(phone_number: str, code: str) -> None:
    api_key = os.environ["TWOFACTOR_API_KEY"]
    # 2Factor's "SMS" (not "OTP") endpoint sends a plain message we control
    # — used here (rather than their auto-generated-OTP endpoint) so the
    # code in the SMS always matches the one this backend hashed and
    # stored, regardless of which provider is active.
    digits = phone_number.lstrip("+")
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    resp = requests.get(
        f"{_TWOFACTOR_URL}/{api_key}/SMS/{digits}/{code}/OTP1",
        timeout=10,
    )
    if resp.status_code >= 400 or resp.json().get("Status") != "Success":
        logger.error("2Factor send failed: %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="Could not send OTP SMS. Please try again.")


def send_otp_sms(phone_number: str, code: str) -> str:
    """Sends `code` to `phone_number` via whichever provider is
    configured. Returns the provider label actually used (handy for
    structured logging/metrics), matching _call_llm's (text, provider)
    convention in services/ai.py."""
    forced = (os.getenv("OTP_PROVIDER") or "").strip().lower()
    msg91_key = (os.getenv("MSG91_AUTH_KEY") or "").strip()
    twofactor_key = (os.getenv("TWOFACTOR_API_KEY") or "").strip()

    use_msg91 = bool(msg91_key) and forced != "2factor"
    use_2factor = bool(twofactor_key) and (forced == "2factor" or not use_msg91)

    if use_msg91:
        _send_via_msg91(phone_number, code)
        return "msg91"
    if use_2factor:
        _send_via_2factor(phone_number, code)
        return "2factor"

    logger.warning("No OTP provider configured (MSG91_AUTH_KEY/TWOFACTOR_API_KEY unset) — "
                    "logging code instead of sending SMS. phone=%s code=%s", phone_number, code)
    return "dev-console"
