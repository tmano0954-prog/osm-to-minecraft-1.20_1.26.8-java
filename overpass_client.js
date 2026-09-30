window.fetchOSMData = async (bounds) => {
    const bboxStr = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    const query = `
        [out:json][timeout:25];
        (
          way["highway"](${bboxStr});
          way["building"](${bboxStr});
          node["power"="pole"](${bboxStr});
          way["power"="line"](${bboxStr});
          node["highway"="traffic_signals"](${bboxStr});
        );
        out body; >; out skel qt;
    `;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
    });
    return await response.json();
};
