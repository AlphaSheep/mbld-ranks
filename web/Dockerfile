# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY ./src ./src
COPY .parcelrc ./

RUN npm run build

COPY ./analytics* ./
RUN ./analytics.sh


# Stage 2: Serve
FROM nginx:1.25

COPY --from=build /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
