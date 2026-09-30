use wasm_bindgen::prelude::*;
mod osm_parser;
mod road_builder;
mod power_grid;
mod interior_gen;
mod traffic_signals;
mod anvil_writer;
mod icon_generator;
mod level_dat;
mod zip_packager;

#[wasm_bindgen]
pub fn generate_world_wasm(osm_json: &str, spawn_lat: f64, spawn_lng: f64, version_str: &str) -> Vec<u8> {
    // 1. Parse OSM Vector Json
    let elements = osm_parser::parse_osm(osm_json);
    
    // 2. Generate MCA Region File Data
    let mca_bytes = anvil_writer::build_region_file(&elements);
    
    // 3. Generate Level.dat
    let level_bytes = level_dat::create_level_dat(spawn_lat, spawn_lng, version_str);
    
    // 4. Generate Icon.png
    let icon_bytes = icon_generator::create_spawn_icon();
    
    // 5. Package World Save Into ZIP
    zip_packager::package_world(mca_bytes, level_bytes, icon_bytes)
}
