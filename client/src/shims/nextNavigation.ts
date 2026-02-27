import { useEffect, useMemo, useState } from "react";

type RouterNavigateOptions = {
  scroll?: boolean;
};

const readLocation = () => {
  if (typeof window === "undefined") {
    return { pathname: "/", search: "", hash: "" };
  }

  return {
    pathname: window.location.pathname || "/",
    search: window.location.search,
    hash: window.location.hash,
  };
};

const toRelativeUrl = (href: string) => {
  if (typeof window === "undefined") return href;

  try {
    const parsed = new URL(href, window.location.origin);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return href;
  }
};

const navigate = (href: string, method: "pushState" | "replaceState") => {
  if (typeof window === "undefined") return;

  window.history[method](null, "", toRelativeUrl(href));
  window.dispatchEvent(new PopStateEvent("popstate"));
};

function useLocationState() {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const updateLocation = () => setLocation(readLocation());
    window.addEventListener("popstate", updateLocation);
    window.addEventListener("hashchange", updateLocation);
    return () => {
      window.removeEventListener("popstate", updateLocation);
      window.removeEventListener("hashchange", updateLocation);
    };
  }, []);

  return location;
}

export function usePathname() {
  return useLocationState().pathname;
}

export function useSearchParams() {
  const { search } = useLocationState();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useParams() {
  return {};
}

export function useRouter() {
  return {
    push: (href: string, options?: RouterNavigateOptions) => {
      void options;
      return navigate(href, "pushState");
    },
    replace: (href: string, options?: RouterNavigateOptions) => {
      void options;
      return navigate(href, "replaceState");
    },
  };
}
