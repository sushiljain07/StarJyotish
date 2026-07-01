"""
Baseline security response headers, applied to every backend response.

This is a pure ASGI middleware (not a dependency) so it runs on every
response regardless of route — including 404s, 503s from the
RuntimeError/RateLimitExceeded handlers in main.py, and FastAPI's own
/docs, /redoc, /openapi.json.

What's intentionally NOT here:
  - Content-Security-Policy on /docs, /redoc: FastAPI's default Swagger UI
    and ReDoc load their JS/CSS from cdn.jsdelivr.net. A strict same-origin
    CSP would silently break those pages. Since this is a JSON API (the
    only HTML FastAPI itself serves is those two docs pages), the simplest
    correct fix is to skip CSP specifically for those paths rather than
    widen the policy for the entire API.
  - Strict-Transport-Security is safe to send unconditionally: browsers
    only ever act on it when it arrives over a connection that was already
    HTTPS, so it's inert (not wrong) for local http://localhost dev.
"""
from starlette.types import ASGIApp, Receive, Scope, Send

_DOCS_PATHS = ("/docs", "/redoc", "/openapi.json")

_SECURITY_HEADERS = {
    b"x-content-type-options": b"nosniff",
    # This is a JSON API with no legitimate reason to be framed by another
    # site — DENY rather than SAMEORIGIN.
    b"x-frame-options": b"DENY",
    b"referrer-policy": b"strict-origin-when-cross-origin",
    # Locks down browser features this API has no reason to touch. Extend
    # this list if a future feature genuinely needs one of these.
    b"permissions-policy": b"geolocation=(), camera=(), microphone=(), payment=()",
    # 1 year, apply to subdomains, eligible for browser preload lists.
    b"strict-transport-security": b"max-age=31536000; includeSubDomains; preload",
}

# Same-origin JSON responses only reference themselves; connect-src 'self'
# covers that. default-src 'none' + frame-ancestors 'none' is the strict
# baseline for an API that serves no first-party HTML pages of its own
# (docs/redoc are excluded above and get no CSP at all).
_API_CSP = b"default-src 'none'; frame-ancestors 'none'; connect-src 'self'"


class SecurityHeadersMiddleware:
    """Adds baseline security headers (CSP/HSTS/nosniff/etc.) to every response."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        is_docs_path = path.startswith(_DOCS_PATHS)

        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                headers = message.setdefault("headers", [])
                for key, value in _SECURITY_HEADERS.items():
                    headers.append((key, value))
                if not is_docs_path:
                    headers.append((b"content-security-policy", _API_CSP))
            await send(message)

        await self.app(scope, receive, send_with_headers)
