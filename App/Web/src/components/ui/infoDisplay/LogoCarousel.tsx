"use client";
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';
import { Paper, Title } from '@mantine/core';
import classes from './CardsCarousel.module.css';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getServices } from '../../../services/areasService';
import { BackendService, CardProps } from '../../../types';

function Card({ image }: CardProps) {
  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      className={classes.card}
      style={{ position: 'relative' }}
    >
      <Image src={image} alt="logo" fill style={{ objectFit: 'contain' }} />
    </Paper>
  );
}

export function LogoCarousel() {
  const [services, setServices] = useState<BackendService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const servicesData = await getServices();
        if (Array.isArray(servicesData)) {
          setServices(servicesData);
        } else {
          console.error('Services data is not an array:', servicesData);
          setError('Invalid services data format');
          setServices([]);
        }
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const safeServices = Array.isArray(services) ? services : [];

  const slides = safeServices.map((service) => (
    <Carousel.Slide key={service.id}>
      <Card image={service.iconLightUrl || service.iconDarkUrl || '/file.svg'} />
    </Carousel.Slide>
  ));

  if (loading) {
    return (
      <div>
        <Title order={2} ta="center" mt="xl" mb="md">
          Our services
        </Title>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading services...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Title order={2} ta="center" mt="xl" mb="md">
          Our services
        </Title>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (safeServices.length === 0) {
    return (
      <div>
        <Title order={2} ta="center" mt="xl" mb="md">
          Our services
        </Title>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No services available
        </div>
      </div>
    );
  }

  return (
    <>
      <Title order={2} ta="center" mt="xl" mb="md">
        Our services
      </Title>
      <Carousel
        slideSize={{ base: '100%', sm: '50%', md: '33.333%', lg: '33.333%' }}
        slideGap={4}
        emblaOptions={{ align: 'start', loop: true }}
        plugins={[Autoplay({ delay: 3000 })]}
        withControls={false}
      >
        {slides}
      </Carousel>
    </>
  );
}