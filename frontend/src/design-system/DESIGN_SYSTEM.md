# 🎨 Interview Prep – Design System Guide

> **Version:** 1.0.0 · **Phase 1** – Visual Identity Foundation

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `dark-bg` | `#0F172A` | Main app background |
| `dark-card` | `#111827` | Card / surface / sidebar |
| `dark-card-hover` | `#1E293B` | Elevated / hover surfaces |
| `brand-primary` | `#2563EB` | Buttons, links, active states |
| `brand-primary-hover` | `#1D4ED8` | Primary hover state |
| `brand-accent` | `#7C3AED` | AI elements, accent highlights |
| `brand-accent-hover` | `#6D28D9` | Accent hover state |
| `status-success` | `#10B981` | Completed, passed, positive |
| `status-warning` | `#F59E0B` | In-progress, needs attention |
| `status-error` | `#EF4444` | Failed, critical, danger |
| `status-info` | `#3B82F6` | Informational, pending |
| `text-primary` | `#E5E7EB` | Main body text |
| `text-secondary` | `#9CA3AF` | Muted / supporting text |
| `text-muted` | `#6B7280` | Placeholder / disabled text |

---

## Component Styling Rules

### Border Radius
- Cards: `12px` → `rounded-card`
- Buttons: `12px` → `rounded-btn`
- Large containers: `16px` → `rounded-lg`
- Pills / avatars: `9999px` → `rounded-full`

### Shadows
- Default card: `shadow-card` (subtle dark ambient glow)
- Hover card: `shadow-card-hover` (deeper glow on hover)
- AI glow: `shadow-glow-accent` (purple atmospheric glow)
- Primary glow: `shadow-glow-primary` (blue atmospheric glow)

### AI Elements
- Use `ds-ai-glow` CSS class for any AI-powered component
- Adds subtle purple inset + outer glow
- Combine with `animate-glow-pulse` for breathing effect
- Badge: `<AIConfidenceBadge confidence={0.85} />`

### Progress Bars
- Always use the `bg-gradient-progress` background (blue → purple gradient)
- Component: `<ProgressBar value={75} max={100} showLabel />`

---

## Typography

| Level | Weight | Tailwind Class |
|---|---|---|
| Headings | 700 (Bold) | `font-heading font-bold` |
| Subheadings | 600 | `font-heading font-semibold` |
| Body | 400 | `font-body` |
| Medium body | 500 | `font-body font-medium` |
| Code/Mono | 400-500 | `font-mono` |

Font stack: **Inter** → Segoe UI → system-ui → sans-serif

---

## UI Components (React)

Import from `@/components/ui`:

```jsx
import {
  Button,
  Card, CardHeader,
  Badge, StatusBadge, ScoreBadge, AIConfidenceBadge,
  ProgressBar,
  Input, Textarea, Select,
} from '../components/ui';
```

### Button Variants
```jsx
<Button variant="primary">Save</Button>
<Button variant="accent">Ask AI</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">More</Button>
<Button variant="danger">Delete</Button>
<Button loading>Processing...</Button>
```

### Card
```jsx
<Card aiGlow>
  <CardHeader title="AI Analysis" subtitle="Powered by GPT" />
  {/* content */}
</Card>
```

### Status Badges
```jsx
<StatusBadge status="completed" />   {/* Green */}
<StatusBadge status="in-progress" /> {/* Amber */}
<StatusBadge status="pending" />     {/* Blue */}
<StatusBadge status="failed" />      {/* Red */}
```

### Score Badge
```jsx
<ScoreBadge score={92} />  {/* "92% – Excellent" in green */}
<ScoreBadge score={68} />  {/* "68% – Average" in amber */}
```

### AI Confidence Badge
```jsx
<AIConfidenceBadge confidence={0.9} />  {/* "AI: High" in green */}
<AIConfidenceBadge confidence={0.6} />  {/* "AI: Medium" in amber */}
```

### Progress Bar
```jsx
<ProgressBar value={7} max={10} showLabel size="md" />
```

---

## CSS Utility Classes

| Class | Description |
|---|---|
| `ds-card` | Dark card with border, radius, shadow |
| `ds-btn-primary` | Blue primary button |
| `ds-btn-accent` | Purple accent/AI button |
| `ds-btn-outline` | Ghost border button |
| `ds-btn-danger` | Red danger button |
| `ds-badge-success` | Green status badge |
| `ds-badge-warning` | Amber status badge |
| `ds-badge-error` | Red status badge |
| `ds-badge-info` | Blue status badge |
| `ds-badge-accent` | Purple AI badge |
| `ds-progress-track` | Progress bar track |
| `ds-progress-fill` | Progress bar fill (gradient) |
| `ds-input` | Styled input field |
| `ds-ai-glow` | Purple glow for AI elements |

---

## Backend Response Formats

### Interview responses now include:
```json
{
  "score": 85,
  "scoreLabel": "Good",
  "status": "completed",
  "aiConfidence": 0.92,
  "aiConfidenceLabel": "High"
}
```

### Score labels (auto-computed):
| Score Range | Label |
|---|---|
| 90–100 | Excellent |
| 75–89 | Good |
| 50–74 | Average |
| 0–49 | Needs Work |

### Status tags:
`completed` · `in-progress` · `pending` · `failed`

### AI Confidence levels:
| Confidence | Label |
|---|---|
| 0.8–1.0 | High |
| 0.5–0.79 | Medium |
| 0.0–0.49 | Low |

---

## Animations

| Class | Effect |
|---|---|
| `animate-glow-pulse` | Breathing purple glow |
| `animate-fade-in` | Fade up entrance |
| `animate-slide-in` | Slide-in from left |

---

## File Structure

```
frontend/src/
  design-system/
    tokens.js          ← Programmatic color/spacing/helper exports
  components/
    ui/
      index.js         ← Barrel export
      Button.jsx       ← Button variants
      Card.jsx         ← Card + CardHeader
      Badge.jsx        ← Badge, StatusBadge, ScoreBadge, AIConfidenceBadge
      ProgressBar.jsx  ← Gradient progress bar
      Input.jsx        ← Input, Textarea, Select
  index.css            ← CSS variables + @layer components utilities
tailwind.config.js     ← Theme tokens (colors, shadows, radius, animations)
```
