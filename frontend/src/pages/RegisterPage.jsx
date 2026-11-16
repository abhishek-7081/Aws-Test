import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      success('Account created successfully! Welcome to TaskFlow.');
      navigate('/');
    } catch (err) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <div className="tf-card p-4 p-sm-5 shadow-sm">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-2"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </div>
              <h4 className="fw-bold m-0">Create your account</h4>
              <p className="small text-muted mt-1">
                Start managing projects and tasks with TaskFlow today.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className={`tf-input ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  autoFocus
                />
                {errors.name && <div className="tf-error-text">{errors.name}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className={`tf-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <div className="tf-error-text">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Password * (min 6 characters)</label>
                <input
                  type="password"
                  name="password"
                  className={`tf-input ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password && <div className="tf-error-text">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`tf-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <div className="tf-error-text">{errors.confirmPassword}</div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="tf-btn tf-btn-primary w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center small text-muted border-top pt-3">
              Already registered?{' '}
              <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

