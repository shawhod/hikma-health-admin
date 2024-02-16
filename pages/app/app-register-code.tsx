import ReactDOM from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import AppLayout from '../../components/Layout';
import { useState } from 'react';
import { Box, Title } from '@mantine/core';
const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

export default function AppRegisterCode() {
  const [code, setCode] = useState(HIKMA_API);

  return (
    <AppLayout title="Register App">
      <Title order={3}>Scan here to with a new app to register your app.</Title>
      {code ? (
        <Box p={10}>
          <QRCodeSVG style={{ background: '#fff', padding: 20 }} value={code} size={300} />
        </Box>
      ) : (
        <p>Error loading Code</p>
      )}
    </AppLayout>
  );
}
