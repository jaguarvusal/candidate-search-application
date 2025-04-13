import { useState, useEffect, useCallback, useRef } from 'react';
import { searchGithub, searchGithubUser } from '../api/API';
import { Candidate } from '../interfaces/Candidate.interface';

export const useCandidateSearch = () => {
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noMoreCandidates, setNoMoreCandidates] = useState<boolean>(false);
  // Add new state for tracking when no suitable candidates are found
  const [noSuitableCandidatesFound, setNoSuitableCandidatesFound] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  
  // Use a ref to store the loadNextCandidate function to break circular dependencies
  const loadNextCandidateRef = useRef<() => void>(() => {});
  
  // Function to check if candidate has sufficient information
  const hasEnoughInfo = useCallback((candidate: any): boolean => {
    // First check for error conditions or if it's an organization
    if (!candidate || candidate.notFound || candidate.error || candidate.isOrganization) return false;

    // Must have at least 2 of these fields to be considered useful
    let infoCount = 0;
    if (candidate.location) infoCount++;
    if (candidate.email) infoCount++;
    if (candidate.company) infoCount++;
    if (candidate.bio) infoCount++;
    if (candidate.name) infoCount++;

    return infoCount >= 2;
  }, []);

  // Load details for a specific candidate
  const loadCandidateDetails = useCallback(async (username: string) => {
    if (!username) return;
    
    try {
      setLoading(true);
      const data = await searchGithubUser(username);
      
      // Simple case: we got a good candidate
      if (data && hasEnoughInfo(data) && !data.notFound && !data.error && !data.isOrganization) {
        console.log('Found suitable candidate:', data.login);
        setCurrentCandidate(data);
        setSkippedCount(0);
        setLoading(false);
        return;
      }
      
      // If user not found or not enough info or is organization, try next one
      console.log('Skipping candidate:', username, 'Reason:', 
        data.notFound ? 'Not found' : 
        data.isOrganization ? 'Is an organization' : 
        'Not enough info');
      
      setSkippedCount(prev => prev + 1);
      
      if (skippedCount >= 20) {
        setError('Failed to find suitable candidates after multiple attempts');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      setTimeout(() => loadNextCandidateRef.current(), 100);
    } catch (err) {
      console.error('Failed to load candidate details:', err);
      setLoading(false);
      setTimeout(() => loadNextCandidateRef.current(), 100);
    }
  }, [hasEnoughInfo, skippedCount]);

  // Move to next candidate
  const loadNextCandidate = useCallback(() => {
    if (loading) return;
    
    const nextIndex = candidateIndex + 1;
    
    if (nextIndex >= candidates.length) {
      // Fetch more candidates
      setLoading(true);
      searchGithub()
        .then(newCandidates => {
          if (newCandidates && newCandidates.length > 0) {
            setCandidates(newCandidates);
            setCandidateIndex(0);
            loadCandidateDetails(newCandidates[0].login);
          } else {
            setNoMoreCandidates(true);
            setLoading(false);
          }
        })
        .catch(() => {
          setError('Failed to load more candidates');
          setLoading(false);
        });
    } else {
      // Just move to next in current batch
      setCandidateIndex(nextIndex);
      loadCandidateDetails(candidates[nextIndex].login);
    }
  }, [loading, candidateIndex, candidates, loadCandidateDetails]);

  // Update the ref whenever loadNextCandidate changes
  useEffect(() => {
    loadNextCandidateRef.current = loadNextCandidate;
  }, [loadNextCandidate]);

  // Save current candidate
  const saveCandidate = useCallback(() => {
    if (!currentCandidate || loading) return;
    
    const savedCandidates = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    savedCandidates.push(currentCandidate);
    localStorage.setItem('savedCandidates', JSON.stringify(savedCandidates));
    
    loadNextCandidateRef.current();
  }, [currentCandidate, loading]);

  // Skip current candidate
  const skipCandidate = useCallback(() => {
    if (loading) return;
    loadNextCandidateRef.current();
  }, [loading]);

  // Load initial candidates with improved timeout handling
  useEffect(() => {
    // Create a ref to track if we found a candidate
    let candidateFound = false;
    
    // Store the timeout ID in a ref so we can clear it
    const timeoutId = setTimeout(() => {
      // Only show timeout error if still loading AND no candidate was found
      if (loading && !candidateFound) {
        setLoading(false);
        setError('Loading timed out. Please refresh the page.');
      }
    }, 15000); // 15 seconds timeout
    
    // Simplified initialization function that doesn't depend on other state variables
    const initialize = async () => {
      console.log('Starting initialization...');
      try {
        const users = await searchGithub();
        console.log(`Received ${users?.length || 0} users from GitHub API`);
        
        if (!users || users.length === 0) {
          setNoMoreCandidates(true);
          setLoading(false);
          return;
        }
        
        setCandidates(users);
        
        // Try users one by one until we find a good one
        let foundSuitableCandidate = false;
        for (let i = 0; i < Math.min(10, users.length); i++) { // Try more users (10 instead of 5)
          // Exit early if we're no longer mounted
          if (candidateFound) return;
          
          const user = users[i];
          if (user && user.login) {
            console.log(`Trying user #${i}: ${user.login}`);
            const userData = await searchGithubUser(user.login);
            
            if (userData && !userData.notFound && !userData.error && !userData.isOrganization && hasEnoughInfo(userData)) {
              console.log('Found suitable candidate:', user.login);
              setCurrentCandidate(userData);
              setCandidateIndex(i);
              foundSuitableCandidate = true;
              candidateFound = true; // Mark that we found a candidate
              break;
            } else {
              console.log('User not suitable:', user.login);
            }
          }
        }
        
        if (!foundSuitableCandidate) {
          console.log('No suitable candidates found in batch');
          setNoSuitableCandidatesFound(true); // Set the new state when no suitable candidates found
          // Don't automatically try to load next candidate - show the refresh prompt instead
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load candidates: ${errorMessage}`);
        setLoading(false);
      }
    };
    
    initialize();
    
    return () => {
      // Clear timeout on cleanup and mark candidateFound to prevent state updates after unmount
      clearTimeout(timeoutId);
      candidateFound = true;
    };
  }, [hasEnoughInfo]); // Only depend on hasEnoughInfo which is stable

  return {
    currentCandidate,
    loading,
    error,
    noMoreCandidates,
    noSuitableCandidatesFound, // Add the new state to the return value
    saveCandidate,
    skipCandidate
  };
};
