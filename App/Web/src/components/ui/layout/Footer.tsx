'use client';
import { Image, Anchor, Group, Flex } from '@mantine/core';
import './Footer.css';

const links = [
  { link: '/about', label: 'About' },
  { link: '/contact', label: 'Contact' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor
      c="dark"
      key={link.label}
      href={link.link}
      lh={1}
      onClick={(event) => {
        if (link.link === '#')
          event.preventDefault();
      }}
      size="sm"
      fw={500}
    >
      {link.label}
    </Anchor>
  ));

  return (
    <footer className="footer" style={{ width: '100%', padding: '0 10rem' }}>
      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
        <Flex justify="space-between" align="center" className="inner">
          <Image src="/area1.png" alt="area logo" style={{ maxWidth: '100px', height: 'auto' }} />
          <Group justify="center" className="links" style={{ flex: 1 }}>
            {items}
          </Group>
        </Flex>
      </div>
    </footer>
  );
}