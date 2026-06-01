import { useState, useEffect } from 'react';
import { eventsApi } from '../../../services/api';
import type { ApiEvent } from '../../../types/api.types';

export interface EventFormData {
  title: string;
  date: string;
  description: string;
  location: string;
  isUpcoming: boolean;
}

export const initialEventForm: EventFormData = {
  title: '',
  date: '',
  description: '',
  location: '',
  isUpcoming: true,
};

export const useEvents = () => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getEvents();
        if (active) setEvents(data);
      } catch (err) {
        if (active) setError('Failed to load events. Please try again.');
        console.error('Error loading events:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchEvents();
    return () => { active = false; };
  }, []);

  return { events, loading, error, loadEvents, setEvents };
};
