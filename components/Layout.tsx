import { useState, useEffect } from 'react';
import {
  AppShell,
  Navbar,
  Title,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  Box,
  UnstyledButton,
  ScrollArea,
  createStyles,
  rem,
  Avatar,
  Loader,
} from '@mantine/core';
import {
  IconCalendarStats,
  IconChevronLeft,
  IconChevronRight,
  IconNotes,
  IconForms,
  IconGauge,
  IconAdjustments,
  IconHaze,
  IconDoorExit,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { LinksGroup } from './LinksGroup';
import { useAuthStatus } from '../hooks/useUser';
import { tw } from 'twind';

const navLinks = [
  { label: 'Dashboard', icon: IconGauge, link: '/app' },
  {
    label: 'Patients',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'Patients List', link: '/app/patients-list' },
      { label: 'Registration Form', link: '/app/patient-registration-form' },
      /*       { label: 'Register Patient', link: '/app/register-patient' }, */
    ],
  },
  {
    label: 'Users',
    icon: IconCalendarStats,
    initiallyOpened: true,
    links: [
      { label: 'Users List', link: '/app/users-list' },
      { label: 'New User', link: '/app/new-user' },
    ],
  },
  { label: 'Forms', icon: IconForms, link: '/app/forms-list' },
  // { label: 'HERS', icon: IconHaze, link: '/app/hers' },
  { label: 'Activate App', icon: IconHaze, link: '/app/app-register-code' },
  // { label: 'Settings', icon: IconAdjustments, link: '/app/settings' },
  { label: 'Export Data', icon: IconAdjustments, link: '/app/exports' },
];

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    paddingBottom: 0,
  },

  links: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  footer: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
}));

type Props = {
  children: React.ReactNode;
  title: string;
  isLoading?: boolean;
};

export default function AppLayout(props: Props) {
  const router = useRouter();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { classes } = useStyles();
  const { children = false, title, isLoading } = props;

  const { loadingAuth, authenticated } = useAuthStatus();
  useEffect(() => {
    if (!authenticated && !loadingAuth) {
      console.log({ authenticated, loadingAuth });
      router.replace('/');
    }
  }, [authenticated, loadingAuth]);

  const confirmSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const links = navLinks.map((item) => <LinksGroup {...item} key={item.label} />);
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
          <Navbar.Section grow className={classes.links} component={ScrollArea}>
            <div className={classes.linksInner}>
              {links}
              <div onClick={confirmSignOut}>
                <LinksGroup icon={IconDoorExit} label="Sign Out" />
              </div>
            </div>
          </Navbar.Section>

          <Navbar.Section className={classes.footer}>{/* <User /> */}</Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Text fz="xl">Hikma Health Admin</Text>
          </div>
        </Header>
      }
    >
      <div>
        <Title order={1}>{title}</Title>
        {isLoading ? (
          <div className={tw('flex justify-center my-6 w-full')}>
            <Loader size="xl" />
          </div>
        ) : (
          children
        )}
      </div>
    </AppShell>
  );
}

export function User() {
  const theme = useMantineTheme();

  return (
    <Box
      sx={{
        paddingTop: theme.spacing.sm,
        borderTop: `${rem(1)} solid ${
          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
      }}
    >
      <UnstyledButton
        sx={{
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

          '&:hover': {
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          },
        }}
      >
        <Group>
          <Avatar
            src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            radius="xl"
          />
          <Box sx={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              Amy Horsefighter
            </Text>
            <Text color="dimmed" size="xs">
              ahorsefighter@gmail.com
            </Text>
          </Box>

          {theme.dir === 'ltr' ? (
            <IconChevronRight size={rem(18)} />
          ) : (
            <IconChevronLeft size={rem(18)} />
          )}
        </Group>
      </UnstyledButton>
    </Box>
  );
}
