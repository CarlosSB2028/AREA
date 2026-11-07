import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import AboutPage from '@/app/about/page';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('AboutPage', () => {
  it('renders the about page with main title', () => {
    render(<AboutPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('About AREA')).toBeInTheDocument();
  });

  it('renders the mission section', () => {
    render(<AboutPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText(/democratize automation/)).toBeInTheDocument();
  });

  it('renders the features grid', () => {
    render(<AboutPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Why Choose AREA?')).toBeInTheDocument();
    expect(screen.getByText('Seamless Integration')).toBeInTheDocument();
    expect(screen.getByText('Cloud-Based Solution')).toBeInTheDocument();
    expect(screen.getByText('Secure & Reliable')).toBeInTheDocument();
  });

  it('renders the timeline', () => {
    render(<AboutPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Our Journey')).toBeInTheDocument();
    expect(screen.getByText('Conception & Planning')).toBeInTheDocument();
    expect(screen.getByText('Development Phase')).toBeInTheDocument();
  });

  it('renders the FAQ section', () => {
    render(<AboutPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('What exactly is AREA?')).toBeInTheDocument();
  });

  it('renders the contact section', () => {
    render(<AboutPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });
});