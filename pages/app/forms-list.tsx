import React, { useState, useEffect } from 'react';
import { Table, ActionIcon, Loader } from '@mantine/core';
import { tw } from 'twind';
import { useRouter } from 'next/router';
import { IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { truncate } from 'lodash';
import AppLayout from '../../components/Layout';
import { FAB } from '../../components/FAB';
import { HHForm } from '../../types/Inputs';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

const getAllForms = async (token: string): Promise<HHForm[]> => {
  const response = await fetch(`${HIKMA_API}/admin_api/get_event_forms`, {
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
  return result.event_forms;
};

const deleteForm = async (id: string, token: string): Promise<any> => {
  const response = await fetch(`${HIKMA_API}/admin_api/delete_event_form`, {
    method: 'DELETE',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    return Promise.reject(error);
  }
  return await response.json();
};

export default function FormsList() {
  const router = useRouter();
  const [forms, setForms] = useState<(HHForm & { created_at: string })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getAllForms(token).then((fs) => {
        setForms(fs as unknown as (HHForm & { created_at: string })[]);
        setIsLoading(false);
      });
    }
  }, []);

  const confirmDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      const token = localStorage.getItem('token') || '';
      deleteForm(id, token)
        .then(() => {
          setForms(forms.filter((f) => f.id !== id));
        })
        .catch((err) => {
          alert('Error deleting form.');
          console.error(err);
        });
    }
  };

  const openCreateNewForm = () => {
    router.push('/app/new-form');
  };

  const ths = (
    <tr>
      <th>Form Name</th>
      <th>Description</th>
      <th>Created At</th>
      <th>Actions</th>
    </tr>
  );

  const rows = forms.map((form) => (
    <tr key={form.id}>
      <td>{form.name}</td>
      <td>{truncate(form.description, { length: 32 })}</td>
      <td>{form.created_at}</td>
      <td>
        <div className={tw('flex space-x-4')}>
          <ActionIcon onClick={() => confirmDelete(form.id)}>
            <IconTrash size="1rem" color="red" />
          </ActionIcon>
        </div>
      </td>
    </tr>
  ));

  console.log({ forms });

  return (
    <>
      <AppLayout title="Forms List">
        <Table verticalSpacing="md" className={tw('my-6')} striped highlightOnHover withBorder>
          <thead>{ths}</thead>
          <tbody>{rows}</tbody>
        </Table>

        <div className={tw('flex justify-center my-6 w-full')}>
          {isLoading && <Loader size="xl" />}
        </div>
      </AppLayout>

      <FAB onClick={openCreateNewForm} />
    </>
  );
}
