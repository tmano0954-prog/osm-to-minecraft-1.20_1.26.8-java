# python_scripts/cairo_map_renderer.py
import cairo
import json
import sys

class CairoMapRenderer:
    def __init__(self, width=2048, height=2048):
        self.width = width
        self.height = height

    def _lat_lon_to_pixel(self, lat, lon, bounds):
        """Maps Lat/Lon coordinates to pixel coordinates on the Cairo surface."""
        min_lat, max_lat = bounds['minLat'], bounds['maxLat']
        min_lon, max_lon = bounds['minLon'], bounds['maxLon']

        x_norm = (lon - min_lon) / (max_lon - min_lon) if max_lon != min_lon else 0.5
        y_norm = (max_lat - lat) / (max_lat - min_lat) if max_lat != min_lat else 0.5 # Inverted for Cairo

        px = x_norm * self.width
        py = y_norm * self.height
        return px, py

    def render_osm_layers(self, osm_elements, bounds, output_filepath="map_render.png"):
        """Draws landuse, highways, and buildings onto a Pycairo surface."""
        surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, self.width, self.height)
        ctx = cairo.Context(surface)

        # Base Grass Layer (#557a2b)
        ctx.set_source_rgb(0.33, 0.48, 0.17)
        ctx.paint()

        highways = [e for e in osm_elements if e.get('type') == 'highway']
        buildings = [e for e in osm_elements if e.get('type') == 'building']

        # Render Roads
        for hw in highways:
            coords = hw.get('coordinates', [])
            if len(coords) < 2:
                continue

            ctx.new_path()
            start_x, start_y = self._lat_lon_to_pixel(coords[0]['lat'], coords[0]['lon'], bounds)
            ctx.move_to(start_x, start_y)

            for pt in coords[1:]:
                px, py = self._lat_lon_to_pixel(pt['lat'], pt['lon'], bounds)
                ctx.line_to(px, py)

            hw_type = hw.get('tags', {}).get('highway', 'residential')
            if hw_type in ['motorway', 'trunk', 'primary']:
                ctx.set_source_rgb(0.2, 0.2, 0.2)
                ctx.set_line_width(12.0)
            else:
                ctx.set_source_rgb(0.35, 0.35, 0.35)
                ctx.set_line_width(6.0)

            ctx.set_line_cap(cairo.LINE_CAP_ROUND)
            ctx.set_line_join(cairo.LINE_JOIN_ROUND)
            ctx.stroke()

        # Render Buildings
        ctx.set_source_rgb(0.7, 0.7, 0.7)
        for bldg in buildings:
            coords = bldg.get('coordinates', [])
            if len(coords) < 3:
                continue

            ctx.new_path()
            start_x, start_y = self._lat_lon_to_pixel(coords[0]['lat'], coords[0]['lon'], bounds)
            ctx.move_to(start_x, start_y)

            for pt in coords[1:]:
                px, py = self._lat_lon_to_pixel(pt['lat'], pt['lon'], bounds)
                ctx.line_to(px, py)

            ctx.close_path()
            ctx.fill_preserve()
            ctx.set_source_rgb(0.4, 0.4, 0.4)
            ctx.set_line_width(2.0)
            ctx.stroke()

        surface.write_to_png(output_filepath)
        print(f"[CairoMapRenderer] Saved map render to {output_filepath}")

if __name__ == "__main__":
    renderer = CairoMapRenderer()
    print("CairoMapRenderer loaded successfully.")
    