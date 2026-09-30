# OSM to Minecraft World Generator (1.20 - 26.8)

An in-browser WebAssembly converter that translates OpenStreetMap (OSM) vector data, satellite imagery, and power infrastructure directly into fully populated, functional Minecraft world saves (`.mca` Anvil region files).

## Features
- **Map Selection:** Interactive bounding box and spawn location selector powered by Leaflet.js.
- **Infrastructure Parsing:** Renders asphalt roads, lane markings, rumbler strips, utility poles, hanging cable sag, and customizable traffic lights.
- **Interior Procedural Engine:** Divides 3D building polygons into multi-level floors with interior walls and furniture.
- **Spawn Customization:** Crops centered spawn previews for `icon.png` and injects custom player head skins onto spawn NPCs.
- **Version Compatibility:** Targets `DataVersion` headers spanning Minecraft 1.20 up to 26.8.

## Technology Stack
- **Frontend:** Single-page HTML5 / CSS3 / JavaScript + Leaflet.js
- **Voxel Engine:** Rust compiled to WebAssembly (`wasm-bindgen`)
- **Hosting:** GitHub Pages via GitHub Actions
