import Link from "next/link";
import { footerNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  const { contact, social } = siteConfig;
  const hasContact = contact.whatsapp || contact.email || social.instagram || social.tiktok;

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto max-w-[90rem] px-4 pt-16 pb-8 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <nav aria-label="Informasi">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
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
            {hasContact ? (
              <ul className="space-y-2">
                {contact.whatsapp && <li>WhatsApp {contact.whatsapp}</li>}
                {contact.email && <li>{contact.email}</li>}
                {social.instagram && <li>Instagram {social.instagram}</li>}
                {social.tiktok && <li>TikTok {social.tiktok}</li>}
              </ul>
            ) : (
              <p>Kontak & sosial media menyusul.</p>
            )}
          </div>
        </div>

        <p
          aria-hidden
          className="font-display mt-20 text-[clamp(3.5rem,15vw,13rem)] leading-[0.8] text-brand select-none"
        >
          Fleece Hearts
        </p>
        <p className="mt-6 text-xs text-paper/50">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
