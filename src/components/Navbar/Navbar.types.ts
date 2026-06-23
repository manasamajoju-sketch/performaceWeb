export interface NavbarProps {
  /** User initials shown next to avatar, e.g. "PG" */
  userInitials?: string;
  /** Called when the user avatar/dropdown is clicked */
  onUserMenuClick?: () => void;
}