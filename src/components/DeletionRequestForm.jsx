import React, { useState } from 'react';
import './DeletionRequestForm.css'; // You'll need to create this CSS file

function DeletionRequestForm() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    reason: '',
    confirmDelete: false
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: '',
    requestId: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.username || !formData.confirmDelete) {
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Please fill in all required fields and confirm your deletion request.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call your Vercel Function API endpoint
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          reason: formData.reason
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setFormStatus({
          submitted: true,
          error: false,
          message: 'Your account deletion request has been submitted. You will receive a confirmation email shortly.',
          requestId: data.requestId
        });
        
        // Reset form
        setFormData({
          email: '',
          username: '',
          reason: '',
          confirmDelete: false
        });
      } else {
        throw new Error(data.message || 'Failed to submit account deletion request');
      }
    } catch (error) {
      setFormStatus({
        submitted: false,
        error: true,
        message: `There was a problem submitting your request: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="deletion-form-container">
      {formStatus.submitted ? (
        <div className="success-message">
          <h2>Request Submitted</h2>
          <p>{formStatus.message}</p>
          {formStatus.requestId && (
            <p className="request-id">Your request ID: <strong>{formStatus.requestId}</strong></p>
          )}
          <p>Please save this request ID for your records. You can use it to check the status of your request.</p>
          <button 
            className="new-request-button"
            onClick={() => setFormStatus({ submitted: false, error: false, message: '', requestId: null })}
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <>
          <section className="info-section">
            <h2>About Account Deletion</h2>
            <p>When you request account deletion, we will:</p>
            <ul>
              <li>Remove your personal information from our database</li>
              <li>Delete all content associated with your account</li>
              <li>Revoke access to premium features (if applicable)</li>
            </ul>
            <p>This process typically takes 14-30 days to complete.</p>
          </section>
          
          <form className="deletion-form" onSubmit={handleSubmit}>
            <h2>Request Form</h2>
            
            {formStatus.error && (
              <div className="error-message">
                <p>{formStatus.message}</p>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter the email associated with your account"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="username">Username/Account ID *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username or account ID in our app"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">Reason for Deletion (Optional)</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please tell us why you're deleting your account"
                rows="4"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="confirmDelete"
                name="confirmDelete"
                checked={formData.confirmDelete}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <label htmlFor="confirmDelete">
                I understand this action is permanent and cannot be undone *
              </label>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Deletion Request'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default DeletionRequestForm;