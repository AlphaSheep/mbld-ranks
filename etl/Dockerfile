# Stage 1: Build
FROM python:3.14-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /code

COPY pyproject.toml uv.lock ./
ENV UV_LINK_MODE=copy
RUN uv sync --locked --no-dev --no-install-project --no-editable

COPY . .
RUN uv sync --locked --no-dev

# Stage 2: Runtime
FROM python:3.14

WORKDIR /code

COPY --from=builder /code/.venv /code/.venv

COPY ./*.py /code/

ENV VIRTUAL_ENV=/code/.venv
ENV PATH="/code/.venv/bin:$PATH"

CMD ["python", "-m", "run"]
