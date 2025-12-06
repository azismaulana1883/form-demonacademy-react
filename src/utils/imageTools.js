// Resize base64 dengan maxWidth + kualitas
export function resizeBase64(base64, maxWidth = 720, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = img.width / img.height;

      canvas.width = maxWidth;
      canvas.height = maxWidth / ratio;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
  });
}

// Cek file valid (jenis + ukuran)
export function validateImageFile(file, maxSizeMB = 5) {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!validTypes.includes(file.type)) {
    return "Format tidak didukung. Gunakan JPEG/PNG/WebP.";
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `Ukuran file terlalu besar (${sizeMB.toFixed(2)}MB). Maksimal ${maxSizeMB}MB.`;
  }

  return null;
}
