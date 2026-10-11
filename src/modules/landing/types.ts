export interface MenuItem {
  label: string;
  href: string;
  isActive?: boolean;
  children?: MenuItem[];
}
