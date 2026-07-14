"use client";

import Image from "next/image";

type PrintItem = {
  id: string;
  itemName: string;
  category: string;
  qrCode: { imageUrl: string | null; publicUrl: string } | null;
};

export default function QRPrintSheet({ items }: { items: PrintItem[] }) {
  return (
    <>
      <div className="print-actions">
        <button className="btn btn-primary-kp btn-sm-pill" onClick={() => window.print()} type="button">Print QR Sheet</button>
      </div>
      <div className="qr-print-sheet">
        {items.map((item) => (
          <article className="qr-print-block" key={item.id}>
            {item.qrCode?.imageUrl ? <Image src={item.qrCode.imageUrl} alt={`${item.itemName} QR`} width={240} height={240} unoptimized /> : <div>No QR</div>}
            <h3>{item.itemName}</h3>
            <p>{item.category}</p>
            <strong>Khoya Paya</strong>
            <small>Scan to return this item safely</small>
          </article>
        ))}
      </div>
    </>
  );
}
