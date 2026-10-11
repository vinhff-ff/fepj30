import type { MenuItem } from "@/modules/landing/types";

const leftMenuItems: MenuItem[] = [
  {
    label: "TRANG CHỦ",
    href: "/?landing=true",
    isActive: true,
  },
  {
    label: "TIN TỨC",
    href: "/tin-tuc",
  },
];

const rightMenuItems: MenuItem[] = [
  {
    label: "FANPAGE",
    href: "/fanpage",
  },
  {
    label: "HỖ TRỢ",
    href: "/ho-tro",
    children: [
      { label: "Hỗ trợ kỹ thuật", href: "/ho-tro/ky-thuat" },
      { label: "Liên hệ quản trị", href: "/ho-tro/lien-he" },
    ],
  },
];

export { leftMenuItems, rightMenuItems };

