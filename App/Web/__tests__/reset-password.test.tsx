import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { ResetPasswordForm } from '@/components/ui/auth/ResetPasswordForm'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => 'mock-token',
  }),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('ResetPasswordPage', () => {
  it.skip('renders the ResetPasswordForm', () => {
    render(<ResetPasswordForm />, { wrapper: AllTheProviders })
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })
})