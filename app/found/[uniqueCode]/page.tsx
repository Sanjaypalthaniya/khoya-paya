import { notFound } from "next/navigation";
import FinderPageClient from "@/components/found/FinderPageClient";
import { prisma } from "@/lib/prisma";

type FoundPageProps = {
  params: Promise<{ uniqueCode: string }>;
};

export default async function FoundPage({ params }: FoundPageProps) {
  const { uniqueCode } = await params;
  const qrCode = await prisma.qRCode.findUnique({
    where: { uniqueCode },
    include: {
      item: {
        select: {
          itemName: true,
          category: true,
          status: true,
          lostModeEnabled: true,
          rewardAmount: true,
        },
      },
    },
  });

  if (!qrCode) {
    notFound();
  }

  return (
    <FinderPageClient
      uniqueCode={uniqueCode}
      item={{
        itemName: qrCode.item.itemName,
        category: qrCode.item.category,
        status: qrCode.item.status,
        lostModeEnabled: qrCode.item.lostModeEnabled,
        rewardAmount: qrCode.item.rewardAmount ? qrCode.item.rewardAmount.toString() : null,
      }}
    />
  );
}
