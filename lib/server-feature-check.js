/**
 * Server-side Feature Check Utility
 * 
 * This module provides utilities to check feature availability using
 * the secure server-side API endpoint, which cannot be bypassed by
 * manipulating client-side clocks or environment variables.
 * 
 * Use this for security-critical feature checks in your application.
 */

/**
 * Check if a feature is available using server-side validation
 * @param {string} featureName - The feature to check
 * @param {string} accessToken - Optional user access token for auth
 * @returns {Promise<boolean>} - Whether the feature is unlocked
 */
export async function checkFeatureServer(featureName, accessToken = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`/api/features/check?feature=${encodeURIComponent(featureName)}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      console.error('Feature check failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    return data.unlocked || false;
    
  } catch (error) {
    console.error('Error checking feature availability:', error);
    return false;
  }
}

/**
 * Batch check multiple features using server-side validation
 * @param {string[]} features - Array of feature names to check
 * @param {string} accessToken - Optional user access token for auth
 * @returns {Promise<Object>} - Object mapping feature names to availability
 */
export async function checkFeaturesServer(features, accessToken = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch('/api/features/check', {
      method: 'POST',
      headers,
      body: JSON.stringify({ features })
    });
    
    if (!response.ok) {
      console.error('Batch feature check failed:', response.status);
      return {};
    }
    
    const data = await response.json();
    return data.features || {};
    
  } catch (error) {
    console.error('Error checking features availability:', error);
    return {};
  }
}

/**
 * Get launch status from server
 * @param {string} accessToken - Optional user access token for auth
 * @returns {Promise<Object>} - Launch status including hasLaunched, serverTime, etc.
 */
export async function getLaunchStatusServer(accessToken = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch('/api/features/check', {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      console.error('Launch status check failed:', response.status);
      return {
        hasLaunched: false,
        serverTime: new Date().toISOString(),
        error: true
      };
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error getting launch status:', error);
    return {
      hasLaunched: false,
      serverTime: new Date().toISOString(),
      error: true
    };
  }
}

/**
 * Higher-order component to protect routes with server-side feature checks
 * @param {React.Component} Component - The component to protect
 * @param {string} featureName - The feature required to access this component
 * @param {React.Component} FallbackComponent - Component to show when feature is locked
 */
export function withFeatureGate(Component, featureName, FallbackComponent = null) {
  return function FeatureGatedComponent(props) {
    const [isUnlocked, setIsUnlocked] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
      async function checkAccess() {
        const unlocked = await checkFeatureServer(featureName);
        setIsUnlocked(unlocked);
        setIsLoading(false);
      }
      
      checkAccess();
    }, []);
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isUnlocked) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      return <div>This feature is not yet available.</div>;
    }
    
    return <Component {...props} />;
  };
}
