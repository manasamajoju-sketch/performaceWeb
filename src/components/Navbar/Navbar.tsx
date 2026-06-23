import React from 'react';
import styles from './Navbar.module.scss';
import downArrow from '../../assets/downArrow.svg';
import quinLogo from '../../assets/quinLogo.svg';
// import { NavbarProps } from './Navbar.types';

/**
 * Top navigation bar — cyan band with the Quin logo on the left
 * and a user avatar + initials dropdown on the right.
 *
 * The logo mark is built from white rectangles matching the Figma
 * spec; swap for an <img src={logo} /> once you have the SVG asset.
 */
// const Navbar: React.FC<NavbarProps> = ({
const Navbar: React.FC<{
  userInitials?: string;
  onUserMenuClick?: () => void;
}> = ({
  userInitials = 'PG',
  onUserMenuClick,
}) => {
  return (
    <nav className={styles.navbar}>
      {/* ── Logo ── */}
      <div className={styles.logo}>
        <img src={quinLogo} alt="Quin logo" className={styles.logoMark} />
        <span className={styles.logoText}>PERFORMANCE</span>
      </div>

      {/* ── User menu ── */}
      <button
        className={styles.userMenu}
        onClick={onUserMenuClick}
        aria-label="Open user menu"
      >
        <div className={styles.avatarRow}>
          <div className={styles.avatar}>
            <span className={styles.initials}>{userInitials}</span>
          </div>
        </div>
        <img src={downArrow} alt="Open user menu" className={styles.chevronDown} />
      </button>
    </nav>
  );
};

export default Navbar;