/**
Utility function that processes the values of an object

@param {Object} obj
@oaram {(v: any) => any} func
@returns {Object}
*/
export function mapObjectValues<T>(obj: T, func: (v: any) => any): T {
  return Object.fromEntries(Object.entries(obj as any).map(([k, v]) => [k, func(v)])) as T;
}

/**
 * Recursively converts all user-defined keys in an object to camelCase
 * @param obj The object to convert
 * @returns A new object with all user-defined keys in camelCase
 */
export const camelCaseKeys = <T extends Record<string, any>>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys) as unknown as T;
  }

  return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace('-', '').replace('_', '')
      );
      acc[camelKey] = camelCaseKeys(value);
    }
    return acc;
  }, {}) as T;
};

/**
 * Deduplicates an array of options based on their `value` field.
 *
 * @param {Array<{ label: string, value: string }>} options - The array of options to deduplicate.
 * @returns {Array<{ label: string, value: string }>} The deduplicated array of options.
 */
export function deduplicateOptions(
  options: Array<{ label: string; value: string }>
): Array<{ label: string; value: string }> {
  const seenValues = new Set<string>();
  const deduplicatedOptions: Array<{ label: string; value: string }> = [];

  for (const option of options) {
    if (!seenValues.has(option.value)) {
      seenValues.add(option.value);
      deduplicatedOptions.push(option);
    }
  }

  return deduplicatedOptions;
}

/**
 * Reorders a list of strings based on a second list that specifies the desired order.
 *
 * @param list1 The list of strings to be reordered.
 * @param list2 The list of strings specifying the desired order.
 *              Can include "_" as a placeholder to skip a position.
 *              Strings not present in `list1` are ignored.
 *
 * @returns A new array with the strings from `list1` reordered according to `list2`.
 */
export function orderedList(list1: string[], list2: string[]): string[] {
  const result: string[] = [];
  const remaining = new Set(list1);

  for (const item of list2) {
    if (item === '_') {
      continue; // Skip the "_" placeholder
    }
    if (remaining.has(item)) {
      result.push(item);
      remaining.delete(item);
    }
  }

  // Add any remaining items from list1 in their original order
  remaining.forEach((item) => result.push(item));

  return result;
}
