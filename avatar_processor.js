/**
 * avatar_processor.js
 * Browser and Node.js compatible avatar texture processor and player head NBT generator.
 * Targeted for Minecraft 1.20 - 1.26.8 DataPack and structure formats.
 */

class AvatarProcessor {
  constructor(targetVersion = "1.26.8") {
    this.targetVersion = targetVersion;
    this.corsProxy = "https://corsproxy.io/?"; // Optional CORS proxy for browser fetches
    this.mojangApiUrl = "https://api.mojang.com/users/profiles/minecraft/";
    this.sessionServerUrl = "https://sessionserver.mojang.com/session/minecraft/profile/";
  }

  /**
   * Fetches player UUID from Mojang API.
   * @param {string} username 
   * @returns {Promise<string|null>}
   */
  async getPlayerUUID(username) {
    try {
      const url = `${this.corsProxy}${encodeURIComponent(this.mojangApiUrl + username)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`UUID fetch failed: ${response.statusText}`);
      
      const data = await response.json();
      return data.id || null;
    } catch (err) {
      console.error(`[AvatarProcessor] Error fetching UUID for ${username}:`, err);
      return null;
    }
  }

  /**
   * Retrieves base64 skin texture property payload for Player Heads.
   * @param {string} uuid 
   * @returns {Promise<string|null>}
   */
  async getSkinTextureData(uuid) {
    if (!uuid) return null;
    try {
      const url = `${this.corsProxy}${encodeURIComponent(this.sessionServerUrl + uuid)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Texture fetch failed: ${response.statusText}`);

      const data = await response.json();
      const texturesProp = data.properties?.find(p => p.name === "textures");
      return texturesProp ? texturesProp.value : null;
    } catch (err) {
      console.error(`[AvatarProcessor] Error fetching texture data for UUID ${uuid}:`, err);
      return null;
    }
  }

  /**
   * Generates modern NBT block structure payload for custom Player Heads (1.20 - 1.26.8).
   * @param {string} username 
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @returns {Promise<Object>}
   */
  async generatePlayerHeadNBT(username, x = 0, y = 64, z = 0) {
    const uuid = await this.getPlayerUUID(username);
    const textureVal = await this.getSkinTextureData(uuid);

    const headData = {
      pos: [x, y, z],
      state: {
        Name: "minecraft:player_head",
        Properties: {
          rotation: "0"
        }
      },
      components: {
        "minecraft:profile": {
          name: username,
          id: uuid ? this.formatUUIDWithHyphens(uuid) : "00000000-0000-0000-0000-000000000000"
        }
      }
    };

    if (textureVal) {
      headData.components["minecraft:profile"].properties = [
        {
          name: "textures",
          value: textureVal
        }
      ];
    }

    return headData;
  }

  /**
   * Extracts raw RGBA pixel data from a player skin URL using HTML Canvas (Browser environment).
   * @param {string} skinUrl 
   * @returns {Promise<ImageData|null>}
   */
  async extractSkinPixels(skinUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, img.width, img.height));
      };
      img.onerror = () => {
        console.error("[AvatarProcessor] Failed to load skin image.");
        resolve(null);
      };
      img.src = skinUrl;
    });
  }

  /**
   * Helper to format raw 32-character hex UUID with standard hyphens.
   * @param {string} rawUuid 
   * @returns {string}
   */
  formatUUIDWithHyphens(rawUuid) {
    if (rawUuid.length !== 32) return rawUuid;
    return `${rawUuid.slice(0, 8)}-${rawUuid.slice(8, 12)}-${rawUuid.slice(12, 16)}-${rawUuid.slice(16, 20)}-${rawUuid.slice(20)}`;
  }
}

// Export for ES6 modules / Node environment or standard global script loading
if (typeof module !== "undefined" && module.exports) {
  module.exports = AvatarProcessor;
} else {
  window.AvatarProcessor = AvatarProcessor;
}
