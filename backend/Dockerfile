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
# --proxy-headers tells uvicorn to trust X-Forwarded-For from Railway's edge
# proxy, so request.client.host (which the rate limiter keys on) is the real
# visitor IP, not Railway's internal proxy IP for every request.
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --proxy-headers"]
