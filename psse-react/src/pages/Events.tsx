import { useState } from 'react';
import { FaCalendarCheck, FaGraduationCap } from 'react-icons/fa';
import { PageLayout } from '../components/layout';
import { Card, CardBody, Button, Modal } from '../components/common';
import { EventCard } from '../components/features';
import { events, upcomingEvents } from '../data/events';
import { useScrollAnimationList } from '../hooks';

export const Events = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const { containerRef: eventsRef, visibleItems: visibleEvents } = useScrollAnimationList(
    events.length,
    100
  );
  const { containerRef: upcomingRef, visibleItems: visibleUpcoming } = useScrollAnimationList(
    upcomingEvents.length,
    150
  );

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
          <div
            ref={eventsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`transition-all duration-500 ${
                  visibleEvents.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Upcoming Events</h2>

          <div ref={upcomingRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card
                key={event.id}
                className={`transition-all duration-500 ${
                  visibleUpcoming.has(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {index === 0 ? (
                        <FaCalendarCheck className="w-10 h-10 text-psse-accent" />
                      ) : (
                        <FaGraduationCap className="w-10 h-10 text-green-500" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h5>
                      <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
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
        </div>
      </Modal>
    </PageLayout>
  );
};
