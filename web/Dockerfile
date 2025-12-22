# Stage 1: Build
FROM oven/bun:1 AS build

WORKDIR /app

# We need nodejs for some parcel dependencies
RUN apt-get update && apt-get install -y nodejs

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY .parcelrc ./
COPY ./src ./src

RUN bun run build

COPY ./analytics* ./
RUN ./analytics.sh


# Stage 2: Serve
FROM nginx:1.25

COPY --from=build /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
