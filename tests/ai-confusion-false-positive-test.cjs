// Advanced AI Confusion & False Positive Detection Test Suite
// Tests scenarios where AI might incorrectly create tasks/events when it shouldn't
// USES REAL AI API - No mock responses

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDGuQmjBzSzrDU7vUdQj5OhDan68NVpCJ4';
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
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  testCount++;
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`Confusion Test ${testCount}: ${name}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

function logPass(message) {
  passCount++;
  log(`✓ PASS: ${message}`, 'green');
}

function logFail(message) {
  failCount++;
  log(`✗ FAIL: ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ WARNING: ${message}`, 'yellow');
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

// Helper: Build system context with data
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
- For task deletion, use: TASK_DELETE_JSON: {"taskTitle": "partial match"}
- ALWAYS write user-facing message FIRST, then JSON on new line
- User should NEVER see raw JSON in the chat interface`;
}

// Detection functions
function detectTaskCreation(response) {
  return response.includes('TASKS_JSON:');
}

function detectEventCreation(response) {
  return response.includes('EVENTS_JSON:');
}

function detectNoteCreation(response) {
  return response.includes('<<<NOTE_START>>>');
}

function detectTaskUpdate(response) {
  return response.includes('TASK_UPDATE_JSON:');
}

function detectTaskDeletion(response) {
  return response.includes('TASK_DELETE_JSON:');
}

function detectAnyAction(response) {
  return detectTaskCreation(response) ||
         detectEventCreation(response) ||
         detectNoteCreation(response) ||
         detectTaskUpdate(response) ||
         detectTaskDeletion(response);
}

// Test 1: Conversational Mention - Not a Command
async function testConversationalMention() {
  logTest('Conversational Mention (Should NOT Create Task)');
  logInfo('Testing: "I was thinking about buying milk later"');

  try {
    const response = await callAI(
      'I was thinking about buying milk later',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskCreation(response)) {
      logFail('FALSE POSITIVE: AI created task for conversational mention');
    } else {
      logPass('AI correctly did NOT create task for conversational mention');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 2: Past Tense - Already Done
async function testPastTense() {
  logTest('Past Tense Statement (Should NOT Create Task)');
  logInfo('Testing: "I bought groceries yesterday"');

  try {
    const response = await callAI(
      'I bought groceries yesterday',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskCreation(response)) {
      logFail('FALSE POSITIVE: AI created task for past tense (already done)');
    } else {
      logPass('AI correctly did NOT create task for past action');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 3: Question About Tasks - Not Update Command
async function testQuestionNotUpdate() {
  logTest('Question About Tasks (Should NOT Trigger Update)');
  logInfo('Testing: "Can I change my task title later?"');

  try {
    const response = await callAI(
      'Can I change my task title later?',
      buildSystemContext({
        tasks: [
          { id: '1', title: 'Review code', completed: false }
        ]
      })
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskUpdate(response)) {
      logFail('FALSE POSITIVE: AI triggered update for question about updating');
    } else {
      logPass('AI correctly answered question without triggering update');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 4: Hypothetical Statement
async function testHypothetical() {
  logTest('Hypothetical Statement (Should NOT Create Event)');
  logInfo('Testing: "If I had a meeting tomorrow, I would be prepared"');

  try {
    const response = await callAI(
      'If I had a meeting tomorrow, I would be prepared',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectEventCreation(response)) {
      logFail('FALSE POSITIVE: AI created event for hypothetical statement');
    } else {
      logPass('AI correctly did NOT create event for hypothetical');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 5: Talking About Tasks in General
async function testGeneralDiscussion() {
  logTest('General Discussion About Tasks (Should NOT Create)');
  logInfo('Testing: "I love organizing tasks and keeping things tidy"');

  try {
    const response = await callAI(
      'I love organizing tasks and keeping things tidy',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectAnyAction(response)) {
      logFail('FALSE POSITIVE: AI took action on general discussion about tasks');
    } else {
      logPass('AI correctly engaged in conversation without taking action');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 6: Ambiguous Context - Multiple Messages
async function testAmbiguousContext() {
  logTest('Ambiguous Multi-Message Context (Should NOT Create)');
  logInfo('Testing ambiguous follow-up: "That sounds good"');

  try {
    // First message - just conversation
    const response1 = await callAI(
      'I might go to the gym tomorrow',
      buildSystemContext()
    );
    logInfo(`Response 1: ${response1.substring(0, 100)}...`);

    await sleep(2000);

    // Second message - ambiguous follow-up
    const contextHistory = `User: I might go to the gym tomorrow\nWove: ${response1}`;
    const response2 = await callAI('That sounds good', contextHistory);
    logInfo(`Response 2: ${response2.substring(0, 100)}...`);

    if (detectAnyAction(response2)) {
      logFail('FALSE POSITIVE: AI took action on ambiguous follow-up');
    } else {
      logPass('AI correctly did NOT take action on ambiguous context');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 7: Asking for Information vs Command
async function testInformationRequest() {
  logTest('Information Request (Should NOT Delete Task)');
  logInfo('Testing: "What happens if I delete my review task?"');

  try {
    const response = await callAI(
      'What happens if I delete my review task?',
      buildSystemContext({
        tasks: [
          { id: '1', title: 'Review code', completed: false }
        ]
      })
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskDeletion(response)) {
      logFail('FALSE POSITIVE: AI deleted task when user asked informational question');
    } else {
      logPass('AI correctly answered question without deleting task');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 8: Negative Statement
async function testNegativeStatement() {
  logTest('Negative Statement (Should NOT Create Task)');
  logInfo('Testing: "I don\'t want to create any tasks right now"');

  try {
    const response = await callAI(
      "I don't want to create any tasks right now",
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskCreation(response)) {
      logFail('FALSE POSITIVE: AI created task despite negative statement');
    } else {
      logPass('AI correctly respected negative statement');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 9: Storytelling/Narrative
async function testStorytelling() {
  logTest('Storytelling Mode (Should NOT Create Tasks)');
  logInfo('Testing: "Yesterday I went to the store, bought some items, then went home"');

  try {
    const response = await callAI(
      'Yesterday I went to the store, bought some items, then went home and cooked dinner',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectAnyAction(response)) {
      logFail('FALSE POSITIVE: AI took action on narrative/story');
    } else {
      logPass('AI correctly identified narrative without taking action');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 10: Expressing Anxiety/Worry
async function testAnxietyExpression() {
  logTest('Expressing Worry (Should NOT Create Tasks)');
  logInfo('Testing: "I\'m worried I have too many things to do"');

  try {
    const response = await callAI(
      "I'm worried I have too many things to do",
      buildSystemContext({
        tasks: [
          { id: '1', title: 'Finish report', completed: false },
          { id: '2', title: 'Call client', completed: false }
        ]
      })
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskCreation(response)) {
      logFail('FALSE POSITIVE: AI created tasks when user expressed anxiety');
    } else {
      logPass('AI correctly empathized without creating tasks');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 11: Conditional Future - Not Commitment
async function testConditionalFuture() {
  logTest('Conditional Future Statement (Should NOT Create Task)');
  logInfo('Testing: "I might need to buy groceries this weekend"');

  try {
    const response = await callAI(
      'I might need to buy groceries this weekend',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskCreation(response)) {
      logFail('FALSE POSITIVE: AI created task for conditional/uncertain statement');
    } else {
      logPass('AI correctly did NOT create task for uncertain future action');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 12: Update Confusion - Vague Reference
async function testVagueUpdateReference() {
  logTest('Vague Update Reference (Should NOT Update Without Clarity)');
  logInfo('Testing: "Can you make it urgent?" without clear task reference');

  try {
    const response = await callAI(
      'Can you make it urgent?',
      buildSystemContext({
        tasks: [
          { id: '1', title: 'Review code', completed: false },
          { id: '2', title: 'Buy groceries', completed: false }
        ]
      })
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskUpdate(response)) {
      logFail('FALSE POSITIVE: AI updated task without clear reference (multiple tasks present)');
    } else {
      logPass('AI correctly asked for clarification instead of guessing');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 13: Delete Confusion - Similar Task Names
async function testDeleteConfusion() {
  logTest('Delete Confusion with Similar Names (Should Ask for Clarification)');
  logInfo('Testing: "Delete the meeting task" when multiple meeting tasks exist');

  try {
    const response = await callAI(
      'Delete the meeting task',
      buildSystemContext({
        tasks: [
          { id: '1', title: 'Team meeting prep', completed: false },
          { id: '2', title: 'Client meeting notes', completed: false },
          { id: '3', title: 'Meeting room booking', completed: false }
        ]
      })
    );

    logInfo(`AI Response: ${response.substring(0, 250)}...`);

    if (detectTaskDeletion(response)) {
      logWarning('AI attempted deletion - check if it asked for clarification first');
      // Extract what it tried to delete
      const deleteMatch = response.match(/TASK_DELETE_JSON:\s*(\{[^}]*\})/);
      if (deleteMatch) {
        logInfo(`Attempted to delete: ${deleteMatch[1]}`);
      }
      logFail('POTENTIAL FALSE POSITIVE: AI should ask for clarification with multiple matches');
    } else {
      logPass('AI correctly asked for clarification instead of guessing');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 14: Rapid Multi-Message Without Clear Intent
async function testRapidMultiMessage() {
  logTest('Rapid Multi-Message Without Clear Intent');
  logInfo('Testing rapid messages that together might look like a command');

  try {
    const response1 = await callAI('I need to', buildSystemContext());
    logInfo(`Response 1: ${response1.substring(0, 100)}...`);

    await sleep(1000);

    const context1 = `User: I need to\nWove: ${response1}`;
    const response2 = await callAI('buy milk', context1);
    logInfo(`Response 2: ${response2.substring(0, 100)}...`);

    await sleep(1000);

    const context2 = `${context1}\nUser: buy milk\nWove: ${response2}`;
    const response3 = await callAI('tomorrow', context2);
    logInfo(`Response 3: ${response3.substring(0, 100)}...`);

    // Check if ANY of the responses created a task prematurely
    const createdPrematurely = detectTaskCreation(response1) || detectTaskCreation(response2);

    if (createdPrematurely) {
      logFail('FALSE POSITIVE: AI jumped the gun and created task before full context');
    } else {
      logPass('AI waited for complete context before taking action');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 15: Question Mark Safety
async function testQuestionMarkSafety() {
  logTest('Question Mark Safety (Questions Should NOT Trigger Actions)');
  logInfo('Testing: "Should I create a task for this?"');

  try {
    const response = await callAI(
      'Should I create a task for buying milk?',
      buildSystemContext()
    );

    logInfo(`AI Response: ${response.substring(0, 200)}...`);

    if (detectTaskCreation(response)) {
      logFail('FALSE POSITIVE: AI created task for question about creating tasks');
    } else {
      logPass('AI correctly answered question without creating task');
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  log('\n' + '🔍 '.repeat(35), 'magenta');
  log('ADVANCED AI CONFUSION & FALSE POSITIVE TEST SUITE', 'magenta');
  log('Testing scenarios where AI might incorrectly take actions', 'magenta');
  log('Using REAL AI API - No Mock Responses', 'magenta');
  log('🔍 '.repeat(35) + '\n', 'magenta');

  const startTime = Date.now();

  try {
    await testConversationalMention();
    await sleep(TEST_DELAY);

    await testPastTense();
    await sleep(TEST_DELAY);

    await testQuestionNotUpdate();
    await sleep(TEST_DELAY);

    await testHypothetical();
    await sleep(TEST_DELAY);

    await testGeneralDiscussion();
    await sleep(TEST_DELAY);

    await testAmbiguousContext();
    await sleep(TEST_DELAY);

    await testInformationRequest();
    await sleep(TEST_DELAY);

    await testNegativeStatement();
    await sleep(TEST_DELAY);

    await testStorytelling();
    await sleep(TEST_DELAY);

    await testAnxietyExpression();
    await sleep(TEST_DELAY);

    await testConditionalFuture();
    await sleep(TEST_DELAY);

    await testVagueUpdateReference();
    await sleep(TEST_DELAY);

    await testDeleteConfusion();
    await sleep(TEST_DELAY);

    await testRapidMultiMessage();
    await sleep(TEST_DELAY);

    await testQuestionMarkSafety();

  } catch (error) {
    log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  // Print summary
  log('\n' + '='.repeat(70), 'cyan');
  log('CONFUSION TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  log(`Total Tests: ${testCount}`, 'blue');
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, 'red');
  log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`, 'yellow');
  log(`Duration: ${duration}s (${(duration / 60).toFixed(1)} minutes)`, 'blue');
  log('='.repeat(70) + '\n', 'cyan');

  // Recommendations
  if (failCount > 0) {
    log('\n⚠️  RECOMMENDATIONS FOR FIXING FALSE POSITIVES:', 'yellow');
    log('1. Improve intent detection in AIInstructions.ts system prompt', 'yellow');
    log('2. Add explicit checks for question marks, past tense, hypotheticals', 'yellow');
    log('3. Require explicit action verbs (create, add, schedule, delete, update)', 'yellow');
    log('4. Add confidence threshold before taking actions', 'yellow');
    log('5. Consider asking for confirmation on ambiguous requests', 'yellow');
  } else {
    log('\n✅ All confusion tests passed!', 'green');
    log('AI correctly identifies when NOT to take actions', 'green');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Start tests
runAllTests();
