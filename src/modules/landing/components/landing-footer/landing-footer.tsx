import Link from "next/link";
import { leftMenuItems, rightMenuItems } from "@/modules/landing/data/navigation";
import type { MenuItem } from "@/modules/landing/types";
import "./landing-footer.scss";

const footerGroups: { id: string; title: string; items: MenuItem[] }[] = [
  {
    id: "kham-pha",
    title: "Khám phá",
    items: [...leftMenuItems, ...rightMenuItems],
  },
];

const footerContacts = [
  { id: "hotline", label: "Hotline", value: "1900 6868" },
  { id: "email", label: "Email", value: "hotro@steamgame.vn" },
  { id: "dia-chi", label: "Địa chỉ", value: "Số 1 Đường Lê Lợi, Quận 1, TP.HCM" },
];

function LandingFooter() {
  return (
    <>
      <div className="mountain-divider">
        <svg viewBox="0 0 1200 130" preserveAspectRatio="none">
          <path
            className="mountain-fill"
            d="M0,56.0 Q38.5,61.2 76.9,65.0 Q138.5,60.3 200.0,56.4 Q237.4,60.6 274.7,65.0
               Q337.4,61.2 400.0,57.3 Q443.5,61.4 487.1,65.0 Q543.5,66.1 600.0,67.8
               Q650.0,65.9 699.9,65.0 Q750.0,67.4 800.0,68.3 Q851.8,66.5 903.6,65.0
               Q951.8,62.4 1000.0,60.5 Q1063.2,62.8 1126.3,65.0 Q1163.2,60.7 1200.0,57.0
               L1200,130 L0,130 Z"
          />
        </svg>
      </div>

      <footer className="landing-footer">
        <div className="landing-footer__inner">
          {footerGroups.map((group) => (
            <nav
              className="landing-footer__group"
              key={group.id}
              aria-label={group.title}
            >
              <h2 className="landing-footer__group-title">{group.title}</h2>
              <ul className="landing-footer__list">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link className="landing-footer__link" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="landing-footer__contacts">
            {footerContacts.map((contact) => (
              <div className="landing-footer__contact" key={contact.id}>
                <span className="landing-footer__contact-label">{contact.label}</span>
                <span className="landing-footer__contact-value">{contact.value}</span>
              </div>
            ))}
          </div>

          <p className="landing-footer__copyright">
            © 2026 Steam Game Center. Giữ trọn mọi quyền thuộc về cộng đồng người chơi.
          </p>
        </div>
      </footer>
    </>
  );
}

export { LandingFooter };
