import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import { SingleBar, Presets } from 'cli-progress';
import 'dotenv/config';

// Configuration
const CONFIG_PATH = path.join(process.cwd(), 'qa-agent/config.yaml');
const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
const BASE_URL = 'https://gdifuture.works';
const OUTPUT_DIR = path.join(process.cwd(), 'qa-agent/output');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// AI Provider Setup
const provider = config.ai_provider || 'openai';
const apiKey = provider === 'dashscope' ? process.env.DASHSCOPE_API_KEY : process.env.OPENAI_API_KEY;
const baseURL = provider === 'dashscope' ? (process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1') : undefined;

if (!apiKey) {
    console.warn(chalk.yellow(`Warning: API key for provider '${provider}' is missing in .env`));
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

class QA_Agent {
  constructor() {
    this.visited = new Set();
    this.queue = [BASE_URL];
    this.results = {
      broken_links: [],
      ui_issues: [],
      grammar_errors: [],
      performance_issues: [],
      console_errors: [],
      network_errors: [],
    };
    this.maxPages = config.settings.max_pages || 50;
    this.maxDepth = config.settings.max_depth || 3;
    this.pagesTested = 0;
  }

  async run() {
    const spinner = ora('Initializing AI QA Agent...').start();
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    spinner.succeed('Agent initialized. Starting crawl...');

    const progressBar = new SingleBar({}, Presets.shades_classic);
    progressBar.start(this.maxPages, 0);

    while (this.queue.length > 0 && this.pagesTested < this.maxPages) {
      const url = this.queue.shift();
      if (this.visited.has(url)) continue;
      this.visited.add(url);
      
      try {
        await this.testPage(context, url);
        this.pagesTested++;
        progressBar.update(this.pagesTested);
      } catch (err) {
        console.error(chalk.red(`\nError testing ${url}: ${err.message}`));
      }
    }

    progressBar.stop();
    spinner.start('Generating QA Report...');
    await this.generateReport();
    spinner.succeed('Audit complete! Report saved to qa-agent/output/qa_report.md');

    await browser.close();
  }

  async testPage(context, url) {
    const page = await context.newPage();
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.console_errors.push({ url, text: msg.text() });
      }
    });

    // Listen for network errors
    page.on('requestfailed', request => {
      this.results.network_errors.push({
        url,
        requestUrl: request.url(),
        error: request.failure()?.errorText || 'Unknown error'
      });
    });

    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    if (loadTime > 4000) {
      this.results.performance_issues.push({ url, type: 'slow_load', value: `${loadTime}ms` });
    }

    // Capture screenshot if enabled
    let screenshotName = '';
    if (config.settings.capture_screenshots) {
      screenshotName = `${Buffer.from(url).toString('base64').substring(0, 15)}_${Date.now()}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    // Crawl: Extract links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href.startsWith('https://gdifuture.works/'))
        .map(href => href.split('#')[0]);
    });

    for (const link of Array.from(new Set(links))) {
       if (!this.visited.has(link) && !this.queue.includes(link)) {
        this.queue.push(link);
      }
    }

    // Sub-Agents
    await this.runNavigationQA(page, url);
    await this.runGrammarQA(page, url);
    await this.runPerformanceQA(page, url);

    if (this.pagesTested % 5 === 0) {
      await this.runMobileQA(context, url);
    }

    if (url.includes('/checkout')) {
      await this.runCheckoutQA(page, url);
    }

    await page.close();
  }

  async runNavigationQA(page, url) {
    const deadButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a.btn, .button'))
        .filter(b => (!b.onclick && (!b.href || b.href === '#' || b.href === 'javascript:void(0)')))
        .map(b => b.innerText?.trim() || b.getAttribute('aria-label') || 'Unnamed button');
    });

    if (deadButtons.length > 0) {
      this.results.ui_issues.push({ url, type: 'Potential Dead UI Elements', detail: deadButtons });
    }
  }

  async runMobileQA(context, url) {
    for (const deviceName of config.agents.find(a => a.name === 'Mobile QA Agent').devices) {
      const device = devices[deviceName];
      if (!device) continue;

      const mobilePage = await context.newPage({ ...device });
      try {
        await mobilePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const hasHorizontalScroll = await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        
        if (hasHorizontalScroll) {
          this.results.ui_issues.push({ url, type: `Mobile Layout Overflow (${deviceName})`, detail: 'Horizontal scroll detected' });
        }
      } catch (e) {
        // Ignore mobile specific timeouts
      } finally {
        await mobilePage.close();
      }
    }
  }

  async runGrammarQA(page, url) {
    if (!process.env.OPENAI_API_KEY) return;
    const textContent = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body;
        return main.innerText.substring(0, 3000);
    });
    
    try {
      const completion = await openai.chat.completions.create({
        model: config.model || "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Identify grammar, translation, or spelling errors in Indonesian or English. Return a JSON object with an 'errors' key containing an array of {error, fix, type: 'grammar'|'translation'|'label'}. If none, return {errors: []}." 
          },
          { role: "user", content: `Text from ${url}:\n\n${textContent}` }
        ],
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(completion.choices[0].message.content);
      if (parsed.errors?.length > 0) {
        this.results.grammar_errors.push({ url, errors: parsed.errors });
      }
    } catch (e) {
      console.error(`AI check failed: ${e.message}`);
    }
  }

  async runPerformanceQA(page, url) {
    const metrics = await page.evaluate(() => {
      const timing = window.performance.timing;
      return {
        domLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        totalTime: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    if (metrics.domLoaded > 2500) {
      this.results.performance_issues.push({ url, type: 'Slow DOM Load', value: `${metrics.domLoaded}ms` });
    }
  }

  async runCheckoutQA(page, url) {
    const hasForms = await page.$$eval('form', forms => forms.length > 0);
    if (!hasForms) {
        this.results.ui_issues.push({ url, type: 'Missing Checkout Form', detail: 'No form elements found on checkout page' });
    }
  }

  async generateReport() {
    let report = `# AI QA Audit Report: GDI FutureWorks\n\n`;
    report += `> [!NOTE]\n> Full automated audit performed on production environment.\n\n`;
    
    report += `## 📊 Summary\n`;
    report += `- **Target Host:** ${BASE_URL}\n`;
    report += `- **Pages Audited:** ${this.pagesTested}\n`;
    report += `- **Duration:** ${new Date().toLocaleString()}\n\n`;

    report += `## 🚨 Critical Failures\n`;
    const criticals = [...this.results.console_errors, ...this.results.network_errors];
    if (criticals.length === 0) {
        report += `> ✅ No critical console or network errors detected.\n\n`;
    } else {
        report += `| Type | URL | Detail |\n| :--- | :--- | :--- |\n`;
        this.results.console_errors.forEach(e => report += `| Console Error | ${e.url} | \`${e.text}\` |\n`);
        this.results.network_errors.forEach(e => report += `| Network Failure | ${e.url} | ${e.error} on \`${e.requestUrl}\` |\n`);
        report += '\n';
    }

    report += `## ✍️ Grammar & Translation (AI Detected)\n`;
    if (this.results.grammar_errors.length === 0) {
        report += `> ✅ No grammar or translation issues found.\n\n`;
    } else {
        this.results.grammar_errors.forEach(ge => {
            report += `### Page: [${ge.url}](${ge.url})\n`;
            ge.errors.forEach(e => report += `- **${e.type}**: "${e.error}" → **${e.fix}**\n`);
            report += '\n';
        });
    }

    const reportPath = path.join(OUTPUT_DIR, 'qa_report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\nReport generated at: ${reportPath}`);
  }
}

const agent = new QA_Agent();
agent.run().catch(console.error);
