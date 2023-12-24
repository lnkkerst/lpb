use std::{env, process::Command};

fn main() {
    let current_dir = env::current_dir().expect("Failed to get current directory");

    let web_dir = current_dir.join("web");

    let output = Command::new("pnpm")
        .args(&["run", "build"])
        .current_dir(web_dir)
        .output()
        .expect("Failed to build web");

    if !output.status.success() {
        panic!("Failed to build web");
    }
}
