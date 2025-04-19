import React, { useState } from 'react';
import styles from './StatusCheck.module.css';

function StatusCheck() {
  const [requestId, setRequestId] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestId) {
      setError('Please enter a request ID');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/check-status?requestId=${encodeURIComponent(requestId)}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus(data);
      } else {
        setError(data.message || 'Could not find request with that ID');
        setStatus(null);
      }
    } catch (error) {
      setError('An error occurred while checking the status');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['status-check']}>
      <h2>Check Deletion Status</h2>
      <p>Enter your request ID to check the status of your account deletion request.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="requestId">Request ID</label>
          <input
            type="text"
            id="requestId"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            placeholder="e.g., DEL-1712345678-123"
            disabled={isLoading}
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check Status'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {status && (
        <div className="status-result">
          <h3>Request Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}</h3>
          <p><strong>Request Date:</strong> {new Date(status.requestDate).toLocaleString()}</p>
          
          {status.status !== 'completed' && (
            <p><strong>Estimated Completion:</strong> {new Date(status.estimatedCompletionDate).toLocaleString()}</p>
          )}
          
          {status.status === 'completed' && (
            <p>Your account has been successfully deleted from our systems.</p>
          )}
          
          {status.status === 'processing' && (
            <p>Your request is currently being processed. We are removing your data from our systems.</p>
          )}
          
          {status.status === 'pending' && (
            <p>Your request has been received and is queued for processing.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StatusCheck;