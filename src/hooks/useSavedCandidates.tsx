import { useState, useEffect, useCallback } from 'react';
import { Candidate } from '../interfaces/Candidate.interface';

export const useSavedCandidates = () => {
  const [savedCandidates, setSavedCandidates] = useState<Candidate[]>([]);

  // Load saved candidates from localStorage on component mount
  useEffect(() => {
    const loadSavedCandidates = () => {
      const storedCandidates = localStorage.getItem('savedCandidates');
      if (storedCandidates) {
        try {
          const parsedCandidates = JSON.parse(storedCandidates);
          setSavedCandidates(parsedCandidates);
        } catch (error) {
          console.error('Error parsing saved candidates:', error);
          setSavedCandidates([]);
        }
      }
    };
    
    loadSavedCandidates();
  }, []);

  // Remove a candidate from the list
  const removeCandidate = useCallback((index: number) => {
    setSavedCandidates(prevCandidates => {
      const updatedCandidates = [...prevCandidates];
      updatedCandidates.splice(index, 1);
      
      // Update localStorage
      localStorage.setItem('savedCandidates', JSON.stringify(updatedCandidates));
      
      return updatedCandidates;
    });
  }, []);

  return {
    savedCandidates,
    removeCandidate
  };
};
