const HOT_COFFEE_KEY_PREFIX = "coffee-tracker:hot-coffee:";

const getStorageKey = (userId: string): string =>
  `${HOT_COFFEE_KEY_PREFIX}${userId}`;

export const getHotCoffeeId = (userId: string): string | null => {
  if (!userId || typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(getStorageKey(userId));
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
};

export const setHotCoffeeId = (userId: string, coffeeId: string): void => {
  if (!userId || !coffeeId || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(userId), coffeeId);
  } catch {
    // Ignore storage failures (private mode/quota) and continue.
  }
};
