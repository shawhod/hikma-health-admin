import React, { useState } from 'react';
import { upperFirst } from 'lodash';
import { TextInput, Select, Button } from '@mantine/core';
import { tw } from 'twind';
import AppLayout from '../../components/Layout';
import { User } from '../../types/User';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

const addUser = async (user: User & { password: string }, token: string): Promise<any> => {
  const response = await fetch(`${HIKMA_API}/admin_api/user`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: user.name,
      role: user.role.toLowerCase(),
      email: user.email,
      password: user.password,
    }),
  });
  // TODO: Handle non ok response
  const result = await response.json();
  return result;
};

export const userRoles = ['provider', 'admin'];

export default function NewUser() {
  const [user, setUser] = useState<User & { password: string }>({
    id: '',
    name: '',
    role: 'Admin',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const confirmSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    if (!user.name || !user.role || !user.email || !user.password) {
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      addUser(user, token).then((result) => {
        console.log(result);
      });
    }
    setLoading(false);
  };

  return (
    <AppLayout title="New User">
      <form onSubmit={confirmSubmit}>
        <div className={tw('max-w-md space-y-4')}>
          <TextInput onChange={updateField} label="Username" name="name" required />
          <Select
            label="User Role"
            placeholder="Pick one"
            onChange={(value) => setUser({ ...user, role: value || '' })}
            data={userRoles.map((role) => ({ label: upperFirst(role), value: role }))}
          />
          <TextInput label="Email" name="email" required onChange={updateField} />
          <TextInput label="Password" name="password" required onChange={updateField} />

          {/*           @ts-ignore */}
          <Button onClick={confirmSubmit} loading={loading} fullWidth>
            Submit
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
