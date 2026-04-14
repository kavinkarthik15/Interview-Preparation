import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { authAPI } from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authAPI.login(form);
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      alert("Login successful ✅");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Login failed';
      alert(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl ds-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl ds-float" style={{ animationDelay: '1.5s' }} />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="text-brand-accent" size={28} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-primary-light bg-clip-text text-transparent">Interview Prep</h1>
          </div>
          <p className="text-text-secondary">Sign in to track your preparation</p>
        </div>

        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-8 animate-fade-in-up ds-card-shine" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Welcome Back</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-status-error-bg border border-status-error/30 text-status-error rounded-card text-sm">
              {errors.general}
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-dark-bg border rounded-card text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition ${
                    errors.email ? 'border-status-error' : 'border-dark-border'
                  }`}
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-dark-bg border rounded-card text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition ${
                    errors.password ? 'border-status-error' : 'border-dark-border'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="text-status-error text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleLogin}
              className="w-full bg-brand-primary text-white py-2.5 rounded-card font-semibold hover:bg-brand-primary-hover focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-bg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-primary hover:text-brand-primary-light font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
