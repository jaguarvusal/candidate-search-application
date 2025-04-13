import { Candidate } from '../interfaces/Candidate.interface';
// Import token directly
import { GITHUB_TOKEN as CONFIG_TOKEN } from '../config';

// Combine all token sources with more detailed logging
let GITHUB_TOKEN = '';

// Log current environment for debugging
console.log('Current environment vars available:', 
  Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

// Try environment variable first
if (import.meta.env.VITE_GITHUB_TOKEN) {
  console.log('Using token from environment variable');
  GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
}
// Fall back to config file
else if (CONFIG_TOKEN) {
  console.log('Using token from config.ts file');
  GITHUB_TOKEN = CONFIG_TOKEN;
}
else {
  console.error('No GitHub token found in environment or config file!');
}

// Create a reusable fetch function with proper error handling and typing
const fetchWithAuth = async <T,>(url: string): Promise<T> => {
  // Get token when needed
  if (!GITHUB_TOKEN) {
    console.error('GitHub token is missing! Add to .env file as VITE_GITHUB_TOKEN or to config.ts file as GITHUB_TOKEN');
    throw new Error('GitHub access token is missing. See console for details.');
  }

  // Create headers with auth token
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`
  };

  try {
    // Use a silenced console during fetch for user requests to prevent 404 logs
    const originalConsoleError = console.error;
    if (url.includes('/users/') && !url.includes('?since=')) {
      // Temporarily override console.error to suppress 404 warnings
      console.error = (...args) => {
        const errorMsg = args.join(' ');
        if (errorMsg.includes('404') || errorMsg.includes('Failed to load resource')) {
          // Don't log 404 errors for user requests
          return;
        }
        originalConsoleError.apply(console, args);
      };
    }

    const response = await fetch(url, { headers });
    
    // Restore console.error
    if (url.includes('/users/') && !url.includes('?since=')) {
      console.error = originalConsoleError;
    }
    
    // Handle 404 Not Found for user requests immediately
    if (response.status === 404) {
      return { notFound: true, login: url.split('/').pop() } as unknown as T;
    }
    
    // Check for rate limiting
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (response.status === 403 && rateLimitRemaining === '0') {
      const resetDate = new Date(parseInt(rateLimitReset || '0') * 1000);
      throw new Error(`Rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${data.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (err) {
    // Suppress 404 errors completely for user detail requests
    if (url.includes('/users/') && !url.includes('?since=') && 
        err instanceof Error && (err.message.includes('404') || err.message.includes('Not Found'))) {
      return { 
        notFound: true, 
        login: url.split('/').pop(),
        error: true 
      } as unknown as T;
    }
    
    // For other errors, log them
    console.error(`Error fetching from ${url}:`, err);
    
    if (err instanceof Error && err.message.includes('Rate limit exceeded')) {
      throw err;
    }
    
    return { error: true, message: err instanceof Error ? err.message : 'Unknown error' } as unknown as T;
  }
};

// Add delay function to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Increase batch size to improve chances of finding valid users
export const searchGithub = async (batchSize = 50): Promise<any[]> => {
  const start = Math.floor(Math.random() * 100000000) + 1;
  await delay(1000); // Add delay to avoid rapid API calls
  return fetchWithAuth<any[]>(`https://api.github.com/users?since=${start}&per_page=${batchSize}`);
};

export const searchGithubUser = async (username: string): Promise<Candidate & { notFound?: boolean, error?: boolean, isOrganization?: boolean }> => {
  await delay(1000); // Add delay to avoid rapid API calls
  
  try {
    const data = await fetchWithAuth<Candidate & { type?: string }>(`https://api.github.com/users/${username}`);
    
    // Check if the result is an organization (GitHub API returns 'User' or 'Organization' in the type field)
    if (data && data.type === 'Organization') {
      console.log(`Skipping ${username} because it's an organization, not a user`);
      return { 
        ...data,
        isOrganization: true 
      };
    }
    
    return data;
  } catch (err) {
    // Return error object in case of failure
    return { error: true, message: err instanceof Error ? err.message : 'Unknown error' } as any;
  }
};
