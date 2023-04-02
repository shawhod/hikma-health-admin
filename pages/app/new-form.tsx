// @ts-nocheck
import React, { useState, useReducer } from 'react';
import {
  Menu,
  Button,
  Grid,
  TextInput,
  Divider,
  Paper,
  Flex,
  Text,
  Checkbox,
  Group,
  NumberInput,
  Textarea,
  Select,
  Radio,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { v1 as uuidV1 } from 'uuid';
import axios from 'axios';
import {
  IconSettings,
  IconSelector,
  IconTextSize,
  IconNotes,
  IconNumbers,
  IconList,
  IconCheckbox,
  IconMedicineSyrup,
  IconSearch,
  IconDatabase,
  IconCalendar,
  IconPhoto,
  IconMessageCircle,
  IconTrash,
    IconArrowsLeftRight,
    IconReportMedical,
} from '@tabler/icons-react';
import { tw } from 'twind';
import { omit, eq } from 'lodash';
import { Welcome } from '../../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../../components/ColorSchemeToggle/ColorSchemeToggle';
import { InputSettingsList } from '../../components/FormBuilder/InputSettingsList';
import { MedicineInput } from '../../components/FormBuilder/MedicineInput';
import {
  TextField,
  HHFieldBase,
  BinaryField,
  MedicineField,
  HHField,
  HHFieldWithPosition,
  InputType,
  OptionsField,
} from '../../types/Inputs';
import AppLayout from '../../components/Layout';
import { DiagnosisSelect } from '../../components/FormBuilder/DiagnosisPicker';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

function createTextField(name = '', description = '', inputType: InputType = 'text'): TextField {
  const baseInput: HHFieldBase = {
    id: String(Math.random()),
    name,
    description,
    inputType,
    required: true,
  };
  switch (inputType) {
    case 'text':
    case 'number':
    case 'email':
    case 'password':
    case 'tel':
      return { ...baseInput, fieldType: 'free-text', inputType, length: 'short' };
    case 'textarea':
      return { ...baseInput, fieldType: 'free-text', inputType, length: 'long' };
  }
}

function createBinaryField(
  name = '',
  description = '',
  inputType: BinaryField['inputType'] = 'checkbox',
  options: BinaryField['options'] = []
): BinaryField {
  return {
    id: String(Math.random()),
    name,
    description,
    inputType,
    required: true,
    fieldType: 'binary',
    options,
  };
}

// TODO: Add createSelectField Method
// TODO: Add createRadioField Method

function createMedicineField(
  name = 'Medicine',
  description = '',
  inputType: MedicineField['inputType'] = 'input-group',
  options: MedicineField['options'] = []
): MedicineField {
  return {
    id: String(Math.random()),
    name,
    description,
    inputType,
    required: true,
    fieldType: 'medicine',
    fields: {
      name: createTextField('Name', 'Name of the medicine'),
      route: createOptionsField('Route', 'Route of the medicine', 'dropdown', [
        'Oral',
        'Intravenous',
        'Intramuscular',
        'Subcutaneous',
        'Topical',
        'Inhalation',
        'Rectal',
        'Ophthalmic',
        'Otic',
        'Nasal',
        'Intranasal',
        'Intradermal',
        'Intraosseous',
        'Intraperitoneal',
        'Intrathecal',
        'Intracardiac',
        'Intracavernous',
        'Intracerebral',
        'Intracere',
      ]),
      form: createOptionsField('Form', 'Form of the medication', 'dropdown', [
        'Tablet',
        'Capsule',
        'Liquid',
        'Powder',
        'Suppository',
        'Inhaler',
        'Patch',
        'Cream',
        'Gel',
        'Ointment',
        'Lotion',
        'Drops',
        'Spray',
        'Syrup',
        'Suspension',
        'Injection',
        'Implant',
        'Implantable pump',
        'Implantable reservoir',
        'Implantable infusion system',
        'Implantable drug delivery system',
        'Implantable drug d',
      ]),
      dose: createTextField('Dose', 'Dose of the medicine'),
      doseUnits: createOptionsField('Dosage Units', 'Units for the dosage', 'dropdown', [
        'mg',
        'g',
        'ml',
        'l',
      ]),
      frequency: createTextField('Frequency', 'Frequency of the medicine'),
      intervals: createTextField('Intervals', 'Intervals of the medicine'),
      duration: createTextField('Duration', 'Duration of the medicine'),
      durationUnits: createOptionsField('Duration Units', 'Units for the duration', 'dropdown', [
        'hours',
        'days',
        'weeks',
        'months',
        'years',
      ]),
    },
  };
}

const createOptionsField = (
  name = '',
  description = '',
  inputType: OptionsField['inputType'] = 'dropdown',
  options: OptionsField['options'] = []
): OptionsField => {
  return {
    id: String(Math.random()),
    name,
    description,
    inputType,
    required: true,
    fieldType: 'options',
    options,
  };
};

const createDiagnosisField = (
  name = 'Diagnosis',
  description = '',
  inputType: OptionsField['inputType'] = 'dropdown',
  options: OptionsField['options'] = [],
): OptionsField => {
  return {
    id: String(Math.random()),
    name,
    description,
    inputType,
    required: true,
    fieldType: 'diagnosis',
    options,
  };
};

const createDateField = (name = '', description = '', inputType = 'date'): DateField => {
  return {
    id: String(Math.random()),
    name,
    description,
    inputType,
    required: true,
    fieldType: 'date',
  };
};

let inputFieldOptions: Partial<FieldType>[] = ['binary', 'free-text', 'medicine'];

type AddButtonProps = {
  onClick: (fieldType: FieldType, inputType: InputType) => void;
};

export const inputIconsMap = {
  text: <IconTextSize />,
  textarea: <IconNotes />,
  number: <IconNumbers />,
  options: <IconList />,
  medicine: <IconMedicineSyrup />,
  diagnosis: <IconReportMedical />,
  checkbox: <IconCheckbox />,
  date: <IconCalendar />,
};

const inputAddButtons = (action: AddButtonProps) => [
  {
    label: 'Text',
    icon: inputIconsMap['text'],
    onClick: action.onClick('free-text', 'text'),
  },
  {
    label: 'Text Long',
    icon: inputIconsMap['textarea'],
    onClick: action.onClick('free-text', 'textarea'),
  },
  {
    label: 'Numeric',
    icon: inputIconsMap['number'],
    onClick: action.onClick('free-text', 'number'),
  },
  {
    label: 'Date',
    icon: inputIconsMap['date'],
    onClick: action.onClick('date', 'date'),
  },
  {
    label: 'Checkbox / Radio',
    icon: inputIconsMap['checkbox'],
    onClick: action.onClick('options', 'radio'),
  },
  {
    label: 'Select / Dropdown',
    icon: inputIconsMap['options'],
    onClick: action.onClick('options', 'select'),
  },
  {
    label: 'Medication',
    icon: inputIconsMap['medicine'],
    onClick: action.onClick('medicine', 'custom'),
  },
  {
    label: "Diagnosis",
    icon: inputIconsMap['diagnosis'],
    onClick: action.onClick('diagnosis', 'custom')
  }
];

type Action =
  | { type: 'add-field'; payload: HHFieldWithPosition }
  | { type: 'remove-field'; payload: string }
  | { type: 'set-dropdown-options'; payload: { id: string; value: FieldOption[] } }
  | { type: 'set-field-key-value'; payload: { id: string; key: string; value: any } }
  | { type: 'add-units'; payload: { id: string; value: DoseUnit[] } }
  | { type: 'remove-units'; payload: { id: string } };

type State = {
  [id: string]: HHFieldWithPosition;
};

const reducer = (state: State, action: Action) => {
  console.log('REDUCER: ', action.payload);
  switch (action.type) {
    case 'add-field':
      return {
        ...state,
        [action.payload.id]: action.payload,
      };
    case 'remove-field':
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    case 'set-field-key-value':
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          [action.payload.key]: action.payload.value,
        },
      };
    case 'set-dropdown-options':
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          options: action.payload.value,
        },
      };
    case 'add-units':
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          units: action.payload.value,
        },
      };
    case 'remove-units':
      return {
        ...state,
        [action.payload.id]: {
          ...omit(state[action.payload.id], 'units'),
        },
      };
    default:
      return state;
  }
};

export default function NewFormBuilder() {
  const [fields, setFields] = useState([] as FieldType[]);
  const [state, dispatch] = useReducer(reducer, {});
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const addField = (fieldType: FieldType, inputType: InputType) => () => {
    console.log({ fieldType, inputType });
    switch (fieldType) {
      case 'binary':
        // dispatch({ type: "add-field", payload: createBinaryField() }
        // setFields([...fields, createBinaryField()]);
        break;
      case 'date':
        dispatch({ type: 'add-field', payload: createDateField('Date', '', inputType) });
        break;
      case 'free-text':
        console.log('free-text');
        dispatch({ type: 'add-field', payload: createTextField('', '', inputType) });
        // setFields([...fields, createTextField()]);
        break;
      case 'options':
        const options = [];
        dispatch({ type: 'add-field', payload: createOptionsField('', '', inputType, options) });
        break;
      case 'medicine':
        // setFields([...fields, createMedicineField()]);
        dispatch({ type: 'add-field', payload: createMedicineField('Medicine', '') });
        break;
      case 'diagnosis':
        dispatch({ type: 'add-field', payload: createDiagnosisField() });
        break;
    }
  };

  const handleFieldRemove = (id: string) => {
    dispatch({ type: 'remove-field', payload: id });
  };

  const handleFieldChange = (id: string, key: string, value: any) => {
    dispatch({ type: 'set-field-key-value', payload: { id, key, value } });
  };

  const handleFieldOptionChange = (id: string, options: FieldOption[]) => {
    dispatch({ type: 'set-dropdown-options', payload: { id, value: options } });
  };

  const handleFieldUnitChange = (id: string, units: DoseUnit[] | false) => {
    if (!units) {
      dispatch({ type: 'remove-units', payload: { id } });
      return;
    }
    dispatch({ type: 'add-units', payload: { id, value: units } });
  };

  const dndData = Object.values(state).map((field) => ({
    ...field,
  }));

  const handleSaveForm = () => {
    if (loadingSave) return;
    const form = {
      id: uuidV1(),
      name: formName,
      description: formDescription,
      metadata: JSON.stringify(dndData),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log({ form });

    setLoadingSave(true);

    axios
      .post(
        `${HIKMA_API}/admin_api/save_event_form`,
        {
          event_form: form,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: String(localStorage.getItem('token')),
          },
        }
      )
      .then(function (response) {
        alert('Form saved!');
        setLoadingSave(false);
        console.log(response);
      })
      .catch(function (error) {
        setLoadingSave(false);
        console.log(error);
      });
  };

  return (
    <AppLayout title="Form Builder">
      <Grid className={tw('m-0 ')} gap="4">
        <Grid.Col span={5} className={tw('overflow-y-scroll h-screen px-2 pt-4')}>
          {/*           <h4 className={tw('text-2xl mb-2')}>Form Builder</h4> */}
          <TextInput
            label="Form Title"
            className={tw('mb-4')}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Form Name"
          />
          <Textarea
            label="Form Description"
            className={tw('mb-4')}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Form Description"
          />
          <InputSettingsList
            data={dndData}
            onRemoveField={handleFieldRemove}
            onFieldChange={handleFieldChange}
            onFieldOptionChange={handleFieldOptionChange}
            onFieldUnitChange={handleFieldUnitChange}
          />
          <br />
          <Divider my="sm" label="Add Input To Form" labelPosition="center" />
          <AddFormInputButtons addField={addField} />
          <Button loading={loadingSave} onClick={handleSaveForm} fullWidth className={tw('my-8')}>
            Save Form
          </Button>
        </Grid.Col>
        <Grid.Col span={7} className={tw(`space-y-4 px-12 py-8`)}>
          <h4 className={tw('text-2xl mb-2')}>{formName}</h4>
          {Object.values(state).map((field) => {
            if (field.fieldType === 'options') {
              return <OptionsInput key={field.id} field={field} />;
            } else if (field.fieldType === 'free-text') {
              return <FreeTextInput key={field.id} field={field} />;
            } else if (field.fieldType === 'date') {
              return (
                <DatePickerInput
                  valueFormat="YYYY MMM DD"
                  description={field.description}
                  label={field.name}
                  required={field.required}
                  placeholder="Pick date"
                  mx="auto"
                />
              );
            } else if (field.fieldType === 'medicine') {
              return <MedicineInput key={field.id} field={field} />;
            } else if (field.fieldType === 'diagnosis') {
              return <DiagnosisSelect key={field.id} field={field} />;
            } else {
              return null;
            }
          })}
        </Grid.Col>
      </Grid>
    </AppLayout>
  );
}

const AddFormInputButtons = React.memo(
  ({ addField }: { addField: (fieldType: FieldType, inputType: InputType) => void }) => {
    return (
      <Flex wrap="wrap" gap="sm">
        {inputAddButtons({ onClick: addField }).map((button) => (
          <Button size="md" key={button.label} onClick={button.onClick} leftIcon={button.icon}>
            {button.label}
          </Button>
        ))}
      </Flex>
    );
  }
);

type FreeTextInputProps = {
  field: HHFieldWithPosition | HHField;
};

const WithUnits = ({
  field,
  children,
}: {
  field: HHFieldWithPosition | HHField;
  children: React.ReactNode;
}) => {
  const hasUnits = field.units && field.units.length > 0;
  console.log('Has units: ', field.units);
  return (
    <div className={tw(`flex flex-row ${hasUnits ? 'space-x-4' : ''}`)}>
      <div className={tw('flex-1')}> {children}</div>
      {hasUnits && <Select label="Units" description=" " data={field.units} />}
    </div>
  );
};

const FreeTextInput = React.memo(
  ({ field }: FreeTextInputProps) => {
    console.log({ field });
    const inputProps = {
      placeholder: field.placeholder,
      label: field.name,
      description: field.description,
      required: field.required,
      // value: field.value,
    };
    switch (field.inputType) {
      case 'textarea':
        return <Textarea {...inputProps} field={field} />;
      case 'number':
        return (
          <WithUnits field={field}>
            {' '}
            <NumberInput {...inputProps} field={field} />{' '}
          </WithUnits>
        );
      case 'text':
      default:
        return <TextInput {...inputProps} field={field} />;
    }
  },
  (prev, next) => eq(prev.field, next.field)
);

type OptionsInputProps = {
  field: HHFieldWithPosition | HHField;
};

const OptionsInput = React.memo(
  ({ field }: OptionsInputProps) => {
    const inputProps = {
      placeholder: field.placeholder,
      label: field.name,
      description: field.description,
      required: field.required,
      // value: field.value,
    };

    switch (field.inputType) {
      case 'radio':
        return (
          <Radio.Group name={field.name} {...inputProps} field={field}>
            <Group mt="xs">
              {field.options.map((option) => (
                <Radio key={option.value} value={option.value} label={option.label} />
              ))}
            </Group>
          </Radio.Group>
        );
      case 'select':
      default:
        return <Select data={field.options} {...inputProps} field={field} />;
    }
  },
  (pres, next) => eq(pres.field, next.field)
);
