import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Save, User, Building2, Briefcase, Calendar, Phone, Shield } from 'lucide-react';
import { Skeleton } from '../components/ui';

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  // Use local date parts to avoid UTC off-by-one
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    targetCompany: user?.targetCompany || '',
    targetRole: user?.targetRole || '',
    interviewDate: formatDateForInput(user?.interviewDate)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        targetCompany: user.targetCompany || '',
        targetRole: user.targetRole || '',
        interviewDate: formatDateForInput(user.interviewDate)
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (data.interviewDate) {
        data.interviewDate = new Date(data.interviewDate).toISOString();
      } else {
        data.interviewDate = null;
      }
      const res = await authAPI.updateProfile(data);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Shield size={28} className="text-brand-primary-light" />
        <h1 className="text-3xl font-bold text-text-primary bg-gradient-to-r from-brand-primary-light to-brand-accent-light bg-clip-text text-transparent">Profile Settings</h1>
      </div>
      <p className="text-text-secondary mb-4">Update your profile and interview details</p>

      <div className="bg-dark-card rounded-lg border border-dark-border shadow-glow-accent p-8 ds-card-shine">
        {/* Avatar & Info */}
        <div className="flex items-center gap-6 mb-10 pb-6 border-b border-dark-border">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary/30 to-brand-accent/30 rounded-full flex items-center justify-center ring-4 ring-brand-primary/20 ring-offset-2 ring-offset-dark-card">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary-light to-brand-accent-light bg-clip-text text-transparent">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{user?.name}</h2>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary-light text-xs font-medium mt-1">
              {user?.email}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
                <User size={16} /> Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="ds-input"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
                <Phone size={16} /> Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="ds-input"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
                <Building2 size={16} /> Target Company
              </label>
              <input
                type="text"
                value={form.targetCompany}
                onChange={(e) => setForm({ ...form, targetCompany: e.targetCompany })}
                className="ds-input"
                placeholder="e.g., Google, Amazon, Microsoft"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
                <Briefcase size={16} /> Target Role
              </label>
              <input
                type="text"
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.targetRole })}
                className="ds-input"
                placeholder="e.g., Senior Frontend Engineer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
                <Calendar size={16} /> Interview Date
              </label>
              <input
                type="date"
                value={form.interviewDate}
                onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                className="ds-input"
              />
              <p className="text-xs text-text-muted mt-1">Set this to see a countdown on your dashboard</p>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={loading}
              className="ds-btn-primary px-6 py-2 text-base font-semibold flex items-center gap-2 shadow-glow-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
