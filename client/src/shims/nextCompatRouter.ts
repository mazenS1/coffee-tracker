import { usePathname } from "./nextNavigation";

export function useRouter() {
  const pathname = usePathname();
  return { pathname };
}
