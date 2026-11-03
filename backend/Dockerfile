FROM python:3.11-slim

# pyswisseph ships only as a source tarball (no prebuilt wheel) and needs a C
# compiler at install time. Installing build-essential up front avoids a
# build failure on platforms whose default image doesn't include gcc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway injects $PORT at runtime; default to 8000 for local `docker run`.
# --proxy-headers tells uvicorn to read X-Forwarded-For, so request.client.host
# (which the rate limiter keys on) is the real visitor IP rather than the
# proxy's. Uvicorn only honours that header from FORWARDED_ALLOW_IPS, which
# defaults to 127.0.0.1 — Railway's edge proxy doesn't connect from loopback,
# so without this every visitor shared one rate-limit bucket. "*" is safe
# only because the container is reachable solely through Railway's proxy;
# override FORWARDED_ALLOW_IPS if this image is ever exposed directly.
ENV PORT=8000
ENV FORWARDED_ALLOW_IPS="*"
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips \"${FORWARDED_ALLOW_IPS}\""]
