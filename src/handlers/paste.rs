use std::sync::Arc;

use axum::{
    extract::{Multipart, Path},
    http::{HeaderMap, StatusCode},
    Extension, Json,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{
    db::{self, PrismaClient},
    utils::generate_random_string,
};

type Database = Extension<Arc<PrismaClient>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PasteCreatePayload {
    file: String,
}

pub async fn create_paste(
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
                .unwrap();
            // .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

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

pub async fn get_paste(db: Database, Path(paste_id): Path<String>) -> Result<String, StatusCode> {
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
