import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHandshake,
  FaGraduationCap,
  FaCalendarAlt,
  FaTools,
  FaCoffee,
  FaCode,
  FaBug,
  FaUsers,
  FaSpinner,
  FaArrowRight,
  FaMapMarkerAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { PageLayout } from '../components/layout';
import { Button, Card, CardBody, Badge, Modal } from '../components/common';
import { EventCard } from '../components/features';
import { coreActivities, studentLifeItems, techStack } from '../data/events';
import { eventsApi } from '../services/api';
import { useScrollAnimationList } from '../hooks';
import { useUserAuth } from '../context';
import type { ApiEvent, Event, BadgeVariant } from '../types';

// Icon mapping for activities
const activityIcons: Record<string, React.ReactNode> = {
  handshake: <FaHandshake className="w-12 h-12 text-psse-accent" />,
  'graduation-cap': <FaGraduationCap className="w-12 h-12 text-psse-accent" />,
  calendar: <FaCalendarAlt className="w-12 h-12 text-psse-accent" />,
  tools: <FaTools className="w-12 h-12 text-psse-accent" />,
};

// Icon mapping for student life
const studentLifeIcons: Record<string, React.ReactNode> = {
  coffee: <FaCoffee className="w-8 h-8 text-psse-accent" />,
  code: <FaCode className="w-8 h-8 text-psse-accent" />,
  bug: <FaBug className="w-8 h-8 text-psse-accent" />,
  users: <FaUsers className="w-8 h-8 text-psse-accent" />,
};

/**
 * Maps an API event to the frontend Event type for EventCard compatibility
 */
function mapApiEventToEvent(apiEvent: ApiEvent): Event {
  const getBadge = (event: ApiEvent): { text: string; variant: BadgeVariant } => {
    const title = event.title.toLowerCase();

    if (title.includes('hackathon')) return { text: 'Hackathon', variant: 'danger' };
    if (title.includes('workshop')) return { text: 'Workshop', variant: 'secondary' };
    if (title.includes('competition') || title.includes('championship'))
      return { text: 'Competition', variant: 'primary' };
    if (title.includes('ceremony') || title.includes('induction'))
      return { text: 'Ceremony', variant: 'info' };
    if (title.includes('contest')) return { text: 'Contest', variant: 'warning' };
    if (title.includes('talk') || title.includes('seminar'))
      return { text: 'Talk', variant: 'primary' };
    if (title.includes('career') || title.includes('fair'))
      return { text: 'Career', variant: 'success' };

    return { text: 'Upcoming', variant: 'success' };
  };

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    image: apiEvent.imageUrl,
    date: new Date(apiEvent.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    badge: getBadge(apiEvent),
    stats: apiEvent.location || '',
    isUpcoming: apiEvent.isUpcoming,
  };
}

export const Home = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const { user, isAuthenticated } = useUserAuth();

  const { containerRef: activitiesRef, visibleItems: visibleActivities } = useScrollAnimationList(
    coreActivities.length,
    100
  );
  const { containerRef: techRef, visibleItems: visibleTech } = useScrollAnimationList(
    techStack.length,
    50
  );
  const { containerRef: lifeRef, visibleItems: visibleLife } = useScrollAnimationList(
    studentLifeItems.length,
    100
  );
  const { containerRef: eventsRef, visibleItems: visibleEvents } = useScrollAnimationList(
    upcomingEvents.length,
    100
  );

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);

        const response = await eventsApi.getUpcomingEvents();
        // Limit to 3 upcoming events for the home page
        const limitedEvents = response.slice(0, 3).map(mapApiEventToEvent);
        setUpcomingEvents(limitedEvents);
      } catch (err) {
        console.error('Failed to fetch upcoming events:', err);
        setEventsError('Failed to load events.');
      } finally {
        setEventsLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-linear-to-br from-psse-dark via-psse-primary to-psse-dark overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/background-cover.jpg')] bg-cover bg-center" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
            Philippine Society of Software Engineers
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fade-in-up">
            Shaping the next disruptors in software innovation
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
            <Button variant="primary" size="lg" onClick={() => setIsJoinModalOpen(true)}>
              Join Us
            </Button>
            <Link to="/about">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-50 to-transparent" />
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About PSSE</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            The official departmental organization of Software Engineering students at Central
            Philippine University. We aim to create a strong community for all software engineering
            students that encourages learning, collaboration, and innovation in software
            development.
          </p>
        </div>
      </section>

      {/* Core Activities Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Activities</h2>
            <p className="text-lg text-gray-600">
              What we do to shape the future of software engineering
            </p>
          </div>

          <div
            ref={activitiesRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {coreActivities.map((activity, index) => (
              <Card
                key={activity.id}
                className={`text-center transition-all duration-500 ${visibleActivities.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
                  }`}
              >
                <CardBody>
                  <div className="mb-4 flex justify-center">
                    {activityIcons[activity.icon]}
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h5>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Tech Stack</h2>
          <p className="text-lg text-gray-600 mb-8">Technologies we work with</p>

          <div ref={techRef} className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <Badge
                key={tech.name}
                variant="primary"
                className={`text-base px-4 py-2 transition-all duration-300 ${visibleTech.has(index) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
              >
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Events</h2>
            <p className="text-lg text-gray-600">
              Check out our upcoming activities and events
            </p>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="w-8 h-8 text-psse-accent animate-spin" />
              <span className="ml-3 text-gray-600">Loading events...</span>
            </div>
          ) : eventsError ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{eventsError}</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No upcoming events at this time.</p>
              <Link to="/events">
                <Button variant="outline">
                  View Past Events
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div
                ref={eventsRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                {upcomingEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="transition-all duration-500 opacity-100 translate-y-0"
                    style={{
                      animation: visibleEvents.has(index) ? `fadeInUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/events">
                  <Button variant="primary">
                    View All Events
                    <FaArrowRight className="ml-2 inline-block" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Student Life Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Life</h2>
            <p className="text-lg text-gray-600">
              What it's really like being a software engineering student
            </p>
          </div>

          <div ref={lifeRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {studentLifeItems.map((item, index) => (
              <Card
                key={item.id}
                className={`transition-all duration-500 ${visibleLife.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    {studentLifeIcons[item.icon]}
                    <h5 className="text-lg font-medium text-gray-900">{item.title}</h5>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          size="lg"
        >
          <div className="space-y-4">
            {/* Event Image */}
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-image.jpg';
                }}
              />
            </div>

            {/* Event Badge */}
            <Badge variant={selectedEvent.badge.variant}>
              {selectedEvent.badge.text}
            </Badge>

            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <FaCalendarAlt className="text-psse-accent" />
                <span className="font-medium">Date:</span>
                <span>{selectedEvent.date}</span>
              </div>

              <div className="flex items-start gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-psse-accent mt-1" />
                <div>
                  <span className="font-medium">Venue:</span>
                  <p className="text-gray-700">{selectedEvent.stats}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Join Us Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join PSSE"
        size="lg"
      >
        <div className="space-y-4">
          <p className="font-semibold text-gray-900">Welcome, Software Engineering Student!</p>
          <p className="text-gray-600">
            If you are a Software Engineering student at Central Philippine University, you are
            already part of the{' '}
            <strong>Philippine Society of Software Engineers (PSSE)</strong>.
          </p>

          <div>
            <p className="font-medium text-gray-900 mb-2">As a member, you can:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Take part in PSSE events, workshops, and projects</li>
              <li>Connect with fellow SE students and faculty mentors</li>
              <li>Develop your skills in leadership, collaboration, and technology</li>
              <li>Purchase exclusive PSSE merchandise</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-900 mb-2">How to get involved:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Stay updated through our official social media pages</li>
              <li>Visit our office at the Engineering Building, Room EN205</li>
              <li>Reach out to any PSSE officer for guidance</li>
            </ul>
          </div>

          <p className="text-gray-600">
            We look forward to seeing you actively contribute and grow with the PSSE community!
          </p>

          {/* Member Login/Register Buttons - Only show when not logged in */}
          {isAuthenticated ? (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <FaCheckCircle className="w-5 h-5" />
                <span className="font-medium">Welcome back, {user?.name || 'Member'}!</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                You're already logged in and can access all member features.
              </p>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Create an account to access exclusive member features like merchandise purchasing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/user/login" className="flex-1" onClick={() => setIsJoinModalOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/user/register" className="flex-1" onClick={() => setIsJoinModalOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </PageLayout>
  );
};
