window.downloadZip = (byteArr, fileName) => {
    const blob = new Blob([byteArr], { type: "application/zip" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};
