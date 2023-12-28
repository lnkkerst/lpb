FROM rust:1.74 as build-stage

WORKDIR /app

RUN cargo new --bin lpb
WORKDIR /app/lpb

COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml
RUN cargo build --release
RUN rm -r src

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./.cargo ./.cargo
COPY ./.env ./.env
COPY ./.env.local ./.env.local
COPY ./web ./web

RUN rm ./target/release/deps/lpb*
RUN cargo prisma generate && cargo prisma migrate deploy && cargo build --release --bin lpb

FROM ubuntu:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/lpb/target/release/lpb ./lpb
COPY --from=build-stage /app/lpb/.env ./.env
COPY --from=build-stage /app/lpb/.env.local ./.env.local
COPY --from=build-stage /app/lpb/prisma/db ./db
EXPOSE 3000
CMD ["./lpb"]
