/**
 * Tone Adapter Utility
 * Adapts input text and generated content to formal academic tone.
 * Also provides dynamic objective generation based on proposal context.
 */

'use strict';

const PROPOSAL_TYPE_OBJECTIVES = {
    vac: [
        'To bridge the identified skill and knowledge gaps through structured Value Added Courses (VAC)',
        'To enhance the employability quotient of graduates by aligning curriculum with industry standards',
        'To foster a culture of continuous learning and professional development within the institution',
        'To establish sustainable academic-industry partnerships for long-term curriculum enrichment',
        'To provide students hands-on exposure to emerging technologies and methodologies',
    ],
    internship: [
        'To facilitate structured industry exposure addressing real-world skill deficiencies identified in the gap analysis',
        'To provide supervised, outcome-oriented internship opportunities aligned with departmental needs',
        'To strengthen the academic-industry interface for mutual benefit and knowledge transfer',
        'To enhance professional competencies and workplace readiness of graduating students',
        'To build a sustainable talent pipeline between the institution and industry partners',
    ],
    hackathon: [
        'To stimulate innovative problem-solving by engaging students with real-world institutional and societal challenges',
        'To foster collaborative ideation across departments through a structured competitive learning environment',
        'To identify and nurture emerging student talent in alignment with industry innovation needs',
        'To strengthen multi-stakeholder collaboration among academia, industry, and government bodies',
        'To generate deployable technological solutions addressing the identified infrastructure and skill gaps',
    ],
};

const FORMAL_REPLACEMENTS = [
    { pattern: /\bcan't\b/gi, replacement: 'cannot' },
    { pattern: /\bwon't\b/gi, replacement: 'will not' },
    { pattern: /\bdon't\b/gi, replacement: 'do not' },
    { pattern: /\bisn't\b/gi, replacement: 'is not' },
    { pattern: /\baren't\b/gi, replacement: 'are not' },
    { pattern: /\bwe're\b/gi, replacement: 'we are' },
    { pattern: /\bthey're\b/gi, replacement: 'they are' },
    { pattern: /\bit's\b/gi, replacement: 'it is' },
    { pattern: /\bthat's\b/gi, replacement: 'that is' },
    { pattern: /\bwasn't\b/gi, replacement: 'was not' },
    { pattern: /\bweren't\b/gi, replacement: 'were not' },
    { pattern: /\bhadn't\b/gi, replacement: 'had not' },
    { pattern: /\bhasn't\b/gi, replacement: 'has not' },
    { pattern: /\bhaven't\b/gi, replacement: 'have not' },
    { pattern: /\bwouldn't\b/gi, replacement: 'would not' },
    { pattern: /\bcouldn't\b/gi, replacement: 'could not' },
    { pattern: /\bshouldn't\b/gi, replacement: 'should not' },
    { pattern: /\bget\b/gi, replacement: 'obtain' },
    { pattern: /\bkids\b/gi, replacement: 'students' },
    { pattern: /\buse\b/gi, replacement: 'utilize' },
    { pattern: /\bshow\b/gi, replacement: 'demonstrate' },
    { pattern: /\bbig\b/gi, replacement: 'significant' },
    { pattern: /\btry\b/gi, replacement: 'endeavour' },
    { pattern: /\bhelp\b/gi, replacement: 'facilitate' },
    { pattern: /\bneed\b/gi, replacement: 'require' },
    { pattern: /\bstart\b/gi, replacement: 'commence' },
    { pattern: /\bend\b/gi, replacement: 'conclude' },
];

/**
 * Applies formal academic tone transformations to input text.
 * @param {string} text - Input text
 * @returns {string} Formally toned text
 */
function applyFormalTone(text) {
    if (!text || typeof text !== 'string') return text;
    let result = text;
    for (const { pattern, replacement } of FORMAL_REPLACEMENTS) {
        result = result.replace(pattern, replacement);
    }
    // Capitalize first letter of each sentence
    result = result.replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());
    return result;
}

/**
 * Generates a list of formal primary objectives for the proposal.
 * @param {string} proposalType - 'vac' | 'internship' | 'hackathon'
 * @param {Array<object>} scoredGaps - Scored and sorted gap items
 * @returns {string[]} Array of dynamic objectives
 */
function generateObjectives(proposalType, scoredGaps) {
    const baseObjectives = PROPOSAL_TYPE_OBJECTIVES[proposalType] || [];

    // Generate gap-specific objectives for top 3 gaps
    const topGaps = scoredGaps.slice(0, 3);
    const gapObjectives = topGaps.map((gap) => {
        return `To specifically address the ${gap.category.replace(/_/g, ' ')} gap pertaining to "${gap.title}" through targeted ${proposalType === 'vac' ? 'course interventions' : proposalType === 'internship' ? 'practical placements' : 'collaborative innovation exercises'}`;
    });

    return [...baseObjectives.slice(0, 3), ...gapObjectives];
}

/**
 * Generates a formal executive summary for the proposal.
 * @param {object} params
 * @returns {string}
 */
function generateExecutiveSummary({ institutionName, institutionType, proposalType, gapCount, topGaps }) {
    const typeLabel = {
        vac: 'Value Added Course (VAC) program',
        internship: 'structured Industry Internship Program',
        hackathon: 'Hackathon Collaboration Initiative',
    }[proposalType];

    const topGapTitles = topGaps
        .slice(0, 3)
        .map((g) => `"${g.title}"`)
        .join(', ');

    return applyFormalTone(
        `This proposal presents a comprehensive framework for the implementation of a ${typeLabel} at ${institutionName}, a distinguished ${institutionType.replace(/_/g, ' ')} committed to academic excellence and industry relevance. The proposal is grounded in a systematic gap analysis comprising ${gapCount} identified institutional deficiencies, with primary focus on ${topGapTitles}. The initiative is designed to address these gaps through evidence-based interventions, thereby enhancing the overall academic quality, graduate employability, and institutional competitiveness. The proposed program has been meticulously structured to ensure alignment with national education policy frameworks, industry standards, and the strategic vision of the institution. All financial projections, implementation timelines, and outcome indicators presented herein are derived from data-driven methodologies and benchmarked against comparable institutional initiatives.`
    );
}

module.exports = { applyFormalTone, generateObjectives, generateExecutiveSummary };
