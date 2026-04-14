/**
 * 💀 Skeleton – Shimmer loading placeholder system
 *
 * Variants:
 *   <Skeleton />                    – Single text line
 *   <Skeleton variant="circle" />   – Avatar / icon placeholder
 *   <Skeleton variant="rect" />     – Card / image placeholder
 *   <Skeleton count={3} />          – Multiple lines
 *
 * Composites:
 *   <Skeleton.Card />         – Full card skeleton
 *   <Skeleton.StatCard />     – Dashboard stat skeleton
 *   <Skeleton.ListItem />     – Topic / interview row
 *   <Skeleton.Panel />        – Large panel skeleton
 */

function SkeletonBase({ variant = 'text', width, height, className = '', style = {} }) {
  const baseClasses = 'ds-skeleton';

  const variantClasses = {
    text: 'h-4 rounded-md',
    circle: 'rounded-full',
    rect: 'rounded-card',
    badge: 'h-5 w-16 rounded-full',
  };

  const variantStyles = {
    text: { width: width || '100%', height: height || undefined },
    circle: { width: width || '40px', height: height || width || '40px' },
    rect: { width: width || '100%', height: height || '120px' },
    badge: { width: width || undefined, height: height || undefined },
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.text} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    />
  );
}

export function Skeleton({ variant = 'text', count = 1, gap = 'gap-3', width, height, className = '', style = {} }) {
  if (count === 1) {
    return <SkeletonBase variant={variant} width={width} height={height} className={className} style={style} />;
  }

  return (
    <div className={`flex flex-col ${gap}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBase
          key={i}
          variant={variant}
          width={i === count - 1 ? '60%' : width}
          height={height}
          className={className}
          style={style}
        />
      ))}
    </div>
  );
}

// ── Composites ──────────────────────────────────────────────
Skeleton.Card = function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-dark-card rounded-card border border-dark-border p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonBase variant="circle" width="36px" />
        <SkeletonBase width="140px" />
      </div>
      <Skeleton count={3} />
      <SkeletonBase width="80px" variant="badge" />
    </div>
  );
};

Skeleton.StatCard = function SkeletonStatCard() {
  return (
    <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <SkeletonBase variant="circle" width="36px" />
        <SkeletonBase width="100px" />
      </div>
      <SkeletonBase width="80px" height="28px" className="rounded-md" />
    </div>
  );
};

Skeleton.ListItem = function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 bg-dark-card rounded-card border border-dark-border">
      <SkeletonBase variant="circle" width="28px" />
      <div className="flex-1 space-y-2">
        <SkeletonBase width="60%" />
        <SkeletonBase width="30%" height="12px" />
      </div>
      <SkeletonBase variant="badge" />
    </div>
  );
};

Skeleton.Panel = function SkeletonPanel({ height = '200px' }) {
  return (
    <div className="bg-dark-card rounded-card border border-dark-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SkeletonBase variant="circle" width="24px" />
        <SkeletonBase width="180px" height="18px" />
      </div>
      <SkeletonBase variant="rect" height={height} className="!rounded-lg" />
    </div>
  );
};

Skeleton.Progress = function SkeletonProgress() {
  return (
    <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SkeletonBase variant="circle" width="24px" />
        <SkeletonBase width="160px" height="18px" />
      </div>
      <SkeletonBase height="16px" className="rounded-full" />
      <SkeletonBase width="80px" height="14px" />
      <div className="space-y-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBase width="100px" height="14px" />
            <div className="flex-1">
              <SkeletonBase height="8px" className="rounded-full" />
            </div>
            <SkeletonBase width="40px" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Full-Page Skeleton Layouts ──────────────────────────────
Skeleton.DashboardPage = function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <SkeletonBase width="180px" height="28px" className="rounded-md" />
        <SkeletonBase width="280px" height="16px" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton.StatCard key={i} />
        ))}
      </div>
      <Skeleton.Panel height="160px" />
      <Skeleton.Progress />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton.Card />
        <Skeleton.Card />
      </div>
    </div>
  );
};

Skeleton.TopicsPage = function TopicsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBase width="200px" height="28px" className="rounded-md" />
          <SkeletonBase width="320px" height="16px" />
        </div>
        <SkeletonBase width="120px" height="40px" className="rounded-btn" />
      </div>
      <div className="flex gap-4">
        <SkeletonBase width="150px" height="38px" className="rounded-card" />
        <SkeletonBase width="120px" height="38px" className="rounded-card" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton.ListItem key={i} />
        ))}
      </div>
    </div>
  );
};

Skeleton.InterviewsPage = function InterviewsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBase width="220px" height="28px" className="rounded-md" />
          <SkeletonBase width="360px" height="16px" />
        </div>
        <SkeletonBase width="140px" height="40px" className="rounded-btn" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dark-card rounded-card border border-dark-border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <SkeletonBase width="200px" height="18px" />
                  <SkeletonBase variant="badge" />
                  <SkeletonBase variant="badge" width="60px" />
                </div>
                <div className="flex items-center gap-4">
                  <SkeletonBase width="90px" height="14px" />
                  <SkeletonBase width="60px" height="14px" />
                  <SkeletonBase width="80px" height="14px" />
                </div>
              </div>
              <SkeletonBase variant="circle" width="32px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Skeleton.ProfilePage = function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div className="space-y-2">
        <SkeletonBase width="180px" height="28px" className="rounded-md" />
        <SkeletonBase width="300px" height="16px" />
      </div>
      <div className="bg-dark-card rounded-card border border-dark-border p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-dark-border">
          <SkeletonBase variant="circle" width="64px" height="64px" />
          <div className="space-y-2">
            <SkeletonBase width="160px" height="20px" />
            <SkeletonBase width="200px" height="14px" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBase width="120px" height="14px" />
            <SkeletonBase height="42px" className="rounded-card" />
          </div>
        ))}
        <SkeletonBase width="130px" height="42px" className="rounded-btn" />
      </div>
    </div>
  );
};

Skeleton.ResumePage = function ResumeSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <SkeletonBase width="180px" height="28px" className="rounded-md" />
        <SkeletonBase width="340px" height="16px" />
      </div>
      <div className="bg-dark-card rounded-card border-2 border-dashed border-dark-border-light p-12">
        <div className="flex flex-col items-center gap-3">
          <SkeletonBase variant="circle" width="72px" height="72px" />
          <SkeletonBase width="200px" height="18px" />
          <SkeletonBase width="160px" height="14px" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
