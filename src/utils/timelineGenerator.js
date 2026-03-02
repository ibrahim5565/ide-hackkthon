/**
 * Timeline Generator Utility
 * Produces a smart, phase-based implementation timeline based on proposal type and gap count.
 */

'use strict';

const PHASE_TEMPLATES = {
    vac: [
        {
            phase: 'Phase 1',
            name: 'Needs Assessment & Curriculum Design',
            durationWeeks: 4,
            activities: [
                'Conduct detailed institutional needs assessment',
                'Engage subject matter experts for curriculum mapping',
                'Design course syllabus and learning outcomes',
                'Identify and onboard faculty members',
            ],
        },
        {
            phase: 'Phase 2',
            name: 'Resource Mobilization & Infrastructure Setup',
            durationWeeks: 3,
            activities: [
                'Procure required hardware and software resources',
                'Set up lab environments and learning management system',
                'Develop course materials, assignments, and assessments',
                'Conduct faculty orientation and training sessions',
            ],
        },
        {
            phase: 'Phase 3',
            name: 'Pilot Implementation',
            durationWeeks: 6,
            activities: [
                'Launch pilot batch with select student cohort',
                'Deliver VAC training sessions as per schedule',
                'Conduct mid-program evaluations and feedback sessions',
                'Refine curriculum based on real-time inputs',
            ],
        },
        {
            phase: 'Phase 4',
            name: 'Full-Scale Rollout & Assessment',
            durationWeeks: 4,
            activities: [
                'Extend program to all targeted departments',
                'Administer comprehensive skill assessments',
                'Issue certificates and document outcomes',
                'Compile impact report for institutional records',
            ],
        },
    ],
    internship: [
        {
            phase: 'Phase 1',
            name: 'Program Design & Partner Identification',
            durationWeeks: 3,
            activities: [
                'Define internship roles aligned to identified skill gaps',
                'Identify and approach industry/corporate partners',
                'Finalize MoU terms and legal agreements',
                'Develop student selection criteria',
            ],
        },
        {
            phase: 'Phase 2',
            name: 'Student Selection & Orientation',
            durationWeeks: 2,
            activities: [
                'Publish internship opportunity notifications',
                'Conduct selection interviews and aptitude tests',
                'Brief selected students on roles and expectations',
                'Complete pre-internship documentation and onboarding',
            ],
        },
        {
            phase: 'Phase 3',
            name: 'Active Internship Execution',
            durationWeeks: 10,
            activities: [
                'Students commence internship at partner organizations',
                'Weekly mentor check-ins and progress reviews',
                'Bi-monthly institutional coordinator site visits',
                'Real-world project assignments and deliverables',
            ],
        },
        {
            phase: 'Phase 4',
            name: 'Evaluation, Reporting & Closure',
            durationWeeks: 2,
            activities: [
                'Final project presentations by intern cohort',
                'Performance evaluation by industry mentors',
                'Internship completion certificates awarded',
                'Compile learnings and program effectiveness report',
            ],
        },
    ],
    hackathon: [
        {
            phase: 'Phase 1',
            name: 'Concept Development & Partnership Setup',
            durationWeeks: 3,
            activities: [
                'Define hackathon theme aligned to institutional gaps',
                'Formalize industry and academic co-organizer partnerships',
                'Establish judging criteria and prize structure',
                'Secure sponsorships and external funding',
            ],
        },
        {
            phase: 'Phase 2',
            name: 'Outreach, Promotion & Team Registration',
            durationWeeks: 3,
            activities: [
                'Launch digital and on-campus promotional campaigns',
                'Open team registration portal and manage applications',
                'Conduct pre-hackathon workshops and webinars',
                'Shortlist qualified teams for participation',
            ],
        },
        {
            phase: 'Phase 3',
            name: 'Hackathon Execution',
            durationWeeks: 1,
            activities: [
                'Conduct opening ceremony and problem statement release',
                '24–48 hour intensive collaborative hacking sessions',
                'Mentor and expert office hours for guidance',
                'Final presentation and live demo to judging panel',
            ],
        },
        {
            phase: 'Phase 4',
            name: 'Post-Hackathon Follow-Up & Impact Assessment',
            durationWeeks: 2,
            activities: [
                'Award ceremony and prize distribution',
                'Incubation pathway for top solutions identified',
                'Publish outcomes report and success stories',
                'Document lessons learned for future editions',
            ],
        },
    ],
};

/**
 * Generates a smart timeline based on proposal type and gap count.
 * @param {string} proposalType - 'vac' | 'internship' | 'hackathon'
 * @param {number} gapCount - Number of gaps identified
 * @returns {object} Timeline with phases, total duration, and start/end estimates
 */
function generateTimeline(proposalType, gapCount) {
    const phases = PHASE_TEMPLATES[proposalType];
    if (!phases) throw new Error(`No timeline template for proposal type: ${proposalType}`);

    // Scale duration slightly with more gaps (complexity adjustment)
    const complexityFactor = gapCount > 5 ? 1.25 : gapCount > 3 ? 1.1 : 1.0;

    let runningWeek = 0;
    const processedPhases = phases.map((phase) => {
        const adjustedWeeks = Math.ceil(phase.durationWeeks * complexityFactor);
        const startWeek = runningWeek + 1;
        const endWeek = runningWeek + adjustedWeeks;
        runningWeek = endWeek;

        return {
            phase: phase.phase,
            name: phase.name,
            duration: `${adjustedWeeks} week${adjustedWeeks > 1 ? 's' : ''}`,
            weekRange: `Week ${startWeek}–${endWeek}`,
            activities: phase.activities,
        };
    });

    const totalWeeks = runningWeek;
    const totalMonths = (totalWeeks / 4.33).toFixed(1);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + totalWeeks * 7);

    return {
        totalDuration: `${totalWeeks} weeks (~${totalMonths} months)`,
        proposedStartDate: formatDate(startDate),
        proposedEndDate: formatDate(endDate),
        complexityNote:
            gapCount > 5
                ? 'Timeline extended by 25% due to high gap complexity.'
                : gapCount > 3
                    ? 'Timeline extended by 10% to address moderate gap coverage.'
                    : 'Standard timeline applied.',
        phases: processedPhases,
    };
}

/**
 * Formats a Date to 'Month YYYY' string.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

module.exports = { generateTimeline };
