import React, { useState } from 'react';
import { validateLeagueName, validateCommissionerName, validateEmail, validateLeagueRules } from '../utils/validation.js';

const CreateLeagueForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    commissioner: '',
    commissionerEmail: '',
    year: new Date().getFullYear()
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Apply character limits
    let limitedValue = value;
    if (name === 'name' || name === 'commissioner') {
      limitedValue = value.slice(0, 255); // 255 character limit
    } else if (name === 'commissionerEmail') {
      limitedValue = value.slice(0, 255); // 255 character limit
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: limitedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate league name
    const nameValidation = validateLeagueName(formData.name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error;
    }
    
    // Validate commissioner name
    const commissionerValidation = validateCommissionerName(formData.commissioner);
    if (!commissionerValidation.valid) {
      newErrors.commissioner = commissionerValidation.error;
    }
    
    // Validate email (required for commissioner)
    if (!formData.commissionerEmail.trim()) {
      newErrors.commissionerEmail = 'Commissioner email is required';
    } else {
      const emailValidation = validateEmail(formData.commissionerEmail);
      if (!emailValidation.valid) {
        newErrors.commissionerEmail = emailValidation.error;
      }
    }
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (formData.year < currentYear || formData.year > currentYear + 5) {
      newErrors.year = `Year must be between ${currentYear} and ${currentYear + 5}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sanitize the data
      const sanitizedData = {
        name: formData.name.trim(),
        commissioner: formData.commissioner.trim(),
        commissionerEmail: formData.commissionerEmail.trim(),
        year: parseInt(formData.year)
      };
      
      await onSubmit(sanitizedData);
    } catch (error) {
      setErrors({ submit: 'Failed to create league. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-league-form">
      <h2>Create New League</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            League Name <span className="required">*</span>
            <span className="char-count">{formData.name.length}/255</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter league name..."
            className={errors.name ? 'error' : ''}
            maxLength={255}
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="commissioner">
            Commissioner Name <span className="required">*</span>
            <span className="char-count">{formData.commissioner.length}/255</span>
          </label>
          <input
            type="text"
            id="commissioner"
            name="commissioner"
            value={formData.commissioner}
            onChange={handleInputChange}
            placeholder="Enter commissioner name..."
            className={errors.commissioner ? 'error' : ''}
            maxLength={255}
            required
          />
          {errors.commissioner && <span className="error-message">{errors.commissioner}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="commissionerEmail">
            Commissioner Email <span className="required">*</span>
            <span className="char-count">{formData.commissionerEmail.length}/255</span>
          </label>
          <input
            type="email"
            id="commissionerEmail"
            name="commissionerEmail"
            value={formData.commissionerEmail}
            onChange={handleInputChange}
            placeholder="Enter commissioner email..."
            className={errors.commissionerEmail ? 'error' : ''}
            maxLength={255}
            required
          />
          {errors.commissionerEmail && <span className="error-message">{errors.commissionerEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="year">
            League Year <span className="required">*</span>
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className={errors.year ? 'error' : ''}
            required
          >
            {Array.from({ length: 6 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          {errors.year && <span className="error-message">{errors.year}</span>}
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create League'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .create-league-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 30px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .create-league-form h2 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
          position: relative;
        }

        .required {
          color: #e74c3c;
        }

        .char-count {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 12px;
          color: #666;
          font-weight: normal;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #e74c3c;
        }

        .error-message {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 5px;
          display: block;
        }

        .submit-error {
          background-color: #fdf2f2;
          border: 1px solid #fecaca;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .cancel-button,
        .submit-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button {
          background-color: #f8f9fa;
          color: #666;
          border: 2px solid #e0e0e0;
        }

        .cancel-button:hover:not(:disabled) {
          background-color: #e9ecef;
        }

        .submit-button {
          background-color: #667eea;
          color: white;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #5a6fd8;
          transform: translateY(-2px);
        }

        .cancel-button:disabled,
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CreateLeagueForm; 