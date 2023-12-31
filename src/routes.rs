use axum::{
    extract::{Multipart, Path},
    http::{HeaderMap, StatusCode},
    routing, Extension, Json, Router,
};
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::{
    db::{self, PrismaClient},
    handlers::web::web_static_handler,
};

type Database = Extension<Arc<PrismaClient>>;

pub async fn create_router() -> Router {
    let prisma_client = Arc::new(db::new_client().await.unwrap());

    let router = Router::new()
        .fallback(web_static_handler)
        .route("/", routing::get(web_static_handler))
        .route("/", routing::post(create_paste))
        .route("/r", routing::post(create_paste))
        .route("/r/:paste_id", routing::get(get_paste))
        .layer(Extension(prisma_client));

    router
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PasteCreatePayload {
    file: String,
}

async fn create_paste(
    db: Database,
    headers: HeaderMap,
    mut payload: Multipart,
) -> Result<Json<Value>, StatusCode> {
    while let Some(field) = payload.next_field().await.unwrap() {
        let name = field.name().ok_or(StatusCode::BAD_REQUEST)?.to_string();
        let data = field
            .text()
            .await
            .map_err(|_| StatusCode::BAD_REQUEST)?
            .to_string();

        if name == "file" {
            let mut paste_id = generate_random_string(5);
            loop {
                if let Some(_) = db
                    .paste()
                    .find_unique(db::paste::id::equals(paste_id.to_owned()))
                    .exec()
                    .await
                    .unwrap()
                {
                    paste_id = generate_random_string(5);
                } else {
                    break;
                }
            }
            db.paste()
                .create(data, vec![db::paste::id::set(paste_id.to_owned())])
                .exec()
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let host = {
                match headers.get("Host") {
                    Some(val) => val.to_str().unwrap_or(""),
                    None => "",
                }
            };

            let proto = {
                match headers.get("X-Forwarded-Proto") {
                    Some(val) => val.to_str().unwrap_or("http"),
                    None => "http",
                }
            };

            return Ok(Json(
                json!({"paste_id": paste_id, "url": format!("{}://{}/r/{}", proto, host, paste_id)}),
            ));
        }
    }

    Err(StatusCode::BAD_REQUEST)
}

async fn get_paste(db: Database, Path(paste_id): Path<String>) -> Result<String, StatusCode> {
    Ok(db
        .paste()
        .find_unique(db::paste::id::equals(paste_id))
        .exec()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?
        .content
        .to_string())
}

fn generate_random_string(length: usize) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let mut rng = thread_rng();

    let random_string: String = (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect();

    random_string
}
