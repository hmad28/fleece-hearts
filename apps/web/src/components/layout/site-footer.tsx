import Link from "next/link";
import { LogoMark } from "@/components/brand/wordmark";
import { homeCopy } from "@/config/content";
import { footerNav, mainNav, siteConfig } from "@/config/site";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  const { contact, social } = siteConfig;
  const contactLines = [
    contact.whatsapp && `WhatsApp ${contact.whatsapp}`,
    contact.email,
    social.instagram && `Instagram ${social.instagram}`,
    social.tiktok && `TikTok ${social.tiktok}`,
  ].filter(Boolean) as string[];

  return (
    <footer className="mt-28 bg-ink text-paper md:mt-36">
      <div className="px-4 pt-16 pb-8 md:px-10 md:pt-20 lg:px-14">
        <div className="grid grid-cols-1 gap-10 border-b border-paper/15 pb-14 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <h2 className="font-display max-w-[14ch] text-[clamp(2.25rem,4.5vw,3.75rem)]">{homeCopy.newsletter.title}</h2>
            <p className="mt-3 text-paper/70">{homeCopy.newsletter.body}</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-1 gap-10 pt-12 sm:grid-cols-3">
          <nav aria-label="Belanja">
            <ul className="space-y-3 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-paper/70 hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Informasi">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-1">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-paper/70 hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm text-paper/70">
            {contactLines.length > 0 ? (
              <ul className="space-y-3">
                {contactLines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : (
              <p>WhatsApp, Instagram, dan email menyusul.</p>
            )}
          </div>
        </div>

        <div className="mt-20 flex items-center gap-4">
          <LogoMark className="h-14 w-auto text-paper md:h-20" />
          <p className="font-display text-[clamp(2.5rem,6vw,5rem)]">Fleece Hearts</p>
        </div>
        <p className="mt-8 text-xs text-paper/50">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
