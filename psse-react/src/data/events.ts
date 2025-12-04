import type { Event, CoreActivity, StudentLifeItem, TechItem } from '../types';

export const events: Event[] = [
  {
    id: 'event-1',
    title: 'Startup Pitch Competition',
    description: "A start-up live pitching competition where the team 'PackUp' presented their solution to challenges in the packaging industry.",
    image: '/images/latest-events/growcon-ph-2025.jpg',
    date: 'March 2024',
    badge: { text: 'Competition', variant: 'primary' },
    stats: '1st Place: PackUp',
  },
  {
    id: 'event-2',
    title: 'National Math Platform Championship',
    description: "Three BSSE-3 students from Central Philippine University hold the 'Champion' title in a nationwide competition for their innovative math platform.",
    image: '/images/latest-events/ithink-hackathon.jpg',
    date: 'February 2024',
    badge: { text: 'National Competition', variant: 'success' },
    stats: 'Champions',
  },
  {
    id: 'event-3',
    title: 'Official Merchandise Design Contest',
    description: 'An event where PSSE members strive their best to come up with the most creative designs for the official merchandise of the organization.',
    image: '/images/latest-events/merch-designing.jpg',
    date: 'January 2024',
    badge: { text: 'Design Contest', variant: 'warning' },
    stats: '25+ Participants',
  },
  {
    id: 'event-4',
    title: 'PSSE Induction Ceremony 2024',
    description: 'The iconic PSSE Induction Ceremony where new members are officially welcomed into the organization and introduced to the PSSE community.',
    image: '/images/background-cover.jpg',
    date: 'September 2024',
    badge: { text: 'Ceremony', variant: 'info' },
    stats: '150+ Inductees',
  },
  {
    id: 'event-5',
    title: 'Advanced React Workshop',
    description: 'Hands-on workshop focusing on advanced React concepts, state management, and modern development practices with industry experts.',
    image: '/images/placeholder-image.jpg',
    date: 'November 2024',
    badge: { text: 'Workshop', variant: 'secondary' },
    stats: '80+ Attendees',
  },
  {
    id: 'event-6',
    title: 'PSSE Hackathon 2024',
    description: '48-hour intensive hackathon where teams collaborate to build innovative solutions to real-world problems using cutting-edge technologies.',
    image: '/images/placeholder-image.jpg',
    date: 'October 2024',
    badge: { text: 'Hackathon', variant: 'danger' },
    stats: '120+ Participants',
  },
];

export const upcomingEvents: Event[] = [
  {
    id: 'upcoming-1',
    title: 'Industry Talk Series',
    description: 'Guest speakers from leading tech companies share insights about the industry.',
    image: '',
    date: 'December 15, 2024',
    badge: { text: 'Talk', variant: 'primary' },
    stats: '',
    isUpcoming: true,
  },
  {
    id: 'upcoming-2',
    title: 'Career Fair 2025',
    description: 'Connect with potential employers and explore career opportunities in tech.',
    image: '',
    date: 'January 20, 2025',
    badge: { text: 'Career', variant: 'success' },
    stats: '',
    isUpcoming: true,
  },
];

export const coreActivities: CoreActivity[] = [
  {
    id: 'activity-1',
    title: 'Collaboration',
    description: 'Working together on student-led tech initiatives and projects within and between other orgs.',
    icon: 'handshake',
  },
  {
    id: 'activity-2',
    title: 'Training',
    description: 'Organizing and hosting training sessions on tools, technologies, and best practices.',
    icon: 'graduation-cap',
  },
  {
    id: 'activity-3',
    title: 'Events',
    description: 'Hosting seminars, orientations, tours, and the iconic PSSE Induction Ceremony.',
    icon: 'calendar',
  },
  {
    id: 'activity-4',
    title: 'Workshops',
    description: 'Hands-on sessions to explore APIs, projects, and emerging tools with guest speakers.',
    icon: 'tools',
  },
];

export const studentLifeItems: StudentLifeItem[] = [
  {
    id: 'life-1',
    title: 'Coffee-powered coding sessions at midnight',
    icon: 'coffee',
  },
  {
    id: 'life-2',
    title: "Writing code that works... then doesn't... then works again",
    icon: 'code',
  },
  {
    id: 'life-3',
    title: 'Debugging for hours just to fix a missing semicolon',
    icon: 'bug',
  },
  {
    id: 'life-4',
    title: 'Team projects = chaos, learning, and growth',
    icon: 'users',
  },
];

export const techStack: TechItem[] = [
  { name: 'JavaScript' },
  { name: 'Python' },
  { name: 'Java' },
  { name: 'React' },
  { name: 'Node.js' },
  { name: 'MySQL' },
  { name: 'MongoDB' },
  { name: 'Git' },
  { name: 'Docker' },
  { name: 'AWS' },
];
