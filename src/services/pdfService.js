/**
 * PDF Service
 * Converts rendered HTML into a professional PDF using Puppeteer.
 */

'use strict';

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(process.cwd(), 'proposals');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Chrome executable path candidates for Windows
const CHROME_PATHS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + (process.env.USERNAME || '') + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];

/**
 * Resolves the path to a usable Chrome/Chromium executable.
 * Prefers system-installed Chrome; falls back to Puppeteer's bundled Chromium.
 * @returns {string|undefined}
 */
function resolveChromePath() {
    for (const chromePath of CHROME_PATHS) {
        if (fs.existsSync(chromePath)) {
            console.log('[pdfService] Using Chrome at:', chromePath);
            return chromePath;
        }
    }
    // Try Puppeteer's own bundled Chromium (only present if PUPPETEER_SKIP_DOWNLOAD was NOT set)
    try {
        const executablePath = puppeteer.executablePath();
        if (executablePath && fs.existsSync(executablePath)) {
            console.log('[pdfService] Using Puppeteer bundled Chromium at:', executablePath);
            return executablePath;
        }
    } catch (_) {
        // executablePath() throws if no bundled browser
    }
    throw new Error(
        'No Chrome/Chromium executable found.\n' +
        'Either install Google Chrome, or re-install puppeteer without PUPPETEER_SKIP_DOWNLOAD:\n' +
        '  npm install puppeteer\n' +
        'Checked paths:\n' +
        CHROME_PATHS.map(p => '  ' + p).join('\n')
    );
}

/**
 * Converts an HTML string to a PDF file.
 * @param {string} html - Fully rendered HTML content
 * @param {string} filename - Output filename (without .pdf extension)
 * @returns {Promise<{filePath: string, fileName: string}>}
 */
async function generatePDF(html, filename) {
    let browser = null;

    try {
        const executablePath = resolveChromePath();
        browser = await puppeteer.launch({
            headless: true,
            executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Set content and wait for all resources (fonts, images) to load
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

        // Emulate print media for proper PDF rendering
        await page.emulateMediaType('print');

        const safeFilename = `${filename}.pdf`;
        const outputPath = path.join(OUTPUT_DIR, safeFilename);

        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '25mm',
                right: '20mm',
                bottom: '25mm',
                left: '20mm',
            },
            displayHeaderFooter: true,
            headerTemplate: `
        <div style="width:100%; font-size:9px; font-family:'Segoe UI', Arial, sans-serif; color:#666; padding:0 20mm; display:flex; justify-content:space-between;">
          <span style="font-weight:600;">Proposal Auto-Generator Platform</span>
          <span>Confidential – For Institutional Use Only</span>
        </div>
      `,
            footerTemplate: `
        <div style="width:100%; font-size:9px; font-family:'Segoe UI', Arial, sans-serif; color:#666; padding:0 20mm; display:flex; justify-content:space-between; align-items:center;">
          <span>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
        });

        return {
            filePath: outputPath,
            fileName: safeFilename,
        };
    } catch (error) {
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { generatePDF };
