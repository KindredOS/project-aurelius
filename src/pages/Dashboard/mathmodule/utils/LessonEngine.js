// lessonEngine.js - Adaptive Learning Engine

import exponentsData from '../dataseries/organizeddata/exponents_and_powers.json';
import expressionsData from '../dataseries/organizeddata/expressions_and_equations.json';
import factoringData from '../dataseries/organizeddata/factoring.json';
import geometryData from '../dataseries/organizeddata/geometry_connections_with_algebra.json';
import inequalitiesData from '../dataseries/organizeddata/inequalities.json';
import linearData from '../dataseries/organizeddata/linear_functions.json';
import rationalData from '../dataseries/organizeddata/rational_expressions.json';
import ratiosData from '../dataseries/organizeddata/ratios_and_proportional_relationships.json';
import statsData from '../dataseries/organizeddata/statistics_and_data_representations.json';
import systemsData from '../dataseries/organizeddata/systems_of_equations.json';

let conceptGraph = [
  ...exponentsData.problems,
  ...expressionsData.problems,
  ...factoringData.problems,
  ...geometryData.problems,
  ...inequalitiesData.problems,
  ...linearData.problems,
  ...rationalData.problems,
  ...ratiosData.problems,
  ...statsData.problems,
  ...systemsData.problems
];

let currentConcept = conceptGraph[0]?.id || null;
let attemptLog = {};
let masteryLog = {}; // Tracks progress by concept/subconcept

function findNode(id) {
  return conceptGraph.find((c) => c.id === id);
}

export function getNextProblem() {
  return findNode(currentConcept) || null;
}

function normalize(str) {
  return String(str)
  .replace(/\s+/g, '')            // remove all whitespace
  .replace(/[−–]/g, '-')          // normalize unicode minus signs
  .toLowerCase();
}

export function submitAnswer(answer, timeTaken = 0) {
  const current = findNode(currentConcept);
  const correct = normalize(answer) === normalize(current.answer);

  if (!current) return false;

  attemptLog[current.id] = attemptLog[current.id] || [];
  attemptLog[current.id].push({ answer, correct, timeTaken, timestamp: Date.now() });

  const key = `${current.concept}::${current.subconcept}`;
  masteryLog[key] = masteryLog[key] || { attempts: 0, correct: 0 };
  masteryLog[key].attempts++;
  if (correct) masteryLog[key].correct++;

  const masteryRatio = masteryLog[key].correct / masteryLog[key].attempts;
  const confident = timeTaken < 8000 && masteryRatio >= 0.75;

  if (correct) {
    const wasAttemptedBefore = (attemptLog[current.id] || []).length > 1;

    if (confident || wasAttemptedBefore) {
      if (current.next && current.next.length > 0) {
        currentConcept = current.next[0];
      } else {
        const idx = conceptGraph.findIndex(c => c.id === current.id);
        if (idx !== -1 && idx + 1 < conceptGraph.length) {
          currentConcept = conceptGraph[idx + 1].id;
        }
      }
    }
  } else if (current.prev?.length > 0) {
    currentConcept = current.prev[0];
  }

  return correct;
}

export function resetLesson() {
  currentConcept = conceptGraph[0]?.id || null;
  attemptLog = {};
  masteryLog = {};
}

export function getMasteryLog() {
  return masteryLog;
}
