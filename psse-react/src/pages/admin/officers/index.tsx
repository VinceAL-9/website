import { createContext, useContext, useState, useMemo, useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaUsers } from 'react-icons/fa';
import { Button, Filter, Modal } from '../../../components/common';
import { officersApi } from '../../../services/api';
import type { ApiOfficer } from '../../../types/api.types';
import { useOfficers, initialOfficerForm, type OfficerFormData } from './useOfficers';
import { useScrollPagination } from '../../../hooks/useScrollPagination';

const OFFICER_CATEGORY_OPTIONS = [
  { value: 'EXEC', label: 'Executive Board' },
  { value: 'ADMIN', label: 'Administrative' },
  { value: 'FINANCE', label: 'Finance & Treasury' },
  { value: 'REP', label: 'Year Level Reps' },
  { value: 'AMBASSADOR', label: 'Ambassadors' },
];

interface OfficersContextType {
    officers: ApiOfficer[];
    loading: boolean;
    error: string | null;
    loadOfficers: () => Promise<void>;
    showOfficerModal: boolean;
    closeOfficerModal: () => void;
    handleOfficerSubmit: (e: FormEvent) => Promise<void>;
    officerForm: OfficerFormData;
    setOfficerForm: React.Dispatch<React.SetStateAction<OfficerFormData>>;
    editingOfficer: ApiOfficer | null;
    officerSubmitting: boolean;
    setSelectedOfficerPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
    officerPhotoPreview: string | null;
    setOfficerPhotoPreview: React.Dispatch<React.SetStateAction<string | null>>;
    openEditOfficerModal: (officer: ApiOfficer) => void;
    handleDeleteOfficer: (officer: ApiOfficer) => Promise<void>;
    openAddOfficerModal: () => void;
    displayedOfficers: ApiOfficer[];
    hasMore: boolean;
    loadMore: () => void;
    officerCategoryFilter: string;
    setOfficerCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
}

const OfficersContext = createContext<OfficersContextType | null>(null);

export const OfficersHeader = () => {
  const context = useContext(OfficersContext);
  if (!context) return null;
  const { openAddOfficerModal, officerCategoryFilter, setOfficerCategoryFilter } = context;
  return (
    <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 py-4 px-6 flex justify-between items-center gap-3 w-full">
        <h2 className="text-xl font-bold text-gray-800">Update Officers</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Filter label="Filter by Category" options={[{ label: 'All Categories', value: 'all' }, ...OFFICER_CATEGORY_OPTIONS]} selected={officerCategoryFilter} onFilterChange={setOfficerCategoryFilter} className="w-48" />
          <Button onClick={openAddOfficerModal}><FaPlus className="mr-2" /> Add Officer</Button>
        </div>
      </div>
  );
};

export const OfficersContent = () => {
  const context = useContext(OfficersContext);
  if (!context) return null;
  const { displayedOfficers, loading, error, loadOfficers, showOfficerModal, closeOfficerModal, handleOfficerSubmit, officerForm, setOfficerForm, editingOfficer, officerSubmitting, setSelectedOfficerPhotoFile, officerPhotoPreview, setOfficerPhotoPreview, openEditOfficerModal, handleDeleteOfficer, hasMore, loadMore } = context;

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
  if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}<button onClick={loadOfficers} className="ml-2 underline">Retry</button></div>;

  return (
    <div ref={containerRef} className="p-6 bg-white rounded-xl shadow-sm overflow-y-auto max-h-[80vh]">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedOfficers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No officers found.</td></tr>
            ) : (
              displayedOfficers.map((officer: ApiOfficer) => (
                <tr key={officer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{officer.photoUrl ? <img src={officer.photoUrl} alt={officer.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"><FaUsers className="text-gray-400" /></div>}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{officer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{officer.position}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{officer.category}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{officer.academicYear}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditOfficerModal(officer)} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><FaEdit className="mr-1" /> Edit</button>
                    <button onClick={() => handleDeleteOfficer(officer)} className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><FaTrash className="mr-1" /> Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {hasMore && <div className="py-4 text-center text-gray-500">Loading more...</div>}
        <Modal isOpen={showOfficerModal} onClose={closeOfficerModal} title={editingOfficer ? 'Edit Officer' : 'Add New Officer'} size="lg">
            <form onSubmit={handleOfficerSubmit} className="space-y-4">
            <div><label htmlFor="officer-name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input id="officer-name" name="name" type="text" required value={officerForm.name} onChange={(e) => setOfficerForm((p: OfficerFormData) => ({...p, name: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" placeholder="Officer name" /></div>
            <div><label htmlFor="officer-position" className="block text-sm font-medium text-gray-700 mb-1">Position *</label><input id="officer-position" name="position" type="text" required value={officerForm.position} onChange={(e) => setOfficerForm((p: OfficerFormData) => ({...p, position: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" /></div>
            <div><label htmlFor="officer-category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label><select id="officer-category" name="category" required value={officerForm.category} onChange={(e) => setOfficerForm((p: OfficerFormData) => ({...p, category: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent">{OFFICER_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label htmlFor="officer-academicYear" className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label><input id="officer-academicYear" name="academicYear" type="text" required value={officerForm.academicYear} onChange={(e) => setOfficerForm((p: OfficerFormData) => ({...p, academicYear: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" /></div>
            <div><label htmlFor="officer-order" className="block text-sm font-medium text-gray-700 mb-1">Display Order</label><input id="officer-order" name="order" type="number" value={officerForm.order} onChange={(e) => setOfficerForm((p: OfficerFormData) => ({...p, order: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" /></div>
            <div>
                <label htmlFor="officer-photo" className="block text-sm font-medium text-gray-700 mb-1">Photo {!editingOfficer && '*'}</label>
                <input id="officer-photo" type="file" accept="image/*" required={!editingOfficer} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setSelectedOfficerPhotoFile(file); const reader = new FileReader(); reader.onloadend = () => setOfficerPhotoPreview(reader.result as string); reader.readAsDataURL(file); } else { setSelectedOfficerPhotoFile(null); setOfficerPhotoPreview(editingOfficer?.photoUrl || null); } }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" />
                {officerPhotoPreview && <div className="mt-4 flex flex-col items-center gap-2"><img src={officerPhotoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-full border-4 border-gray-200" /></div>}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={closeOfficerModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" disabled={officerSubmitting}>Cancel</button><Button type="submit" disabled={officerSubmitting}>{officerSubmitting ? 'Saving...' : editingOfficer ? 'Update Officer' : 'Create Officer'}</Button></div>
            </form>
        </Modal>
    </div>
  );
};


export const OfficersProvider = ({ children }: { children: ReactNode }) => {
  const { officers, loading, error, loadOfficers } = useOfficers();
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<ApiOfficer | null>(null);
  const [officerForm, setOfficerForm] = useState<OfficerFormData>(initialOfficerForm);
  const [officerSubmitting, setOfficerSubmitting] = useState(false);
  const [selectedOfficerPhotoFile, setSelectedOfficerPhotoFile] = useState<File | null>(null);
  const [officerPhotoPreview, setOfficerPhotoPreview] = useState<string | null>(null);
  const [officerCategoryFilter, setOfficerCategoryFilter] = useState('all');

  const filteredOfficers = useMemo(() => {
    if (officerCategoryFilter === 'all') return officers;
    return officers.filter((officer) => officer.category === officerCategoryFilter);
  }, [officers, officerCategoryFilter]);

  const { displayedItems: displayedOfficers, hasMore, loadMore, reset: resetPagination } = useScrollPagination(filteredOfficers);

  useEffect(() => {
    resetPagination();
  }, [filteredOfficers, resetPagination]);

  const openAddOfficerModal = () => {
    setEditingOfficer(null);
    setOfficerForm(initialOfficerForm);
    setSelectedOfficerPhotoFile(null);
    setOfficerPhotoPreview(null);
    setShowOfficerModal(true);
  };

  const openEditOfficerModal = (officer: ApiOfficer) => {
    setEditingOfficer(officer);
    setOfficerForm({ name: officer.name, position: officer.position, category: officer.category, academicYear: officer.academicYear, order: String(officer.order || 0) });
    setSelectedOfficerPhotoFile(null);
    setOfficerPhotoPreview(officer.photoUrl);
    setShowOfficerModal(true);
  };

  const closeOfficerModal = () => {
    setShowOfficerModal(false);
    setEditingOfficer(null);
    setOfficerForm(initialOfficerForm);
    setSelectedOfficerPhotoFile(null);
    setOfficerPhotoPreview(null);
  };

  const handleOfficerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOfficerSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', officerForm.name);
      formData.append('position', officerForm.position);
      formData.append('category', officerForm.category);
      formData.append('academicYear', officerForm.academicYear);
      formData.append('order', officerForm.order);
      if (selectedOfficerPhotoFile) formData.append('photo', selectedOfficerPhotoFile);

      if (editingOfficer) await officersApi.updateOfficer(editingOfficer.id, formData);
      else {
        if (!selectedOfficerPhotoFile) { alert('Please select a photo for the officer.'); setOfficerSubmitting(false); return; }
        await officersApi.createOfficer(formData);
      }
      closeOfficerModal();
      loadOfficers();
    } catch (err) {
      console.error('Error saving officer:', err);
      alert('Failed to save officer. Please try again.');
    } finally {
      setOfficerSubmitting(false);
    }
  };

  const handleDeleteOfficer = async (officer: ApiOfficer) => {
    if (!window.confirm(`Are you sure you want to delete "${officer.name}"?`)) return;
    try {
      await officersApi.deleteOfficer(officer.id);
      loadOfficers();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      if (error.response?.status !== 401) alert(`Failed to delete officer: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  return (
    <OfficersContext.Provider value={{ officers, loading, error, loadOfficers, showOfficerModal, closeOfficerModal, handleOfficerSubmit, officerForm, setOfficerForm, editingOfficer, officerSubmitting, setSelectedOfficerPhotoFile, officerPhotoPreview, setOfficerPhotoPreview, openEditOfficerModal, handleDeleteOfficer, openAddOfficerModal, displayedOfficers, hasMore, loadMore, officerCategoryFilter, setOfficerCategoryFilter }}>
      {children}
    </OfficersContext.Provider>
  );
};

export const OfficersView = () => {
  return (
    <OfficersProvider>
      <OfficersHeader />
      <div className="mt-6">
        <OfficersContent />
      </div>
    </OfficersProvider>
  );
};
