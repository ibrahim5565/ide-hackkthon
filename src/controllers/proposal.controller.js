/**
 * Proposal Controller
 * Handles the POST /generate-proposal endpoint logic.
 */

'use strict';

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { validateProposalRequest } = require('../utils/validator');
const { ProposalEngine } = require('../services/proposalEngine');
const { generatePDF } = require('../services/pdfService');

/**
 * POST /generate-proposal
 * Validates request, runs proposal engine, generates PDF, returns download URL.
 */
async function generateProposal(req, res) {
    try {
        // 1. Validate request body
        const { error, value } = validateProposalRequest(req.body);
        if (error) {
            const errorMessages = error.details.map((d) => d.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errorMessages,
            });
        }

        const { institutionProfile, gapAnalysis, proposalType } = value;

        // 2. Run the proposal engine
        const engine = new ProposalEngine(institutionProfile, gapAnalysis, proposalType);
        const html = await engine.generate();

        // 3. Generate unique filename
        const safeInstitutionName = institutionProfile.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 30);
        const filename = `${proposalType}_${safeInstitutionName}_${uuidv4().split('-')[0]}`;

        // 4. Convert HTML to PDF
        const { fileName } = await generatePDF(html, filename);

        // 5. Return download URL
        return res.status(200).json({
            status: 'success',
            message: 'Proposal generated successfully',
            proposalType,
            institutionName: institutionProfile.name,
            downloadUrl: `/proposals/${fileName}`,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[ProposalController] Unhandled error:\n', err.stack || err.message);
        return res.status(500).json({
            status: 'error',
            message: 'An internal server error occurred while generating the proposal.',
            detail: err.message,
        });
    }
}

module.exports = { generateProposal };
