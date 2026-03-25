import ForgotPasswordForm from '@/components/Admin/ForgotPasswordForm'

export const metadata = {
  title: 'Reset Password - Admin - Bastion Standard',
  description: 'Reset your admin password using security questions',
}

export default function AdminForgotPasswordPage() {
  return <ForgotPasswordForm />
}
