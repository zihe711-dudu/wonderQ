export async function fileToResizedDataUrl(
  file: File,
  width = 900,
  height = 600,
  mime: string = "image/webp",
  quality = 0.82
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  return await resizeDataUrl(dataUrl, width, height, mime, quality);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("讀取圖片失敗"));
    reader.readAsDataURL(file);
  });
}

export function resizeDataUrl(
  src: string,
  width = 900,
  height = 600,
  mime: string = "image/webp",
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("無法建立畫布內容"));
          return;
        }
        // 以 cover 方式置中裁切，確保 3:2 固定尺寸
        const scale = Math.max(width / img.width, height / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const dx = (width - drawWidth) / 2;
        const dy = (height - drawHeight) / 2;
        // 白底避免透明背景
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        const out = canvas.toDataURL(mime, quality);
        resolve(out);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("載入圖片失敗"));
    img.src = src;
  });
}


