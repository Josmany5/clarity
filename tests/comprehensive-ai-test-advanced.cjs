// Advanced Comprehensive AI Test Suite - REAL API Testing
// Tests complex AI scenarios with actual Gemini API calls
// Rate limit: 14 requests per minute

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3001/api/ai';
const RATE_LIMIT_MS = 4300; // 14 requests per minute = 4.3 seconds between requests
const RESULTS_DIR = path.join(__dirname, 'results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Load test cases
const testCases = require('./test-cases-advanced.json');

// Simulated app context for testing
class TestContext {
  constructor(setup = {}) {
    this.tasks = this.generateEntities('task', setup.tasks || 0);
    this.events = this.generateEntities('event', setup.events || 0);
    this.notes = this.generateEntities('note', setup.notes || 0);
    this.goals = this.generateEntities('goal', setup.goals || 0);
  }

  generateEntities(type, count) {
    const entities = [];
    for (let i = 1; i <= count; i++) {
      entities.push({
        id: `${type}-${i}`,
        title: `Test ${type} ${i}`,
        ...(type === 'task' && { completed: i % 3 === 0, urgent: i % 4 === 0, important: i % 5 === 0 }),
        ...(type === 'event' && { startDate: '2025-11-10', startTime: '10:00' }),
        ...(type === 'note' && { content: `Content for note ${i}`, lastModified: Date.now() }),
        ...(type === 'goal' && { description: `Goal ${i} description`, status: 'not-started' })
      });
    }
    return entities;
  }

  getContextString() {
    return JSON.stringify({
      tasks: this.tasks,
      events: this.events,
      notes: this.notes,
      goals: this.goals
    });
  }
}

// AI Service helpers (matching AIService.ts)
function buildSystemPrompt(context) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return `You are Prose, an AI productivity coach in Prose.

Current context:
- User is on: Dashboard page
- ${context.taskCount} tasks
- ${context.eventCount} events
- ${context.noteCount} notes
- ${context.goalCount} goals
- Today: ${todayStr}

You can create/update/delete entities using JSON commands that are invisible to users.

**CREATING TASKS** (for to-dos, reminders, deadlines):
Use TASKS_JSON when users say "task", "to-do", "remind me", "need to".
Tasks can have dueDate AND dueTime - this is the DEADLINE, not a calendar event.

TASKS_JSON: [
  {
    "title": "Task title",
    "dueDate": "2025-11-15" (optional),
    "dueTime": "15:00" (optional, HH:MM 24-hour),
    "urgent": true/false,
    "important": true/false
  }
]

**CREATING EVENTS** (for calendar items: meetings, appointments, classes):
Use EVENTS_JSON when users say "schedule", "meeting", "appointment", "class".

EVENTS_JSON: [
  {
    "title": "Event name",
    "type": "meeting" or "appointment" or "class" or "other",
    "startDate": "2025-11-15",
    "startTime": "14:00",
    "endTime": "15:00" (optional),
    "location": "Place" (optional)
  }
]

**KEY DISTINCTION**:
- "Remind me to call John at 3pm" → TASK (deadline to complete by 3pm)
- "Schedule meeting with John at 3pm" → EVENT (calendar appointment at 3pm)

**UPDATING/DELETING**:
TASK_UPDATE_JSON: { "taskTitle": "partial match", "updates": {...} }
TASK_DELETE_JSON: { "taskTitle": "partial match" }
EVENT_UPDATE_JSON: { "eventTitle": "partial match", "updates": {...} }
EVENT_DELETE_JSON: { "eventTitle": "partial match" }

**IMPORTANT**: Write JSON commands directly in your response. The user will NEVER see the JSON - it's automatically extracted and removed.`;
}

async function callRealAI(userPrompt, context) {
  const systemPrompt = buildSystemPrompt({
    taskCount: context.tasks.length,
    eventCount: context.events.length,
    noteCount: context.notes.length,
    goalCount: context.goals.length
  });

  const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      data: { message: fullPrompt }
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

// JSON extraction (matching AIAssistant.tsx)
function extractJSONArray(text, prefix) {
  const cleanText = text.replace(/```(?:json|tool_code)?\n?/g, '').replace(/```/g, '');
  const startIndex = cleanText.indexOf(prefix);
  if (startIndex === -1) return null;

  const jsonStart = cleanText.indexOf('[', startIndex);
  if (jsonStart === -1) return null;

  let bracketCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = jsonStart; i < cleanText.length; i++) {
    const char = cleanText[i];
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
          return cleanText.substring(jsonStart, i + 1);
        }
      }
    }
  }
  return null;
}

function extractJSON(text, prefix) {
  const cleanText = text.replace(/```(?:json|tool_code)?\n?/g, '').replace(/```/g, '');
  const startIndex = cleanText.indexOf(prefix);
  if (startIndex === -1) return null;

  const jsonStart = cleanText.indexOf('{', startIndex);
  if (jsonStart === -1) return null;

  let braceCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = jsonStart; i < cleanText.length; i++) {
    const char = cleanText[i];
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

// Clean JSON from message (matching AIAssistant.tsx)
function cleanJSONFromMessage(response, extracted) {
  let clean = response;

  // Remove extracted JSON blocks
  if (extracted.tasks) {
    const marker = 'TASKS_JSON:';
    const startIdx = clean.indexOf(marker);
    if (startIdx !== -1) {
      const endIdx = startIdx + marker.length + extracted.tasks.length;
      clean = clean.slice(0, startIdx) + clean.slice(endIdx);
    }
  }

  if (extracted.events) {
    const marker = 'EVENTS_JSON:';
    const startIdx = clean.indexOf(marker);
    if (startIdx !== -1) {
      const endIdx = startIdx + marker.length + extracted.events.length;
      clean = clean.slice(0, startIdx) + clean.slice(endIdx);
    }
  }

  // Remove markers and leftover JSON
  clean = clean.replace(/TASK_UPDATE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  clean = clean.replace(/TASK_DELETE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  clean = clean.replace(/EVENT_UPDATE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  clean = clean.replace(/EVENT_DELETE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
  clean = clean.replace(/^\s*\]\s*$/gm, '');
  clean = clean.replace(/\btool_code\b/g, '');

  return clean.trim();
}

// JSON leak detection
function detectJSONLeak(cleanedMessage) {
  const leaks = [];

  // High severity: JSON markers
  const markers = ['TASKS_JSON:', 'EVENTS_JSON:', 'TASK_UPDATE_JSON:', 'EVENT_UPDATE_JSON:',
                   'TASK_DELETE_JSON:', 'EVENT_DELETE_JSON:', '<<<NOTE_START>>>', '<<<NOTE_END>>>'];
  for (const marker of markers) {
    if (cleanedMessage.includes(marker)) {
      leaks.push({ severity: 'high', type: 'marker', content: marker });
    }
  }

  // Medium severity: JSON-like patterns with known fields
  const jsonPatterns = [
    /"title"\s*:/,
    /"dueDate"\s*:/,
    /"startTime"\s*:/,
    /"urgent"\s*:/,
    /"completed"\s*:/
  ];
  for (const pattern of jsonPatterns) {
    if (pattern.test(cleanedMessage)) {
      leaks.push({ severity: 'medium', type: 'json_pattern', pattern: pattern.toString() });
    }
  }

  // Low severity: Stray brackets/braces
  const strayBrackets = cleanedMessage.match(/^\s*[\{\[\]\}]\s*$/gm);
  if (strayBrackets) {
    leaks.push({ severity: 'low', type: 'stray_brackets', content: strayBrackets });
  }

  return leaks;
}

// Main test runner
async function runTest(testCase, testNumber, totalTests) {
  const startTime = Date.now();
  console.log(`\n[${testNumber}/${totalTests}] Running ${testCase.id}: ${testCase.name}`);

  const context = new TestContext(testCase.setup || {});

  try {
    // Call real AI
    const aiCallStart = Date.now();
    const rawResponse = await callRealAI(testCase.userPrompt, context);
    const aiCallTime = Date.now() - aiCallStart;

    // Extract JSON
    const extractionStart = Date.now();
    const extracted = {
      tasks: extractJSONArray(rawResponse, 'TASKS_JSON:'),
      events: extractJSONArray(rawResponse, 'EVENTS_JSON:'),
      taskUpdate: extractJSON(rawResponse, 'TASK_UPDATE_JSON:'),
      eventUpdate: extractJSON(rawResponse, 'EVENT_UPDATE_JSON:'),
      taskDelete: extractJSON(rawResponse, 'TASK_DELETE_JSON:'),
      eventDelete: extractJSON(rawResponse, 'EVENT_DELETE_JSON:')
    };
    const extractionTime = Date.now() - extractionStart;

    // Clean message
    const cleanStart = Date.now();
    const cleanedMessage = cleanJSONFromMessage(rawResponse, extracted);
    const cleanTime = Date.now() - cleanStart;

    // Detect leaks
    const leaks = detectJSONLeak(cleanedMessage);

    // Analyze results
    const issues = [];

    // Check for JSON leaks
    if (leaks.length > 0) {
      issues.push({
        type: 'json_leak',
        severity: leaks[0].severity,
        details: leaks
      });
    }

    // Check entity type (task vs event)
    if (testCase.expectedEntityType) {
      const createdType = extracted.tasks ? 'task' : extracted.events ? 'event' : 'unknown';
      if (createdType !== testCase.expectedEntityType) {
        issues.push({
          type: 'wrong_entity_type',
          expected: testCase.expectedEntityType,
          actual: createdType
        });
      }
    }

    const passed = issues.length === 0;
    const totalTime = Date.now() - startTime;

    console.log(passed ? '✅ PASS' : '❌ FAIL');
    if (!passed) {
      console.log('Issues:', issues.map(i => i.type).join(', '));
    }

    return {
      id: testCase.id,
      name: testCase.name,
      category: testCase.category,
      passed,
      issues,
      rawResponse,
      extracted,
      cleanedMessage,
      leaks,
      timing: {
        aiCall: aiCallTime,
        extraction: extractionTime,
        cleaning: cleanTime,
        total: totalTime
      }
    };

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return {
      id: testCase.id,
      name: testCase.name,
      category: testCase.category,
      passed: false,
      error: error.message,
      timing: {
        total: Date.now() - startTime
      }
    };
  }
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  console.log('🚀 Starting Advanced Comprehensive AI Test Suite');
  console.log(`📡 Using REAL AI API calls (${testCases.length} tests)`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_MS}ms between requests (14 req/min)`);
  console.log(`⌛ Estimated time: ~${Math.ceil(testCases.length * RATE_LIMIT_MS / 1000 / 60)} minutes\n`);

  const results = [];
  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const result = await runTest(testCases[i], i + 1, testCases.length);
    results.push(result);

    if (result.passed) passCount++;
    else failCount++;

    // Rate limiting (skip on last test)
    if (i < testCases.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(80));
  console.log('  ADVANCED TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nTotal Tests: ${testCases.length}`);
  console.log(`✅ Passed: ${passCount} (${((passCount / testCases.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failCount}\n`);

  // Group by category
  const byCategory = {};
  results.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { passed: 0, failed: 0, total: 0 };
    }
    byCategory[r.category].total++;
    if (r.passed) byCategory[r.category].passed++;
    else byCategory[r.category].failed++;
  });

  console.log('📊 By Category:');
  Object.keys(byCategory).forEach(cat => {
    const stats = byCategory[cat];
    console.log(`  ${cat}: ${stats.passed}/${stats.total} passed (${((stats.passed/stats.total)*100).toFixed(1)}%)`);
  });

  // Failed tests detail
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.log(`\n❌ Failed Tests (${failed.length}):`);
    failed.forEach(r => {
      console.log(`  ${r.id}: ${r.name}`);
      if (r.issues) {
        r.issues.forEach(issue => {
          console.log(`    - ${issue.type}: ${JSON.stringify(issue).substring(0, 100)}...`);
        });
      }
      if (r.error) {
        console.log(`    - Error: ${r.error}`);
      }
    });
  }

  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(RESULTS_DIR, `advanced-test-${timestamp}.json`);

  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: testCases.length,
      passed: passCount,
      failed: failCount,
      byCategory
    },
    results
  }, null, 2));

  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);

  // Exit code
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
