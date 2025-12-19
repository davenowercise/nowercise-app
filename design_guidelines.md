# Nowercise - Design Guidelines

## Design Approach
**System Foundation:** Apple Human Interface Guidelines for clarity and accessibility, with Material Design's feedback patterns for reassurance. Customized heavily for medical/health context with emotional support as core principle.

**Design Philosophy:** "Gentle Progress" - Every interaction should feel like a supportive coach, not a demanding trainer. Reduce anxiety through predictable patterns, celebrate tiny victories, adapt to energy levels.

## Typography System
- **Primary Font:** Inter or similar humanist sans-serif via Google Fonts
- **Hierarchy:**
  - Headlines (Onboarding, Section Headers): 2xl to 4xl, semibold (600)
  - Body Text (Instructions, Descriptions): lg to xl, regular (400) - larger than typical apps
  - Labels/Meta: base to lg, medium (500)
  - Safety Messages: xl, semibold for visibility
- **Line Height:** Generous 1.6-1.8 for readability when fatigued
- **Letter Spacing:** Slightly increased (0.01-0.02em) for clarity

## Layout System
**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16 (p-4, m-6, gap-8, py-12, mb-16)

**Container Strategy:**
- Max-width: 6xl for main content
- Single-column layouts on mobile (always)
- Maximum 2-column splits on desktop for exercise cards
- Generous padding: px-6 mobile, px-8 desktop
- Section spacing: py-12 mobile, py-16 desktop

**Fatigue-Adaptive Layout:**
- "Low Energy Mode" toggle reduces visible options from 6 to 3 exercises
- Progressive disclosure: Show essentials first, details on demand
- Sticky "I'm tired" quick-exit button always accessible

## Core Components

### Navigation
- **Bottom Tab Bar (Mobile Primary):**
  - 5 large touch targets: Today, Exercises, Progress, Community, Profile
  - Icons with labels (never icon-only)
  - Active state clearly distinguished
  - Height: 80px for easy thumb reach

- **Top Header:**
  - Persistent safety status indicator (circle badge: green/amber/red)
  - "How are you feeling?" quick check-in button
  - Minimal chrome, focus on content

### Hero Section (Home/Today View)
**Image:** Warm, authentic photo of diverse cancer survivors exercising outdoors or in bright, airy spaces. Natural light, genuine smiles, non-intimidating activity (walking, gentle stretching). Image should occupy top 40vh with gradient overlay for text readability.

**Hero Content Over Image:**
- Daily encouragement message (rotates): "You showed up. That's everything." 
- Blur-backed CTA button: "Start Today's Routine" (xl padding, rounded-2xl)
- Small streak counter: "5 days this week 🎉"

### Exercise Cards
**Layout:** Grid on desktop (2 columns max), stack on mobile
**Card Structure:**
- Large preview image/illustration (exercise demonstration)
- Exercise name (xl, semibold)
- Duration estimate (lg with clock icon)
- Difficulty badge (pill-shaped: "Gentle", "Moderate", "Energizing")
- Safety indicator (colored dot: green = safe today, amber = check-in, red = skip)
- Large "Start" button (full-width within card, py-4)

**Interaction:** Tap entire card or button to begin

### Safety Indicator System
**Visual Language:**
- Green Circle: "Safe to proceed" + checkmark icon
- Amber Circle: "Proceed with caution" + alert icon + brief reason ("heart rate elevated")
- Red Circle: "Skip today" + rest icon + supportive message ("Your body needs rest")
- Always paired with icon AND text label for accessibility
- Size: 48px minimum for visibility

### Progress Tracking
**Dashboard Components:**
- Large circular progress indicator (weekly goal completion)
- Horizontal bar chart: Last 7 days activity (simplified, no gridlines)
- Achievement badges grid: Visual rewards, unlockable
- "Small Wins" feed: Timeline of completed exercises with timestamps

**Data Density:** Minimal. Show 1-2 key metrics prominently, hide rest behind "See Details"

### Celebration Animations
**Trigger Points:**
- Exercise completion: Confetti burst (2 seconds), encouraging message
- Streak milestones: Badge unlock animation
- Weekly goal: Fireworks effect
**Philosophy:** Brief, joyful, never overwhelming. Skippable after 1 second.

### Forms & Input
- **Touch Targets:** Minimum 56px height for all interactive elements
- **Buttons:** 
  - Primary CTA: py-4 px-8, rounded-2xl, xl text, semibold
  - Secondary: py-3 px-6, rounded-xl, lg text
  - Ghost/Tertiary: py-3 px-4, underlined text
- **Input Fields:** 
  - Single-column form layouts
  - Large labels above inputs (lg, medium)
  - Input height: 56px minimum
  - Generous spacing between fields (mb-6)
  - Helper text below inputs (base size, muted)

### Community/Support Section
**Layout:** Card-based feed
- Story cards: Large images, brief captions
- Encouragement wall: Text-only inspirational messages from survivors
- Support group links: Large cards with meeting times
**Tone:** "You're not alone" - photos of real people, authentic stories

### Onboarding Flow
**Structure:** 4-5 screens maximum
- Welcome screen with hero image
- Safety questionnaire (large radio buttons)
- Goal setting (slider with large labels)
- Notification preferences (toggle switches, 60px tall)
- Celebration: "You're ready to begin!"

## Image Strategy
**Hero Images:**
- Home/Today: Primary hero (40vh)
- Exercise Library: Collection of demonstration photos
- Progress: Small celebratory illustrations
- Profile: Optional user upload

**Image Sources:** Authentic photos of cancer survivors, diverse ages/ethnicities, genuine emotions, natural settings. Avoid stock photo aesthetics - prioritize authenticity over polish.

**Placement:**
- Hero: Top of Today view, Onboarding screens
- Cards: Exercise demonstrations, Achievement badges
- Backgrounds: Subtle, abstract gradient textures (not photos) behind content sections

## Accessibility Imperatives
- Minimum contrast ratio: 4.5:1 for all text
- All interactive elements: keyboard navigable
- Screen reader labels on all icons and status indicators
- Motion: Respect `prefers-reduced-motion`
- Text resizing: Layout remains functional at 200% zoom
- Error states: Icon + text + color for triple redundancy

## Information Architecture
**Primary Screens:**
1. Today/Home: Hero + Today's recommended exercises + Quick stats
2. Exercise Library: Filterable grid (body area, difficulty, duration)
3. Progress: Weekly summary + Achievements + History
4. Community: Stories + Support groups
5. Profile: Settings + Health data + Preferences

**Navigation Depth:** Maximum 2 taps to any feature from home