import React, { useState } from 'react';
import { MultiSelect } from '@mantine/core';
import icd10 from '../../data/icd10-xs.json'; // Importing the extra small ICD10 JSON file
import { HHField, HHFieldWithPosition } from '../../types/Inputs';

type Props = {
  field: HHFieldWithPosition | HHField;
};

export function DiagnosisSelect({ field }: Props) {
  const [data, setData] = useState(
    icd10.map((item) => ({
      value: `${item.desc} (${item.code}`,
      label: `${item.desc} (${item.code}`,
    }))
  );

  return (
    <MultiSelect
      label={field.name}
      description={field.description}
      data={data}
      required={field.required}
      placeholder="Select items"
      searchable
      maxDropdownHeight={160}
      limit={20}
      creatable
      getCreateLabel={(query) => `+ Add ${query}`}
      onCreate={(query) => {
        const item = { value: query, label: query };
        setData((current) => [...current, item]);
        return item;
      }}
    />
  );
}
