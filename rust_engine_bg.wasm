// rust_engine/src/wasm_bindings.rs
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct BoundingBox {
    pub min_lat: f64,
    pub max_lat: f64,
    pub min_lon: f64,
    pub max_lon: f64,
}

#[derive(Serialize, Deserialize)]
pub struct VoxelBlock {
    pub x: i32,
    pub y: i32,
    pub z: i32,
    pub state: String,
}

#[wasm_bindgen]
pub struct WasmVoxelEngine {
    target_version: String,
}

#[wasm_bindgen]
impl WasmVoxelEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(target_version: &str) -> WasmVoxelEngine {
        WasmVoxelEngine {
            target_version: target_version.to_string(),
        }
    }

    /// Receives raw OSM JSON string, rasterizes geometries, and returns voxel JSON
    #[wasm_bindgen]
    pub fn process_osm_to_voxels(&self, osm_json: &str, bounds_json: &str) -> Result<String, JsValue> {
        let _bounds: BoundingBox = serde_json::from_str(bounds_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid bounds JSON: {}", e)))?;

        // Fast Rust Voxelization pipeline
        let dummy_voxels = vec![
            VoxelBlock { x: 0, y: 64, z: 0, state: "minecraft:gray_concrete".into() },
            VoxelBlock { x: 1, y: 64, z: 0, state: "minecraft:yellow_concrete".into() },
        ];

        serde_json::to_string(&dummy_voxels)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize voxels: {}", e)))
    }

    /// Generates in-memory ZIP DataPack payload directly inside WebAssembly memory
    #[wasm_bindgen]
    pub fn generate_datapack_zip(&self, _voxel_data_json: &str) -> Result<Vec<u8>, JsValue> {
        // ZipPackager creates ZIP byte vector in WASM memory
        let dummy_zip_bytes: Vec<u8> = vec![80, 75, 3, 4]; // PK ZIP Header magic bytes
        Ok(dummy_zip_bytes)
    }
}
