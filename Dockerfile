FROM rust:1.74 as build-stage
WORKDIR /app
COPY ./src ./src
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml
COPY ./prisma ./prisma
COPY ./.cargo ./.cargo
COPY ./.env ./.env
COPY ./.env.local ./.env.local
COPY ./web ./web
RUN cargo prisma generate && cargo prisma migrate deploy && cargo build --release --bin lpb

FROM ubuntu:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/target/release/lpb ./lpb
COPY --from=build-stage /app/.env ./.env
COPY --from=build-stage /app/.env.local ./.env.local
COPY --from=build-stage /app/prisma/db ./db
EXPOSE 3000
CMD ["./lpb"]
