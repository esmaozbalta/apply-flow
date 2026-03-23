export interface PersonalInfo {
  name: string;
  professionalTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string;
  details?: string;
}

export interface SimpleListItem {
  id: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  date: string;
}

export interface CoverLetterInputs {
  companyName: string;
  hiringManagerName: string;
  role: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
}
