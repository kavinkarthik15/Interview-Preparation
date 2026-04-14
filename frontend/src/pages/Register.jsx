import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (fieldError) =>
    `w-full pl-10 pr-4 py-2.5 bg-dark-bg border rounded-card text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition ${
      fieldError ? 'border-status-error' : 'border-dark-border'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl ds-float" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl ds-float" style={{ animationDelay: '1.5s' }} />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="text-brand-accent" size={28} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-primary-light bg-clip-text text-transparent">Interview Prep</h1>
          </div>
          <p className="text-text-secondary">Create your account to get started</p>
        </div>

        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-8 animate-fade-in-up ds-card-shine" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Create Account</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-status-error-bg border border-status-error/30 text-status-error rounded-card text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClasses(errors.name)}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-status-error text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClasses(errors.email)}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-status-error text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClasses(errors.password)}
                  placeholder="Min 6 characters"
                />
              </div>
              {errors.password && <p className="text-status-error text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputClasses(errors.confirmPassword)}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && <p className="text-status-error text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-2.5 rounded-card font-semibold hover:bg-brand-primary-hover focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-bg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:text-brand-primary-light font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
