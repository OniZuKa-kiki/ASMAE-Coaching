export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMoreNavActive(
  pathname: string,
  items: readonly { href: string }[]
): boolean {
  return items.some((item) => isNavLinkActive(pathname, item.href));
}
