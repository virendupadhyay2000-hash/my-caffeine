import { useContactSettings } from "@/hooks/useQueries";
import { t } from "@/lib/i18n";
import { Mail, Phone, Sprout } from "lucide-react";

/** Fallback shown until an admin saves contact settings. */
const DEFAULT_CONTACT = {
  email: "Virendupadhyay.2000@gmail.com",
  phone: "+91 94131 44022",
} as const;

export function Footer() {
  const year = new Date().getFullYear();
  const contactQuery = useContactSettings();
  const email = contactQuery.data?.email?.trim() || DEFAULT_CONTACT.email;
  const phone = contactQuery.data?.phone?.trim() || DEFAULT_CONTACT.phone;
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold text-foreground">
              {t.appName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.tagline}
            <span className="mt-1 block text-xs uppercase tracking-wider">
              {t.taglineEn}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
            {t.footer.contact} · {t.footer.contactEn}
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href={telHref}
                data-ocid="footer.phone_link"
                className="rounded-sm transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href={`mailto:${email}`}
                data-ocid="footer.email_link"
                className="min-w-0 break-all rounded-sm transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {email}
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
            {t.footer.builtWithEn}
          </h2>
          <p className="text-sm text-muted-foreground">
            © {year}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm font-medium text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
