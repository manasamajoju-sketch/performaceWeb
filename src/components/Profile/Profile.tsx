import React from 'react';
import Navbar from '../Navbar';
import styles from './Profile.module.scss';
import chevronDown from '../../assets/downArrow.svg';
import type {
  ProfileProps,
  PersonalInformation,
  Preferences,
  DeviceItem,
  PodItem,
} from './Profile.types';

const DEFAULT_PERSONAL_INFO: PersonalInformation = {
  fullName: 'Pedri Gonzalez',
  emailId: 'temp@gmail.com',
  phone: '+61 8726512564',
};

const DEFAULT_PREFERENCES: Preferences = {
  unitsOfMeasurement: 'Imperial',
  language: 'English',
  notifications: 'Enabled',
  secondaryLanguage: 'English',
};

const DEFAULT_DEVICES: DeviceItem[] = [
  { id: '1', name: 'Iphone 16 Pro max', lastActive: 'Last Active 3 hours ago' },
  { id: '2', name: 'Apple Series 11 Watch', lastActive: 'Last Active 1 hour ago' },
];

const DEFAULT_PODS: PodItem[] = [
  { id: '1', name: 'Quin Pod +400 X', lastConnected: 'Last Active 3 hours ago' },
  { id: '2', name: 'Quin Pro', lastConnected: 'Last connected 8 hours ago' },
  { id: '3', name: 'Quin Bullet Pro', lastConnected: 'Last connected 1 week ago' },
];

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const Profile: React.FC<ProfileProps> = ({
  personalInfo = DEFAULT_PERSONAL_INFO,
  preferences = DEFAULT_PREFERENCES,
  recentDevices = DEFAULT_DEVICES,
  recentPods = DEFAULT_PODS,
  onEditPersonalInfo,
  onPreferenceChange,
}) => {
  return (
    <div className={styles.page}>
      <Navbar userFullName={personalInfo.fullName} />
      <div className={styles.profile}>

      <div className={styles.content}>
        {/* ── Left column ── */}
        <div className={styles.leftColumn}>
          <div className={styles.header}>
            <div className={styles.avatar}>{getInitials(personalInfo.fullName)}</div>
            <span className={styles.headerName}>{personalInfo.fullName}</span>
          </div>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <button className={styles.editLink} onClick={onEditPersonalInfo}>
                Edit
              </button>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Full Name</span>
              <span className={styles.value}>{personalInfo.fullName}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Email ID</span>
              <span className={styles.value}>{personalInfo.emailId}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{personalInfo.phone}</span>
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Preferences</h2>

            <div className={styles.row}>
              <span className={styles.label}>Units of Measurement</span>
              <button
                className={styles.dropdownTrigger}
                onClick={() =>
                  onPreferenceChange?.('unitsOfMeasurement', preferences.unitsOfMeasurement)
                }
              >
                <span>{preferences.unitsOfMeasurement}</span>
                <img src={chevronDown} alt="" className={styles.chevron} />
              </button>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Language</span>
              <button
                className={styles.dropdownTrigger}
                onClick={() => onPreferenceChange?.('language', preferences.language)}
              >
                <span>{preferences.language}</span>
                <img src={chevronDown} alt="" className={styles.chevron} />
              </button>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Notifications</span>
              <button
                className={styles.dropdownTrigger}
                onClick={() =>
                  onPreferenceChange?.('notifications', preferences.notifications)
                }
              >
                <span>{preferences.notifications}</span>
                <img src={chevronDown} alt="" className={styles.chevron} />
              </button>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Language</span>
              <button
                className={styles.dropdownTrigger}
                onClick={() =>
                  onPreferenceChange?.('secondaryLanguage', preferences.secondaryLanguage || '')
                }
              >
                <span>{preferences.secondaryLanguage}</span>
                <img src={chevronDown} alt="" className={styles.chevron} />
              </button>
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className={styles.rightColumn}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Devices</h2>
            {recentDevices.map((device) => (
              <div key={device.id} className={styles.listItem}>
                <span className={styles.itemName}>{device.name}</span>
                <span className={styles.itemMeta}>{device.lastActive}</span>
              </div>
            ))}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Pods</h2>
            {recentPods.map((pod) => (
              <div key={pod.id} className={styles.listItem}>
                <span className={styles.itemName}>{pod.name}</span>
                <span className={styles.itemMeta}>{pod.lastConnected}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;