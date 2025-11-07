// utils/aggregateScores.js
export function aggregateSubjectScores(progress, subject) {
  if (!progress || typeof progress !== 'object') return 0;

  // Case 1: progress is already scoped to one subject (nested map)
  if (progress[subject] && typeof progress[subject] === 'object') {
    return averageValues(progress[subject]);
  }

  // Case 2: progress is a flat map of module scores
  return averageValues(progress, subject);
}

function averageValues(obj, subjectFilter = null) {
  const keys = Object.keys(obj);

  let subjectKeys = keys;
  if (subjectFilter) {
    subjectKeys = keys.filter(key =>
      key.toLowerCase().includes(subjectFilter.toLowerCase())
    );

    // Handle generic module names
    if (subjectKeys.length === 0) {
      subjectKeys = keys.filter(key => key.toLowerCase().startsWith("module"));
    }
  }

  if (!subjectKeys.length) return 0;

  const values = subjectKeys
    .map(k => obj[k])
    .filter(v => typeof v === "number" && !isNaN(v));

  if (!values.length) return 0;

  const total = values.reduce((sum, v) => sum + v, 0);
  return Math.round(total / values.length);
}
