/**
 * Gap Scoring Service
 * Implements a multi-factor scoring algorithm to prioritize gaps on a 1–10 scale.
 */

'use strict';

// Severity weights (out of 10)
const SEVERITY_SCORES = {
    critical: 10,
    high: 7.5,
    medium: 5,
    low: 2.5,
};

// Category strategic importance weights (modifier 0.5 – 1.0)
const CATEGORY_WEIGHTS = {
    skill_gap: 1.0,
    industry_alignment: 0.95,
    curriculum: 0.9,
    technology: 0.85,
    research: 0.8,
    infrastructure: 0.75,
    collaboration: 0.7,
    funding: 0.65,
};

// Number of affected departments contributes to breadth score
function calculateBreadthScore(affectedDepartments) {
    const count = affectedDepartments.length;
    if (count >= 5) return 10;
    if (count === 4) return 8;
    if (count === 3) return 6;
    if (count === 2) return 4;
    return 2;
}

/**
 * Scores a single gap item.
 * @param {object} gap - Raw gap item
 * @returns {object} Gap item enriched with score and rank metadata
 */
function scoreGap(gap) {
    const severityScore = SEVERITY_SCORES[gap.severity] || 5;
    const categoryWeight = CATEGORY_WEIGHTS[gap.category] || 0.7;
    const breadthScore = calculateBreadthScore(gap.affectedDepartments);

    // Weighted composite score (severity has highest weight)
    const rawScore = severityScore * 0.5 + breadthScore * 0.3 + severityScore * categoryWeight * 0.2;

    // Normalize to 1–10 scale
    const normalizedScore = Math.min(10, Math.max(1, parseFloat(rawScore.toFixed(1))));

    let priorityLabel;
    if (normalizedScore >= 8) priorityLabel = 'Critical Priority';
    else if (normalizedScore >= 6) priorityLabel = 'High Priority';
    else if (normalizedScore >= 4) priorityLabel = 'Medium Priority';
    else priorityLabel = 'Low Priority';

    return {
        ...gap,
        score: normalizedScore,
        priorityLabel,
        scoringBreakdown: {
            severityScore,
            breadthScore,
            categoryWeight,
        },
    };
}

/**
 * Scores and ranks all gaps, returning sorted array (highest score first).
 * @param {Array<object>} gaps - Raw gap analysis array
 * @returns {Array<object>} Sorted, scored gaps with rank assigned
 */
function scoreAndRankGaps(gaps) {
    if (!Array.isArray(gaps) || gaps.length === 0) return [];

    const scored = gaps.map(scoreGap);

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Assign rank
    return scored.map((gap, index) => ({
        ...gap,
        rank: index + 1,
    }));
}

/**
 * Returns a text summary of the top N gaps for proposal focus areas.
 * @param {Array<object>} rankedGaps
 * @param {number} topN
 * @returns {string}
 */
function getTopGapsSummary(rankedGaps, topN = 3) {
    return rankedGaps
        .slice(0, topN)
        .map((g) => `Rank ${g.rank}: ${g.title} (Score: ${g.score}/10, ${g.priorityLabel})`)
        .join('\n');
}

module.exports = { scoreAndRankGaps, getTopGapsSummary };
