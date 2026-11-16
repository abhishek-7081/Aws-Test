import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.email) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
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
      await login(formData);
      success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo account filler for rapid testing
  const handleFillDemo = () => {
    setFormData({
      email: 'alex@example.com',
      password: 'password123',
    });
    setErrors({});
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
              <h4 className="fw-bold m-0">Sign in to TaskFlow</h4>
              <p className="small text-muted mt-1">
                Enter your credentials to access your workspaces.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`tf-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && <div className="tf-error-text">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold m-0">Password</label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`tf-input ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                {errors.password && <div className="tf-error-text">{errors.password}</div>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="tf-btn tf-btn-primary w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Demo button */}
              <button
                type="button"
                className="tf-btn tf-btn-secondary w-100 mb-4"
                onClick={handleFillDemo}
              >
                ⚡ Autofill Demo Credentials
              </button>
            </form>

            <div className="text-center small text-muted border-top pt-3">
              Don't have an account yet?{' '}
              <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
