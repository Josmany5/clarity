#!/usr/bin/env node

/**
 * AI JSON Leak Detection Test Suite
 *
 * This test suite systematically tests the AI assistant's JSON handling
 * to identify when and why JSON leaks into chat responses.
 *
 * Usage:
 *   npm run test:ai-leak              # Run all tests
 *   npm run test:ai-leak:verbose      # Run with detailed logging
 *   npm run test:ai-leak:category simple  # Run specific category
 */

const fs = require('fs');
const path = require('path');

// ============= CONFIGURATION =============

const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const CATEGORY_FILTER = process.argv.find(arg => arg.startsWith('--category='))?.split('=')[1];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============= JSON EXTRACTION FUNCTIONS =============
// Copied from AIAssistant.tsx

function extractJSON(text, prefix) {
  const startIndex = text.indexOf(prefix);
  if (startIndex === -1) return null;

  const jsonStart = text.indexOf('{', startIndex);
  if (jsonStart === -1) return null;

  let braceCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = jsonStart; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return text.substring(jsonStart, i + 1);
        }
      }
    }
  }

  return null;
}

function extractJSONArray(text, prefix) {
  const startIndex = text.indexOf(prefix);
  if (startIndex === -1) return null;

  const jsonStart = text.indexOf('[', startIndex);
  if (jsonStart === -1) return null;

  let bracketCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = jsonStart; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '[') bracketCount++;
      if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          return text.substring(jsonStart, i + 1);
        }
      }
    }
  }

  return null;
}

// ============= JSON CLEANING FUNCTIONS =============
// Copied from AIAssistant.tsx

function cleanResponse(response) {
  let displayMessage = response;

  // Extract all JSON blocks
  const tasksJSON = extractJSONArray(displayMessage, 'TASKS_JSON:');
  const eventsJSON = extractJSONArray(displayMessage, 'EVENTS_JSON:');
  const noteMatch = displayMessage.match(/<<<NOTE_START>>>\s*([\s\S]*?)\s*<<<NOTE_END>>>/);
  const updateJSON = extractJSON(displayMessage, 'TASK_UPDATE_JSON:');
  const deleteJSON = extractJSON(displayMessage, 'TASK_DELETE_JSON:');
  const deleteAllJSON = extractJSON(displayMessage, 'TASK_DELETE_ALL_JSON:');
  const deleteCompletedJSON = extractJSON(displayMessage, 'TASK_DELETE_COMPLETED_JSON:');

  // Remove task creation JSON - use exact extracted string
  if (tasksJSON) {
    const taskMarker = 'TASKS_JSON:';
    const startIdx = displayMessage.indexOf(taskMarker);
    if (startIdx !== -1) {
      const endIdx = startIdx + taskMarker.length + tasksJSON.length;
      displayMessage = displayMessage.slice(0, startIdx) + displayMessage.slice(endIdx);
    }
  }

  // Remove note creation block (everything between markers)
  if (noteMatch) {
    displayMessage = displayMessage.replace(/<<<NOTE_START>>>[\s\S]*?<<<NOTE_END>>>\n*/g, '');
  }

  // Remove event creation JSON - use exact extracted string
  if (eventsJSON) {
    const eventMarker = 'EVENTS_JSON:';
    const startIdx = displayMessage.indexOf(eventMarker);
    if (startIdx !== -1) {
      const endIdx = startIdx + eventMarker.length + eventsJSON.length;
      displayMessage = displayMessage.slice(0, startIdx) + displayMessage.slice(endIdx);
    }
  }

  // Remove task update JSON
  if (updateJSON) {
    displayMessage = displayMessage.replace(/TASK_UPDATE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  }

  // Remove task deletion JSON
  if (deleteJSON) {
    displayMessage = displayMessage.replace(/TASK_DELETE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  }

  // Remove bulk deletion JSONs
  if (deleteAllJSON) {
    displayMessage = displayMessage.replace(/TASK_DELETE_ALL_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  }

  if (deleteCompletedJSON) {
    displayMessage = displayMessage.replace(/TASK_DELETE_COMPLETED_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  }

  // Catch-all: Remove any remaining JSON blocks (arrays or objects)
  displayMessage = displayMessage.replace(/```json[\s\S]*?```/g, ''); // Remove JSON code blocks
  displayMessage = displayMessage.replace(/\{[\s]*"[^"]+":[\s\S]*?\}/g, (match) => {
    // Only remove if it looks like a complete JSON object (contains quotes and colons)
    if (match.includes('"') && match.includes(':')) {
      return '';
    }
    return match;
  });

  displayMessage = displayMessage.trim();

  return {
    cleaned: displayMessage,
    extracted: {
      tasks: tasksJSON,
      events: eventsJSON,
      note: noteMatch ? noteMatch[1] : null,
      update: updateJSON,
      delete: deleteJSON,
      deleteAll: deleteAllJSON,
      deleteCompleted: deleteCompletedJSON,
    }
  };
}

// ============= JSON LEAK DETECTION =============

function detectJSONLeak(text) {
  const patterns = [
    // Marker patterns
    { name: 'TASKS_JSON marker', regex: /TASKS_JSON:\s*\[/, severity: 'high' },
    { name: 'EVENTS_JSON marker', regex: /EVENTS_JSON:\s*\[/, severity: 'high' },
    { name: 'NOTE markers', regex: /<<<NOTE_START>>>|<<<NOTE_END>>>/, severity: 'high' },
    { name: 'UPDATE marker', regex: /TASK_UPDATE_JSON:\s*\{/, severity: 'high' },
    { name: 'DELETE marker', regex: /TASK_DELETE_JSON:\s*\{/, severity: 'high' },

    // Structural patterns (more lenient - could be false positives)
    { name: 'JSON object with title', regex: /\{\s*"title"\s*:\s*"[^"]+"\s*,/, severity: 'medium' },
    { name: 'JSON object with content', regex: /\{\s*"content"\s*:\s*"[^"]+"\s*\}/, severity: 'medium' },
    { name: 'Array of objects', regex: /\[\s*\{\s*"[^"]+"\s*:/, severity: 'low' },
  ];

  const matches = [];
  let found = false;
  let highestSeverity = null;

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) {
      matches.push({
        pattern: pattern.name,
        severity: pattern.severity,
        sample: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : '')
      });
      found = true;

      if (!highestSeverity ||
          (pattern.severity === 'high') ||
          (highestSeverity === 'low' && pattern.severity === 'medium')) {
        highestSeverity = pattern.severity;
      }
    }
  }

  return { found, matches, severity: highestSeverity };
}

// ============= TEST RUNNER =============

function runTest(testCase) {
  const startTime = Date.now();

  if (VERBOSE) {
    log(`\n${'='.repeat(80)}`, 'cyan');
    log(`🧪 Test: ${testCase.id} - ${testCase.name}`, 'bright');
    log(`Category: ${testCase.category}`, 'gray');
    log(`${'='.repeat(80)}`, 'cyan');
  }

  const result = {
    testId: testCase.id,
    category: testCase.category,
    name: testCase.name,
    passed: false,
    issues: [],
    performance: {}
  };

  try {
    // 1. Clean the response
    const cleanStart = Date.now();
    const { cleaned, extracted } = cleanResponse(testCase.mockResponse);
    const cleanTime = Date.now() - cleanStart;

    // 2. Detect JSON leak
    const detectStart = Date.now();
    const leakCheck = detectJSONLeak(cleaned);
    const detectTime = Date.now() - detectStart;

    // 3. Log extracted JSON
    if (VERBOSE) {
      log('\n📝 Extracted JSON:', 'blue');
      Object.keys(extracted).forEach(key => {
        if (extracted[key]) {
          log(`  ${key}: ${extracted[key].substring(0, 100)}${extracted[key].length > 100 ? '...' : ''}`, 'gray');
        }
      });
    }

    // 4. Log cleaned message
    if (VERBOSE) {
      log('\n💬 Cleaned Message:', 'green');
      log(cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : ''), 'gray');
    }

    // 5. Check for leak
    if (leakCheck.found) {
      result.issues.push({
        type: 'json_leak',
        severity: leakCheck.severity,
        patterns: leakCheck.matches
      });

      if (VERBOSE) {
        log('\n❌ JSON LEAK DETECTED:', 'red');
        leakCheck.matches.forEach(match => {
          log(`  [${match.severity.toUpperCase()}] ${match.pattern}: ${match.sample}`, 'yellow');
        });
      }
    } else {
      if (VERBOSE) {
        log('\n✅ No JSON leak detected', 'green');
      }
    }

    // 6. Compare with expected
    const expectedDisplay = testCase.expectedDisplay || testCase.mockResponse;
    if (cleaned !== expectedDisplay && !leakCheck.found) {
      // Different but no leak - might be acceptable
      if (VERBOSE) {
        log('\n⚠️  Display differs from expected but no leak detected', 'yellow');
      }
    }

    // 7. Determine pass/fail
    result.passed = !leakCheck.found;
    result.performance = {
      cleaningTime: cleanTime,
      detectionTime: detectTime,
      totalTime: Date.now() - startTime
    };

    result.details = {
      originalLength: testCase.mockResponse.length,
      cleanedLength: cleaned.length,
      removedChars: testCase.mockResponse.length - cleaned.length,
      extractedCount: Object.values(extracted).filter(v => v !== null).length
    };

  } catch (error) {
    result.passed = false;
    result.issues.push({
      type: 'error',
      message: error.message,
      stack: error.stack,
      severity: 'critical'
    });

    if (VERBOSE) {
      log(`\n❌ ERROR: ${error.message}`, 'red');
    }
  }

  return result;
}

// ============= RESULTS ANALYSIS =============

function analyzeResults(results) {
  const summary = {
    totalTests: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => r.passed === false).length,
    categories: {}
  };

  // Group by category
  results.forEach(r => {
    if (!summary.categories[r.category]) {
      summary.categories[r.category] = { total: 0, passed: 0, failed: 0 };
    }
    summary.categories[r.category].total++;
    if (r.passed) {
      summary.categories[r.category].passed++;
    } else {
      summary.categories[r.category].failed++;
    }
  });

  // Find common patterns in failures
  const failedTests = results.filter(r => !r.passed);
  const leakPatterns = {};

  failedTests.forEach(test => {
    test.issues.forEach(issue => {
      if (issue.type === 'json_leak') {
        issue.patterns.forEach(pattern => {
          if (!leakPatterns[pattern.pattern]) {
            leakPatterns[pattern.pattern] = [];
          }
          leakPatterns[pattern.pattern].push(test.testId);
        });
      }
    });
  });

  return {
    summary,
    leakPatterns,
    failedTests: failedTests.map(t => ({
      id: t.testId,
      name: t.name,
      category: t.category,
      issues: t.issues.map(i => i.type + (i.severity ? ` [${i.severity}]` : ''))
    }))
  };
}

function printReport(analysis) {
  log('\n' + '='.repeat(80), 'cyan');
  log('  TEST RESULTS SUMMARY', 'bright');
  log('='.repeat(80), 'cyan');

  const { summary } = analysis;
  const passRate = ((summary.passed / summary.totalTests) * 100).toFixed(1);

  log(`\nTotal Tests: ${summary.totalTests}`, 'bright');
  log(`✅ Passed: ${summary.passed} (${passRate}%)`, summary.passed === summary.totalTests ? 'green' : 'yellow');
  log(`❌ Failed: ${summary.failed}`, summary.failed > 0 ? 'red' : 'gray');

  log('\n📂 By Category:', 'blue');
  Object.keys(summary.categories).forEach(cat => {
    const stats = summary.categories[cat];
    const catPassRate = ((stats.passed / stats.total) * 100).toFixed(1);
    log(`  ${cat}: ${stats.passed}/${stats.total} passed (${catPassRate}%)`,
        stats.failed > 0 ? 'yellow' : 'green');
  });

  if (analysis.failedTests.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    analysis.failedTests.forEach(test => {
      log(`  ${test.id}: ${test.name}`, 'yellow');
      log(`    Issues: ${test.issues.join(', ')}`, 'gray');
    });
  }

  if (Object.keys(analysis.leakPatterns).length > 0) {
    log('\n🔍 Common Leak Patterns:', 'yellow');
    Object.keys(analysis.leakPatterns).forEach(pattern => {
      const tests = analysis.leakPatterns[pattern];
      log(`  ${pattern}: ${tests.length} occurrences`, 'yellow');
      log(`    Tests: ${tests.join(', ')}`, 'gray');
    });
  }

  log('\n' + '='.repeat(80), 'cyan');
}

function saveResults(results, analysis) {
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save detailed results
  fs.writeFileSync(
    path.join(resultsDir, 'latest-run.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), results, analysis }, null, 2)
  );

  // Save summary log
  const logPath = path.join(resultsDir, `test-run-${timestamp}.txt`);
  const logContent = [
    '='.repeat(80),
    `AI JSON Leak Detection Test Run - ${new Date().toLocaleString()}`,
    '='.repeat(80),
    '',
    `Total Tests: ${analysis.summary.totalTests}`,
    `Passed: ${analysis.summary.passed}`,
    `Failed: ${analysis.summary.failed}`,
    '',
    'Failed Tests:',
    ...analysis.failedTests.map(t => `  - ${t.id}: ${t.name} (${t.issues.join(', ')})`),
    '',
    '='.repeat(80)
  ].join('\n');

  fs.writeFileSync(logPath, logContent);

  log(`\n💾 Results saved to:`, 'cyan');
  log(`  ${path.join(resultsDir, 'latest-run.json')}`, 'gray');
  log(`  ${logPath}`, 'gray');
}

// ============= MAIN EXECUTION =============

async function main() {
  log('\n🚀 Starting AI JSON Leak Detection Test Suite\n', 'bright');

  // Load test cases
  const testCasesPath = path.join(__dirname, 'test-cases.json');
  if (!fs.existsSync(testCasesPath)) {
    log('❌ Error: test-cases.json not found!', 'red');
    log(`Expected at: ${testCasesPath}`, 'gray');
    process.exit(1);
  }

  const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));

  // Filter by category if specified
  let casesToRun = testCases;
  if (CATEGORY_FILTER) {
    casesToRun = testCases.filter(tc => tc.category === CATEGORY_FILTER);
    log(`Filtering to category: ${CATEGORY_FILTER} (${casesToRun.length} tests)\n`, 'yellow');
  }

  // Run tests
  const results = [];
  for (const testCase of casesToRun) {
    const result = runTest(testCase);
    results.push(result);

    if (!VERBOSE) {
      process.stdout.write(result.passed ? colors.green + '.' + colors.reset : colors.red + 'F' + colors.reset);
    }
  }

  if (!VERBOSE) console.log('\n');

  // Analyze and report
  const analysis = analyzeResults(results);
  printReport(analysis);
  saveResults(results, analysis);

  // Exit with appropriate code
  process.exit(analysis.summary.failed > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});
