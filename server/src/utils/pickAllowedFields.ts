export type PickAllowedFieldsResult<T extends object> = {
  picked: Partial<T>;
  unknownKeys: string[];
};

export const pickAllowedFields = <T extends object>(
  body: unknown,
  allowedKeys: readonly (keyof T)[]
): PickAllowedFieldsResult<T> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      picked: {},
      unknownKeys: [],
    };
  }

  const allowed = new Set<string>(allowedKeys.map((key) => String(key)));
  const picked: Partial<T> = {};
  const unknownKeys: string[] = [];

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!allowed.has(key)) {
      unknownKeys.push(key);
      continue;
    }

    (picked as Record<string, unknown>)[key] = value;
  }

  return {
    picked,
    unknownKeys,
  };
};
