import type { Officer, OfficerCategory, OfficerCategoryInfo } from '../types';

export const officerCategories: Record<OfficerCategory, OfficerCategoryInfo> = {
  exec: {
    title: 'Executive Board',
    description: 'The primary leadership team responsible for strategic direction and overall governance',
  },
  admin: {
    title: 'Administrative Officers',
    description: 'Officers responsible for documentation, financial management, and organizational operations',
  },
  finance: {
    title: 'Finance Officers',
    description: 'Officers ensuring financial transparency and treasury management',
  },
  rep: {
    title: 'Year Level Representatives',
    description: 'Student representatives managing communications and student representation',
  },
  ambassador: {
    title: 'PSSE Ambassadors',
    description: 'Official ambassadors representing PSSE in external events',
  },
};

export const officers: Officer[] = [
  // Executive Board
  {
    id: 'exec-1',
    title: 'President',
    image: '/images/officers/pres.png',
    category: 'exec',
  },
  {
    id: 'exec-2',
    title: 'Vice President (External)',
    image: '/images/officers/vp-external.png',
    category: 'exec',
  },
  {
    id: 'exec-3',
    title: 'Vice President (Internal)',
    image: '/images/officers/vp-internal.png',
    category: 'exec',
  },
  {
    id: 'exec-4',
    title: 'Vice President (Media)',
    image: '/images/officers/vp-media.png',
    category: 'exec',
  },
  {
    id: 'exec-5',
    title: 'Vice President (Tech)',
    image: '/images/officers/vp-tech.png',
    category: 'exec',
  },
  // Administrative Officers
  {
    id: 'admin-1',
    title: 'Secretary',
    image: '/images/officers/secretary.png',
    category: 'admin',
  },
  {
    id: 'admin-2',
    title: 'Assistant Secretary',
    image: '/images/officers/asst-secretary.png',
    category: 'admin',
  },
  // Finance Officers
  {
    id: 'finance-1',
    title: 'General Treasurer',
    image: '/images/officers/gen-treasurer.png',
    category: 'finance',
  },
  {
    id: 'finance-2',
    title: '4th Year Treasurer',
    image: '/images/officers/fourth-treasurer.png',
    category: 'finance',
  },
  {
    id: 'finance-3',
    title: '3rd Year Treasurer',
    image: '/images/officers/third-treasurer.png',
    category: 'finance',
  },
  {
    id: 'finance-4',
    title: '2nd Year Treasurer',
    image: '/images/officers/second-treasurer.png',
    category: 'finance',
  },
  {
    id: 'finance-5',
    title: '1st Year Treasurer',
    image: '/images/officers/first-treasurer.png',
    category: 'finance',
  },
  {
    id: 'finance-6',
    title: 'Auditor',
    image: '/images/officers/auditor.png',
    category: 'finance',
  },
  {
    id: 'finance-7',
    title: 'Assistant Auditor',
    image: '/images/officers/asst-auditor.png',
    category: 'finance',
  },
  {
    id: 'finance-8',
    title: 'Business Manager',
    image: '/images/officers/business-manager.png',
    category: 'finance',
  },
  {
    id: 'finance-9',
    title: 'Assistant Business Manager',
    image: '/images/officers/asst-business-manager.png',
    category: 'finance',
  },
  // Representatives
  {
    id: 'rep-1',
    title: 'Public Information Officer',
    image: '/images/officers/pio.png',
    category: 'rep',
  },
  {
    id: 'rep-2',
    title: '4th Year Representative',
    image: '/images/officers/fourth-rep.png',
    category: 'rep',
  },
  {
    id: 'rep-3',
    title: '3rd Year Representative',
    image: '/images/officers/third-rep.png',
    category: 'rep',
  },
  {
    id: 'rep-4',
    title: '2nd Year Representative',
    image: '/images/officers/second-rep.png',
    category: 'rep',
  },
  {
    id: 'rep-5',
    title: '1st Year Representative',
    image: '/images/officers/first-rep.png',
    category: 'rep',
  },
  // Ambassadors
  {
    id: 'ambassador-1',
    title: 'Ambassador',
    image: '/images/officers/ambassador.png',
    category: 'ambassador',
  },
  {
    id: 'ambassador-2',
    title: 'Ambassadress',
    image: '/images/officers/ambassadress.png',
    category: 'ambassador',
  },
];
