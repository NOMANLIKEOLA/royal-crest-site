import { site } from "@/config/site";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer id="contact" className={s.footer}>
      <div className="wrap">
        <div className={s.grid}>
          <p className={s.brand}>{site.name}</p>
          <address className={s.block}>
            <strong>Contact</strong>
            <a href={site.phoneHref}>{site.phoneDisplay}</a>
            <span>{site.email}</span>
          </address>
          <address className={s.block}>
            <strong>Office</strong>
            <span>{site.addressLines[0]}</span>
            <span>{site.addressLines[1]}</span>
            <span>{site.hours}</span>
          </address>
        </div>
        <p className={s.legal}>
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Payments are processed securely by Stripe. Availability can change; our team confirms every reservation.</span>
        </p>
      </div>
    </footer>
  );
}