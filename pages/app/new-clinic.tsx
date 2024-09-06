import React, { useState, useReducer, useEffect, useMemo, useRef } from 'react';
import { Menu, Button, TextInput, NumberInput, Textarea, Select, Box } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { v1 as uuidV1 } from 'uuid';
import axios from 'axios';
import AppLayout from '../../components/Layout';
import { useForm } from '@mantine/form';
import { getTranslation, RegistrationFormField } from './patients/registration-form';
import { useRouter } from 'next/router';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

type Clinic = {
  id: string;
  name: string;
};



export default function RegisterClinic() {
  const router = useRouter();
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const form = useForm<Clinic>({
    mode: 'controlled',
    initialValues: {
      id: '',
      name: '',
    },

    validate: {
      name: (value) => value.length < 3,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const createClinic = async (values: Clinic) => {
    try {
      setLoadingSubmission(true);
      const response = await axios.post(`${HIKMA_API}/v1/admin/clinics`, values, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: String(localStorage.getItem('token')),
        },
      });
      setLoadingSubmission(false);
      alert('Clinic created successfully');
      router.push('/app/clinics-list');
    } catch (error) {
      console.log(error);
      alert('Error creating clinic');
      setLoadingSubmission(false);
    }
  };

  return (
    <AppLayout title="Register Clinic">
      <form onSubmit={form.onSubmit(createClinic)} ref={formRef}>
        <Box style={{ maxWidth: 500 }} className="space-y-4">
          <TextInput label="Name" {...form.getInputProps('name')} />

          <Button type="submit" loading={loadingSubmission} className="primary" fullWidth>
            Submit
          </Button>
        </Box>
      </form>
    </AppLayout>
  );
}
