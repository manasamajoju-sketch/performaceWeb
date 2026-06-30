export interface NavbarProps {
  /** User full name shown in the navbar, e.g. "Pedri Gonzalez" */
  userFullName?: string;
  /** Called when the user menu button is clicked */
  onUserMenuClick?: () => void;
}