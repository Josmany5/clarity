// Comprehensive JSON Leak Test for ALL AI Actions
// Tests EVERY type of action: create, update, delete for tasks, events, notes, goals

const https = require('https');

// Configuration
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDGuQmjBzSzrDU7vUdQj5OhDan68NVpCJ4';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Read AI instructions
const fs = require('fs');
const path = require('path');
const instructionsPath = path.join(__dirname, '../services/AIInstructions.ts');
let systemPromptTemplate = fs.readFileSync(instructionsPath, 'utf-8');

// Extract buildSystemPrompt function
const match = systemPromptTemplate.match(/return `([\s\S]+)`;\s*};/);
if (!match) {
  console.error('❌ Could not extract system prompt from AIInstructions.ts');
  process.exit(1);
}

const promptTemplate = match[1];

function buildSystemPrompt() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[today.getDay()];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowDayName = dayNames[tomorrow.getDay()];

  const getNextDayOfWeek = (dayName) => {
    const targetDay = dayNames.indexOf(dayName);
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) daysUntil += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate.toISOString().split('T')[0];
  };

  const context = {
    currentPage: 'Dashboard',
    taskCount: 0,
    noteCount: 0,
    eventCount: 0,
    goalCount: 0,
    workspaceCount: 0,
    taskListCount: 4,
    projectCount: 0,
    recentActivity: [],
    tasks: [],
    events: [],
    notes: [],
    goals: [],
    projects: []
  };

  let prompt = promptTemplate
    .replace(/\$\{todayStr\}/g, todayStr)
    .replace(/\$\{todayDayName\}/g, todayDayName)
    .replace(/\$\{tomorrowStr\}/g, tomorrowStr)
    .replace(/\$\{tomorrowDayName\}/g, tomorrowDayName)
    .replace(/\$\{getNextDayOfWeek\('Sunday'\)\}/g, getNextDayOfWeek('Sunday'))
    .replace(/\$\{getNextDayOfWeek\('Monday'\)\}/g, getNextDayOfWeek('Monday'))
    .replace(/\$\{context\.currentPage\}/g, context.currentPage)
    .replace(/\$\{context\.taskCount\}/g, context.taskCount)
    .replace(/\$\{context\.noteCount\}/g, context.noteCount)
    .replace(/\$\{context\.eventCount\}/g, context.eventCount)
    .replace(/\$\{context\.goalCount\}/g, context.goalCount)
    .replace(/\$\{context\.projectCount\}/g, context.projectCount)
    .replace(/\$\{context\.workspaceCount\}/g, context.workspaceCount)
    .replace(/\$\{context\.taskListCount\}/g, context.taskListCount)
    .replace(/\$\{context\.recentActivity\.join\(', '\) \|\| 'None yet'\}/g, 'None yet')
    .replace(/\$\{JSON\.stringify\(context\.tasks, null, 2\)\}/g, JSON.stringify(context.tasks, null, 2))
    .replace(/\$\{JSON\.stringify\(context\.events, null, 2\)\}/g, JSON.stringify(context.events, null, 2))
    .replace(/\$\{JSON\.stringify\(context\.notes, null, 2\)\}/g, JSON.stringify(context.notes, null, 2))
    .replace(/\$\{JSON\.stringify\(context\.goals, null, 2\)\}/g, JSON.stringify(context.goals, null, 2))
    .replace(/\$\{JSON\.stringify\(context\.projects, null, 2\)\}/g, JSON.stringify(context.projects, null, 2));

  return prompt;
}

// Send request to Gemini
function sendToGemini(userMessage) {
  return new Promise((resolve, reject) => {
    const systemPrompt = buildSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(`${API_URL}?key=${API_KEY}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.candidates && result.candidates[0]) {
            resolve(result.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('No response from Gemini'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// JSON leak detection patterns
const JSON_PATTERNS = {
  TASKS_JSON: /TASKS_JSON:\s*\[/i,
  TASK_UPDATE_JSON: /TASK_UPDATE_JSON:\s*\{/i,
  TASK_DELETE_JSON: /TASK_DELETE_JSON:\s*\{/i,
  TASK_DELETE_ALL_JSON: /TASK_DELETE_ALL_JSON:\s*\{/i,
  TASK_DELETE_COMPLETED_JSON: /TASK_DELETE_COMPLETED_JSON:\s*\{/i,
  EVENTS_JSON: /EVENTS_JSON:\s*\[/i,
  EVENT_UPDATE_JSON: /EVENT_UPDATE_JSON:\s*\{/i,
  EVENT_DELETE_JSON: /EVENT_DELETE_JSON:\s*\{/i,
  NOTE_START: /<<<NOTE_START>>>/i,
  NOTE_END: /<<<NOTE_END>>>/i,
  GOALS_JSON: /GOALS_JSON:\s*\[/i,
  GOAL_UPDATE_JSON: /GOAL_UPDATE_JSON:\s*\{/i,
  GOAL_DELETE_JSON: /GOAL_DELETE_JSON:\s*\{/i,
  CODE_BLOCK_JSON: /```(?:json)?\s*(?:TASKS_JSON|EVENTS_JSON|GOALS_JSON)/i,
  BACKTICK_JSON: /`(?:TASKS_JSON|EVENTS_JSON|GOALS_JSON)/i
};

function hasJSONLeak(response) {
  const leaks = [];
  for (const [name, pattern] of Object.entries(JSON_PATTERNS)) {
    if (pattern.test(response)) {
      leaks.push(name);
    }
  }
  return leaks;
}

// Test cases covering ALL actions
const testCases = [
  // TASK CREATION
  {
    category: 'Task Creation',
    prompt: 'Create a task to review the quarterly report by Friday',
    shouldHaveJSON: true,
    expectedMarker: 'TASKS_JSON'
  },
  {
    category: 'Task Creation',
    prompt: 'Remind me to call the dentist tomorrow at 2pm',
    shouldHaveJSON: true,
    expectedMarker: 'TASKS_JSON'
  },
  {
    category: 'Task Creation',
    prompt: 'Add urgent task: fix production bug, estimate 2 hours',
    shouldHaveJSON: true,
    expectedMarker: 'TASKS_JSON'
  },

  // TASK UPDATES
  {
    category: 'Task Update',
    prompt: 'Mark the quarterly report task as completed',
    shouldHaveJSON: true,
    expectedMarker: 'TASK_UPDATE_JSON'
  },
  {
    category: 'Task Update',
    prompt: 'Change the deadline for the dentist call to 3pm',
    shouldHaveJSON: true,
    expectedMarker: 'TASK_UPDATE_JSON'
  },

  // TASK DELETION
  {
    category: 'Task Delete',
    prompt: 'Delete the quarterly report task',
    shouldHaveJSON: true,
    expectedMarker: 'TASK_DELETE_JSON'
  },
  {
    category: 'Task Delete',
    prompt: 'Remove all completed tasks',
    shouldHaveJSON: true,
    expectedMarker: 'TASK_DELETE_COMPLETED_JSON'
  },

  // EVENT CREATION
  {
    category: 'Event Creation',
    prompt: 'Schedule a team meeting for Monday at 10am',
    shouldHaveJSON: true,
    expectedMarker: 'EVENTS_JSON'
  },
  {
    category: 'Event Creation',
    prompt: 'I have a dentist appointment next Tuesday at 2pm',
    shouldHaveJSON: true,
    expectedMarker: 'EVENTS_JSON'
  },
  {
    category: 'Event Creation',
    prompt: 'Add yoga class every Monday, Wednesday, Friday at 6pm',
    shouldHaveJSON: true,
    expectedMarker: 'EVENTS_JSON'
  },

  // EVENT UPDATES
  {
    category: 'Event Update',
    prompt: 'Move the team meeting to 11am',
    shouldHaveJSON: true,
    expectedMarker: 'EVENT_UPDATE_JSON'
  },
  {
    category: 'Event Update',
    prompt: 'Change the dentist appointment location to Downtown Clinic',
    shouldHaveJSON: true,
    expectedMarker: 'EVENT_UPDATE_JSON'
  },

  // EVENT DELETION
  {
    category: 'Event Delete',
    prompt: 'Cancel the team meeting',
    shouldHaveJSON: true,
    expectedMarker: 'EVENT_DELETE_JSON'
  },
  {
    category: 'Event Delete',
    prompt: 'Remove the dentist appointment',
    shouldHaveJSON: true,
    expectedMarker: 'EVENT_DELETE_JSON'
  },

  // NOTE CREATION
  {
    category: 'Note Creation',
    prompt: 'Save a note about the new project requirements',
    shouldHaveJSON: true,
    expectedMarker: 'NOTE_START'
  },
  {
    category: 'Note Creation',
    prompt: 'Take notes on the GTD methodology',
    shouldHaveJSON: true,
    expectedMarker: 'NOTE_START'
  },

  // GOAL CREATION
  {
    category: 'Goal Creation',
    prompt: 'Create a goal to learn React by December 31st',
    shouldHaveJSON: true,
    expectedMarker: 'GOALS_JSON'
  },
  {
    category: 'Goal Creation',
    prompt: 'Set a goal: run a marathon next year',
    shouldHaveJSON: true,
    expectedMarker: 'GOALS_JSON'
  },

  // GOAL UPDATES
  {
    category: 'Goal Update',
    prompt: 'Mark the React learning goal as in-progress',
    shouldHaveJSON: true,
    expectedMarker: 'GOAL_UPDATE_JSON'
  },
  {
    category: 'Goal Update',
    prompt: 'Update marathon goal target date to June 2026',
    shouldHaveJSON: true,
    expectedMarker: 'GOAL_UPDATE_JSON'
  },

  // GOAL DELETION
  {
    category: 'Goal Delete',
    prompt: 'Delete the React learning goal',
    shouldHaveJSON: true,
    expectedMarker: 'GOAL_DELETE_JSON'
  },

  // QUESTIONS (should NOT have JSON)
  {
    category: 'Questions',
    prompt: 'What tasks do I have?',
    shouldHaveJSON: false
  },
  {
    category: 'Questions',
    prompt: 'How many events are scheduled?',
    shouldHaveJSON: false
  },
  {
    category: 'Questions',
    prompt: 'What are my goals?',
    shouldHaveJSON: false
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Comprehensive JSON Leak Test for ALL Action Types\n');
  console.log(`Testing ${testCases.length} scenarios\n`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    process.stdout.write(`[${i + 1}/${testCases.length}] ${test.category}: "${test.prompt.substring(0, 50)}..." `);

    try {
      const response = await sendToGemini(test.prompt);
      const leaks = hasJSONLeak(response);

      if (test.shouldHaveJSON) {
        // Should have JSON marker
        if (leaks.length > 0 && leaks.includes(test.expectedMarker)) {
          console.log('✅ PASS');
          passed++;
        } else {
          console.log(`❌ FAIL (expected ${test.expectedMarker}, got: ${leaks.length > 0 ? leaks.join(', ') : 'none'})`);
          failed++;
          failures.push({
            test,
            response: response.substring(0, 200),
            expected: test.expectedMarker,
            actual: leaks
          });
        }
      } else {
        // Should NOT have JSON marker
        if (leaks.length === 0) {
          console.log('✅ PASS');
          passed++;
        } else {
          console.log(`❌ FAIL (leaked JSON: ${leaks.join(', ')})`);
          failed++;
          failures.push({
            test,
            response: response.substring(0, 200),
            expected: 'no JSON',
            actual: leaks
          });
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
      failures.push({
        test,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${testCases.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ FAILURES:');
    console.log('='.repeat(60));
    failures.forEach((f, i) => {
      console.log(`\n${i + 1}. ${f.test.category}: "${f.test.prompt}"`);
      console.log(`   Expected: ${f.expected}`);
      console.log(`   Actual: ${JSON.stringify(f.actual)}`);
      if (f.response) {
        console.log(`   Response snippet: ${f.response}...`);
      }
      if (f.error) {
        console.log(`   Error: ${f.error}`);
      }
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
