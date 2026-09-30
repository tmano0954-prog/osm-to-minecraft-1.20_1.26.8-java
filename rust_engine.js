/**
 * rust_engine.js
 * JavaScript interface and loader for the compiled Rust WebAssembly module (osm_to_minecraft_bg.wasm).
 * Target Versions: Minecraft 1.20 - 1.26.8
 */

class RustEngine {
  constructor() {
    this.wasmInstance = null;
    this.engine = null;
    this.isInitialized = false;
  }

  /**
   * Asynchronously loads and initializes the Wasm module and memory.
   * @param {string} targetVersion Range target (default: "1.26.8")
   */
  async init(targetVersion = "1.26.8") {
    try {
      // Import the wasm-pack generated JS glue module
      const wasmModule = await import('./pkg/osm_to_minecraft.js');
      
      // Initialize WebAssembly binary
      await wasmModule.default('./pkg/osm_to_minecraft_bg.wasm');

      // Instantiate WasmVoxelEngine struct from Rust
      this.wasmInstance = wasmModule;
      this.engine = new wasmModule.WasmVoxelEngine(targetVersion);
      this.isInitialized = true;
      
      console.log("[RustEngine] WebAssembly Voxel Engine initialized successfully.");
      return true;
    } catch (err) {
      console.error("[RustEngine] Failed to initialize Wasm module:", err);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Sends raw OSM JSON and Bounding Box data to Rust for fast multithreaded voxelization.
   * @param {Object} osmData Raw Overpass JSON response object
   * @param {Object} bounds Bounding box coordinates {minLat, maxLat, minLon, maxLon}
   * @returns {Array<Object>|null} Parsed array of voxel blocks {x, y, z, state}
   */
  processOsmToVoxels(osmData, bounds) {
    if (!this.isInitialized) {
      throw new Error("[RustEngine] Wasm engine is not initialized. Call init() first.");
    }

    try {
      const osmJsonStr = JSON.stringify(osmData);
      const boundsJsonStr = JSON.stringify(bounds);

      // Execute high-performance Rust rasterization
      const voxelResultJson = this.engine.process_osm_to_voxels(osmJsonStr, boundsJsonStr);
      return JSON.parse(voxelResultJson);
    } catch (err) {
      console.error("[RustEngine] Error processing OSM data in Wasm:", err);
      return null;
    }
  }

  /**
   * Calls Rust zip_packager to build DataPack .zip bytes directly inside Wasm memory.
   * @param {Array<Object>} voxelBlocks Array of voxel blocks
   * @returns {Uint8Array|null} Compressed ZIP byte array ready for browser download
   */
  generateDataPackZip(voxelBlocks) {
    if (!this.isInitialized) {
      throw new Error("[RustEngine] Wasm engine is not initialized.");
    }

    try {
      const voxelJsonStr = JSON.stringify(voxelBlocks);
      
      // Returns raw Uint8Array from Wasm memory buffer
      const zipBytes = this.engine.generate_datapack_zip(voxelJsonStr);
      return new Uint8Array(zipBytes);
    } catch (err) {
      console.error("[RustEngine] Error generating ZIP archive in Wasm:", err);
      return null;
    }
  }
}

// Export for ES6 modules or attach to global window
if (typeof module !== "undefined" && module.exports) {
  module.exports = RustEngine;
} else {
  window.RustEngine = RustEngine;
}
