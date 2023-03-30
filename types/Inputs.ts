// INPUT TYPES FOR CUSTOM FORMS & WORKFLOWS
export type InputType = 'text' | 'textarea' | 'number' | 'email' | 'password' | 'date' | 'time' | 'datetime' | 'checkbox' | 'radio' | 'select' | 'file' | 'image' | 'url' | 'tel' | 'color' | 'range' | 'hidden' | 'submit' | 'reset' | 'button' | 'search' | 'month' | 'week' | 'datetime-local' | 'custom';

export type FieldType = 'binary' | 'medicine' | 'dosage' | 'free-text' | 'input-group' | 'options' | 'date' | 'custom';

export type HHFieldBase = {
  id: string;
  name: string;
  description: string;
  required: boolean;
};

export type DurationUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years';
export type MeasurementUnit = 'cm' | 'm' | 'kg' | 'lb' | 'in' | 'ft' | 'mmHg' | 'cmH2O' | 'mmH2O' | 'mmol/L' | 'mg/dL' | 'C' | 'F' | 'BPM' | 'P' | 'M' | 'mmol/L' | 'mg/dL' | '%' | 'units';
export type DoseUnit = 'mg' | 'g' | 'mcg' | 'mL' | 'L' | 'units';

export type MedicineRoute = 'oral' | 'sublingual' | 'rectal' | 'topical' | 'inhalation' | 'intravenous' | 'intramuscular' | 'intradermal' | 'subcutaneous' | 'nasal' | 'ophthalmic' | 'otic' | 'vaginal' | 'transdermal' | 'other';
export type MedicineForm = 'tablet' | 'syrup' | 'ampule' | 'suppository' | 'cream' | 'drops' | 'bottle' | 'spray' | 'gel' | 'lotion' | 'inhaler' | 'capsule' | 'injection' | 'patch' | 'other';

export type FieldOption = {
  label: string;
  value: string;
};

export type BinaryField = HHFieldBase & {
  fieldType: 'binary';
  inputType: 'checkbox' | 'radio' | 'select';
  options: FieldOption[];
};

export type OptionsField = HHFieldBase & {
  fieldType: 'options';
  inputType: 'checkbox' | 'radio' | 'select';
  options: FieldOption[];
};

export type TextField = HHFieldBase & ({
  fieldType: 'free-text';
  inputType: 'text' | 'number' | 'email' | 'password' | 'tel';
  length: 'short';
  units?: DoseUnit[] | DurationUnit[];
} | {
  fieldType: 'free-text';
  inputType: 'textarea';
  length: 'long';
  units?: DoseUnit[] | DurationUnit[];
});

export type MedicineField = HHFieldBase & {
  fieldType: 'medicine';
  inputType: 'input-group';
  fields: {
    name: TextField;
    route: MedicineRoute;
    form: MedicineForm;
    frequency: TextField;
    intervals: TextField;
    dose: TextField;
    doseUnits: DoseUnit;
    duration: TextField;
    durationUnits: DurationUnit;
  }
};

export type DateField = HHFieldBase & {
  fieldType: 'date';
  inputType: 'date';
  min?: Date;
  max?: Date;
};

export type HHField = BinaryField | TextField | MedicineField | DateField | OptionsField;

export type HHFieldWithPosition =
  | BinaryField & { position: number }
  | TextField & { position: number }
  | MedicineField & { position: number }
  | OptionsField & { position: number }
  | DateField & { position: number };

export type HHForm = {
  id: string;
  name: string;
  description: string;
  fields: HHField[];
  createdAt: Date;
  updatedAt: Date;
};
