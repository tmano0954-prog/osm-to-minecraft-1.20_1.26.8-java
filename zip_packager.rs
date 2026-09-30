use std::io::Write;
use zip::write::FileOptions;

pub fn package_world(mca_data: Vec<u8>, level_data: Vec<u8>, icon_data: Vec<u8>) -> Vec<u8> {
    let mut buf = Vec::new();
    {
        let mut zip = zip::ZipWriter::new(std::io::Cursor::new(&mut buf));
        let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

        let _ = zip.start_file("OSM_World/level.dat", options);
        let _ = zip.write_all(&level_data);

        let _ = zip.start_file("OSM_World/icon.png", options);
        let _ = zip.write_all(&icon_data);

        let _ = zip.start_file("OSM_World/region/r.0.0.mca", options);
        let _ = zip.write_all(&mca_data);

        let _ = zip.finish();
    }
    buf
}
