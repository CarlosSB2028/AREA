import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import AreaListCard from '../src/components/ui/areaList/AreaListCard'
import { services as mockServices, data as mockAreas } from '../src/mocks/areas'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AreaListCard', () => {
  it('renders areas correctly', () => {
    render(<AreaListCard areas={mockAreas.slice(0, 2)} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.getByText('GitHub PR Monitor')).toBeInTheDocument()
    expect(screen.getByText('Slack Channel Alert')).toBeInTheDocument()
  })

  it('displays area descriptions', () => {
    render(<AreaListCard areas={mockAreas.slice(0, 1)} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.getByText('Monitors pull requests and sends notifications')).toBeInTheDocument()
  })

  it('shows status badges', () => {
    render(<AreaListCard areas={mockAreas.slice(0, 1)} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.getByText('success')).toBeInTheDocument()
  })

  it('displays last run dates', () => {
    render(<AreaListCard areas={mockAreas.slice(0, 1)} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.getByText('Last run: 2024-09-25')).toBeInTheDocument()
  })

  it('renders service badges', () => {
    render(<AreaListCard areas={mockAreas.slice(0, 1)} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('renders multiple areas', () => {
    render(<AreaListCard areas={mockAreas.slice(0, 3)} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.getByText('GitHub PR Monitor')).toBeInTheDocument()
    expect(screen.getByText('Slack Channel Alert')).toBeInTheDocument()
    expect(screen.getByText('GitLab CI Pipeline')).toBeInTheDocument()
  })

  it('handles empty areas list', () => {
    render(<AreaListCard areas={[]} services={mockServices} />, { wrapper: AllTheProviders })
    expect(screen.queryByText('GitHub PR Monitor')).not.toBeInTheDocument()
  })
})