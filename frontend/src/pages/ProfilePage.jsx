import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name || name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (password) {
      if (password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload = { name: name.trim() };
      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="tf-card p-4 p-md-5 mb-4">
            <h4 className="fw-bold mb-4">User Profile & Account</h4>

            {/* Profile Avatar & Details */}
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded border mb-4">
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h6 className="fw-bold m-0">{user?.name}</h6>
                <div className="small text-muted">{user?.email}</div>
                <div className="small text-muted">
                  Role: <span className="badge bg-secondary-subtle text-dark text-capitalize">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="tf-input bg-light"
                  value={user?.email || ''}
                  disabled
                />
                <span className="small text-muted">Email address cannot be modified.</span>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name *</label>
                <input
                  type="text"
                  className={`tf-input ${validationErrors.name ? 'is-invalid' : ''}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: '' }));
                  }}
                />
                {validationErrors.name && (
                  <div className="tf-error-text">{validationErrors.name}</div>
                )}
              </div>

              <div className="border-top my-4 pt-3">
                <h6 className="fw-semibold mb-3">Change Password (Optional)</h6>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className={`tf-input ${validationErrors.password ? 'is-invalid' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: '' }));
                    }}
                  />
                  {validationErrors.password && (
                    <div className="tf-error-text">{validationErrors.password}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className={`tf-input ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                  />
                  {validationErrors.confirmPassword && (
                    <div className="tf-error-text">{validationErrors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="tf-btn tf-btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

