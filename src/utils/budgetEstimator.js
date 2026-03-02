/**
 * Budget Estimator Utility
 * Calculates estimated budget ranges based on proposal type and gap analysis data.
 */

'use strict';

// Base costs per proposal type (in USD)
const BASE_COSTS = {
    vac: {
        label: 'VAC (Value Added Course)',
        setupCost: 15000,
        perGapCost: 3000,
        facultyCostPerMonth: 5000,
        infrastructureCost: 8000,
        contingencyPercent: 0.1,
    },
    internship: {
        label: 'Industry Internship Program',
        setupCost: 10000,
        perGapCost: 2000,
        stipendPerIntern: 800,
        coordinationCost: 4000,
        contingencyPercent: 0.1,
    },
    hackathon: {
        label: 'Hackathon Collaboration',
        setupCost: 20000,
        perGapCost: 1500,
        prizePool: 10000,
        logisticsCost: 7000,
        contingencyPercent: 0.12,
    },
};

const SEVERITY_MULTIPLIER = {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
    critical: 2.0,
};

/**
 * Estimates budget for a proposal based on type and scored gaps.
 * @param {string} proposalType - 'vac' | 'internship' | 'hackathon'
 * @param {Array<object>} scoredGaps - Gap items with score property
 * @returns {object} Budget breakdown object
 */
function estimateBudget(proposalType, scoredGaps) {
    const config = BASE_COSTS[proposalType];
    if (!config) throw new Error(`Unknown proposal type: ${proposalType}`);

    let variableCost = 0;
    scoredGaps.forEach((gap) => {
        const multiplier = SEVERITY_MULTIPLIER[gap.severity] || 1.0;
        variableCost += config.perGapCost * multiplier;
    });

    let typeSpecificCost = 0;
    if (proposalType === 'vac') {
        // Estimate 3-month faculty engagement
        typeSpecificCost = config.facultyCostPerMonth * 3 + config.infrastructureCost;
    } else if (proposalType === 'internship') {
        // Estimate for up to 10 interns for 3 months
        const estimatedInterns = Math.min(scoredGaps.length * 3, 30);
        typeSpecificCost = config.stipendPerIntern * estimatedInterns + config.coordinationCost;
    } else if (proposalType === 'hackathon') {
        typeSpecificCost = config.prizePool + config.logisticsCost;
    }

    const subtotal = config.setupCost + variableCost + typeSpecificCost;
    const contingency = subtotal * config.contingencyPercent;
    const total = subtotal + contingency;

    return {
        proposalTypeLabel: config.label,
        breakdown: {
            setupAndAdministration: formatCurrency(config.setupCost),
            gapAddressingCosts: formatCurrency(variableCost),
            programSpecificCosts: formatCurrency(typeSpecificCost),
            contingencyReserve: formatCurrency(contingency),
        },
        estimatedTotalUSD: formatCurrency(total),
        estimatedTotalINR: formatCurrency(total * 83.5, 'INR'),
        note:
            'This is a preliminary estimate. Final budget is subject to institutional negotiations and resource availability.',
    };
}

/**
 * Formats a number as a currency string.
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(amount));
}

module.exports = { estimateBudget };
