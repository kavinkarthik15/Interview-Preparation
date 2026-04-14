import { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, MessageSquare, Star, Clock, X, Sparkles } from 'lucide-react';
import { AIFeedbackPanel, MLConfidenceBar, Skeleton } from '../components/ui';

const TYPES = ['Technical', 'Behavioral', 'System Design', 'HR', 'Coding', 'Other'];

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'Technical', company: '', duration: '', score: '', feedback: '', overallRating: ''
  });

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const res = await interviewAPI.getAll();
      setInterviews(res.data.interviews);
    } catch (err) {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Interview title is required');
      return;
    }
    try {
      const data = {
        title: form.title,
        type: form.type,
        company: form.company,
        duration: form.duration ? parseInt(form.duration) : 0,
        score: form.score ? parseFloat(form.score) : null,
        feedback: form.feedback,
        overallRating: form.overallRating ? parseInt(form.overallRating) : null
      };
      await interviewAPI.create(data);
      toast.success('Mock interview recorded!');
      setForm({ title: '', type: 'Technical', company: '', duration: '', score: '', feedback: '', overallRating: '' });
      setShowForm(false);
      loadInterviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record interview');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview record?')) return;
    try {
      await interviewAPI.delete(id);
      toast.success('Interview deleted');
      loadInterviews();
    } catch (err) {
      toast.error('Failed to delete interview');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mock Interviews</h1>
          <p className="text-text-secondary mt-1">Track your mock interview sessions and performance</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ds-btn-primary"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Interview'}
        </button>
      </div>

      {/* Add Interview Form */}
      {showForm && (
        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-6 animate-fade-in">
          <h3 className="font-semibold text-text-primary mb-4">Record Mock Interview</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="ds-input"
                  placeholder="e.g., Google Frontend Round 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="ds-select"
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="ds-input"
                  placeholder="e.g., Google"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="ds-input"
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  className="ds-input"
                  placeholder="e.g., 85"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Overall Rating (1-5)</label>
                <select
                  value={form.overallRating}
                  onChange={(e) => setForm({ ...form, overallRating: e.target.value })}
                  className="ds-select"
                >
                  <option value="">Select rating</option>
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Feedback / Notes</label>
              <textarea
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                className="ds-textarea"
                rows={3}
                placeholder="How did it go? What can be improved?"
              />
            </div>
            <button type="submit" className="ds-btn-primary">
              Save Interview
            </button>
          </form>
        </div>
      )}

      {/* Interviews List */}
      {loading ? (
        <Skeleton.InterviewsPage />
      ) : interviews.length === 0 ? (
        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-12 text-center">
          <MessageSquare className="mx-auto text-text-muted mb-4 ds-empty-icon" size={48} />
          <p className="text-text-primary font-medium">No mock interviews yet</p>
          <p className="text-text-muted text-sm mt-1">Record your first session to start tracking performance!</p>
        </div>
      ) : (
        <div className="space-y-4 ds-stagger">
          {interviews.map((interview) => (
            <div key={interview._id} className="bg-dark-card rounded-card border border-dark-border p-5 hover:border-dark-border-light hover:shadow-card transition-all duration-200 ds-card-shine">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-text-primary">{interview.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent-light">
                      {interview.type}
                    </span>
                    {interview.company && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary-light">
                        {interview.company}
                      </span>
                    )}
                    {interview.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        interview.status === 'completed' ? 'bg-status-success-bg text-status-success' :
                        interview.status === 'in-progress' ? 'bg-status-warning-bg text-status-warning' :
                        interview.status === 'failed' ? 'bg-status-error-bg text-status-error' :
                        'bg-status-info-bg text-status-info'
                      }`}>
                        {interview.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                    {interview.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {interview.duration} min
                      </span>
                    )}
                    {interview.score !== null && (
                      <span className={`font-medium ${
                        interview.score >= 90 ? 'text-status-success' :
                        interview.score >= 75 ? 'text-brand-primary-light' :
                        interview.score >= 50 ? 'text-status-warning' :
                        'text-status-error'
                      }`}>
                        Score: {interview.score}%
                        {interview.scoreLabel && ` (${interview.scoreLabel})`}
                      </span>
                    )}
                    {interview.overallRating && (
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-status-warning fill-status-warning" />
                        {interview.overallRating}/5
                      </span>
                    )}
                  </div>

                  {interview.feedback && (
                    <p className="text-sm text-text-secondary mt-3 bg-dark-bg p-3 rounded-card border border-dark-border">{interview.feedback}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(interview._id)}
                  className="p-2 text-text-muted hover:text-status-error transition ml-4"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* ML Prediction Summary */}
              {interview.mlPredictionSummary?.hasPrediction && (
                <div className="mt-4 p-4 rounded-card bg-dark-bg border border-brand-primary/15">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">ML Prediction</span>
                    {interview.mlPredictionSummary.weak_area && interview.mlPredictionSummary.weak_area !== 'No Data' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning border border-status-warning/20 font-medium">
                        Weak: {interview.mlPredictionSummary.weak_area}
                      </span>
                    )}
                  </div>
                  <MLConfidenceBar
                    confidence={interview.mlPredictionSummary.confidence}
                    label="Confidence"
                  />
                </div>
              )}

              {/* AI Feedback Panel – Score Cards, Radar Chart, Improvement Tags */}
              <AIFeedbackPanel
                scoreBreakdown={interview.scoreBreakdown || {}}
                aiFeedbackSummary={interview.aiFeedbackSummary || {}}
                overallScore={interview.score}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
