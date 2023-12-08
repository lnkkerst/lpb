FROM rust:1-alpine as build-stage
WORKDIR /app
COPY src Cargo.toml Cargo.lock prisma ./
RUN apk add pkgconf && cargo build --release --bin lpb

FROM alpine:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/target/release/lpb ./
EXPOSE 3000
CMD ["./lpb"]
