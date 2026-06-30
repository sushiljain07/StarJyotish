"""
Verifies a Google "Sign in with Google" ID token server-side. The frontend
(GoogleLoginButton.jsx, via @react-oauth/google) only ever hands this
backend the ID token Google itself issued — the backend never sees or
trusts anything else about the sign-in. google.oauth2.id_token.verify_*
checks the token's signature against Google's published public keys,
*and* that it was issued for this app's client ID — the second check
matters because without it, a valid Google ID token issued to a
completely different app would also pass verification here.
"""
import os
from dataclasses import dataclass
from typing import Optional

from fastapi import HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token


@dataclass
class GoogleProfile:
    sub: str
    email: Optional[str]
    email_verified: bool
    name: Optional[str]


def verify_google_id_token(token: str) -> GoogleProfile:
    client_id = (os.getenv("GOOGLE_CLIENT_ID") or "").strip()
    if not client_id:
        raise RuntimeError(
            "GOOGLE_CLIENT_ID is not configured. Set it in backend/.env "
            "(see .env.example) before enabling Google login."
        )
    try:
        claims = google_id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
    except ValueError:
        # Covers every failure mode verify_oauth2_token raises for
        # (expired, bad signature, wrong audience/client id, malformed) —
        # all of them mean exactly one thing to the caller: reject this
        # login attempt with the same generic 401.
        raise HTTPException(status_code=401, detail="Invalid Google login. Please try again.")

    return GoogleProfile(
        sub=claims["sub"],
        email=claims.get("email"),
        email_verified=bool(claims.get("email_verified", False)),
        name=claims.get("name"),
    )
