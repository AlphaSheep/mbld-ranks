# Stage 1: Build
FROM python:3.14-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
ENV UV_LINK_MODE=copy
RUN uv sync --locked --no-dev --no-install-project --no-editable

COPY . .
RUN uv sync --locked --no-dev

# Stage 2: Runtime
FROM python:3.14-slim

ARG API_VERSION=0.0.0

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv

COPY . .

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"
ENV API_VERSION=${API_VERSION}

CMD ["python", "-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
