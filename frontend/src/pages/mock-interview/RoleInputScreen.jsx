import { useState, useRef } from 'react';
import { Briefcase, Play, Sparkles, Upload, FileText, X, Building2, Timer, Gauge } from 'lucide-react';
import { Button, Card, Input, Select, Textarea, Badge } from '../../components/ui';
import toast from 'react-hot-toast';
import { mockInterviewAPI } from '../../services/api';

const ROLE_OPTIONS = [
  { value: 'Frontend Developer', label: 'Frontend Developer' },
  { value: 'Backend Developer', label: 'Backend Developer' },
  { value: 'Full Stack Developer', label: 'Full Stack Developer' },
  { value: 'Data Engineer', label: 'Data Engineer' },
  { value: 'DevOps Engineer', label: 'DevOps Engineer' },
  { value: 'Mobile Developer', label: 'Mobile Developer' },
  { value: 'QA Engineer', label: 'QA Engineer' },
  { value: 'Data Scientist', label: 'Data Scientist' },
  { value: 'Product Manager', label: 'Product Manager' },
  { value: 'Cloud Engineer', label: 'Cloud Engineer' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (2-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'lead', label: 'Lead (8-12 years)' },
  { value: 'principal', label: 'Principal (12+ years)' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'mixed', label: 'Mixed (Auto-balanced)' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const COMPANY_OPTIONS = [
  { value: '', label: 'No specific company' },
  { value: 'google', label: 'Google' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'meta', label: 'Meta' },
  { value: 'microsoft', label: 'Microsoft' },
  { value: 'apple', label: 'Apple' },
  { value: 'netflix', label: 'Netflix' },
  { value: 'startup', label: 'Startup (General)' },
];

export default function RoleInputScreen({ onStart, loading }) {
  const [jobRole, setJobRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [difficulty, setDifficulty] = useState('mixed');
  const [targetCompany, setTargetCompany] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jdFileName, setJdFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validate = () => {
    const errs = {};
    const role = jobRole === '__custom__' ? customRole.trim() : jobRole;
    if (!role) errs.jobRole = 'Please select or enter a job role.';
    if (!experienceLevel) errs.experienceLevel = 'Please select your experience level.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const { data } = await mockInterviewAPI.uploadJD(file);
      setJobDescription(data.jobDescription);
      setJdFileName(file.name);
      toast.success('Job description extracted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract JD from file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearJDFile = () => {
    setJdFileName('');
    setJobDescription('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const role = jobRole === '__custom__' ? customRole.trim() : jobRole;
    onStart({
      jobRole: role,
      experienceLevel,
      jobDescription: jobDescription.trim() || undefined,
      difficulty,
      targetCompany: targetCompany || undefined,
      timerEnabled,
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card hover={false} className="relative overflow-hidden">
        {/* Accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/20">
              <Briefcase className="text-brand-primary-light" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Start Mock Interview</h2>
              <p className="text-sm text-text-secondary">Configure your interview session</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Job Role */}
            <Select
              label="Job Role"
              value={jobRole}
              onChange={(e) => { setJobRole(e.target.value); setErrors({}); }}
              options={[...ROLE_OPTIONS, { value: '__custom__', label: '✏️ Enter custom role...' }]}
              placeholder="Select a role..."
              error={errors.jobRole}
            />

            {jobRole === '__custom__' && (
              <Input
                label="Custom Role"
                placeholder="e.g. Site Reliability Engineer"
                value={customRole}
                onChange={(e) => { setCustomRole(e.target.value); setErrors({}); }}
                error={errors.jobRole}
              />
            )}

            {/* Experience Level */}
            <Select
              label="Experience Level"
              value={experienceLevel}
              onChange={(e) => { setExperienceLevel(e.target.value); setErrors({}); }}
              options={EXPERIENCE_OPTIONS}
              placeholder="Select experience level..."
              error={errors.experienceLevel}
            />

            {/* --- Phase 9 enhancements ---------------------- */}

            {/* Difficulty + Company row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={
                  <span className="flex items-center gap-1.5">
                    <Gauge size={14} className="text-brand-accent-light" />
                    Difficulty
                  </span>
                }
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={DIFFICULTY_OPTIONS}
              />

              <Select
                label={
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-brand-primary-light" />
                    Target Company
                  </span>
                }
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                options={COMPANY_OPTIONS}
              />
            </div>

            {/* Timer toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-status-warning" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Timer Mode</p>
                  <p className="text-xs text-text-muted">Adds countdown timers per question (3-7 min based on difficulty)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  timerEnabled ? 'bg-brand-primary' : 'bg-dark-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    timerEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Job Description: textarea + file upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Job Description (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Upload size={13} />
                  Upload JD File
                </Button>
              </div>

              {jdFileName && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded bg-brand-primary/10 border border-brand-primary/20">
                  <FileText size={14} className="text-brand-primary-light shrink-0" />
                  <span className="text-xs text-brand-primary-light truncate flex-1">{jdFileName}</span>
                  <button type="button" onClick={clearJDFile} className="text-text-muted hover:text-text-primary">
                    <X size={14} />
                  </button>
                </div>
              )}

              <Textarea
                placeholder="Paste the job description or upload a file to get tailored questions..."
                value={jobDescription}
                onChange={(e) => { setJobDescription(e.target.value); setJdFileName(''); }}
                rows={4}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                <Play size={18} />
                Start Interview
                <Sparkles size={16} className="text-brand-accent-light" />
              </Button>
            </div>
          </form>

          {/* Config summary badges */}
          <div className="flex flex-wrap gap-2 mt-5">
            {difficulty !== 'mixed' && (
              <Badge variant={difficulty === 'hard' ? 'error' : difficulty === 'easy' ? 'success' : 'warning'}>
                {difficulty} difficulty
              </Badge>
            )}
            {targetCompany && (
              <Badge variant="accent">
                {COMPANY_OPTIONS.find(c => c.value === targetCompany)?.label || targetCompany}
              </Badge>
            )}
            {timerEnabled && (
              <Badge variant="warning">⏱ Timer on</Badge>
            )}
          </div>

          {/* Info tip */}
          <div className="mt-4 p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/10">
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="text-brand-primary-light font-medium">💡 Tip:</span>{' '}
              You'll receive 10 questions across 4 categories: Core Knowledge, Scenario-based, Problem Solving, and Behavioral.
              {targetCompany && ` Includes company-specific questions for ${COMPANY_OPTIONS.find(c => c.value === targetCompany)?.label || targetCompany}.`}
              {timerEnabled && ' Timer mode adds countdowns per question.'}
              {' '}Each answer is scored on relevance, clarity, depth, and practical understanding.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
