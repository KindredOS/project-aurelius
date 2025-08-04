//Path: src/utils/stylesBranding.js
//Focus: A singular place to support branding logic 
//Version Update: First scaffold

export const SUBJECT_THEMES = {
  science: {
    primary: '#3b82f6',      // Blue
    secondary: '#2563eb',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    progressGradient: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
    name: 'Science'
  },
  technology: {
    primary: '#8b5cf6',      // Purple
    secondary: '#7c3aed',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    progressGradient: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
    name: 'Technology'
  },
  engineering: {
    primary: '#f59e0b',      // Orange
    secondary: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    progressGradient: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
    name: 'Engineering'
  },
  arts: {
    primary: '#ec4899',      // Pink
    secondary: '#db2777',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    progressGradient: 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)',
    name: 'Arts'
  },
  math: {
    primary: '#ef4444',      // Bold red
    secondary: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    progressGradient: 'linear-gradient(135deg, #fef2f2 0%, #ef4444 100%)',
    name: 'Mathematics'
  },
  lifestyle: {
    primary: '#10b981',      // Energetic green
    secondary: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    progressGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    name: 'Lifestyle'
  },
  all: {
    primary: '#374151',      // Gray
    secondary: '#4b5563',
    gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
    progressGradient: 'linear-gradient(90deg, #374151 0%, #4b5563 100%)',
    name: 'All Subjects'
  }
};

export function getThemeColors(subject = 'all') {
  return SUBJECT_THEMES[subject.toLowerCase()] || SUBJECT_THEMES.all;
}
