import { BillingCycle, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Free",
    slug: "free",
    description: "Basic QR recovery for personal use.",
    price: 0,
    currency: "INR",
    billingCycle: BillingCycle.FREE,
    itemLimit: 2147483647,
    features: ["Unlimited registered items", "Basic QR code", "Recovery ID", "Finder message support", "Basic dashboard"],
    isPopular: false,
  },
  {
    name: "Premium Monthly",
    slug: "premium-monthly",
    description: "Higher item limit with Lost Mode, scan alerts, rewards, and email alerts.",
    price: 199,
    currency: "INR",
    billingCycle: BillingCycle.MONTHLY,
    itemLimit: 25,
    features: ["25 registered items", "Lost Mode", "Scan alerts", "Reward note", "QR PDF download", "Email alerts"],
    isPopular: true,
  },
  {
    name: "Premium Yearly",
    slug: "premium-yearly",
    description: "Premium protection billed yearly.",
    price: 999,
    currency: "INR",
    billingCycle: BillingCycle.YEARLY,
    itemLimit: 25,
    features: ["25 registered items", "Lost Mode", "Scan alerts", "Reward note", "QR PDF download", "Email alerts"],
    isPopular: false,
  },
  {
    name: "Business Monthly",
    slug: "business-monthly",
    description: "Bulk QR management and business dashboard readiness.",
    price: 999,
    currency: "INR",
    billingCycle: BillingCycle.MONTHLY,
    itemLimit: 500,
    features: ["500 registered items", "Bulk QR management", "School/office dashboard readiness", "Team asset tracking readiness", "Priority support"],
    isPopular: false,
  },
  {
    name: "Business Custom",
    slug: "business-custom",
    description: "Custom plan for teams, schools, and offices.",
    price: 0,
    currency: "INR",
    billingCycle: BillingCycle.CUSTOM,
    itemLimit: 500,
    features: ["Custom onboarding", "Bulk QR management", "Team workflows", "Asset tracking readiness", "Priority support"],
    isPopular: false,
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, isActive: true },
      create: { ...plan, isActive: true },
    });
    console.log(`Seeded plan: ${plan.name}`);
  }

  const categories = ["Phone", "Laptop", "Bag", "Wallet", "Keys", "Documents", "School Item", "Pet", "Travel Luggage", "Office Asset", "Other"];
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.category.upsert({ where: { slug }, update: { name, isActive: true }, create: { name, slug, isActive: true } });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Khoya Paya Admin";

  if (adminEmail && (adminPassword || process.env.SEED_ADMIN_PASSWORD_HASH)) {
    const passwordHash = process.env.SEED_ADMIN_PASSWORD_HASH ?? await bcrypt.hash(adminPassword as string, 12);
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } });

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { name: adminName, role: UserRole.ADMIN },
      create: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log(existingAdmin ? `Admin exists, role ensured: ${adminEmail}` : `Admin created: ${adminEmail}`);
  } else {
    console.log("Skipped admin seed. Set ADMIN_EMAIL and ADMIN_PASSWORD (or the SEED_ADMIN_* overrides).");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
