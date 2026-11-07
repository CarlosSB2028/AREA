"use client";
import { useState, useEffect } from 'react';
import {
  IconGauge,
  IconHome2,
  IconLogin,
  IconListDetails,
  IconMenu2,
} from '@tabler/icons-react';
import { Button, Center, Stack, Tooltip, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';

import { useRouter, usePathname } from 'next/navigation';
import { UserMenu } from '../user/UserMenu';
import classes from './NavBarMinimal.module.css';
import { NavbarLinkProps, UserContent } from '../../../types';
import { getUserInfo } from '../../../services/userService';


function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined} aria-label={label}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const dataCenter = [
  { icon: IconHome2, label: 'Home', link: "/", checkAdmin: false },
  { icon: IconListDetails, label: 'Areas', link: "/areas", checkAdmin: false },
  { icon: IconGauge, label: 'Dashboard', link: "/dashboard", checkAdmin: true },
];

export function NavbarMinimal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<UserContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo && userInfo.email) {
          setIsConnected(true);
          setUser(userInfo);
          setIsAdmin(userInfo.isAdmin === true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
        console.error("Error fetching user info:", error);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  const links = dataCenter.map((link) => (
    (link.checkAdmin && !isAdmin) ? null :
    <NavbarLink
      {...link}
      key={link.label}
      active={link.link === pathname}
      onClick={() => {
        console.log("Navigating to:", link.link);
        router.push(link.link);
      }}
    />
  ));

  return (
    <>
      <nav className={`${classes.navbar} ${isOpen ? classes.open : ''}`} style={{ backgroundColor: 'var(--mantine-color-white)', width: '78px' }}>
        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>

        <Center className={classes.logo}>
          <Image src="/A1.png" alt="Logo" width={40} height={40} />
        </Center>

        <div className={classes.user}>
          {isConnected && user ? (
            <UserMenu user={user} />
          ) : (
            <NavbarLink icon={IconLogin} label="Login" onClick={() => router.push('/login')} />
          )}
        </div>
      </nav>
      {isMobile && !isOpen && (
        <Button variant="light" radius="xl" onClick={() => setIsOpen(!isOpen)} className={classes.hamburger} aria-label="Open navigation menu">
          <IconMenu2 size={20} />
        </Button>
      )}
      {isMobile && isOpen && (
        <div className={classes.overlay} onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}