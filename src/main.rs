#[allow(warnings, unused)]
mod db;
mod error;
mod routes;

use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();
    dotenv::from_filename(".env.local").ok();

    let host = env::var("HOST").unwrap_or("127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or("8000".to_string());
    let addr = format!("{host}:{port}");

    run_server(&addr).await;
    println!("Server is running at {addr}");
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
