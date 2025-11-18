#!/usr/bin/env node

// Comprehensive Goal Creation Test Suite
// Tests goal creation, duplication detection, and JSON handling

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = 'AIzaSyBlBONh3bVNqH4H5j4MYgy5nRhSvtFFwLg';
const TEST_RESULTS_DIR = path.join(__dirname, 'results');

// Ensure results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

const testCases = [
  {
    name: 'Simple Goal Creation',
    userMessage: 'Create a goal to launch my startup by end of year',
    expectedJSON: 'GOALS_JSON:',
    shouldCreateGoal: true
  },
  {
    name: 'Multiple Goals Creation',
    userMessage: 'I want to create three goals: learn Spanish, run a marathon, and save $10k',
    expectedJSON: 'GOALS_JSON:',
    shouldCreateGoal: true
  },
  {
    name: 'Goal with Target Date',
    userMessage: 'Set a goal to finish my thesis by March 2026',
    expectedJSON: 'GOALS_JSON:',
    shouldCreateGoal: true
  },
  {
    name: 'Conversational Request (No Goal)',
    userMessage: 'What are some good goal-setting strategies?',
    expectedJSON: null,
    shouldCreateGoal: false
  },
  {
    name: 'Duplicate Prevention Test',
    userMessage: 'Create a goal to learn JavaScript',
    expectedJSON: 'GOALS_JSON:',
    shouldCreateGoal: true,
    conversationHistory: [
      { role: 'user', content: 'Create a goal to learn JavaScript' },
      { role: 'assistant', content: 'I created the goal "Learn JavaScript" for you. GOALS_JSON: [{"title":"Learn JavaScript","description":"Master JavaScript programming","status":"not-started"}]' }
    ]
  },
  {
    name: 'Task vs Goal Distinction',
    userMessage: 'Remind me to buy groceries tomorrow',
    expectedJSON: 'TASKS_JSON:',
    shouldCreateGoal: false
  },
  {
    name: 'Note vs Goal Distinction',
    userMessage: 'Save a note about my goal-setting process',
    expectedJSON: 'NOTE_START',
    shouldCreateGoal: false
  },
  {
    name: 'JSON Leak Prevention',
    userMessage: 'Tell me about your capabilities',
    expectedJSON: null,
    shouldCreateGoal: false
  },
  {
    name: 'Complex Goal with Details',
    userMessage: 'I want to lose 20 pounds by summer 2026, starting with diet and exercise',
    expectedJSON: 'GOALS_JSON:',
    shouldCreateGoal: true
  },
  {
    name: 'Goal Status Update',
    userMessage: 'Mark my startup launch goal as in progress',
    expectedJSON: 'GOAL_UPDATE_JSON:',
    shouldCreateGoal: false
  }
];

async function callGeminiAPI(systemPrompt, conversationHistory, userMessage) {
  const contents = [];

  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  return result.candidates[0].content.parts[0].text;
}

function buildSystemPrompt() {
  const today = new Date().toISOString().split('T')[0];
  return `You are Wove, an AI productivity coach. Today is ${today}.

## GOAL CREATION RULES

Use GOALS_JSON when users request to create long-term goals or ambitions.

Format:
GOALS_JSON: [{"title": "Goal title", "description": "Details", "targetDate": "YYYY-MM-DD", "status": "not-started"}]

## IMPORTANT DISTINCTIONS

- Goals = Long-term objectives (months/years)
- Tasks = Short-term actions (hours/days) - use TASKS_JSON
- Notes = Information to save - use <<<NOTE_START>>>

## JSON LEAK PREVENTION

ONLY output JSON when explicitly creating/updating/deleting goals. Never leak JSON in conversational responses.

User's current goals: []
`;
}

async function runTest(testCase, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST ${index + 1}/${testCases.length}: ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`User Message: "${testCase.userMessage}"`);

  const startTime = Date.now();

  try {
    const systemPrompt = buildSystemPrompt();
    const response = await callGeminiAPI(
      systemPrompt,
      testCase.conversationHistory || [],
      testCase.userMessage
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`\nResponse Time: ${responseTime}ms`);
    console.log(`\nRAW RESPONSE:\n${response}\n`);

    // Check for expected JSON marker
    const hasExpectedJSON = testCase.expectedJSON ? response.includes(testCase.expectedJSON) : true;
    const hasGoalJSON = response.includes('GOALS_JSON:');
    const hasTaskJSON = response.includes('TASKS_JSON:');
    const hasNoteJSON = response.includes('NOTE_START');

    // Check for JSON leaks in conversational responses
    const hasJSONLeak = !testCase.shouldCreateGoal && (hasGoalJSON || response.match(/[\{\[].*"title".*[\}\]]/));

    const result = {
      testName: testCase.name,
      userMessage: testCase.userMessage,
      passed: hasExpectedJSON && !hasJSONLeak && (hasGoalJSON === testCase.shouldCreateGoal),
      responseTime,
      hasGoalJSON,
      hasTaskJSON,
      hasNoteJSON,
      hasJSONLeak,
      expectedJSON: testCase.expectedJSON,
      response: response.substring(0, 500) // First 500 chars
    };

    if (result.passed) {
      console.log('✅ TEST PASSED');
    } else {
      console.log('❌ TEST FAILED');
      if (!hasExpectedJSON) console.log(`   - Expected to find: ${testCase.expectedJSON}`);
      if (hasJSONLeak) console.log('   - JSON leaked in conversational response');
      if (hasGoalJSON !== testCase.shouldCreateGoal) {
        console.log(`   - Goal creation mismatch (expected: ${testCase.shouldCreateGoal}, got: ${hasGoalJSON})`);
      }
    }

    return result;

  } catch (error) {
    console.log(`❌ TEST ERROR: ${error.message}`);
    return {
      testName: testCase.name,
      userMessage: testCase.userMessage,
      passed: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('\n🚀 STARTING COMPREHENSIVE GOAL CREATION TEST SUITE\n');
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Rate Limit: ~6 requests per minute (10-second delay between tests)\n`);

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const result = await runTest(testCases[i], i);
    results.push(result);

    // Rate limiting: 10 seconds between requests
    if (i < testCases.length - 1) {
      console.log('\n⏳ Waiting 10 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${(passed / results.length * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultFile = path.join(TEST_RESULTS_DIR, `goal-test-${timestamp}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: ${resultFile}`);

  // Print failed tests
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach((test, i) => {
      console.log(`\n${i + 1}. ${test.testName}`);
      console.log(`   Message: "${test.userMessage}"`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });
  }

  console.log('\n✅ TEST SUITE COMPLETE\n');
}

runAllTests().catch(console.error);
