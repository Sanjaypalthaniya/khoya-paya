import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import UpgradeButton from "@/components/billing/UpgradeButton";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentPlan } from "@/lib/plans";

function featureList(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function money(value: { toString(): string }, currency: string) { const amount=Number(value.toString()); return new Intl.NumberFormat("en-IN",{style:"currency",currency,maximumFractionDigits:amount%1?2:0}).format(amount); }

export default async function PricingCards() {
  const [plans,user]=await Promise.all([prisma.plan.findMany({where:{isActive:true},orderBy:[{price:"asc"},{createdAt:"asc"}]}),getCurrentUser()]);
  const current=user?await getCurrentPlan(user.id):null;
  return <><div className="pricing-source-note"><ShieldCheck size={18}/><span>Plan availability, limits, and prices are loaded from the active Khoya Paya plan catalogue.</span></div><div className="row g-4 align-items-stretch">
    {plans.map(plan=>{const currentPlan=current?.plan?.id===plan.id;const features=featureList(plan.features);return <div className="col-lg-4" key={plan.id}><article className={`pricing-card pricing-card-v2 h-100 ${plan.isPopular?"featured":""} ${currentPlan?"current":""}`}>
      <div className="pricing-badges">{plan.isPopular&&<span className="popular-badge">Recommended</span>}{currentPlan&&<span className="current-plan-badge">Current plan</span>}</div><div className="plan-name">{plan.name}</div><h3>{money(plan.price,plan.currency)}{plan.billingCycle!=="FREE"&&<small>/{plan.billingCycle.toLowerCase()}</small>}</h3><p>{plan.description}</p><div className="plan-limit"><strong>{plan.itemLimit}</strong><span>registered item{plan.itemLimit===1?"":"s"}</span></div><ul>{features.map(feature=><li key={feature}><Check size={15}/>{feature}</li>)}</ul>
      {currentPlan?<button className="btn btn-secondary-kp btn-sm-pill" type="button" disabled>Current plan</button>:plan.billingCycle==="FREE"?<Link className="btn btn-primary-kp btn-sm-pill" href="/signup">Start free</Link>:<UpgradeButton planSlug={plan.slug} label={`Choose ${plan.name}`}/>}<small className="plan-change-note">Plan changes and eligibility are confirmed before checkout.</small>
    </article></div>})}
  </div></>;
}
