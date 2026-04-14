import { useState, useEffect } from 'react';
import { topicAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Check, Trash2, BookOpen, Filter, X, Search } from 'lucide-react';
import { Skeleton } from '../components/ui';

const CATEGORIES = ['DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ category: '', completed: '' });
  const [form, setForm] = useState({
    title: '', category: 'DSA', difficulty: 'Medium', notes: '', resources: ''
  });

  useEffect(() => {
    loadTopics();
  }, [filter]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.completed !== '') params.completed = filter.completed;
      const res = await topicAPI.getAll(params);
      setTopics(res.data.topics);
    } catch (err) {
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Topic title is required');
      return;
    }
    try {
      const data = {
        ...form,
        resources: form.resources ? form.resources.split(',').map(r => r.trim()).filter(Boolean) : []
      };
      await topicAPI.create(data);
      toast.success('Topic added!');
      setForm({ title: '', category: 'DSA', difficulty: 'Medium', notes: '', resources: '' });
      setShowForm(false);
      loadTopics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add topic');
    }
  };

  const handleToggle = async (id) => {
    try {
      await topicAPI.toggleComplete(id);
      loadTopics();
    } catch (err) {
      toast.error('Failed to update topic');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await topicAPI.delete(id);
      toast.success('Topic deleted');
      loadTopics();
    } catch (err) {
      toast.error('Failed to delete topic');
    }
  };

  const difficultyColor = (d) => {
    if (d === 'Easy') return 'bg-status-success-bg text-status-success';
    if (d === 'Medium') return 'bg-status-warning-bg text-status-warning';
    return 'bg-status-error-bg text-status-error';
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto bg-gradient-to-br from-dark-bg via-brand-primary/10 to-brand-accent/20 min-h-screen pb-16">
      <div className="flex items-center justify-between mb-4 mt-6">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-brand-primary/40 to-brand-accent/40 shadow-glow-accent animate-glow-pulse">
            <BookOpen size={32} className="text-brand-primary-light" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-brand-primary-light to-brand-accent-light bg-clip-text text-transparent drop-shadow-lg">Preparation Topics</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ds-btn-primary px-8 py-3 text-lg font-semibold flex items-center gap-2 shadow-glow-primary"
        >
          {showForm ? <X size={24} /> : <Plus size={24} />}
          {showForm ? 'Cancel' : 'Add Topic'}
        </button>
      </div>
      <p className="text-text-secondary mb-6 text-lg font-medium">Manage your study topics and track completion</p>

      {/* Add Topic Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-dark-card via-brand-primary/10 to-brand-accent/10 rounded-xl border-2 border-dark-border shadow-glow-accent p-10 animate-fade-in">
          <h3 className="font-semibold text-text-primary mb-6 text-2xl">Add New Topic</h3>
          <form onSubmit={handleCreate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-semibold text-text-primary mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="ds-input text-lg"
                  placeholder="e.g., Binary Search Tree"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-text-primary mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="ds-select text-lg"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-text-primary mb-2">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="ds-select text-lg"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-text-primary mb-2">Resources (comma-separated URLs)</label>
                <input
                  type="text"
                  value={form.resources}
                  onChange={(e) => setForm({ ...form, resources: e.target.value })}
                  className="ds-input text-lg"
                  placeholder="https://leetcode.com/..., https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold text-text-primary mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="ds-textarea text-lg"
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="ds-btn-primary px-8 py-3 text-lg font-semibold flex items-center gap-2 shadow-glow-primary">
                <Plus size={22} />
                Add Topic
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-8 items-center flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <Filter size={22} className="text-brand-primary-light" />
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-5 py-3 bg-dark-card border-2 border-brand-primary/30 rounded-xl text-lg text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <select
          value={filter.completed}
          onChange={(e) => setFilter({ ...filter, completed: e.target.value })}
          className="px-5 py-3 bg-dark-card border-2 border-brand-primary/30 rounded-xl text-lg text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
        >
          <option value="">All Status</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>
      </div>

      {/* Topics List */}
      {loading ? (
        <Skeleton.TopicsPage />
      ) : topics.length === 0 ? (
        <div className="bg-gradient-to-br from-dark-card via-brand-primary/10 to-brand-accent/10 rounded-xl border-2 border-dark-border shadow-glow-accent p-20 text-center">
          <BookOpen className="mx-auto text-text-muted mb-6 ds-empty-icon animate-glow-pulse" size={64} />
          <p className="text-text-primary font-extrabold text-2xl">No topics found</p>
          <p className="text-text-muted text-lg mt-2">Add your first preparation topic to get started!</p>
        </div>
      ) : (
        <div className="space-y-6 ds-stagger">
          {topics.map((topic) => (
            <div key={topic._id} className="bg-gradient-to-br from-dark-card via-brand-primary/10 to-brand-accent/10 rounded-xl border-2 border-dark-border p-8 flex items-center gap-8 hover:border-brand-primary/40 hover:shadow-glow-primary transition-all duration-200 ds-card-shine animate-fade-in">
              <button
                onClick={() => handleToggle(topic._id)}
                className={`p-3 rounded-full border-2 transition ${
                  topic.completed
                    ? 'border-status-success bg-status-success text-white animate-glow-pulse'
                    : 'border-dark-border-light text-transparent hover:border-status-success'
                }`}
              >
                <Check size={20} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`font-extrabold text-xl ${topic.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}> 
                    {topic.title}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary-light font-semibold">
                    {topic.category}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${difficultyColor(topic.difficulty)}`}> 
                    {topic.difficulty}
                  </span>
                </div>
                {topic.notes && (
                  <p className="text-base text-text-muted mt-2 truncate">{topic.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(topic._id)}
                className="p-4 text-text-muted hover:text-status-error transition"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
