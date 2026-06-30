export interface PersonalInformation {
  fullName: string;
  emailId: string;
  phone: string;
}

export interface Preferences {
  unitsOfMeasurement: string;
  language: string;
  notifications: 'Enabled' | 'Disabled';
  secondaryLanguage?: string;
}

export interface DeviceItem {
  id: string;
  name: string;
  lastActive: string;
}

export interface PodItem {
  id: string;
  name: string;
  lastConnected: string;
}

export interface ProfileProps {
  personalInfo?: PersonalInformation;
  preferences?: Preferences;
  recentDevices?: DeviceItem[];
  recentPods?: PodItem[];
  onEditPersonalInfo?: () => void;
  onPreferenceChange?: (key: keyof Preferences, value: string) => void;
}