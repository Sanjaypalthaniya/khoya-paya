"use client";

import Image from "next/image";

type QRCodePreviewProps = {
  imageUrl: string;
  publicUrl: string;
};

export default function QRCodePreview({ imageUrl, publicUrl }: QRCodePreviewProps) {
  async function copyUrl() {
    await navigator.clipboard.writeText(publicUrl);
  }

  function downloadPng() {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "khoya-paya-qr.png";
    link.click();
  }

  return (
    <div className="qr-preview-card">
      <Image src={imageUrl} alt="Khoya Paya QR code" width={320} height={320} unoptimized />
      <p>{publicUrl}</p>
      <div className="item-actions justify-content-center">
        <button className="btn btn-secondary-kp btn-sm-pill" type="button" onClick={copyUrl}>Copy Public URL</button>
        <button className="btn btn-primary-kp btn-sm-pill" type="button" onClick={downloadPng}>Download QR PNG</button>
      </div>
    </div>
  );
}
