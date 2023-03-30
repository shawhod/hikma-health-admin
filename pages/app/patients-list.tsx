import React, { useState, useEffect } from 'react';
import { ActionIcon, Loader, Table } from '@mantine/core';
import {tw} from 'twind';
import AppLayout from '../../components/Layout';
import { Patient } from '../../types/Patient';

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

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    getAllPatients(token)
      .then((patientsList: Patient[]) => {
        setPatients(patientsList);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const ths = (
    <tr>
      <th>ID</th>
      <th>Given Name</th>
      <th>Surname</th>
      <th>Date of Birth</th>
      <th>Country</th>
      <th>Hometown</th>
      <th>Sex</th>
      <th>Phone</th>
      <th>Camp</th>
      <th>Created At</th>
      <th>Updated At</th>
    </tr>
  );

  const rows = patients.map((patient: Patient) => (
    <tr key={patient.id}>
      <td>{patient.id}</td>
      <td>{patient.given_name}</td>
      <td>{patient.surname}</td>
      <td>{patient.date_of_birth}</td>
      <td>{patient.country}</td>
      <td>{patient.hometown}</td>
      <td>{patient.sex}</td>
      <td>{patient.phone}</td>
      <td>{patient.camp}</td>
      <td>{patient.created_at}</td>
      <td>{patient.updated_at}</td>
    </tr>
  ));

  return (
    <AppLayout title="Patients List">
      <div>
        <Table striped highlightOnHover>
          <thead>{ths}</thead>
          <tbody>{rows}</tbody>
        </Table>
      </div>

      <div className={tw("flex justify-center my-6 w-full")}>
      {loading && <Loader size="xl" />}
      </div>
    </AppLayout>
  );
}
