import { Brain, AlertTriangle } from 'lucide-react';

/**
 * 🟣 AIExplanationPanel – AI explanation with purple left border
 *
 * Props:
 *   explanation – string text from ML model
 *   weakArea   – identified weak area string
 *   score      – predicted score (0-10)
 *   confidence – confidence % (0-100)
 */
export function AIExplanationPanel({
  explanation = '',
  weakArea = null,
  score = null,
  confidence = null
}) {
  if (!explanation && !weakArea) return null;

  return (
    <div
      className="relative rounded-card overflow-hidden bg-dark-card border border-dark-border ds-hover-lift"
      style={{
        boxShadow: '0 0 16px rgba(124, 58, 237, 0.08), inset 0 0 24px rgba(124, 58, 237, 0.03)'
      }}
    >
      {/* Purple left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-accent to-brand-primary rounded-l-card" />

      <div className="pl-5 pr-4 py-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-brand-accent-light" />
          <h4 className="text-sm font-semibold text-text-primary">AI Analysis</h4>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent-light font-medium">
            ML Model
          </span>
        </div>

        {/* Explanation text */}
        {explanation && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {explanation}
          </p>
        )}

        {/* Weak area callout */}
        {weakArea && weakArea !== 'No Data' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-status-warning/5 border border-status-warning/15">
            <AlertTriangle size={14} className="text-status-warning mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-status-warning">Focus Area</div>
              <div className="text-sm text-text-secondary mt-0.5">{weakArea}</div>
            </div>
          </div>
        )}

        {/* Score + Confidence summary */}
        {(score != null || confidence != null) && (
          <div className="flex items-center gap-4 pt-1">
            {score != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Predicted</span>
                <span className={`text-sm font-bold ${
                  score >= 8 ? 'text-status-success' :
                  score >= 6 ? 'text-brand-primary-light' :
                  score >= 4 ? 'text-status-warning' :
                  'text-status-error'
                }`}>{score}/10</span>
              </div>
            )}
            {confidence != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Confidence</span>
                <span className={`text-sm font-bold ${
                  confidence >= 70 ? 'text-brand-primary-light' :
                  confidence >= 40 ? 'text-status-warning' :
                  'text-status-error'
                }`}>{confidence}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIExplanationPanel;
