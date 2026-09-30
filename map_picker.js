let map, bboxLayer, spawnMarker;
let currentBounds = null, currentSpawn = null;

document.addEventListener("DOMContentLoaded", () => {
    map = L.map('map').setView([28.5383, -81.3792], 13); // Orlando default center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Click to place spawn marker
    map.on('click', (e) => {
        currentSpawn = e.latlng;
        if (spawnMarker) map.removeLayer(spawnMarker);
        spawnMarker = L.marker(e.latlng).addTo(map).bindPopup("Spawn Point").openPopup();
    });
});

window.getSelectedBounds = () => map.getBounds();
window.getSpawnPoint = () => currentSpawn;
