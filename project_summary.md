# Nowercise Project Summary

## Overview
Nowercise is a comprehensive digital health platform designed for cancer patients, providing personalized exercise programs based on scientific research. The platform connects patients with exercise specialists and offers adaptive workout recommendations tailored to specific cancer types, treatment phases, and individual needs.

## Key Features Implemented

### Personalized Exercise Recommendation
- **ACSM-ACS Guidelines Integration**: Implemented algorithms based on American College of Sports Medicine and American Cancer Society guidelines
- **Tier System (1-4)**: Created a structured approach to exercise intensity progression
- **Cancer-Specific Considerations**: Tailored recommendations by cancer type (breast, prostate, colorectal, etc.)
- **Treatment Phase Awareness**: Adjusts recommendations based on phase (pre-treatment, during treatment, post-surgery, post-treatment)

### PAR-Q+ Medical Screening
- **Medical Clearance Screening**: Integrated PAR-Q+ questionnaire to identify patients who need medical clearance
- **Risk Assessment**: Evaluates health risks before beginning exercise programs
- **Medical Clearance Guidance**: Dedicated page explaining when and how to obtain medical clearance

### Workout Planning and Logging
- **Adaptive Workout Generation**: Creates workouts based on patient tier level and cancer type
- **Exercise Library**: Comprehensive database of exercises with filtering by treatment phase
- **Workout Logging**: Tracks repetitions, Rating of Perceived Exertion (RPE), and pain levels
- **Email Integration**: Allows sending workout logs to healthcare providers

### Calendar and Scheduling
- **4-Week Program Calendar**: Interactive calendar showing 12 workout sessions 
- **Color-Coding System**: Visual differentiation between workout types (strength, cardio, recovery)
- **Workout Type Filtering**: Ability to filter calendar by exercise type
- **Detailed Workout Views**: Click on calendar dates to access specific workout sessions

### User Interface
- **Mobile-Responsive Design**: Optimized for phones held vertically
- **Floating Action Buttons**: Improved mobile navigation to key features
- **Intuitive Workout Interface**: Clear layout for exercise information and logging
- **Multiple Format Options**: Both detailed and streamlined workout formats

## Technical Implementation
- **Frontend**: React.js with TypeScript, using Tailwind CSS for styling
- **UI Components**: Customized shadcn/ui component library
- **Calendar**: Integrated FullCalendar for workout scheduling
- **Data Management**: Drizzle ORM with PostgreSQL database

## Next Steps (Proposed)
- Completion tracking for workout calendar
- Progress visualization with charts and metrics
- User profile customization
- Additional exercise videos and content
- Notification system for workout reminders