import React, { useState, useReducer, useEffect, useMemo, useRef } from 'react';
import { Menu, Button, TextInput, NumberInput, Textarea, Select, Box } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { v1 as uuidV1 } from 'uuid';
import axios from 'axios';
import { tw } from 'twind';
import AppLayout from '../../../components/Layout';
import { usePatientRegistrationForm } from '../../../hooks/usePatientRegistrationForm';
import { useForm } from '@mantine/form';
import { getTranslation, RegistrationFormField } from './registration-form';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

type PatientAttributeRow = {
  id: string; // uuid,
  patient_id: string; // uuid
  attribute_id: string;
  attribute: string;
  number_value: number | null;
  string_value: string | null;
  date_value: Date | null;
  boolean_value: boolean | null;
  metadata: Record<string, any>;
};

/**
Given a column type (a field type) of an input entry, return the default value to display
@param {RegistrationFormField["fieldType"]} fieldType
@returns {boolean | number | string | Date}
*/
function getDefaultFormValue(
  fieldType: RegistrationFormField['fieldType']
): boolean | number | string | Date {
  if (['text', 'select'].includes(fieldType)) {
    return '';
  } else if (fieldType === 'number') {
    return 0;
  } else if (fieldType === 'boolean') {
    return false;
  } else if (fieldType === 'date') {
    return new Date();
  }

  // something went wrong
  console.warn('Encountered new fieldType for patient registration');
  return '';
}

export default function RegisterPatient() {
  const {
    form: patientRegistrationForm,
    isLoading: isLoadingForm,
    refresh: refreshForm,
  } = usePatientRegistrationForm();
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const form = useForm({
    mode: 'controlled',
    initialValues: {},

    validate: {},
  });

  // once the registration form has loaded, set the initial values of the form
  useEffect(() => {
    if (isLoadingForm === false && patientRegistrationForm !== null) {
      // get the registration form and data types, then set the default
      const defaultValues = patientRegistrationForm.fields.reduce(
        (prev, curr) => {
          const key = curr.column;
          const defaultValue = getDefaultFormValue(curr.fieldType);
          prev[key] = defaultValue;
          return prev;
        },
        {} as Record<string, any>
      );

      form.setInitialValues(defaultValues);
    }
  }, [isLoadingForm, patientRegistrationForm]);

  const formRef = useRef<HTMLFormElement>(null);

  const createPatient = (values: any) => {
    if (loadingSubmission) return;
    // construct the base patient data
    const patientBaseData = {};
    const additionalAttributes: PatientAttributeRow[] = [];
    const token = localStorage.getItem('token');

    patientRegistrationForm?.fields
      .filter((field) => field.deleted !== true && field.visible)
      .forEach((field) => {
        if (field.baseField) {
          // @ts-ignore
          patientBaseData[field.column] = values[field.column];
        } else {
          const row: PatientAttributeRow = {
            id: uuidV1(),
            patient_id: '', // TODO: From the server side???
            attribute_id: field.id,
            attribute: field.column,
            number_value: field.fieldType === 'number' ? Number(values[field.column]) : null,
            string_value: ['text', 'select'].includes(field.fieldType)
              ? String(values[field.column])
              : null,
            date_value: field.fieldType === 'date' ? new Date(values[field.column]) : null,
            boolean_value: field.fieldType === 'boolean' ? Boolean(values[field.column]) : null,
            metadata: {},
          };
          additionalAttributes.push(row);
        }
      });

    setLoadingSubmission(true);
    axios
      .post(
        `${HIKMA_API}/v1/admin/patients`,
        {
          data: {
            baseFields: patientBaseData,
            attributeFields: additionalAttributes,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: String(token),
          },
        }
      )
      .then((res) => {
        console.log({ res });
        form.setValues({});
        form.reset();
        formRef?.current?.reset();
        alert('New patient registered successfully.');
      })
      .catch((error) => {
        console.error(error);
        alert(
          'Error registering patient. Please make sure you have internet access and your server is up to date.'
        );
      })
      .finally(() => {
        setLoadingSubmission(false);
      });
  };

  // FIXME: handle case where the form is not created yet
  if (isLoadingForm === false && patientRegistrationForm === null) {
    return (
      <AppLayout title="Register Patient" isLoading={isLoadingForm}>
        Please create a patient registration form first before proceeding.
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Register Patient" isLoading={isLoadingForm}>
      <form onSubmit={form.onSubmit(createPatient)} ref={formRef}>
        <Box style={{ maxWidth: 500 }} className={tw('space-y-4')}>
          {patientRegistrationForm?.fields
            .filter((field) => field.visible && field.deleted !== true)
            .map((field) => {
              if (field.fieldType === 'text') {
                return (
                  <TextInput
                    key={field.id}
                    label={getTranslation(field.label, 'en')}
                    {...form.getInputProps(field.column)}
                  />
                );
              }
              if (field.fieldType === 'number') {
                return (
                  <NumberInput
                    key={field.id}
                    label={getTranslation(field.label, 'en')}
                    {...form.getInputProps(field.column)}
                  />
                );
              }
              if (field.fieldType === 'select') {
                return (
                  <Select
                    key={field.id}
                    label={getTranslation(field.label, 'en')}
                    data={field.options.map((opt) => ({
                      label: getTranslation(opt, 'en'),
                      value: getTranslation(opt, 'en'),
                    }))}
                    {...form.getInputProps(field.column)}
                  />
                );
              }
              if (field.fieldType === 'date') {
                return (
                  <DatePickerInput
                    valueFormat="YYYY MMM DD"
                    description={''}
                    label={getTranslation(field.label, 'en')}
                    required={field.required}
                    placeholder="Pick date"
                    mx="auto"
                    {...form.getInputProps(field.column)}
                  />
                );
              }
              return <Box></Box>;
            })}

          <Button type="submit" loading={loadingSubmission}>
            Submit
          </Button>
        </Box>
      </form>
    </AppLayout>
  );
}
