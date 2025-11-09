// Comprehensive AI Testing Suite
// Tests AI functionality with 6-second delays between tests

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDas5BCVhqm_aAw3-w_QHLPTIa3-MVZfA8';
const API_URL = 'http://localhost:3001/api/ai';
const TEST_DELAY = 6000; // 6 seconds between tests

// Test counter
let testCount = 0;
let passCount = 0;
let failCount = 0;

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  testCount++;
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Test ${testCount}: ${name}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function logPass(message) {
  passCount++;
  log(`✓ PASS: ${message}`, 'green');
}

function logFail(message) {
  failCount++;
  log(`✗ FAIL: ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callAI(message, context = '') {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      data: { message, context }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

// Test 1: Conversation Context Retention
async function testConversationContext() {
  logTest('Conversation Context Retention');

  try {
    // First message
    const response1 = await callAI('My name is Alex and I love pizza');
    logInfo(`AI Response 1: ${response1.substring(0, 100)}...`);

    await sleep(TEST_DELAY);

    // Second message - should remember name
    const contextHistory = `User: My name is Alex and I love pizza\nWove: ${response1}`;
    const response2 = await callAI('What is my name?', contextHistory);
    logInfo(`AI Response 2: ${response2}`);

    if (response2.toLowerCase().includes('alex')) {
      logPass('AI remembered user name from previous message');
    } else {
      logFail(`AI did not remember name. Response: ${response2}`);
    }

    await sleep(TEST_DELAY);

    // Third message - should remember favorite food
    const contextHistory2 = `${contextHistory}\nUser: What is my name?\nWove: ${response2}`;
    const response3 = await callAI('What food do I like?', contextHistory2);
    logInfo(`AI Response 3: ${response3}`);

    if (response3.toLowerCase().includes('pizza')) {
      logPass('AI remembered user food preference');
    } else {
      logFail(`AI did not remember food. Response: ${response3}`);
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 2: Task Creation with All Parameters
async function testTaskCreation() {
  logTest('Task Creation with Urgent, Important, Due Dates, Times');

  try {
    const response = await callAI(
      'Create an urgent and important task: Review quarterly reports. Due Friday at 3pm. Should take 2 hours.',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response}`);

    // Check for TASKS_JSON marker
    if (response.includes('TASKS_JSON:')) {
      logPass('AI used TASKS_JSON format');

      // Extract JSON
      const jsonMatch = response.match(/TASKS_JSON:\s*(\[[\s\S]*?\])/);
      if (jsonMatch) {
        const tasks = JSON.parse(jsonMatch[1]);
        const task = tasks[0];

        logInfo(`Extracted task: ${JSON.stringify(task, null, 2)}`);

        // Validate fields
        if (task.urgent === true) logPass('Task marked urgent');
        else logFail('Task not marked urgent');

        if (task.important === true) logPass('Task marked important');
        else logFail('Task not marked important');

        if (task.dueDate) logPass(`Due date set: ${task.dueDate}`);
        else logFail('No due date set');

        if (task.dueTime === '15:00') logPass(`Due time correct: ${task.dueTime}`);
        else logFail(`Due time incorrect: ${task.dueTime}`);

        if (task.estimatedTime === 120) logPass(`Estimated time correct: ${task.estimatedTime}min`);
        else logFail(`Estimated time incorrect: ${task.estimatedTime}`);

      } else {
        logFail('Could not extract JSON from response');
      }
    } else {
      logFail('AI did not use TASKS_JSON format');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 3: Event Creation
async function testEventCreation() {
  logTest('Event Creation (Appointments, Meetings, Recurring)');

  try {
    const response = await callAI(
      'Schedule my dentist appointment for next Monday at 2pm',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response}`);

    if (response.includes('EVENTS_JSON:')) {
      logPass('AI used EVENTS_JSON format');

      const jsonMatch = response.match(/EVENTS_JSON:\s*(\[[\s\S]*?\])/);
      if (jsonMatch) {
        const events = JSON.parse(jsonMatch[1]);
        const event = events[0];

        logInfo(`Extracted event: ${JSON.stringify(event, null, 2)}`);

        if (event.type === 'appointment') logPass(`Type correct: ${event.type}`);
        else logFail(`Type incorrect: ${event.type}`);

        if (event.startTime === '14:00') logPass(`Start time correct: ${event.startTime}`);
        else logFail(`Start time incorrect: ${event.startTime}`);

      }
    } else {
      logFail('AI did not use EVENTS_JSON format');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 4: Note Creation
async function testNoteCreation() {
  logTest('Note Creation');

  try {
    const response = await callAI(
      'Create a note about photosynthesis with detailed explanation',
      buildSystemContext()
    );

    logInfo(`AI Response length: ${response.length} chars`);

    if (response.includes('<<<NOTE_START>>>') && response.includes('<<<NOTE_END>>>')) {
      logPass('AI used note markers');

      const noteMatch = response.match(/<<<NOTE_START>>>([\s\S]*?)<<<NOTE_END>>>/);
      if (noteMatch) {
        const noteJSON = JSON.parse(noteMatch[1].trim());

        if (noteJSON.title) logPass(`Note has title: ${noteJSON.title}`);
        else logFail('Note missing title');

        if (noteJSON.content && noteJSON.content.length > 500) {
          logPass(`Note has substantial content: ${noteJSON.content.length} chars`);
        } else {
          logFail(`Note content too short: ${noteJSON.content?.length || 0} chars`);
        }
      }
    } else {
      logFail('AI did not use note markers');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 5: Data Queries
async function testDataQueries() {
  logTest('AI Data Queries (What\'s on calendar, what tasks are due)');

  try {
    const mockContext = buildSystemContext({
      tasks: [
        { id: '1', title: 'Review PR', completed: false, urgent: true, dueDate: '2025-11-10' },
        { id: '2', title: 'Buy groceries', completed: false, dueDate: '2025-11-09' },
        { id: '3', title: 'Finish report', completed: false, important: true, dueDate: '2025-11-11' }
      ],
      events: [
        { id: '1', title: 'Team Meeting', startDate: '2025-11-09', startTime: '10:00', type: 'meeting' },
        { id: '2', title: 'Dentist', startDate: '2025-11-10', startTime: '14:00', type: 'appointment' }
      ]
    });

    const response = await callAI(
      'What tasks are due today and tomorrow?',
      mockContext
    );

    logInfo(`AI Response: ${response}`);

    // Check if AI mentions the tasks
    const mentionsReviewPR = response.toLowerCase().includes('review');
    const mentionsGroceries = response.toLowerCase().includes('groceries') || response.toLowerCase().includes('buy');

    if (mentionsReviewPR || mentionsGroceries) {
      logPass('AI successfully queried and reported tasks');
    } else {
      logFail('AI did not mention any tasks from the data');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 6: Task Updates
async function testTaskUpdates() {
  logTest('Task Updates and Deletions');

  try {
    const response = await callAI(
      'Mark "Review PR" as completed',
      buildSystemContext({
        tasks: [
          { id: '1', title: 'Review PR', completed: false, urgent: true }
        ]
      })
    );

    logInfo(`AI Response: ${response}`);

    if (response.includes('TASK_UPDATE_JSON:')) {
      logPass('AI used TASK_UPDATE_JSON format');

      const jsonMatch = response.match(/TASK_UPDATE_JSON:\s*(\{[\s\S]*?\})/);
      if (jsonMatch) {
        const update = JSON.parse(jsonMatch[1]);

        if (update.taskTitle && update.taskTitle.toLowerCase().includes('review')) {
          logPass(`Correct task targeted: ${update.taskTitle}`);
        }

        if (update.updates && update.updates.completed === true) {
          logPass('Correct update: completed = true');
        }
      }
    } else {
      logFail('AI did not use TASK_UPDATE_JSON format');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 7: JSON Leak Detection
async function testJSONLeakPrevention() {
  logTest('JSON Leak Prevention - User Should Not See JSON');

  try {
    const response = await callAI(
      'Create a task: Buy milk tomorrow at 10am',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response}`);

    // Check if JSON appears before user-facing message
    const tasksJSONIndex = response.indexOf('TASKS_JSON:');
    const userMessageMatch = response.match(/I['']ve created/i) || response.match(/I created/i) || response.match(/created.*task/i);

    if (tasksJSONIndex !== -1 && userMessageMatch) {
      const userMessageIndex = userMessageMatch.index;

      if (userMessageIndex < tasksJSONIndex) {
        logPass('User-facing message appears BEFORE JSON (correct order)');
      } else {
        logFail('JSON appears BEFORE user message (wrong - user will see JSON first)');
      }
    } else if (tasksJSONIndex === -1) {
      logFail('No TASKS_JSON found in response');
    } else {
      logInfo('No clear user-facing message found, checking format...');

      // At minimum, JSON should be on separate line
      const jsonLine = response.split('\n').find(line => line.includes('TASKS_JSON:'));
      if (jsonLine && jsonLine.trim().startsWith('TASKS_JSON:')) {
        logPass('JSON on separate line (minimally acceptable)');
      } else {
        logFail('JSON mixed with user text');
      }
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 8: Immediate Context Awareness
async function testImmediateContext() {
  logTest('Immediate Context Awareness - Last Message Reference');

  try {
    const contextHistory = `User: I just finished a big project
Wove: That's great! Congratulations on completing your project.
User: I'm feeling really tired now
Wove: It's understandable to feel tired after completing a big project. Make sure to rest!`;

    const response = await callAI(
      'Should I take a break?',
      contextHistory
    );

    logInfo(`AI Response: ${response}`);

    // Check if AI acknowledges being tired / recent project completion
    const acknowledgesTired = response.toLowerCase().includes('tired') ||
                             response.toLowerCase().includes('rest') ||
                             response.toLowerCase().includes('break') ||
                             response.toLowerCase().includes('recover');

    if (acknowledgesTired) {
      logPass('AI aware of immediate context (tiredness from last message)');
    } else {
      logFail(`AI did not acknowledge immediate context. Response: ${response}`);
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Helper: Build system context
function buildSystemContext(data = {}) {
  const today = new Date().toISOString().split('T')[0];

  return `You are Wove, an AI assistant integrated into Prose - a productivity dashboard.

Today's date: ${today}

USER DATA:
- Tasks: ${JSON.stringify(data.tasks || [])}
- Events: ${JSON.stringify(data.events || [])}
- Notes: ${JSON.stringify(data.notes || [])}

INSTRUCTIONS:
- For task creation, use: TASKS_JSON: [{"title": "...", "urgent": true/false, "important": true/false, "dueDate": "YYYY-MM-DD", "dueTime": "HH:MM", "estimatedTime": minutes}]
- For event creation, use: EVENTS_JSON: [{"title": "...", "type": "appointment/meeting/class/other", "startDate": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM"}]
- For note creation, use: <<<NOTE_START>>>{"title": "...", "content": "..."}<<<NOTE_END>>>
- For task updates, use: TASK_UPDATE_JSON: {"taskTitle": "partial match", "updates": {"completed": true/false}}
- ALWAYS write user-facing message FIRST, then JSON on new line
- User should NEVER see raw JSON in the chat interface`;
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Comprehensive AI Test Suite', 'yellow');
  log(`⏱️  Test Delay: ${TEST_DELAY / 1000} seconds between tests\n`, 'yellow');

  await testConversationContext();
  await sleep(TEST_DELAY);

  await testTaskCreation();
  await sleep(TEST_DELAY);

  await testEventCreation();
  await sleep(TEST_DELAY);

  await testNoteCreation();
  await sleep(TEST_DELAY);

  await testDataQueries();
  await sleep(TEST_DELAY);

  await testTaskUpdates();
  await sleep(TEST_DELAY);

  await testJSONLeakPrevention();
  await sleep(TEST_DELAY);

  await testImmediateContext();

  // Final Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests Run: ${testCount}`, 'blue');
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, 'red');
  log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`, 'yellow');
  log('='.repeat(60) + '\n', 'cyan');
}

// Run tests
runAllTests().catch(console.error);
