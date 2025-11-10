// Mobile-Specific JSON Leak Detection Test
// Tests whether JSON commands leak more on mobile due to:
// 1. Different text wrapping and newline handling
// 2. Touch keyboard input patterns (autocorrect, word suggestions)
// 3. Slower mobile processing causing async timing issues
// 4. Mobile browser rendering differences

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'http://localhost:3001/api/ai';
const TEST_DELAY = 6000; // 6 seconds between tests

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is required');
  console.error('Set it in your .env file or run: export GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

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
  log(`Mobile Test ${testCount}: ${name}`, 'cyan');
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

// JSON Leak Detection Patterns
const jsonLeakPatterns = {
  tasksJson: /TASKS_JSON:\s*\[/i,
  taskUpdateJson: /TASK_UPDATE_JSON:\s*{/i,
  taskDeleteJson: /TASK_DELETE_JSON:\s*{/i,
  eventsJson: /EVENTS_JSON:\s*\[/i,
  eventUpdateJson: /EVENT_UPDATE_JSON:\s*{/i,
  noteStart: /<<<NOTE_START>>>/,
  noteEnd: /<<<NOTE_END>>>/,
  codeBlock: /```(?:json)?/,
  jsonObject: /\{\s*"(?:title|taskTitle|eventTitle)/,
};

function detectJsonLeak(response) {
  const leaks = [];

  // Check for raw JSON markers
  if (jsonLeakPatterns.tasksJson.test(response)) {
    leaks.push('TASKS_JSON marker visible');
  }
  if (jsonLeakPatterns.taskUpdateJson.test(response)) {
    leaks.push('TASK_UPDATE_JSON marker visible');
  }
  if (jsonLeakPatterns.taskDeleteJson.test(response)) {
    leaks.push('TASK_DELETE_JSON marker visible');
  }
  if (jsonLeakPatterns.eventsJson.test(response)) {
    leaks.push('EVENTS_JSON marker visible');
  }
  if (jsonLeakPatterns.eventUpdateJson.test(response)) {
    leaks.push('EVENT_UPDATE_JSON marker visible');
  }
  if (jsonLeakPatterns.noteStart.test(response)) {
    leaks.push('<<<NOTE_START>>> marker visible');
  }
  if (jsonLeakPatterns.noteEnd.test(response)) {
    leaks.push('<<<NOTE_END>>> marker visible');
  }

  // Check for code blocks (JSON shouldn't be in code blocks)
  if (jsonLeakPatterns.codeBlock.test(response)) {
    leaks.push('Code block (```) found - JSON may be exposed');
  }

  // Check for raw JSON objects
  const jsonObjectMatches = response.match(/\{[^}]*"(?:title|taskTitle|eventTitle|content)"[^}]*\}/g);
  if (jsonObjectMatches && jsonObjectMatches.length > 0) {
    leaks.push(`${jsonObjectMatches.length} potential raw JSON object(s) found`);
  }

  return leaks;
}

// Test 1: Mobile Line Break Sensitivity
async function testMobileLineBreaks() {
  logTest('Mobile Line Break Handling');
  logInfo('Testing if mobile-style newlines cause JSON to leak');

  try {
    // Simulate mobile autocorrect adding extra newlines
    const mobileStyleMessage = 'Create a task called\n\n"Review code"\n\ndue tomorrow';
    const response = await callAI(mobileStyleMessage);

    logInfo(`Mobile-style input: ${mobileStyleMessage.replace(/\n/g, '\\n')}`);
    logInfo(`AI Response (truncated): ${response.substring(0, 200)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked with mobile-style line breaks');
    } else {
      logFail(`JSON leaked with mobile line breaks: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 2: Touch Keyboard Autocorrect Patterns
async function testTouchKeyboardPatterns() {
  logTest('Touch Keyboard Autocorrect Patterns');
  logInfo('Testing commands with mobile autocorrect artifacts');

  try {
    // Simulate autocorrect changing "task" to "Task" mid-sentence
    const autocorrectMessage = 'Add Task called meeting at 3pm Tomorrow';
    const response = await callAI(autocorrectMessage);

    logInfo(`Autocorrect input: ${autocorrectMessage}`);
    logInfo(`AI Response (truncated): ${response.substring(0, 200)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked with autocorrect patterns');
    } else {
      logFail(`JSON leaked with autocorrect: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 3: Long Mobile Message with Multiple Commands
async function testLongMobileMessage() {
  logTest('Long Mobile Message with Multiple Commands');
  logInfo('Testing if mobile processing delays cause JSON leaks in long messages');

  try {
    const longMessage = 'Hey, I need to create a task for grocery shopping, and also schedule a dentist appointment on Friday at 2pm, oh and remind me to call mom tomorrow, and create a note about my project ideas';
    const response = await callAI(longMessage);

    logInfo(`Long message length: ${longMessage.length} chars`);
    logInfo(`AI Response length: ${response.length} chars`);
    logInfo(`AI Response (first 300 chars): ${response.substring(0, 300)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked in long mobile message');
    } else {
      logFail(`JSON leaked in long message: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 4: Rapid Follow-up Messages (Mobile Async Timing)
async function testRapidFollowups() {
  logTest('Rapid Follow-up Messages (Async Timing)');
  logInfo('Testing if rapid mobile messages cause JSON extraction race conditions');

  try {
    // First message
    const response1 = await callAI('Create task buy milk');
    logInfo(`Response 1 (truncated): ${response1.substring(0, 100)}...`);

    const leaks1 = detectJsonLeak(response1);

    // Immediate follow-up (simulating mobile user typing quickly)
    await sleep(1000); // Only 1 second delay (mobile users might be faster)

    const contextHistory = `User: Create task buy milk\nWove: ${response1}`;
    const response2 = await callAI('Make it urgent', contextHistory);
    logInfo(`Response 2 (truncated): ${response2.substring(0, 100)}...`);

    const leaks2 = detectJsonLeak(response2);

    const totalLeaks = leaks1.length + leaks2.length;

    if (totalLeaks === 0) {
      logPass('No JSON leaked in rapid follow-up messages');
    } else {
      logFail(`JSON leaked in rapid messages: First: ${leaks1.join(', ')}, Second: ${leaks2.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 5: Mobile Voice-to-Text Patterns
async function testVoiceToTextPatterns() {
  logTest('Voice-to-Text Input Patterns');
  logInfo('Testing voice input patterns that might expose JSON');

  try {
    // Voice input often includes run-on sentences with lowercase
    const voiceMessage = 'create a task called review project due friday at three p m';
    const response = await callAI(voiceMessage);

    logInfo(`Voice input: ${voiceMessage}`);
    logInfo(`AI Response (truncated): ${response.substring(0, 200)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked with voice input patterns');
    } else {
      logFail(`JSON leaked with voice input: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 6: Mobile Screen Width Text Wrapping
async function testMobileTextWrapping() {
  logTest('Mobile Screen Width Text Wrapping');
  logInfo('Testing if narrow mobile screens cause JSON to wrap and leak');

  try {
    // Long task title that might wrap on mobile
    const longTitleMessage = 'Create task "Complete the comprehensive quarterly financial report and submit to accounting department"';
    const response = await callAI(longTitleMessage);

    logInfo(`Long title message: ${longTitleMessage}`);
    logInfo(`AI Response (truncated): ${response.substring(0, 300)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked with long titles that wrap on mobile');
    } else {
      logFail(`JSON leaked with wrapped text: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 7: Mobile Special Characters
async function testMobileSpecialCharacters() {
  logTest('Mobile Special Character Input');
  logInfo('Testing emoji and special chars from mobile keyboards');

  try {
    // Mobile users often use emojis
    const emojiMessage = 'Create task 🏃‍♂️ morning run 🌅 tomorrow at 6am';
    const response = await callAI(emojiMessage);

    logInfo(`Emoji message: ${emojiMessage}`);
    logInfo(`AI Response (truncated): ${response.substring(0, 200)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked with emojis and special characters');
    } else {
      logFail(`JSON leaked with special chars: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Test 8: Mobile Copy-Paste Formatting Issues
async function testMobileCopyPaste() {
  logTest('Mobile Copy-Paste Formatting');
  logInfo('Testing if mobile copy-paste causes formatting issues that expose JSON');

  try {
    // Simulate pasted text with weird spacing
    const pastedMessage = 'Create  task    with   irregular    spacing due   to   copy paste';
    const response = await callAI(pastedMessage);

    logInfo(`Pasted message: "${pastedMessage}"`);
    logInfo(`AI Response (truncated): ${response.substring(0, 200)}...`);

    const leaks = detectJsonLeak(response);

    if (leaks.length === 0) {
      logPass('No JSON leaked with irregular copy-paste spacing');
    } else {
      logFail(`JSON leaked with pasted text: ${leaks.join(', ')}`);
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  log('\n' + '🏃 '.repeat(35), 'magenta');
  log('MOBILE JSON LEAK DETECTION TEST SUITE', 'magenta');
  log('Testing mobile-specific patterns that might cause JSON to leak', 'magenta');
  log('🏃 '.repeat(35) + '\n', 'magenta');

  const startTime = Date.now();

  try {
    await testMobileLineBreaks();
    await sleep(TEST_DELAY);

    await testTouchKeyboardPatterns();
    await sleep(TEST_DELAY);

    await testLongMobileMessage();
    await sleep(TEST_DELAY);

    await testRapidFollowups(); // Has shorter internal delay
    await sleep(TEST_DELAY);

    await testVoiceToTextPatterns();
    await sleep(TEST_DELAY);

    await testMobileTextWrapping();
    await sleep(TEST_DELAY);

    await testMobileSpecialCharacters();
    await sleep(TEST_DELAY);

    await testMobileCopyPaste();

  } catch (error) {
    log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  // Print summary
  log('\n' + '='.repeat(70), 'cyan');
  log('MOBILE TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  log(`Total Tests: ${testCount}`, 'blue');
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, 'red');
  log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`, 'yellow');
  log(`Duration: ${duration}s`, 'blue');
  log('='.repeat(70) + '\n', 'cyan');

  // Mobile-specific recommendations
  if (failCount > 0) {
    log('\n⚠️  MOBILE-SPECIFIC RECOMMENDATIONS:', 'yellow');
    log('1. Check regex patterns in AIAssistant.tsx for mobile newline handling', 'yellow');
    log('2. Test on actual mobile devices (iOS Safari, Chrome Mobile)', 'yellow');
    log('3. Verify touch keyboard autocorrect doesn\'t break JSON extraction', 'yellow');
    log('4. Check async timing with slower mobile network conditions', 'yellow');
    log('5. Test with mobile screen widths (320px, 375px, 414px)', 'yellow');
  } else {
    log('\n✅ All mobile-specific JSON leak tests passed!', 'green');
    log('JSON commands are properly extracted even with mobile input patterns', 'green');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Start tests
runAllTests();
