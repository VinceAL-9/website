import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { PageLayout } from '../components/layout';
import { Button, Modal, Badge } from '../components/common';
import { EventCard } from '../components/features';
import { eventsApi } from '../services/api';
import { useScrollAnimationList } from '../hooks';
import { useUserAuth } from '../context';
import type { ApiEvent, Event, BadgeVariant } from '../types';

/**
 * Maps an API event to the frontend Event type for EventCard compatibility
 */
function mapApiEventToEvent(apiEvent: ApiEvent): Event {
  // Determine badge based on event title/description
  const getBadge = (event: ApiEvent): { text: string; variant: BadgeVariant } => {
    const title = event.title.toLowerCase();
    const desc = event.description.toLowerCase();

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
    if (desc.includes('national')) return { text: 'National Competition', variant: 'success' };

    return { text: 'Event', variant: 'primary' };
  };

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    image: apiEvent.imageUrl,
    date: new Date(apiEvent.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    badge: getBadge(apiEvent),
    stats: apiEvent.location || '',
    isUpcoming: apiEvent.isUpcoming,
  };
}

export const Events = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useUserAuth();

  const { containerRef: eventsRef, visibleItems: visibleEvents } = useScrollAnimationList(
    pastEvents.length,
    100
  );
  const { containerRef: upcomingRef, visibleItems: visibleUpcoming } = useScrollAnimationList(
    upcomingEvents.length,
    150
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all events in parallel
        const [pastResponse, upcomingResponse] = await Promise.all([
          eventsApi.getPastEvents(),
          eventsApi.getUpcomingEvents(),
        ]);

        setPastEvents(pastResponse.map(mapApiEventToEvent));
        setUpcomingEvents(upcomingResponse.map(mapApiEventToEvent));
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <PageLayout>
      {/* Header Section */}
      <section className="py-16 px-4 bg-linear-to-b from-gray-100 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Events & Activities</h1>
          <p className="text-xl text-gray-600">
            Recent competitions and activities organized by PSSE
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <FaSpinner className="w-8 h-8 text-psse-accent animate-spin" />
              <span className="ml-3 text-gray-600">Loading events...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No past events to display.</p>
            </div>
          ) : (
            <div
              ref={eventsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {pastEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`transition-all duration-500 ${visibleEvents.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Upcoming Events</h2>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="w-6 h-6 text-psse-accent animate-spin" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No upcoming events at this time. Check back soon!</p>
            </div>
          ) : (
            <div ref={upcomingRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="transition-all duration-500 opacity-100 translate-y-0"
                  style={{
                    animation: visibleUpcoming.has(index) ? `fadeInUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want to participate in our events?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join PSSE and be part of exciting competitions, workshops, and networking opportunities!
          </p>
          <Button variant="primary" size="lg" onClick={() => setIsJoinModalOpen(true)}>
            Join PSSE
          </Button>
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

      {/* Join Modal */}
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
