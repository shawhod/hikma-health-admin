import React, { useState, useEffect, useMemo } from 'react';
import { ActionIcon, Button, Loader, Table } from '@mantine/core';
import { tw } from 'twind';
import AppLayout from '../../../components/Layout';
import { Patient } from '../../../types/Patient';
import { differenceBy, isEqual, isEqualWith, replace } from 'lodash';
import { format } from 'date-fns';
import { tableToCSV } from '../exports';
import {
  baseFields,
  getTranslation,
  RegistrationForm,
  translationObjectOptions,
} from './registration-form';
import axios from 'axios';
import { mapObjectValues } from '../../../utils/misc';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { usePatientRegistrationForm } from '../../../hooks/usePatientRegistrationForm';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

export const getAllPatients = async (token: string): Promise<Patient[]> => {
  const response = await fetch(`${HIKMA_API}/admin_api/all_patients`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(error);
    return Promise.resolve([]);
  }

  const result = await response.json();
  return result.patients;
};

/**
Get the colulmns of the patient records
This is a heavy process O(n)

@param {Patient[]} patientsList
@return {string[]} columns
*/
export function getPatientColumns(patientsList: Patient[]): string[] {
  const cols = new Set();
  patientsList.slice(0, 200).forEach((pt) => {
    const allKeys = Object.keys(pt);
    const excluded = ['additional_data'];
    allKeys.forEach((k) => !excluded.includes(k) && cols.add(k));
    Object.keys(pt['additional_data']).forEach((k) => cols.add(k));
  });
  return Array.from(cols) as string[];
}

export default function PatientsList() {
  const [columns, setColumns] = useState<string[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const { form: patientRegistrationForm } = usePatientRegistrationForm();

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    getAllPatients(token)
      .then((patientsList: Patient[]) => {
        setPatients(patientsList);
        console.log(patientsList);

        setColumns(getPatientColumns(patientsList));

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  console.log({ patientRegistrationForm });

  /* mapping of field_ids to their current label */
  const registrationIdToField: Record<string, any> = useMemo(() => {
    if (patientRegistrationForm === null) return {};
    const { fields } = patientRegistrationForm;
    return fields.reduce(
      (prev, curr) => {
        const key = curr.id;
        prev[key] = getTranslation(curr.label, 'en') || '';
        return prev;
      },
      {} as Record<string, any>
    );
  }, [patientRegistrationForm]);

  /* mapping of columns to their current label */
  const registrationColToField: Record<string, any> = useMemo(() => {
    if (patientRegistrationForm === null) return {};
    const { fields } = patientRegistrationForm;
    return fields.reduce(
      (prev, curr) => {
        const key = curr.column;
        prev[key] = getTranslation(curr.label, 'en') || curr.column || '';
        return prev;
      },
      {} as Record<string, any>
    );
  }, [patientRegistrationForm]);

  /** Download all the loaded patients */
  const downloadPatients = () => {
    const fileName = format(new Date(), 'yyyy-MM-dd') + '-PatientsList';

    tableToCSV(fileName);
  };

  /** The base fields columns */
  // const basePatientFields = [
  //   'created_at',
  //   'id',
  //   'given_name',
  //   'surname',
  //   'date_of_birth',
  //   'country',
  //   'hometown',
  //   'sex',
  //   'phone',
  //   'updated_at',
  // ];
  console.log(registrationIdToField);
  const basePatientFields = baseFields
    .filter((field) => field.baseField === true)
    .map((field) => field.column);
  /** Add id created_at, updated_at manually to the base fields */
  basePatientFields.unshift('id', 'created_at');
  basePatientFields.push('updated_at');
  /** The custom / dynamic fields that are in the additional_data column */
  const additionalData = differenceBy(columns, basePatientFields);

  const goToRegisterPatient = () => {
    router.push('/app/patients/register');
  };

  const ths = (
    <Table.Tr>
      {basePatientFields.map((col) => (
        <Table.Th style={{ minWidth: 250 }} key={col}>
          {registrationColToField[col] || replace(col || '', '_', ' ')}
        </Table.Th>
      ))}
      {additionalData.map((col) => (
        <Table.Th style={{ minWidth: 250 }} key={col}>
          {registrationIdToField[col] || col}
        </Table.Th>
      ))}
    </Table.Tr>
  );

  const rows = patients.map((patient: Patient) => (
    <Table.Tr key={patient.id}>
      {basePatientFields.map((field) => (
        <Table.Td key={patient.id + field}>
          {String(patient[field as keyof Patient] || '')}
        </Table.Td>
      ))}
      {additionalData.map((col) => (
        <Table.Td key={col}>{String(patient.additional_data[col as any] || '')}</Table.Td>
      ))}
      {/*
      <td>{format(patient.created_at, 'dd MMM yyyy')}</td>
      <td>{patient.id}</td>
      <td>{patient.given_name}</td>
      <td>{patient.surname}</td>
      <td>{format(patient.date_of_birth, 'dd MMM yyyy')}</td>
      <td>{patient.country}</td>
      <td>{patient.hometown}</td>
      <td>{patient.sex}</td>
      <td>{patient.phone}</td>
  */}
      {/* additionalData.map((f) => (
        // @ts-ignore
        <td key={f}>{patient.additional_data[f as any] || ''}</td>
      )) */}
    </Table.Tr>
  ));

  return (
    <>
      <AppLayout title="Patients List">
        <Button onClick={downloadPatients} variant={'light'}>
          Download data
        </Button>
        <Table.ScrollContainer minWidth={500}>
          <Table
            horizontalSpacing={'md'}
            striped
            stickyHeader
            stickyHeaderOffset={60}
            highlightOnHover
          >
            <thead>{ths}</thead>
            <tbody>{rows}</tbody>
          </Table>
        </Table.ScrollContainer>

        <div className={tw('flex justify-center my-6 w-full')}>
          {loading && <Loader size="xl" />}
        </div>
      </AppLayout>
      <ActionIcon
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}
        onClick={goToRegisterPatient}
        variant="filled"
        size="xl"
        radius="xl"
        aria-label="Settings"
      >
        <IconPlus style={{ width: '60%', height: '60%' }} stroke={1.5} />
      </ActionIcon>
    </>
  );
}
