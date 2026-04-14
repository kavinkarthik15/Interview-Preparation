import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Target, Lightbulb, ChevronDown, ChevronUp, Activity, Shield, BookOpen } from 'lucide-react';
import { Card, Badge, ProgressBar } from '../../components/ui';
import { mockInterviewAPI } from '../../services/api';

const SEVERITY_CONFIG = {
  critical: { color: 'text-status-error', bg: 'bg-status-error/10', border: 'border-status-error/20', badge: 'error', label: 'Critical' },
  moderate: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', badge: 'warning', label: 'Moderate' },
  mild: { color: 'text-brand-primary-light', bg: 'bg-brand-primary/10', border: 'border-brand-primary/20', badge: 'info', label: 'Mild' },
  none: { color: 'text-status-success', bg: 'bg-status-success/10', border: 'border-status-success/20', badge: 'success', label: 'Strong' },
  unknown: { color: 'text-text-muted', bg: 'bg-dark-card-hover', border: 'border-dark-border', badge: 'default', label: 'N/A' },
};

export default function SkillGapPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [days, setDays] = useState(90);

  useEffect(() => {
    loadGaps();
  }, [days]);

  const loadGaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mockInterviewAPI.getSkillGaps({ days });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load skill gap data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card hover={false} className="animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-dark-border" />
          <div className="h-5 w-40 rounded bg-dark-border" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-dark-border" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card hover={false} className="text-center py-6">
        <AlertTriangle size={24} className="text-status-warning mx-auto mb-2" />
        <p className="text-sm text-text-secondary">{error}</p>
      </Card>
    );
  }

  if (!data || data.totalSessions === 0) {
    return (
      <Card hover={false} className="text-center py-6">
        <Activity size={24} className="text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-secondary">Complete at least one mock interview to see skill gap analysis.</p>
      </Card>
    );
  }

  const { categoryGaps, dimensionGaps, competencyGaps, topWeakAreas, recommendations, totalSessions, periodDays } = data;
  const hasGaps = topWeakAreas.length > 0 || competencyGaps.length > 0;

  return (
    <Card hover={false} className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-brand-accent-light" />
          <h3 className="text-base font-bold text-text-primary">Skill Gap Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs bg-dark-bg border border-dark-border rounded-md px-2 py-1 text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>6 months</option>
            <option value={365}>1 year</option>
          </select>
          <span className="text-[10px] text-text-muted">{totalSessions} sessions</span>
        </div>
      </div>

      {/* Top Weak Areas */}
      {topWeakAreas.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-status-warning" />
            Priority Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {topWeakAreas.map((wa, idx) => {
              const sev = SEVERITY_CONFIG[wa.severity] || SEVERITY_CONFIG.unknown;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${sev.bg} ${sev.border}`}
                >
                  <TrendingDown size={12} className={sev.color} />
                  <span className={`text-xs font-medium ${sev.color}`}>{wa.name}</span>
                  <span className="text-[10px] text-text-muted">{wa.score}/10</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Gaps */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
          <Target size={13} className="text-brand-primary-light" />
          Category Performance
        </p>
        <div className="space-y-2.5">
          {categoryGaps.map((cg) => {
            const sev = SEVERITY_CONFIG[cg.gapSeverity] || SEVERITY_CONFIG.unknown;
            return (
              <div key={cg.category} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-28 shrink-0 truncate">{cg.label}</span>
                <div className="flex-1 h-2 rounded-full bg-dark-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      cg.gapSeverity === 'critical' ? 'bg-status-error' :
                      cg.gapSeverity === 'moderate' ? 'bg-status-warning' :
                      cg.gapSeverity === 'mild' ? 'bg-brand-primary' : 'bg-status-success'
                    }`}
                    style={{ width: cg.averageScore != null ? `${(cg.averageScore / 10) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-xs font-mono font-medium w-10 text-right ${sev.color}`}>
                  {cg.averageScore ?? '—'}
                </span>
                <Badge variant={sev.badge} className="text-[10px] px-1.5 py-0">
                  {sev.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dimension Gaps */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
          <Activity size={13} className="text-brand-accent-light" />
          Dimension Breakdown
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dimensionGaps.map((dg) => {
            const sev = SEVERITY_CONFIG[dg.gapSeverity] || SEVERITY_CONFIG.unknown;
            return (
              <div key={dg.dimension} className={`rounded-lg border p-3 text-center ${sev.bg} ${sev.border}`}>
                <p className="text-[10px] text-text-muted mb-1">{dg.label}</p>
                <p className={`text-lg font-bold ${sev.color}`}>
                  {dg.averageScore ?? '—'}
                  <span className="text-[10px] text-text-muted">/10</span>
                </p>
                <Badge variant={sev.badge} className="text-[9px] mt-1 px-1.5 py-0">
                  {sev.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competency Gaps – collapsible */}
      {competencyGaps.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors mb-2"
          >
            <BookOpen size={13} className="text-status-warning" />
            Competency Gaps ({competencyGaps.length})
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {expanded && (
            <div className="space-y-2 animate-fade-in">
              {competencyGaps.map((cg, idx) => {
                const sev = SEVERITY_CONFIG[cg.gapSeverity] || SEVERITY_CONFIG.unknown;
                return (
                  <div key={idx} className={`rounded-lg border p-3 ${sev.bg} ${sev.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-text-primary">{cg.competency}</span>
                      <span className={`text-xs font-mono font-bold ${sev.color}`}>
                        {cg.averageScore ?? '—'}/10
                      </span>
                    </div>
                    {cg.topImprovements?.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {cg.topImprovements.map((imp, i) => (
                          <p key={i} className="text-[10px] text-text-muted pl-2">• {imp}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className={`rounded-lg p-4 border ${hasGaps ? 'bg-status-warning/5 border-status-warning/15' : 'bg-status-success/5 border-status-success/15'}`}>
          <p className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
            <Lightbulb size={13} className={hasGaps ? 'text-status-warning' : 'text-status-success'} />
            Recommendations
          </p>
          <div className="space-y-1.5">
            {recommendations.map((rec, idx) => (
              <p key={idx} className="text-xs text-text-secondary leading-relaxed">
                <span className="text-text-muted mr-1">{idx + 1}.</span> {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
