use std::io::Result;

fn main() -> Result<()> {
    // Generate Rust code from protobuf definitions
    prost_build::Config::new()
        .out_dir("src/generated")
        .compile_protos(
            &[
                "proto/core.proto",
                "proto/networking.proto",
            ],
            &["proto/"],
        )?;

    println!("cargo:rerun-if-changed=proto/core.proto");
    println!("cargo:rerun-if-changed=proto/networking.proto");

    Ok(())
}
