#[allow(warnings, unused)]
mod db;
mod error;
mod handlers;
mod routes;
mod utils;

use dotenv::dotenv;
use std::env;
use tokio::signal;

#[tokio::main]
async fn main() {
    dotenv::from_filename(".env.local").ok();
    dotenv().ok();

    let mut term = signal::unix::signal(signal::unix::SignalKind::terminate())
        .expect("Failed to register SIGTERM handler");

    tokio::spawn(async move {
        term.recv().await;
        std::process::exit(0);
    });

    let host = env::var("HOST").unwrap_or("127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or("8000".to_string());
    let addr = format!("{host}:{port}");

    println!("Server is running at {addr}");
    run_server(&addr).await;
}

async fn run_server(uri: &str) {
    tracing_subscriber::fmt::init();

    let listener = tokio::net::TcpListener::bind(uri)
        .await
        .expect("Failed to listen");

    let app = routes::create_router().await;

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
