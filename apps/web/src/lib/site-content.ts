import "server-only";
import { homeCopy } from "@/config/content";
import { getDb } from "@/lib/db";

export interface SiteContent {
  announcement: string;
  heroEyebrow: string;
  heroBody: string;
  showLatest: boolean;
  showLookbook: boolean;
  showMaterial: boolean;
  showCategories: boolean;
}

const defaults: SiteContent = {
  announcement: "",
  heroEyebrow: homeCopy.hero.eyebrow,
  heroBody: homeCopy.hero.body,
  showLatest: true,
  showLookbook: true,
  showMaterial: true,
  showCategories: true,
};

export async function getSiteContent(): Promise<SiteContent> {
  const { rows } = await getDb().query<{ data: Partial<SiteContent> }>("SELECT data FROM site_content WHERE key='home'");
  return { ...defaults, ...rows[0]?.data };
}
