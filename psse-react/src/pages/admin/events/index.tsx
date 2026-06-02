import { createContext, useContext, useState, useMemo, useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { Button, Filter } from '../../../components/common';
import { eventsApi } from '../../../services/api';
import type { ApiEvent } from '../../../types';
import { useEvents, initialEventForm, type EventFormData } from './useEvents';
import { EventTable } from './EventTable';
import { EventModal } from './EventModal';
import { useScrollPagination } from '../../../hooks/useScrollPagination';

interface EventsContextType {
    events: ApiEvent[];
    loading: boolean;
    error: string | null;
    loadEvents: () => Promise<void>;
    showEventModal: boolean;
    setShowEventModal: React.Dispatch<React.SetStateAction<boolean>>;
    editingEvent: ApiEvent | null;
    setEditingEvent: React.Dispatch<React.SetStateAction<ApiEvent | null>>;
    eventForm: EventFormData;
    setEventForm: React.Dispatch<React.SetStateAction<EventFormData>>;
    eventSubmitting: boolean;
    setEventSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    selectedImageFile: File | null;
    setSelectedImageFile: React.Dispatch<React.SetStateAction<File | null>>;
    imagePreview: string | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    eventYearFilter: string;
    setEventYearFilter: React.Dispatch<React.SetStateAction<string>>;
    eventStatusFilter: string;
    setEventStatusFilter: React.Dispatch<React.SetStateAction<string>>;
    displayedEvents: ApiEvent[];
    hasMore: boolean;
    loadMore: () => void;
    eventYearOptions: { label: string; value: string; }[];
    eventStatusOptions: { label: string; value: string; }[];
    openEditEventModal: (event: ApiEvent) => void;
    handleDeleteEvent: (event: ApiEvent) => Promise<void>;
    formatDate: (dateString: string) => string;
    closeEventModal: () => void;
    handleEventSubmit: (e: FormEvent) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | null>(null);

export const EventsHeader = () => {
    const context = useContext(EventsContext);
    if (!context) return null;
    const { setShowEventModal, setEditingEvent, setEventForm, setSelectedImageFile, setImagePreview, eventYearFilter, setEventYearFilter, eventStatusFilter, setEventStatusFilter, eventYearOptions, eventStatusOptions } = context;
    return (
      <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 py-4 px-6 flex justify-between items-center gap-3 w-full">
        <h2 className="text-xl font-bold text-gray-800">Manage Events</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Filter label="Filter by Year" options={eventYearOptions} selected={eventYearFilter} onFilterChange={setEventYearFilter} className="w-40" />
          <Filter label="Filter by Status" options={eventStatusOptions} selected={eventStatusFilter} onFilterChange={setEventStatusFilter} className="w-40" />
          <Button onClick={() => { setEditingEvent(null); setEventForm(initialEventForm); setSelectedImageFile(null); setImagePreview(null); setShowEventModal(true); }}><FaPlus className="mr-2" /> Add Event</Button>
        </div>
      </div>
    );
};

export const EventsContent = () => {
    const context = useContext(EventsContext);
    if (!context) return null;
    const { loading, error, loadEvents, displayedEvents, openEditEventModal, handleDeleteEvent, formatDate, showEventModal, closeEventModal, handleEventSubmit, eventForm, setEventForm, editingEvent, eventSubmitting, selectedImageFile, setSelectedImageFile, imagePreview, setImagePreview, hasMore, loadMore } = context;

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;
            
            const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
            
            if (isAtBottom && hasMore) {
                loadMore();
            }
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [hasMore, loadMore]);

    if (loading) return <div className="flex items-center justify-center py-12"><FaSpinner className="animate-spin text-3xl text-psse-accent" /></div>;
    if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}<button onClick={loadEvents} className="ml-2 underline">Retry</button></div>;
    return (
        <div ref={containerRef} className="p-6 bg-white rounded-xl shadow-sm overflow-y-auto max-h-[80vh]">
            <EventTable events={displayedEvents} onEdit={openEditEventModal} onDelete={handleDeleteEvent} formatDate={formatDate} />
            <EventModal
                isOpen={showEventModal}
                onClose={closeEventModal}
                onSubmit={handleEventSubmit}
                form={eventForm}
                setForm={setEventForm}
                editingEvent={editingEvent}
                submitting={eventSubmitting}
                selectedImageFile={selectedImageFile}
                setSelectedImageFile={setSelectedImageFile}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
            />
            {hasMore && <div className="py-4 text-center text-gray-500">Loading more...</div>}
        </div>
    );
};


export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { events, loading, error, loadEvents } = useEvents();
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventFormData>(initialEventForm);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [eventYearFilter, setEventYearFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (eventYearFilter !== 'all') {
      filtered = filtered.filter(e => new Date(e.date).getFullYear().toString() === eventYearFilter);
    }
    if (eventStatusFilter !== 'all') {
      const isUpcoming = eventStatusFilter === 'upcoming';
      filtered = filtered.filter(e => e.isUpcoming === isUpcoming);
    }
    return filtered;
  }, [events, eventYearFilter, eventStatusFilter]);

  const { displayedItems: displayedEvents, hasMore, loadMore, reset: resetPagination } = useScrollPagination(filteredEvents);

  useEffect(() => {
    resetPagination();
  }, [filteredEvents, resetPagination]);

  const eventYearOptions = useMemo(() => {
    const years = Array.from(new Set(events.map(e => new Date(e.date).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a));
    return [{ label: 'All Years', value: 'all' }, ...years.map(y => ({ label: y, value: y }))];
  }, [events]);

  const eventStatusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past', value: 'past' },
  ];

  const openEditEventModal = (event: ApiEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date.split('T')[0],
      description: event.description,
      location: event.location,
      isUpcoming: event.isUpcoming,
    });
    setSelectedImageFile(null);
    setImagePreview(event.imageUrl);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm(initialEventForm);
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const handleEventSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEventSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', new Date(eventForm.date).toISOString());
      formData.append('location', eventForm.location);
      formData.append('isUpcoming', eventForm.isUpcoming.toString());
      if (selectedImageFile) formData.append('image', selectedImageFile);

      if (editingEvent) {
        await eventsApi.updateEvent(editingEvent.id, formData);
      } else {
        if (!selectedImageFile) {
          alert('Please select an image for the event.');
          setEventSubmitting(false);
          return;
        }
        await eventsApi.createEvent(formData);
      }
      closeEventModal();
      loadEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event. Please try again.');
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event: ApiEvent) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) return;
    try {
      await eventsApi.deleteEvent(event.id);
      loadEvents();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      if (error.response?.status !== 401) alert(`Failed to delete event: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <EventsContext.Provider value={{ events, loading, error, loadEvents, showEventModal, setShowEventModal, editingEvent, setEditingEvent, eventForm, setEventForm, eventSubmitting, setEventSubmitting, selectedImageFile, setSelectedImageFile, imagePreview, setImagePreview, eventYearFilter, setEventYearFilter, eventStatusFilter, setEventStatusFilter, displayedEvents, hasMore, loadMore, eventYearOptions, eventStatusOptions, openEditEventModal, handleDeleteEvent, formatDate, closeEventModal, handleEventSubmit }}>
        {children}
    </EventsContext.Provider>
  );
};

export const EventsView = () => {
  return (
    <EventsProvider>
        <EventsHeader />
        <div className="mt-6">
            <EventsContent />
        </div>
    </EventsProvider>
  );
};
