import { CheckCircle, AlertTriangle, Lightbulb, ArrowUpRight } from 'lucide-react';

/**
 * 📈 ImprovementSection – Categorized AI feedback with colored tags
 * 
 * Props:
 *   strengths   – array of strength strings (Emerald tags)
 *   weaknesses  – array of weakness strings (Amber tags)
 *   suggestions – array of suggestion strings (Blue list items)
 */
export function ImprovementSection({
  strengths = [],
  weaknesses = [],
  suggestions = []
}) {
  const hasContent = strengths.length > 0 || weaknesses.length > 0 || suggestions.length > 0;

  if (!hasContent) return null;

  return (
    <div className="space-y-4">

      {/* Strengths */}
      {strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-status-success" />
            <h4 className="text-sm font-semibold text-status-success">Strengths</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {strengths.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                           bg-status-success/10 text-status-success border border-status-success/20
                           transition-all duration-200 hover:bg-status-success/15 hover:border-status-success/30"
              >
                <ArrowUpRight size={10} />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-status-warning" />
            <h4 className="text-sm font-semibold text-status-warning">Areas to Improve</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {weaknesses.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                           bg-status-warning/10 text-status-warning border border-status-warning/20
                           transition-all duration-200 hover:bg-status-warning/15 hover:border-status-warning/30"
              >
                <AlertTriangle size={10} />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-brand-primary-light" />
            <h4 className="text-sm font-semibold text-brand-primary-light">Suggestions</h4>
          </div>
          <ul className="space-y-1.5">
            {suggestions.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-text-secondary
                           bg-brand-primary/5 border border-brand-primary/10 rounded-lg px-3 py-2
                           transition-all duration-200 hover:bg-brand-primary/8 hover:border-brand-primary/20"
              >
                <Lightbulb size={12} className="text-brand-primary-light mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImprovementSection;
