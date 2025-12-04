import type { Officer, OfficerCategory, OfficerCategoryInfo } from '../types';

export const officerCategories: Record<OfficerCategory, OfficerCategoryInfo> = {
  executive: {
    title: 'Executive Board',
    description: 'The primary leadership team responsible for strategic direction and overall governance',
  },
  administrative: {
    title: 'Administrative Officers',
    description: 'Officers responsible for documentation, financial management, and organizational operations',
  },
  audit: {
    title: 'Audit & Finance',
    description: 'Officers ensuring financial transparency and business development',
  },
  communications: {
    title: 'Communications & Representation',
    description: 'Officers managing communications, public relations, and student representation',
  },
};

export const officers: Officer[] = [
  // Executive Board
  {
    id: 'exec-1',
    title: 'President',
    image: '/images/officers/pres.png',
    category: 'executive',
  },
  {
    id: 'exec-2',
    title: 'Vice President (External)',
    image: '/images/officers/vp-external.png',
    category: 'executive',
  },
  {
    id: 'exec-3',
    title: 'Vice President (Internal)',
    image: '/images/officers/vp-internal.png',
    category: 'executive',
  },
  {
    id: 'exec-4',
    title: 'Vice President (Media)',
    image: '/images/officers/vp-media.png',
    category: 'executive',
  },
  {
    id: 'exec-5',
    title: 'Vice President (Tech)',
    image: '/images/officers/vp-tech.png',
    category: 'executive',
  },
  // Administrative Officers
  {
    id: 'admin-1',
    title: 'Secretary',
    image: '/images/officers/secretary.png',
    category: 'administrative',
  },
  {
    id: 'admin-2',
    title: 'Assistant Secretary',
    image: '/images/officers/asst-secretary.png',
    category: 'administrative',
  },
  {
    id: 'admin-3',
    title: 'General Treasurer',
    image: '/images/officers/gen-treasurer.png',
    category: 'administrative',
  },
  {
    id: 'admin-4',
    title: '4th Year Treasurer',
    image: '/images/officers/fourth-treasurer.png',
    category: 'administrative',
  },
  {
    id: 'admin-5',
    title: '3rd Year Treasurer',
    image: '/images/officers/third-treasurer.png',
    category: 'administrative',
  },
  {
    id: 'admin-6',
    title: '2nd Year Treasurer',
    image: '/images/officers/second-treasurer.png',
    category: 'administrative',
  },
  {
    id: 'admin-7',
    title: '1st Year Treasurer',
    image: '/images/officers/first-treasurer.png',
    category: 'administrative',
  },
  // Audit & Finance
  {
    id: 'audit-1',
    title: 'Auditor',
    image: '/images/officers/auditor.png',
    category: 'audit',
  },
  {
    id: 'audit-2',
    title: 'Assistant Auditor',
    image: '/images/officers/asst-auditor.png',
    category: 'audit',
  },
  {
    id: 'audit-3',
    title: 'Business Manager',
    image: '/images/officers/business-manager.png',
    category: 'audit',
  },
  {
    id: 'audit-4',
    title: 'Assistant Business Manager',
    image: '/images/officers/asst-business-manager.png',
    category: 'audit',
  },
  // Communications & Representation
  {
    id: 'comm-1',
    title: 'Public Information Officer',
    image: '/images/officers/pio.png',
    category: 'communications',
  },
  {
    id: 'comm-2',
    title: '4th Year Representative',
    image: '/images/officers/fourth-rep.png',
    category: 'communications',
  },
  {
    id: 'comm-3',
    title: '3rd Year Representative',
    image: '/images/officers/third-rep.png',
    category: 'communications',
  },
  {
    id: 'comm-4',
    title: '2nd Year Representative',
    image: '/images/officers/second-rep.png',
    category: 'communications',
  },
  {
    id: 'comm-5',
    title: '1st Year Representative',
    image: '/images/officers/first-rep.png',
    category: 'communications',
  },
  {
    id: 'comm-6',
    title: 'Ambassador',
    image: '/images/officers/ambassador.png',
    category: 'communications',
  },
  {
    id: 'comm-7',
    title: 'Ambassadress',
    image: '/images/officers/ambassadress.png',
    category: 'communications',
  },
];
