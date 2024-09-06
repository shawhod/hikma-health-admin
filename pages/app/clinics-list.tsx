import React, { useEffect, useState } from 'react';
import { Loader, ActionIcon, Table } from '@mantine/core';
import { IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import AppLayout from '../../components/Layout';
import { FAB } from '../../components/FAB';
import { User } from '../../types/User';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

const getClinics = async (token: string): Promise<User[]> => {
  const response = await fetch(`${HIKMA_API}/v1/admin/clinics`, {
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
  return result.clinics;
};

const deleteClinic = async (id: string, token: string): Promise<any> => {
  const response = await fetch(`${HIKMA_API}/v1/admin/clinics/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: token,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    return Promise.reject(error);
  }
  return await response.json();
};

export default function UsersList() {
  const router = useRouter();
  const [clinics, setClinics] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getClinics(token)
        .then((clinics) => {
          console.log({ clinics });
          setClinics(clinics);
          setLoading(false);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const openRegisterClinicForm = () => {
    router.push('/app/new-clinic');
  };

  const confirmDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) return;
    const token = localStorage.getItem('token');
    if (token) {
      deleteClinic(id, token)
        .then((res) => {
          console.log(res);
          // remove user from state
          const newClinics = clinics.filter((clinic) => clinic.id !== id);
          setClinics(newClinics);
        })
        .catch((err) => console.log(err));
    }
  };

  const ths = (
    <Table.Tr>
      <Table.Th>ID</Table.Th>
      <Table.Th style={{ width: '60%' }}>Name</Table.Th>
      <Table.Th>Actions</Table.Th>
    </Table.Tr>
  );

  const editClinic = (clinic: User) =>
    router.push({
      pathname: `/app/edit-clinic`,
      query: { clinic: JSON.stringify(clinic) },
    });

  const rows = clinics.map((clinic) => (
    <Table.Tr key={clinic.id}>
      <Table.Td>{clinic.id}</Table.Td>
      <Table.Td>{clinic.name}</Table.Td>
      <Table.Td>
        <div className="flex space-x-4">
          <ActionIcon variant="transparent" onClick={() => confirmDelete(clinic.id)}>
            <IconTrash size="1rem" color="red" />
          </ActionIcon>
          {/* <ActionIcon variant="transparent" onClick={() => editClinic(clinic)}>
            <IconEdit size="1rem" color="blue" />
          </ActionIcon> */}
        </div>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <>
      <AppLayout title="Clinics List">
        <div>
          <Table striped highlightOnHover>
            <Table.Thead>{ths}</Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </div>
        <div className="flex justify-center my-6 w-full">{loading && <Loader size="xl" />}</div>
      </AppLayout>
      <FAB onClick={openRegisterClinicForm} />
    </>
  );
}
