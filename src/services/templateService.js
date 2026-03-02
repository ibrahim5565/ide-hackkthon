/**
 * Template Service
 * Compiles Handlebars templates and injects dynamic proposal data.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// Register Handlebars helpers
Handlebars.registerHelper('inc', (value) => parseInt(value) + 1);
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('gte', (a, b) => a >= b);
Handlebars.registerHelper('join', (arr, sep) => (Array.isArray(arr) ? arr.join(sep || ', ') : arr));
Handlebars.registerHelper('upperCase', (str) => (str ? str.toUpperCase() : ''));
Handlebars.registerHelper('titleCase', (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
});
Handlebars.registerHelper('formatScore', (score) => {
    const filled = Math.round(score);
    return '★'.repeat(filled) + '☆'.repeat(10 - filled);
});
Handlebars.registerHelper('currentYear', () => new Date().getFullYear());
Handlebars.registerHelper('formatDate', () =>
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
);
Handlebars.registerHelper('severityClass', (severity) => {
    const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
    return map[severity] || 'badge-low';
});

// Cache compiled templates
const templateCache = new Map();

/**
 * Loads and compiles a Handlebars template (with caching).
 * @param {string} templateName - Template file name without extension
 * @returns {Function} Compiled Handlebars template function
 */
function loadTemplate(templateName) {
    if (templateCache.has(templateName)) return templateCache.get(templateName);

    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
    }

    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(source);
    templateCache.set(templateName, compiled);
    return compiled;
}

/**
 * Loads and compiles the base layout template.
 * @returns {Function} Compiled base template function
 */
function loadBaseTemplate() {
    return loadTemplate('base');
}

/**
 * Renders a full proposal HTML document.
 * @param {string} proposalType - 'vac' | 'internship' | 'hackathon'
 * @param {object} data - Template data context
 * @returns {string} Rendered HTML string
 */
function renderProposalHTML(proposalType, data) {
    // Load and render the type-specific content template
    const contentTemplate = loadTemplate(proposalType);
    const contentHTML = contentTemplate(data);

    // Inject content into base layout
    const baseTemplate = loadBaseTemplate();
    return baseTemplate({
        ...data,
        content: contentHTML,
    });
}

module.exports = { renderProposalHTML };
