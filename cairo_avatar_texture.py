# python_scripts/cairo_avatar_texture.py
import cairo

class CairoAvatarTextureGenerator:
    def __init__(self, resolution=128):
        self.res = resolution

    def create_player_head_texture(self, base_color_rgb=(0.85, 0.68, 0.53), output_path="avatar_cairo.png"):
        """Generates a structured skin texture layout using vector drawing."""
        surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, self.res, self.res)
        ctx = cairo.Context(surface)

        # Base Skin Fill
        r, g, b = base_color_rgb
        ctx.set_source_rgb(r, g, b)
        ctx.paint()

        unit = self.res / 64.0

        # Eyes (White area)
        ctx.set_source_rgb(1.0, 1.0, 1.0)
        ctx.rectangle(16 * unit, 24 * unit, 12 * unit, 8 * unit)
        ctx.rectangle(36 * unit, 24 * unit, 12 * unit, 8 * unit)
        ctx.fill()

        # Pupils (Blue)
        ctx.set_source_rgb(0.2, 0.4, 0.8)
        ctx.rectangle(20 * unit, 26 * unit, 6 * unit, 6 * unit)
        ctx.rectangle(40 * unit, 26 * unit, 6 * unit, 6 * unit)
        ctx.fill()

        # Mouth
        ctx.set_source_rgb(0.5, 0.25, 0.2)
        ctx.rectangle(24 * unit, 44 * unit, 16 * unit, 4 * unit)
        ctx.fill()

        surface.write_to_png(output_path)
        print(f"[CairoAvatarTextureGenerator] Saved avatar texture to {output_path}")

if __name__ == "__main__":
    gen = CairoAvatarTextureGenerator()
    gen.create_player_head_texture()
    