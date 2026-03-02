/**
 * Server Entry Point
 * Proposal Auto-Generator Platform – Express Application
 */

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const proposalRoutes = require('./routes/proposal.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================================
// SECURITY MIDDLEWARE
// ================================================================
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles in served PDFs
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST'],
}));

// Rate limiting: max 10 proposal requests per 15 minutes per IP
const proposalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many proposal requests. Please try again after 15 minutes.',
    },
});

// ================================================================
// LOGGING
// ================================================================
app.use(morgan('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'));

// ================================================================
// BODY PARSING
// ================================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ================================================================
// STATIC FILE SERVING – Frontend UI (public/)
// ================================================================
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ================================================================
// DOWNLOAD ROUTE – Generated PDFs (proposals/)
// Serves PDF files using res.download() for reliable binary delivery.
// ================================================================
const PROPOSALS_DIR = path.join(process.cwd(), 'proposals');

app.get('/proposals/:filename', (req, res) => {
    // Sanitise filename – allow only safe characters, must end in .pdf
    const raw = req.params.filename;
    if (!raw || !/^[\w\-]+\.pdf$/i.test(raw)) {
        return res.status(400).json({ status: 'error', message: 'Invalid filename.' });
    }

    const filePath = path.join(PROPOSALS_DIR, raw);

    // Guard: file must exist and be inside the proposals dir
    if (!fs.existsSync(filePath) || !filePath.startsWith(PROPOSALS_DIR)) {
        return res.status(404).json({ status: 'error', message: 'PDF not found.' });
    }

    // Stream the PDF as a proper attachment download
    res.download(filePath, raw, (err) => {
        if (err && !res.headersSent) {
            console.error('[server] PDF download error:', err.message);
            res.status(500).json({ status: 'error', message: 'Failed to send PDF.' });
        }
    });
});

// ================================================================
// API ROUTES
// ================================================================
app.use('/api', proposalLimiter, proposalRoutes);

// API meta-info (moved from / so that / can serve the HTML frontend)
app.get('/api/info', (req, res) => {
    res.json({
        service: 'Proposal Auto-Generator Platform',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            ui: 'GET /',
            health: 'GET /api/health',
            generateProposal: 'POST /api/generate-proposal',
            downloadProposal: 'GET /proposals/:filename.pdf',
        },
    });
});

// ================================================================
// 404 HANDLER
// ================================================================
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ================================================================
// GLOBAL ERROR HANDLER
// ================================================================
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('[Global Error Handler]', err.stack || err.message);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'An unexpected error occurred.',
    });
});

// ================================================================
// START SERVER
// ================================================================
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║     PROPOSAL AUTO-GENERATOR PLATFORM                 ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Server running at: http://localhost:${PORT}             ║`);
    console.log(`║  Environment:       ${(process.env.NODE_ENV || 'development').padEnd(30)}║`);
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  Endpoints:                                          ║');
    console.log('║    GET  /                    → Service info          ║');
    console.log('║    GET  /api/health          → Health check          ║');
    console.log('║    POST /api/generate-proposal → Generate PDF        ║');
    console.log('║    GET  /proposals/:file.pdf → Download proposal     ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
