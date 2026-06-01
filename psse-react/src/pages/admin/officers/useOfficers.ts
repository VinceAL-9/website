import { useState, useEffect } from 'react';
import { officersApi } from '../../../services/api';
import type { ApiOfficer } from '../../../types/api.types';

export interface OfficerFormData {
  name: string;
  position: string;
  category: string;
  academicYear: string;
  order: string;
}

export const initialOfficerForm: OfficerFormData = {
  name: '',
  position: '',
  category: 'EXEC',
  academicYear: '',
  order: '0',
};

export const useOfficers = () => {
  const [officers, setOfficers] = useState<ApiOfficer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOfficers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await officersApi.getOfficers();
      setOfficers(data);
    } catch (err) {
      setError('Failed to load officers. Please try again.');
      console.error('Error loading officers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchOfficers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await officersApi.getOfficers();
        if (active) setOfficers(data);
      } catch (err) {
        if (active) setError('Failed to load officers. Please try again.');
        console.error('Error loading officers:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOfficers();
    return () => { active = false; };
  }, []);

  return { officers, loading, error, loadOfficers, setOfficers };
};
