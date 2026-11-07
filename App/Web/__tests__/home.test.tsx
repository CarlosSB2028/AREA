import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import Home from '@/app/page'
import { services as mockServices } from '../src/mocks/areas'

jest.mock('../src/services/areasService', () => ({
  getServices: jest.fn(() => Promise.resolve(mockServices)),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getByText('Welcome to AREA')).toBeInTheDocument()
  })

  it('renders the area logo', async () => {
    render(<Home />, { wrapper: AllTheProviders })
    await waitFor(() => {
      expect(screen.getAllByAltText('logo')).toHaveLength(6)
    })
  })

  it('renders the base button', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('clicks the Get Started button', () => {
    render(<Home />, { wrapper: AllTheProviders })
    const button = screen.getByText('Get Started')
    fireEvent.click(button)
  })
})