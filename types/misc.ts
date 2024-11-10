export type ICD11Diagnosis = {
  code: string;
  desc: string;
  desc_ar: string;
};

export type Medication = {};

export type InputType = 'number' | 'checkbox' | 'radio' | 'select' | 'diagnosis' | 'medicine';
