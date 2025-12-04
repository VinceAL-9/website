import { FaCalendarAlt, FaTrophy, FaUsers } from 'react-icons/fa';
import { Card, CardImage, CardBody, Badge } from '../common';
import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardImage src={event.image} alt={event.title} />
      <CardBody className="flex-1 flex flex-col">
        <Badge variant={event.badge.variant} className="mb-2 self-start">
          {event.badge.text}
        </Badge>
        <h5 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h5>
        <p className="text-gray-600 text-sm flex-1">{event.description}</p>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FaCalendarAlt className="text-psse-accent" />
            {event.date}
          </span>
          <span className="flex items-center gap-1">
            {event.stats.includes('Place') || event.stats.includes('Champion') ? (
              <FaTrophy className="text-yellow-500" />
            ) : (
              <FaUsers className="text-psse-accent" />
            )}
            {event.stats}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};
