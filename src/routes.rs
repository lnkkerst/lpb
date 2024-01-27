use axum::{routing, Extension, Router};
use std::sync::Arc;

use crate::{
    db::{self, PrismaClient},
    handlers::{paste, web::web_static_handler},
};

type Database = Extension<Arc<PrismaClient>>;

pub async fn create_router() -> Router {
    let prisma_client = Arc::new(db::new_client().await.unwrap());

    let router = Router::new()
        .fallback(web_static_handler)
        .route("/", routing::get(web_static_handler))
        .route("/", routing::post(paste::create_paste))
        .route("/r", routing::post(paste::create_paste))
        .route("/r/:paste_id", routing::get(paste::get_paste))
        .layer(Extension(prisma_client));

    router
}
