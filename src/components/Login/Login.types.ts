export interface LoginProps {
  onLogin?: (email: string, passcode: string) => void
  onForgotCode?: () => void
}