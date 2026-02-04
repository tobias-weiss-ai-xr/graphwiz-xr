use std::io::Result;

fn main() -> Result<()> {
    // Re-build protobuf files when they change
    println!("cargo:rerun-if-changed=../../shared/protocol/proto/agent.proto");

    tonic_build::configure()
        .build_server(true)
        .build_client(true)
        .compile(&["../../shared/protocol/proto/agent.proto"], &["../../shared/protocol/proto"])?;

    Ok(())
}
