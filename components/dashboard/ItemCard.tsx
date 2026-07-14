import ItemActions from "@/components/dashboard/ItemActions";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Image from "next/image";

type ItemCardProps = {
  item: {
    id: string;
    itemName: string;
    category: string;
    imageUrl: string | null;
    status: string;
    lostModeEnabled: boolean;
    createdAt: Date;
    qrCode: { id: string } | null;
  };
};

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <article className="dashboard-item-card">
      <div className="item-card-image-wrap">
        {item.imageUrl ? <Image className="item-card-image" src={item.imageUrl} alt={item.itemName} width={640} height={400} unoptimized /> : <div className="item-image-fallback">No Image</div>}
      </div>
      <div className="message-card-head">
        <div>
          <StatusBadge status={item.status} />
          <h3>{item.itemName}</h3>
          <small>{item.category} • {item.createdAt.toLocaleDateString()}</small>
        </div>
      </div>
      <div className="item-badge-row">
        <span>{item.lostModeEnabled ? "Lost Mode On" : "Lost Mode Off"}</span>
        <span>{item.qrCode ? "QR Generated" : "No QR"}</span>
      </div>
      <ItemActions itemId={item.id} hasQr={Boolean(item.qrCode)} lostModeEnabled={item.lostModeEnabled} />
    </article>
  );
}
