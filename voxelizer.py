# python_scripts/voxelizer.py
# Mercator projection math and 3D voxel grid rasterizer for OpenStreetMap vector data.
# Targets modern Minecraft standards (1.20 - 1.26.8).

import math

class Voxelizer:
    def __init__(self, scale_m_per_block=1.0, base_y=64):
        """
        :param scale_m_per_block: Meters per Minecraft block (1.0 = 1:1 real-world scale)
        :param base_y: Baseline Y-level for terrain surface
        """
        self.scale = scale_m_per_block
        self.base_y = base_y
        self.EARTH_RADIUS_M = 6378137.0

    def lat_lon_to_web_mercator(self, lat, lon):
        """Converts geographic WGS84 Lat/Lon coordinates into Web Mercator meters (EPSG:3857)."""
        x = self.EARTH_RADIUS_M * math.radians(lon)
        lat_rad = math.radians(lat)
        y = self.EARTH_RADIUS_M * math.log(math.tan(math.pi / 4.0 + lat_rad / 2.0))
        return x, y

    def project_to_block_coords(self, lat, lon, origin_lat, origin_lon):
        """
        Projects Lat/Lon to relative integer block coordinates (X, Z) centered at a specified origin.
        """
        origin_x, origin_z_mercator = self.lat_lon_to_web_mercator(origin_lat, origin_lon)
        target_x, target_z_mercator = self.lat_lon_to_web_mercator(lat, lon)

        # Calculate relative delta in meters
        dx_m = target_x - origin_x
        dz_m = origin_z_mercator - target_z_mercator # Invert Z axis (North = -Z in Minecraft)

        block_x = int(round(dx_m / self.scale))
        block_z = int(round(dz_m / self.scale))
        return block_x, block_z

    def rasterize_building(self, outline_coords, origin_lat, origin_lon, height_m=12, wall_block="minecraft:gray_concrete", roof_block="minecraft:stone_slab"):
        """
        Rasterizes a 2D building polygon outline into a 3D hollow voxel structure.
        """
        block_nodes = []
        if len(outline_coords) < 3:
            return block_nodes

        # Convert polygon nodes to block space
        poly_points = [self.project_to_block_coords(pt['lat'], pt['lon'], origin_lat, origin_lon) for pt in outline_coords]
        
        building_height_blocks = max(1, int(round(height_m / self.scale)))
        min_y = self.base_y
        max_y = self.base_y + building_height_blocks

        # Extrude wall edges along polygon segments
        num_points = len(poly_points)
        for i in range(num_points):
            p1 = poly_points[i]
            p2 = poly_points[(i + 1) % num_points] # Loop back to close polygon

            # Bresenham-style line rasterization between points
            wall_blocks_2d = self._rasterize_line_2d(p1[0], p1[1], p2[0], p2[1])

            for bx, bz in wall_blocks_2d:
                # Vertical wall extrusion
                for y in range(min_y, max_y):
                    block_nodes.append({
                        "x": bx,
                        "y": y,
                        "z": bz,
                        "state": wall_block
                    })

                # Roof cap placement
                block_nodes.append({
                    "x": bx,
                    "y": max_y,
                    "z": bz,
                    "state": roof_block
                })

        return block_nodes

    def _rasterize_line_2d(self, x0, z0, x1, z1):
        """Bresenham's line algorithm for grid interpolation."""
        points = []
        dx = abs(x1 - x0)
        dz = abs(z1 - z0)
        sx = 1 if x0 < x1 else -1
        sz = 1 if z0 < z1 else -1
        err = dx - dz

        curr_x, curr_z = x0, z0
        while True:
            points.append((curr_x, curr_z))
            if curr_x == x1 and curr_z == z1:
                break
            e2 = 2 * err
            if e2 > -dz:
                err -= dz
                curr_x += sx
            if e2 < dx:
                err += dx
                curr_z += sz
        return points


if __name__ == "__main__":
    voxelizer = Voxelizer(scale_m_per_block=1.0, base_y=64)
    print("[Voxelizer] Python Web Mercator rasterizer initialized.")
    