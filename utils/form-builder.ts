import { toLower } from "lodash"
import { FieldOption } from '../types/Inputs.ts';

export function listToFieldOptions(list: string[]): FieldOption[] {
  return list.map((item) => ({
    label: item,
    value: toLower(item),
  }));
}
