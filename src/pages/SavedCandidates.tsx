import { useSavedCandidates } from '../hooks/useSavedCandidates';
import '../styles/SavedCandidates.css';

const SavedCandidates = () => {
  const { savedCandidates, removeCandidate } = useSavedCandidates();

  // Display message if no candidates are saved
  if (savedCandidates.length === 0) {
    return (
      <div className="saved-candidates-container">
        <h1>Potential Candidates</h1>
        <div className="no-candidates-message">
          <p>No potential candidates have been saved yet.</p>
          <p>Go to the home page and click the + button to save candidates you're interested in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-candidates-container">
      <h1>Potential Candidates</h1>
      
      <div className="table-responsive">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Location</th>
              <th>Company</th>
              <th>Email</th>
              <th>Bio</th>
              <th>Profile</th>
              <th>Reject</th>
            </tr>
          </thead>
          <tbody>
            {savedCandidates.map((candidate, index) => (
              <tr key={`${candidate.login}-${index}`}>
                <td className="avatar-cell">
                  <img 
                    src={candidate.avatar_url} 
                    alt={`${candidate.login}'s avatar`} 
                  />
                </td>
                <td>
                  {candidate.name ? `${candidate.name} (${candidate.login})` : `(${candidate.login})`}
                </td>
                <td>{candidate.location || 'N/A'}</td>
                <td>{candidate.company || 'N/A'}</td>
                <td>{candidate.email || 'N/A'}</td>
                <td>
                  {candidate.bio ? 
                    (candidate.bio.length > 100 ? 
                      `${candidate.bio.substring(0, 100)}...` : candidate.bio
                    ) : 'N/A'
                  }
                </td>
                <td>
                  <a href={candidate.html_url} target="_blank" rel="noopener noreferrer">
                    View Profile
                  </a>
                </td>
                <td className="reject-cell">
                  <button 
                    onClick={() => removeCandidate(index)}
                    className="reject-button"
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavedCandidates;
