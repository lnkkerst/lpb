use anyhow::anyhow;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

pub struct AppError {
    status_code: StatusCode,
    code: String,
    error: anyhow::Error,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            self.status_code,
            Json(json!({
                "code": self.code,
                "detail": format!("Something went wrong: {}", self.error)
            })),
        )
            .into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(value: E) -> Self {
        Self {
            status_code: StatusCode::INTERNAL_SERVER_ERROR,
            code: "unknown_error".to_string(),
            error: value.into(),
        }
    }
}

impl Default for AppError {
    fn default() -> Self {
        Self {
            status_code: StatusCode::INTERNAL_SERVER_ERROR,
            code: "unknown_error".to_string(),
            error: anyhow!("Unknown error"),
        }
    }
}

impl AppError {
    pub fn new<E>(status_code: StatusCode, code: &str, error: E) -> Self
    where
        E: Into<anyhow::Error>,
    {
        let status_code = status_code.clone();
        let error = error.into();
        let code = code.to_string();
        Self {
            status_code,
            code,
            error,
        }
    }
}
