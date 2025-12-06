import { FaCalendarAlt } from 'react-icons/fa';
import { Card, CardImage, CardBody, Badge } from '../common';
import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="h-full flex flex-col cursor-pointer hover:shadow-2xl transition-shadow duration-300">
      <CardImage src={event.image} alt={event.title} />
      <CardBody className="flex-1 flex flex-col">
        <Badge variant={event.badge.variant} className="mb-2 self-start">
          {event.badge.text}
        </Badge>
        <h5 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h5>
        <div className="flex items-center gap-2 mt-auto text-sm text-gray-500">
          <FaCalendarAlt className="text-psse-accent" />
          <span>{event.date}</span>
        </div>
      </CardBody>
    </Card>
  );
};
