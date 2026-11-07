"use client";

import { Button, Container, Overlay, Text, Title } from '@mantine/core';
import classes from './HeroBanner.module.css';
import { useRouter } from 'next/navigation';

export function HeroBanner() {
  const router = useRouter();

  return (
    <div className={classes.hero}>
      <Overlay
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 60%)"
        opacity={1}
        zIndex={0}
      />
      <Container className={classes.container} size="md">
        <Title className={classes.title}>Welcome to AREA</Title>

        <Text className={classes.description} size="xl" mt="xl" color="white">
          Automate your tasks with custom applets. AREA offers you an intuitive platform to connect your favorite services and save time.
        </Text>

        <Button variant="gradient" size="xl" radius="xl" className={classes.control} onClick={() => { router.push('/login'); }}>
          Get Started
        </Button>
      </Container>
    </div>
  );
}