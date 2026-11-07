import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { HeroBanner } from '@/components/ui/infoDisplay/HeroBanner'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('HeroBanner', () => {
  it('renders the title', () => {
    render(<HeroBanner />, { wrapper: AllTheProviders })
    expect(screen.getByText('Welcome to AREA')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<HeroBanner />, { wrapper: AllTheProviders })
    expect(screen.getByText('Automate your tasks with custom applets. AREA offers you an intuitive platform to connect your favorite services and save time.')).toBeInTheDocument()
  })

  it('renders the Get Started button', () => {
    render(<HeroBanner />, { wrapper: AllTheProviders })
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('clicks the Get Started button without error', () => {
    render(<HeroBanner />, { wrapper: AllTheProviders })
    const button = screen.getByText('Get Started')
    fireEvent.click(button)
  })
})