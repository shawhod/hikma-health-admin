import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { useState } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Head from 'next/head';
import {
  MantineProvider,
  ColorSchemeScript,
  createTheme,
  useMantineColorScheme,
  MantineColorScheme,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import './index.css';
import { emotionTransform, MantineEmotionProvider } from '@mantine/emotion';
import { emotionCache } from '../emotion/cache';

const theme = createTheme({});

export default function App(props: AppProps & { colorScheme: MantineColorScheme }) {
  const { Component, pageProps } = props;
  // const { setColorScheme, clearColorScheme, colorScheme } = useMantineColorScheme();

  // const toggleColorScheme = (value?: ColorScheme) => {
  //   const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
  //   setColorScheme(nextColorScheme);
  //   setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  // };

  return (
    <MantineEmotionProvider cache={emotionCache}>
      <MantineProvider
        theme={theme}
        // forceColorScheme={colorScheme as any}
        stylesTransform={emotionTransform}
        defaultColorScheme="dark"
        // withGlobalStyles
        // withNormalizeCSS
      >
        <Head>
          <title>Hikma Health Admin Dashboard</title>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          <link rel="shortcut icon" href="/favicon.svg" />
          <ColorSchemeScript />
        </Head>

        <ColorSchemeScript
          defaultColorScheme="dark"
          // onToggle={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
        />
        <Component {...pageProps} />
        <Notifications />
      </MantineProvider>
    </MantineEmotionProvider>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  };
};
