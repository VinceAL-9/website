import { type FormEvent, type ChangeEvent } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Modal, Button } from '../../../components/common';
import type { ApiEvent } from '../../../types/api.types';
import { type EventFormData } from './useEvents';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  form: EventFormData;
  setForm: React.Dispatch<React.SetStateAction<EventFormData>>;
  editingEvent: ApiEvent | null;
  submitting: boolean;
  selectedImageFile: File | null;
  setSelectedImageFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
}

export const EventModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  editingEvent,
  submitting,
  selectedImageFile,
  setSelectedImageFile,
  imagePreview,
  setImagePreview,
}: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingEvent ? 'Edit Event' : 'Add New Event'} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" placeholder="Event title" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input id="date" name="date" type="date" required value={form.date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea id="description" name="description" required rows={4} value={form.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent resize-none" placeholder="Event description" />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Event Image {!editingEvent && '*'}</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required={!editingEvent}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(file);
              } else {
                setSelectedImageFile(null);
                setImagePreview(editingEvent?.imageUrl || null);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-psse-accent file:text-white hover:file:bg-psse-accent/90"
          />
          {imagePreview && (
            <div className="mt-3">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-300" />
            </div>
          )}
          {editingEvent && !selectedImageFile && <p className="mt-1 text-sm text-gray-500">Leave empty to keep existing image</p>}
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input id="location" name="location" type="text" required value={form.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" placeholder="Event location" />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isUpcoming"
            name="isUpcoming"
            type="checkbox"
            checked={form.isUpcoming}
            onChange={(e) => setForm((prev) => ({ ...prev, isUpcoming: e.target.checked }))}
            className="w-4 h-4 text-psse-accent border-gray-300 rounded focus:ring-psse-accent"
          />
          <label htmlFor="isUpcoming" className="text-sm text-gray-700">Mark as upcoming event</label>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" disabled={submitting}>Cancel</button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <><FaSpinner className="animate-spin mr-2" /> Saving...</> : editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
