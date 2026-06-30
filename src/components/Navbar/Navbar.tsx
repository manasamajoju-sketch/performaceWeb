import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.scss';
import downArrow from '../../assets/downArrow.svg';
import quinLogo from '../../assets/quinLogo.svg';

const Navbar: React.FC<{
  userFullName?: string;
  onLogoutClick?: () => void;
}> = ({
  userFullName = 'Pedri Gonzalez',
  onLogoutClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 const handleProfileClick = () => {
  console.log('navigating to profile');
  setIsMenuOpen(false);
  navigate('/profile');
};

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogoutClick?.();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src={quinLogo} alt="Quin logo" className={styles.logoMark} />
        <span className={styles.logoText}>PERFORMANCE</span>
      </div>

      <div className={styles.userMenuWrapper} ref={menuRef}>
        <button
          className={styles.userMenu}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Open user menu"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <span className={styles.fullName}>{userFullName}</span>
          <img
            src={downArrow}
            alt=""
            className={`${styles.chevronDown} ${isMenuOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {isMenuOpen && (
          <div className={styles.dropdown} role="menu">
            <button className={styles.dropdownItem} role="menuitem" onClick={handleProfileClick}>
              Profile
            </button>
            <button className={styles.dropdownItem} role="menuitem" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;