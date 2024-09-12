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
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
      acc[camelKey] = camelCaseKeys(value);
    }
    return acc;
  }, {}) as T;
};