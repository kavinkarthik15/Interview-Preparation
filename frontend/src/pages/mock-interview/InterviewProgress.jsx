

/**
 * Interview Progress Indicator
 * Shows step dots + progress bar for the mock interview flow.
 */
export default function InterviewProgress({
  currentIndex,
  totalQuestions,
  answeredCount,
  category,
}) {
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const categoryLabels = {
    core_knowledge: 'Core Knowledge',
    scenario_based: 'Scenario-Based',
    problem_solving: 'Problem Solving',
    behavioral: 'Behavioral',
  };

  const categoryColors = {
    core_knowledge: 'from-blue-500 to-blue-600',
    scenario_based: 'from-violet-500 to-purple-600',
    problem_solving: 'from-amber-500 to-orange-500',
    behavioral: 'from-emerald-500 to-teal-500',
  };

  return (
    <div className="space-y-3">
      {/* Top info row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Question</span>
          <span className="font-bold text-text-primary">
            {currentIndex + 1}
            <span className="text-text-muted font-normal"> / {totalQuestions}</span>
          </span>
        </div>
        {category && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r ${categoryColors[category] || 'from-gray-500 to-gray-600'} text-white`}>
            {categoryLabels[category] || category}
          </span>
        )}
        <span className="text-xs font-semibold text-text-primary">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-progress transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          let dotClass = 'bg-dark-border'; // unanswered
          if (i < answeredCount) dotClass = 'bg-status-success'; // answered
          if (i === currentIndex) dotClass = 'bg-brand-primary ring-2 ring-brand-primary/40 scale-125'; // current

          return (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shrink-0 ${dotClass}`}
              title={`Question ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
