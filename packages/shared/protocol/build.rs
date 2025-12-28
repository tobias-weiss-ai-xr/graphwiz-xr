use std::io::Result;

fn main() -> Result<()> {
    // Set protoc path to downloaded binary
    std::env::set_var("PROTOC", "/home/weiss/tmp/protoc/bin/protoc");

    // Get the manifest directory to use absolute paths
    let manifest_dir = std::path::PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let proto_dir = manifest_dir.join("proto");

    // Get OUT_DIR for generated files
    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());

    // Generate Rust code from protobuf definitions
    prost_build::Config::new()
        .out_dir(&out_dir)
        .compile_well_known_types()
        .extern_path(".google.protobuf", "::prost_types")
        .file_descriptor_set_path(out_dir.join("file_descriptor_set.bin"))
        .compile_protos(
            &[
                proto_dir.join("core.proto"),
                proto_dir.join("networking.proto"),
                proto_dir.join("room.proto"),
                proto_dir.join("media.proto"),
                proto_dir.join("auth.proto"),
            ],
            &[proto_dir],
        )?;

    println!("cargo:rerun-if-changed=proto/core.proto");
    println!("cargo:rerun-if-changed=proto/networking.proto");
    println!("cargo:rerun-if-changed=proto/room.proto");
    println!("cargo:rerun-if-changed=proto/media.proto");
    println!("cargo:rerun-if-changed=proto/auth.proto");

    Ok(())
}
