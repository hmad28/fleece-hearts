import "server-only";
import { homeCopy } from "@/config/content";
import { siteConfig } from "@/config/site";
import { getDb } from "@/lib/db";

export interface SiteContent {
  announcement: string;
  promotionImageUrl: string;
  promotionEnabled: boolean;
  heroEyebrow: string;
  heroBody: string;
  showLatest: boolean;
  showLookbook: boolean;
  showMaterial: boolean;
  showCategories: boolean;
  whatsappNumber: string;
  instagramUrl: string;
  tiktokUrl: string;
}

const defaults: SiteContent = {
  announcement: "",
  promotionImageUrl: "/images/dummy/campaign-wide.jpg",
  promotionEnabled: true,
  heroEyebrow: homeCopy.hero.eyebrow,
  heroBody: homeCopy.hero.body,
  showLatest: true,
  showLookbook: true,
  showMaterial: true,
  showCategories: true,
  whatsappNumber: siteConfig.contact.whatsapp ?? "",
  instagramUrl: siteConfig.social.instagram ?? "",
  tiktokUrl: siteConfig.social.tiktok ?? "",
};

export async function getSiteContent(): Promise<SiteContent> {
  const { rows } = await getDb().query<{ data: Partial<SiteContent> }>("SELECT data FROM site_content WHERE key='home'");
  return { ...defaults, ...rows[0]?.data };
}
