// Context and Content Data Accuracy Test Suite
// Tests whether the AI correctly reads from actual user data vs hallucinating
// This addresses the issue where asking "what are my goals?" returns "plan a trip to Japan"
// even though that goal doesn't exist in the user's actual data

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
  log(`Context Test ${testCount}: ${name}`, 'cyan');
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

// Helper: Build system context with actual user data
function buildContext(userData = {}) {
  const today = new Date().toISOString().split('T')[0];

  return `You are Wove, an AI assistant integrated into Prose - a productivity dashboard.

Today's date: ${today}

USER DATA:
- Goals: ${JSON.stringify(userData.goals || [])}
- Tasks: ${JSON.stringify(userData.tasks || [])}
- Events: ${JSON.stringify(userData.events || [])}
- Notes: ${JSON.stringify(userData.notes || [])}

INSTRUCTIONS:
- When user asks about their data (goals, tasks, events, notes), ONLY read from the USER DATA section above
- NEVER hallucinate or invent example data
- If a data array is empty [], tell the user they have no items in that category
- Report actual titles, dates, and details from the data provided
- Do not use training data examples like "plan a trip to Japan" - only use actual user data`;
}

// Test 1: Empty Goals Array - Should Report "No Goals"
async function testEmptyGoalsArray() {
  logTest('Empty Goals Array - No Hallucination');
  logInfo('Testing if AI reports "no goals" when goals array is empty');

  try {
    const context = buildContext({ goals: [] });
    const response = await callAI('What are my goals?', context);

    logInfo(`Context provided: goals = []`);
    logInfo(`AI Response: ${response}`);

    // Check that AI doesn't hallucinate example goals
    const hallucinatedExamples = [
      'japan',
      'trip',
      'travel',
      'vacation',
      'exercise',
      'fitness',
      'learn',
      'read',
      'save money',
      'project'
    ];

    let foundHallucination = false;
    const responseLower = response.toLowerCase();

    for (const example of hallucinatedExamples) {
      if (responseLower.includes(example) && !responseLower.includes('no goals')) {
        foundHallucination = true;
        logFail(`AI hallucinated goal example: "${example}"`);
        break;
      }
    }

    if (!foundHallucination) {
      if (responseLower.includes('no goals') || responseLower.includes("don't have any goals") || responseLower.includes("haven't set any goals")) {
        logPass('AI correctly reported no goals without hallucinating');
      } else {
        logWarning(`AI response unclear about empty goals: ${response}`);
      }
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 2: Actual Goals - Should Report Exact Titles
async function testActualGoalsReading() {
  logTest('Actual Goals Reading - Exact Titles');
  logInfo('Testing if AI reads and reports actual goal titles from context');

  try {
    const actualGoals = [
      { id: '1', title: 'Launch SaaS product by Q2', category: 'business', deadline: '2025-06-30' },
      { id: '2', title: 'Reduce technical debt', category: 'development', deadline: '2025-12-31' }
    ];

    const context = buildContext({ goals: actualGoals });
    const response = await callAI('What are my goals?', context);

    logInfo(`Context provided: ${JSON.stringify(actualGoals, null, 2)}`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    // Check that AI mentions the actual goals
    const mentionsLaunchSaaS = responseLower.includes('launch') && responseLower.includes('saas');
    const mentionsTechDebt = responseLower.includes('technical debt') || responseLower.includes('reduce');

    if (mentionsLaunchSaaS && mentionsTechDebt) {
      logPass('AI correctly reported both actual goals');
    } else if (mentionsLaunchSaaS || mentionsTechDebt) {
      logWarning('AI reported only one of the two goals');
    } else {
      logFail('AI did not report any of the actual goals');
    }

    // Check that AI doesn't hallucinate other goals
    if (responseLower.includes('japan') || responseLower.includes('trip')) {
      logFail('AI hallucinated "trip to Japan" despite actual goals provided');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 3: Empty Tasks Array - Should Report "No Tasks"
async function testEmptyTasksArray() {
  logTest('Empty Tasks Array - No Hallucination');
  logInfo('Testing if AI reports "no tasks" when tasks array is empty');

  try {
    const context = buildContext({ tasks: [] });
    const response = await callAI('What tasks do I have?', context);

    logInfo(`Context provided: tasks = []`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    if (responseLower.includes('no tasks') || responseLower.includes("don't have any tasks") || responseLower.includes("haven't added any tasks")) {
      logPass('AI correctly reported no tasks');
    } else {
      // Check if AI hallucinated example tasks
      const exampleTasks = ['buy milk', 'groceries', 'meeting', 'review', 'call'];
      let foundHallucination = false;

      for (const task of exampleTasks) {
        if (responseLower.includes(task)) {
          foundHallucination = true;
          logFail(`AI hallucinated task: "${task}"`);
          break;
        }
      }

      if (!foundHallucination) {
        logWarning(`AI response unclear about empty tasks: ${response}`);
      }
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 4: Actual Tasks - Should Report Exact Titles
async function testActualTasksReading() {
  logTest('Actual Tasks Reading - Exact Titles');
  logInfo('Testing if AI reads and reports actual task titles from context');

  try {
    const actualTasks = [
      { id: '1', title: 'Fix authentication bug', completed: false, urgent: true, dueDate: '2025-11-10' },
      { id: '2', title: 'Update API documentation', completed: false, important: true, dueDate: '2025-11-12' },
      { id: '3', title: 'Code review for PR #42', completed: true, dueDate: '2025-11-08' }
    ];

    const context = buildContext({ tasks: actualTasks });
    const response = await callAI('What tasks do I have pending?', context);

    logInfo(`Context provided: ${actualTasks.length} tasks`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    // Check that AI mentions the actual pending tasks (not completed)
    const mentionsAuthBug = responseLower.includes('authentication') || responseLower.includes('auth bug');
    const mentionsApiDocs = responseLower.includes('api documentation') || responseLower.includes('update') && responseLower.includes('documentation');

    // Should NOT mention completed task
    const mentionsCompletedTask = responseLower.includes('code review') && responseLower.includes('pr');

    if (mentionsAuthBug && mentionsApiDocs) {
      logPass('AI correctly reported both pending tasks');
    } else if (mentionsAuthBug || mentionsApiDocs) {
      logWarning('AI reported only one of the two pending tasks');
    } else {
      logFail('AI did not report any of the actual pending tasks');
    }

    if (mentionsCompletedTask) {
      logWarning('AI mentioned completed task when asked for pending tasks');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 5: Empty Events Array - Should Report "No Events"
async function testEmptyEventsArray() {
  logTest('Empty Events Array - No Hallucination');
  logInfo('Testing if AI reports "no events" when events array is empty');

  try {
    const context = buildContext({ events: [] });
    const response = await callAI('What\'s on my calendar?', context);

    logInfo(`Context provided: events = []`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    if (responseLower.includes('no events') || responseLower.includes("nothing on") || responseLower.includes("calendar is empty") || responseLower.includes("don't have any events")) {
      logPass('AI correctly reported no events');
    } else {
      // Check if AI hallucinated example events
      const exampleEvents = ['meeting', 'dentist', 'appointment', 'lunch', 'call'];
      let foundHallucination = false;

      for (const event of exampleEvents) {
        if (responseLower.includes(event)) {
          foundHallucination = true;
          logFail(`AI hallucinated event: "${event}"`);
          break;
        }
      }

      if (!foundHallucination) {
        logWarning(`AI response unclear about empty events: ${response}`);
      }
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 6: Actual Events - Should Report Exact Titles
async function testActualEventsReading() {
  logTest('Actual Events Reading - Exact Titles');
  logInfo('Testing if AI reads and reports actual event titles from context');

  try {
    const actualEvents = [
      { id: '1', title: 'Sprint Planning', type: 'meeting', startDate: '2025-11-10', startTime: '10:00', endTime: '11:00' },
      { id: '2', title: 'Quarterly Review with CEO', type: 'meeting', startDate: '2025-11-11', startTime: '14:00', endTime: '15:30' }
    ];

    const context = buildContext({ events: actualEvents });
    const response = await callAI('What meetings do I have coming up?', context);

    logInfo(`Context provided: ${actualEvents.length} events`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    const mentionsSprint = responseLower.includes('sprint') || responseLower.includes('planning');
    const mentionsReview = responseLower.includes('quarterly') || responseLower.includes('ceo');

    if (mentionsSprint && mentionsReview) {
      logPass('AI correctly reported both actual events');
    } else if (mentionsSprint || mentionsReview) {
      logWarning('AI reported only one of the two events');
    } else {
      logFail('AI did not report any of the actual events');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 7: Mixed Empty and Full Data - Context Separation
async function testMixedContextSeparation() {
  logTest('Mixed Context - Some Empty, Some Full');
  logInfo('Testing if AI correctly distinguishes between empty and full data arrays');

  try {
    const context = buildContext({
      goals: [{ id: '1', title: 'Achieve product-market fit', category: 'business' }],
      tasks: [], // Empty
      events: [{ id: '1', title: 'Investor call', type: 'meeting', startDate: '2025-11-12', startTime: '09:00' }],
      notes: [] // Empty
    });

    const response = await callAI('Give me a summary of my goals, tasks, events, and notes', context);

    logInfo(`Context: 1 goal, 0 tasks, 1 event, 0 notes`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    // Should mention the existing goal
    const mentionsGoal = responseLower.includes('product-market fit') || responseLower.includes('achieve');

    // Should report no tasks
    const reportsNoTasks = responseLower.includes('no tasks') || responseLower.includes("don't have any tasks");

    // Should mention the existing event
    const mentionsEvent = responseLower.includes('investor') || responseLower.includes('call');

    // Should report no notes
    const reportsNoNotes = responseLower.includes('no notes') || responseLower.includes("don't have any notes");

    if (mentionsGoal && reportsNoTasks && mentionsEvent && reportsNoNotes) {
      logPass('AI correctly distinguished between empty and full arrays');
    } else {
      if (!mentionsGoal) logWarning('AI missed existing goal');
      if (!reportsNoTasks) logWarning('AI did not report empty tasks');
      if (!mentionsEvent) logWarning('AI missed existing event');
      if (!reportsNoNotes) logWarning('AI did not report empty notes');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 8: Training Data Contamination Check
async function testTrainingDataContamination() {
  logTest('Training Data Contamination - "Trip to Japan" Check');
  logInfo('Testing if AI hallucinates "trip to Japan" goal from training data');

  try {
    const context = buildContext({
      goals: [
        { id: '1', title: 'Complete certification exam', category: 'education', deadline: '2025-12-01' }
      ]
    });

    const response = await callAI('What are my goals?', context);

    logInfo(`Context: 1 goal "Complete certification exam"`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    // Should mention actual goal
    const mentionsActualGoal = responseLower.includes('certification') || responseLower.includes('exam');

    // Should NOT mention hallucinated examples
    const mentionsJapan = responseLower.includes('japan');
    const mentionsTrip = responseLower.includes('trip') && !mentionsActualGoal; // "trip" might be in "complete"

    if (mentionsActualGoal && !mentionsJapan && !mentionsTrip) {
      logPass('AI correctly reported actual goal without hallucinating "trip to Japan"');
    } else {
      if (!mentionsActualGoal) logFail('AI did not mention actual goal');
      if (mentionsJapan) logFail('AI hallucinated "Japan" from training data');
      if (mentionsTrip) logWarning('AI mentioned "trip" (not in actual goal)');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 9: Large Dataset - All Arrays Full
async function testLargeDatasetAccuracy() {
  logTest('Large Dataset Accuracy - All Arrays Full');
  logInfo('Testing if AI accurately reads from large context with many items');

  try {
    const context = buildContext({
      goals: [
        { id: '1', title: 'Reach 10k MRR', category: 'business', deadline: '2025-12-31' },
        { id: '2', title: 'Hire first engineer', category: 'business', deadline: '2025-11-30' },
        { id: '3', title: 'Launch v2.0', category: 'product', deadline: '2025-10-15' }
      ],
      tasks: [
        { id: '1', title: 'Fix payment gateway', completed: false, urgent: true },
        { id: '2', title: 'Write blog post', completed: false },
        { id: '3', title: 'Update pricing page', completed: false, important: true }
      ],
      events: [
        { id: '1', title: 'Demo to potential client', type: 'meeting', startDate: '2025-11-10' },
        { id: '2', title: 'Webinar: Product Launch', type: 'other', startDate: '2025-11-15' }
      ]
    });

    const response = await callAI('What are my top priorities?', context);

    logInfo(`Context: 3 goals, 3 tasks, 2 events`);
    logInfo(`AI Response (first 300 chars): ${response.substring(0, 300)}...`);

    const responseLower = response.toLowerCase();

    // Should mention urgent/important items
    const mentionsUrgentTask = responseLower.includes('payment') || responseLower.includes('gateway');
    const mentionsImportantTask = responseLower.includes('pricing');
    const mentionsUpcomingGoal = responseLower.includes('launch') || responseLower.includes('v2');

    let priorityItemsCount = 0;
    if (mentionsUrgentTask) priorityItemsCount++;
    if (mentionsImportantTask) priorityItemsCount++;
    if (mentionsUpcomingGoal) priorityItemsCount++;

    if (priorityItemsCount >= 2) {
      logPass(`AI correctly identified ${priorityItemsCount}/3 priority items from large dataset`);
    } else if (priorityItemsCount === 1) {
      logWarning('AI only mentioned 1 priority item from dataset');
    } else {
      logFail('AI did not mention any priority items from actual data');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 10: Specific Item Query - Exact Match
async function testSpecificItemQuery() {
  logTest('Specific Item Query - Exact Match');
  logInfo('Testing if AI can find and report on a specific item by name');

  try {
    const context = buildContext({
      tasks: [
        { id: '1', title: 'Refactor authentication module', completed: false, dueDate: '2025-11-15', estimatedTime: 240 },
        { id: '2', title: 'Write unit tests', completed: false },
        { id: '3', title: 'Update dependencies', completed: false }
      ]
    });

    const response = await callAI('Tell me about the authentication refactor task', context);

    logInfo(`Context: 3 tasks, querying specific task "Refactor authentication module"`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    const mentionsAuth = responseLower.includes('authentication') || responseLower.includes('refactor');
    const mentionsDueDate = responseLower.includes('november') || responseLower.includes('15') || responseLower.includes('due');
    const mentionsTime = responseLower.includes('240') || responseLower.includes('4 hour') || responseLower.includes('hours');

    if (mentionsAuth && (mentionsDueDate || mentionsTime)) {
      logPass('AI correctly found and reported specific task with details');
    } else if (mentionsAuth) {
      logWarning('AI found task but missing some details');
    } else {
      logFail('AI did not find the specific task requested');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 11: Data Type Confusion - Goals vs Tasks
async function testDataTypeConfusion() {
  logTest('Data Type Confusion - Goals vs Tasks');
  logInfo('Testing if AI correctly distinguishes between goals and tasks');

  try {
    const context = buildContext({
      goals: [
        { id: '1', title: 'Become a better developer', category: 'personal' }
      ],
      tasks: [
        { id: '1', title: 'Complete React tutorial', completed: false }
      ]
    });

    const response = await callAI('What are my goals? (not tasks)', context);

    logInfo(`Context: 1 goal "Become a better developer", 1 task "Complete React tutorial"`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    const mentionsGoal = responseLower.includes('better developer') || responseLower.includes('become');
    const mentionsTask = responseLower.includes('react tutorial') || responseLower.includes('complete react');

    if (mentionsGoal && !mentionsTask) {
      logPass('AI correctly reported goal without confusing it with task');
    } else if (mentionsGoal && mentionsTask) {
      logFail('AI confused goals with tasks - mentioned both');
    } else if (!mentionsGoal && mentionsTask) {
      logFail('AI reported task instead of goal');
    } else {
      logFail('AI did not report the goal');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 12: Empty String vs Empty Array
async function testEmptyStringVsEmptyArray() {
  logTest('Empty String vs Empty Array Handling');
  logInfo('Testing if AI handles malformed empty data correctly');

  try {
    // Simulate edge case where context might have empty strings
    const context = buildContext({
      goals: [],
      tasks: [],
      events: [],
      notes: []
    });

    const response = await callAI('Do I have any goals, tasks, events, or notes?', context);

    logInfo(`Context: All arrays empty`);
    logInfo(`AI Response: ${response}`);

    const responseLower = response.toLowerCase();

    const reportsEmpty =
      responseLower.includes('no goals') ||
      responseLower.includes("don't have any") ||
      responseLower.includes("haven't set") ||
      responseLower.includes("nothing") ||
      responseLower.includes("empty");

    if (reportsEmpty) {
      logPass('AI correctly reported all data arrays as empty');
    } else {
      logFail('AI did not clearly report empty data');
    }

  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  log('\n' + '🔍 '.repeat(35), 'magenta');
  log('CONTEXT & CONTENT DATA ACCURACY TEST SUITE', 'magenta');
  log('Testing if AI reads actual user data vs hallucinating from training data', 'magenta');
  log('🔍 '.repeat(35) + '\n', 'magenta');

  const startTime = Date.now();

  try {
    await testEmptyGoalsArray();
    await sleep(TEST_DELAY);

    await testActualGoalsReading();
    await sleep(TEST_DELAY);

    await testEmptyTasksArray();
    await sleep(TEST_DELAY);

    await testActualTasksReading();
    await sleep(TEST_DELAY);

    await testEmptyEventsArray();
    await sleep(TEST_DELAY);

    await testActualEventsReading();
    await sleep(TEST_DELAY);

    await testMixedContextSeparation();
    await sleep(TEST_DELAY);

    await testTrainingDataContamination();
    await sleep(TEST_DELAY);

    await testLargeDatasetAccuracy();
    await sleep(TEST_DELAY);

    await testSpecificItemQuery();
    await sleep(TEST_DELAY);

    await testDataTypeConfusion();
    await sleep(TEST_DELAY);

    await testEmptyStringVsEmptyArray();

  } catch (error) {
    log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  // Print summary
  log('\n' + '='.repeat(70), 'cyan');
  log('CONTEXT DATA ACCURACY TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  log(`Total Tests: ${testCount}`, 'blue');
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, 'red');
  log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`, 'yellow');
  log(`Duration: ${duration}s`, 'blue');
  log('='.repeat(70) + '\n', 'cyan');

  // Recommendations
  if (failCount > 0) {
    log('\n⚠️  CONTEXT DATA ACCURACY RECOMMENDATIONS:', 'yellow');
    log('1. Check if AI system prompt emphasizes reading from USER DATA section', 'yellow');
    log('2. Verify context is properly passed to Gemini API in server.js', 'yellow');
    log('3. Add explicit instruction: "NEVER use training data examples"', 'yellow');
    log('4. Consider adding data validation before sending to AI', 'yellow');
    log('5. Check if AIInstructions.ts has clear guidance on context reading', 'yellow');
    log('6. Test with actual frontend to ensure context building is correct', 'yellow');
  } else {
    log('\n✅ All context data accuracy tests passed!', 'green');
    log('AI correctly reads from actual user data without hallucinating', 'green');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Start tests
runAllTests();
