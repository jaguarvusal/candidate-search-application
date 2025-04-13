import { useState, useEffect, useRef } from 'react';
import { useCandidateSearch } from '../hooks/useCandidateSearch';
// import { Candidate } from '../interfaces/Candidate.interface';
import '../styles/CandidateSearch.css';

const CandidateSearch = () => {
  const {
    currentCandidate,
    loading,
    error,
    noMoreCandidates,
    noSuitableCandidatesFound,
    saveCandidate,
    skipCandidate
  } = useCandidateSearch();

  // Refs for measuring card sections
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  
  // State to track card section heights
  const [sectionHeight, setSectionHeight] = useState<number>(0);

  // Effect to measure and adjust section heights
  useEffect(() => {
    if (currentCandidate && bottomSectionRef.current) {
      // Get the actual rendered height of the content in bottom section
      const contentHeight = bottomSectionRef.current.scrollHeight;
      
      // Set the height for both sections
      setSectionHeight(contentHeight);
      
      // Force any overflow to be visible in a consistent way
      const adjustHeight = Math.max(290, contentHeight); // Changed from 400px to 290px
      
      // Apply heights directly to the DOM elements for immediate effect
      if (bottomSectionRef.current) {
        bottomSectionRef.current.style.height = `${adjustHeight}px`;
      }
      
      if (topSectionRef.current) {
        topSectionRef.current.style.height = `${adjustHeight}px`;
      }
    }
  }, [currentCandidate]);

  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Looking for candidates...</p>
    </div>;
  }

  if (error) {
    return <div className="error-container">
      <h2>Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>;
  }

  if (noMoreCandidates) {
    return <div className="no-candidates">
      <h2>No more candidates available</h2>
      <p>Check back later or adjust your search criteria.</p>
    </div>;
  }

  if (noSuitableCandidatesFound || !currentCandidate) {
    return <div className="no-suitable-candidates">
      <h2>No Suitable Candidates Found</h2>
      <p>We couldn't find candidates with sufficient profile information in this batch.</p>
      <button 
        onClick={() => window.location.reload()}
        className="refresh-button"
      >
        Refresh to Load More Candidates
      </button>
    </div>;
  }

  return (
    <div className="candidate-search">
      <h1 style={{ marginTop: '0.2rem', marginBottom: '1rem' }}>Candidate Search</h1>

      {/* Only render candidate card if we have a candidate */}
      <div className="candidate-card" style={{ 
        maxWidth: '320px', // Reduced from 350px
        margin: '0 auto',
        backgroundColor: 'black',
        border: 'none',
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        display: 'block'
      }}>
        {/* Top half - Image section - adaptive height */}
        <div 
          id="candidate-image-top" 
          ref={topSectionRef}
          style={{ 
            height: sectionHeight ? `${sectionHeight}px` : '290px', // Changed from 'auto' to explicit 290px
            minHeight: '290px', // Reduced from 320px
            width: '100%',
            backgroundColor: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'height 0.3s ease',
            borderTopLeftRadius: '40px', // Match card radius
            borderTopRightRadius: '40px' // Match card radius
          }}
        >
          <img
            src={currentCandidate.avatar_url}
            alt={`${currentCandidate.login}'s avatar`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              position: 'absolute'
            }}
          />
        </div>

        {/* Bottom half - Info section - content determines height */}
        <div 
          id="candidate-info-bottom" 
          ref={bottomSectionRef}
          style={{ 
            height: 'auto',
            minHeight: '290px', // Reduced from 320px
            padding: '20px', // Reduced from 25px
            backgroundColor: 'black',
            color: 'white',
            boxSizing: 'border-box',
            display: 'block',
            transition: 'height 0.3s ease',
            borderBottomLeftRadius: '40px', // Match card radius
            borderBottomRightRadius: '40px' // Match card radius
          }}
        >
          <h2 style={{ 
            margin: '0 0 15px 0', // Reduced from 20px
            fontSize: '1.4em' // Reduced from 1.5em
          }}>{currentCandidate.login}</h2>
          
          <div style={{ fontSize: '0.95em', lineHeight: '1.6' }}>
            {currentCandidate.name && (
              <p className="info-field" style={{ margin: '12px 0' }}>
                <strong>Name:</strong> {currentCandidate.name}
              </p>
            )}
            
            <p className="info-field" style={{ margin: '12px 0' }}>
              <strong>Location:</strong> {currentCandidate.location || 'Not specified'}
            </p>
            
            <p className="info-field" style={{ margin: '12px 0' }}>
              <strong>Email:</strong> {currentCandidate.email || 'Not available'}
            </p>
            
            {currentCandidate.company && (
              <p className="info-field" style={{ margin: '12px 0' }}>
                <strong>Company:</strong> {currentCandidate.company}
              </p>
            )}
            
            {currentCandidate.bio && (
              <p className="info-field" style={{ margin: '12px 0' }}>
                <strong>Bio:</strong> {currentCandidate.bio.length > 100 ? 
                  `${currentCandidate.bio.substring(0, 100)}...` : currentCandidate.bio}
              </p>
            )}
            
            <p className="info-field" style={{ margin: '12px 0' }}>
              <strong>Profile:</strong> <a href={currentCandidate.html_url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </p>
          </div>
        </div>
      </div>

      {/* Position buttons with adjusted width to match card */}
      <div className="candidate-actions" style={{ 
        marginTop: '50px', 
        display: 'flex',
        justifyContent: 'space-between',
        width: '320px', // Match reduced card width
        margin: '40px auto 0',
      }}> 
        <button
          onClick={skipCandidate}
          style={{
            backgroundColor: '#ff4d4d',
            color: 'black',
            padding: '0',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '32px',
            width: '70px',
            height: '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold'
          }}
          disabled={loading}
        >
          -
        </button>
        <button
          onClick={saveCandidate}
          style={{
            backgroundColor: '#4CAF50',
            color: 'black',
            padding: '0',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '32px',
            width: '70px',
            height: '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold'
          }}
          disabled={loading}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CandidateSearch;
