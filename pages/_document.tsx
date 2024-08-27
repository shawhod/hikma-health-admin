import NextDocument, { Head, Html, Main, NextScript } from 'next/document';
// import { createGetInitialProps } from '@mantine/next';
import createEmotionServer from '@emotion/server/create-instance';
import { ColorSchemeScript } from '@mantine/core';
import { createGetInitialProps } from '@mantine/emotion';
// Import cache created in the previous step
import { emotionCache } from '../emotion/cache';

// const getInitialProps = createGetInitialProps(
// NextDocument,
// stylesServer
// );

// export default class _Document extends Document {
// static getInitialProps = getInitialProps;
// }

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <ColorSchemeScript />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

const stylesServer = createEmotionServer(emotionCache);

Document.getInitialProps = createGetInitialProps(NextDocument, stylesServer);
