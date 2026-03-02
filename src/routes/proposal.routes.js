/**
 * Proposal Routes
 * Defines all routes for the Proposal Auto-Generator API.
 */

'use strict';

const express = require('express');
const router = express.Router();
const { generateProposal } = require('../controllers/proposal.controller');

/**
 * POST /generate-proposal
 * Body: { institutionProfile, gapAnalysis, proposalType }
 * Response: { status, downloadUrl, ... }
 */
router.post('/generate-proposal', generateProposal);

/**
 * GET /health
 * Simple service health check
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Proposal Auto-Generator Platform',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
