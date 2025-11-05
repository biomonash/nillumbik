FROM node:25-bookworm-slim AS build-frontend

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN yarn install --frozen-lockfile

COPY frontend ./
RUN yarn build

FROM golang:1.24-alpine AS build-backend

WORKDIR /build
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend ./
COPY --from=build-frontend /build/dist assets/dist
RUN go build -o nillumbik cmd/api/main.go

FROM scratch AS prod
WORKDIR /app
COPY --from=build-backend /build/nillumbik /app/nillumbik
ENTRYPOINT [ "/app/nillumbik" ]
