/**
 * Proposal Engine
 * Core class that orchestrates proposal generation by combining
 * scoring, budget estimation, timeline generation, tone adaptation,
 * and template rendering.
 */

'use strict';

const { scoreAndRankGaps } = require('./scoringService');
const { estimateBudget } = require('../utils/budgetEstimator');
const { generateTimeline } = require('../utils/timelineGenerator');
const { generateObjectives, generateExecutiveSummary } = require('../utils/toneAdapter');
const { renderProposalHTML } = require('./templateService');

const PROPOSAL_TYPE_LABELS = {
    vac: 'Value Added Course (VAC) Proposal',
    internship: 'Industry Internship Program Proposal',
    hackathon: 'Hackathon Collaboration Proposal',
};

class ProposalEngine {
    /**
     * @param {object} institutionProfile - Validated institution profile
     * @param {Array<object>} gapAnalysis - Validated gap analysis items
     * @param {string} proposalType - 'vac' | 'internship' | 'hackathon'
     */
    constructor(institutionProfile, gapAnalysis, proposalType) {
        this.institutionProfile = institutionProfile;
        this.gapAnalysis = gapAnalysis;
        this.proposalType = proposalType;
    }

    /**
     * Orchestrates the full proposal generation pipeline.
     * @returns {Promise<string>} Rendered HTML string ready for PDF conversion
     */
    async generate() {
        // Step 1: Score and rank gaps
        const rankedGaps = scoreAndRankGaps(this.gapAnalysis);

        // Step 2: Generate budget estimate
        const budget = estimateBudget(this.proposalType, rankedGaps);

        // Step 3: Generate timeline
        const timeline = generateTimeline(this.proposalType, rankedGaps.length);

        // Step 4: Generate dynamic objectives
        const objectives = generateObjectives(this.proposalType, rankedGaps);

        // Step 5: Generate formal executive summary
        const executiveSummary = generateExecutiveSummary({
            institutionName: this.institutionProfile.name,
            institutionType: this.institutionProfile.type,
            proposalType: this.proposalType,
            gapCount: rankedGaps.length,
            topGaps: rankedGaps,
        });

        // Step 6: Build proposed solutions per proposal type
        const proposedSolution = this._buildProposedSolution(rankedGaps);

        // Step 7: Build expected outcomes
        const expectedOutcomes = this._buildExpectedOutcomes(rankedGaps);

        // Step 8: Assemble template data context
        const templateData = {
            proposalTitle: PROPOSAL_TYPE_LABELS[this.proposalType],
            proposalType: this.proposalType,
            generatedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            institution: this.institutionProfile,
            executiveSummary,
            objectives,
            rankedGaps,
            totalGaps: rankedGaps.length,
            criticalGaps: rankedGaps.filter((g) => g.priorityLabel === 'Critical Priority'),
            proposedSolution,
            expectedOutcomes,
            budget,
            timeline,
        };

        // Step 9: Render HTML via Handlebars
        return renderProposalHTML(this.proposalType, templateData);
    }

    /**
     * Builds the "Proposed Solution" section based on proposal type and top gaps.
     * @param {Array<object>} rankedGaps
     * @returns {object}
     */
    _buildProposedSolution(rankedGaps) {
        const typeDescriptions = {
            vac: {
                overview:
                    'The proposed Value Added Course (VAC) program is structured as a supplementary academic initiative designed to operationally bridge the identified institutional gaps through targeted short-term courses, workshops, and certification pathways delivered by qualified industry practitioners and academic experts.',
                components: [
                    'Modular course curriculum mapped directly to each identified gap',
                    'Blended learning approach combining in-person instruction with digital resources',
                    'Industry expert guest lectures and demonstration sessions',
                    'Hands-on laboratory and project-based learning components',
                    'Continuous assessment and certification framework',
                    'Student performance analytics and individualized feedback mechanisms',
                ],
            },
            internship: {
                overview:
                    'The proposed Internship Program establishes a formal, structured collaboration between the institution and qualified industry partners, enabling students to gain supervised practical experience in environments that directly address the identified skill and knowledge gaps.',
                components: [
                    'Formal MoU-based partnership with vetted industry organizations',
                    'Structured internship rotations across relevant functional domains',
                    'Dedicated industry mentors and institutional supervisors per intern',
                    'Weekly progress tracking and milestone-based evaluation system',
                    'Real-world project assignments with documented deliverables',
                    'Final presentation and portfolio development for career readiness',
                ],
            },
            hackathon: {
                overview:
                    'The proposed Hackathon Collaboration Initiative establishes a structured, high-energy innovation event co-organized with industry partners, government bodies, and technology communities to foster interdisciplinary problem-solving, entrepreneurial thinking, and collaborative innovation aligned with the identified institutional gaps.',
                components: [
                    'Multi-track problem statements addressing each identified gap category',
                    'Cross-disciplinary team formation to maximize diverse skill integration',
                    'Dedicated mentorship by industry experts throughout the event',
                    'Structured prototype development, testing, and presentation workflow',
                    'Incubation pathway and industry adoption track for winning solutions',
                    'Post-hackathon publication and intellectual property documentation support',
                ],
            },
        };

        const topGapSolutions = rankedGaps.slice(0, 5).map((gap) => ({
            gap: gap.title,
            rank: gap.rank,
            score: gap.score,
            approach: this._getGapApproach(gap, this.proposalType),
        }));

        return {
            ...(typeDescriptions[this.proposalType] || typeDescriptions.vac),
            gapSpecificApproaches: topGapSolutions,
        };
    }

    /**
     * Returns a tailored solution approach for a specific gap and proposal type.
     * @param {object} gap
     * @param {string} proposalType
     * @returns {string}
     */
    _getGapApproach(gap, proposalType) {
        const approaches = {
            vac: `Design and deliver a dedicated ${gap.category.replace(/_/g, ' ')} course module addressing "${gap.title}" through structured theory, practicals, and industry case studies.`,
            internship: `Place students within industry environments where exposure to "${gap.title}" challenges is integral to daily operations, with targeted learning objectives defined in the internship charter.`,
            hackathon: `Define a problem statement centred on "${gap.title}" as one of the hackathon tracks, inviting multi-disciplinary teams to propose and prototype evidence-based solutions.`,
        };
        return approaches[proposalType] || approaches.vac;
    }

    /**
     * Builds "Expected Outcomes" section.
     * @param {Array<object>} rankedGaps
     * @returns {object}
     */
    _buildExpectedOutcomes(rankedGaps) {
        const typeOutcomes = {
            vac: [
                'Measurable improvement in student competency scores across targeted skill domains',
                'Industry-recognized certifications awarded to minimum 80% of participating students',
                'Reduction in identified skill gaps by an estimated 60–70% within program duration',
                'Enhanced employability quotient reflected in improved campus placement rates',
                'Establishment of a sustainable VAC delivery framework replicable across departments',
                'Strengthened academic–industry interface with potential for long-term curriculum co-creation',
            ],
            internship: [
                'At least 85% of participating students successfully complete the full internship cycle',
                'Minimum 70% of interns receive formal job offers or pre-placement offers from hosting organizations',
                'Quantifiable improvement in professional skills and workplace readiness assessments',
                'Documented gap reduction across all identified high-priority areas within 12 months',
                'Formalization of at least 3 new industry partnerships through the program',
                'Publication of an institutional internship outcomes report for stakeholder transparency',
            ],
            hackathon: [
                'Generation of at least 20 innovative solution prototypes addressing identified gaps',
                'Minimum 5 solutions selected for incubation or pilot deployment consideration',
                'Participation of at least 100 students across multiple departments and specializations',
                'Engagement of minimum 10 industry mentors and 3 co-organizing partner entities',
                'Significant increase in student innovation index and entrepreneurial awareness',
                'Documentation and publication of outcomes for academic and policy advocacy purposes',
            ],
        };

        const shortTermOutcomes = (typeOutcomes[this.proposalType] || []).slice(0, 3);
        const longTermOutcomes = (typeOutcomes[this.proposalType] || []).slice(3);

        const kpis = rankedGaps.slice(0, 4).map((gap) => ({
            indicator: `Gap Resolution – ${gap.title}`,
            target: gap.severity === 'critical' ? '≥70% gap closure within program period' : '≥50% gap closure within program period',
            measurement: 'Pre/Post assessment scores and departmental evaluation reports',
        }));

        return { shortTermOutcomes, longTermOutcomes, kpis };
    }
}

module.exports = { ProposalEngine };
