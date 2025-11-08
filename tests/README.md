# AI JSON Leak Detection Test Suite

This test suite systematically tests the AI assistant's JSON handling to identify when and why JSON leaks into chat responses.

## Quick Start

```bash
# Run all tests
npm run test:ai-leak

# Run with detailed logging
npm run test:ai-leak:verbose

# Run specific category
npm run test:ai-leak:category=edge_cases
```

## Test Results Summary

**Latest Run:**
- **Total Tests:** 42
- **Passed:** 40 (95.2%)
- **Failed:** 2 (4.8%)

## Identified Issues

### 🔴 Critical Findings

The test suite identified **2 specific scenarios** where JSON leaks into chat:

#### 1. TC030: Malformed JSON in Response
**Issue:** When AI generates malformed JSON that fails to parse, the marker remains in the display message.

**Example:**
```
Input: "Create a task to review code"
AI Response: "Creating your task!\n\nTASKS_JSON: [{\"title\":\"Review code\"}]\n\nTask created!"
```

**Problem:** The closing bracket is missing in the JSON (`}]` instead of proper closing).
**Result:** Extraction fails, marker `TASKS_JSON: []` remains in chat.

**Root Cause:** The extraction function returns `null` when JSON is malformed, so the removal logic can't find the exact extracted string to remove.

#### 2. TC036: Multiple JSON Blocks of Same Type
**Issue:** When AI includes the same JSON marker type twice, only the first is removed.

**Example:**
```
AI Response: "Creating all tasks!\n\nTASKS_JSON: [{\"title\":\"Task 1\"}]\n\nAnd here's another:\n\nTASKS_JSON: [{\"title\":\"Task 2\"}]\n\nBoth created!"
```

**Problem:** Second `TASKS_JSON:` marker leaks through.
**Result:** User sees `"TASKS_JSON: [{\"title\":\"Task 2\"}]"` in chat.

**Root Cause:** The cleaning logic only removes one instance of each marker type.

### ✅ What Works Well

**40/42 tests pass**, including:
- ✅ Simple entity creation (tasks, notes, events)
- ✅ Complex content (code blocks, JSON examples, nested lists, tables)
- ✅ Multiple different entities simultaneously
- ✅ Conversational queries without JSON
- ✅ Mixed requests (create + explain)
- ✅ Very long content
- ✅ Unicode/emoji
- ✅ Escaped characters
- ✅ Empty fields

## Test Categories

### 1. Simple Entity Creation (5 tests)
Basic task/note/event creation with standard fields.

### 2. Complex Content (9 tests)
- Code blocks (JavaScript, JSON)
- Nested lists
- Tables
- Mixed markdown
- Math formulas
- Escaped characters

### 3. Multiple Entities (4 tests)
Creating multiple items simultaneously.

### 4. Conversational Queries (6 tests)
Regular Q&A without entity creation.

### 5. Mixed Requests (5 tests)
Combinations of entity creation + explanations.

### 6. Edge Cases (9 tests) ⚠️
- **2 failures:** Malformed JSON, Multiple markers
- 7 passing: Long content, unicode, newlines, etc.

### 7. Boundary Tests (4 tests)
Extreme cases: very short, empty, JSON-only responses.

## File Structure

```
tests/
├── README.md                           # This file
├── ai-json-leak-detection.test.cjs    # Main test runner
├── test-cases.json                     # 42 test case definitions
└── results/
    ├── latest-run.json                 # Detailed JSON results
    └── test-run-*.txt                  # Human-readable logs
```

## Understanding Test Results

### Console Output

```bash
🚀 Starting AI JSON Leak Detection Test Suite

..........F.......                      # . = pass, F = fail

================================================================================
  TEST RESULTS SUMMARY
================================================================================

Total Tests: 42
✅ Passed: 40 (95.2%)
❌ Failed: 2

📂 By Category:
  edge_cases: 7/9 passed (77.8%)

❌ Failed Tests:
  TC030: Malformed JSON in response
    Issues: json_leak [high]
```

### Results Files

**`latest-run.json`** contains:
- Timestamp
- Full test results with performance metrics
- Extracted JSON for each test
- Detailed issue information
- Pattern analysis

**`test-run-*.txt`** contains:
- Human-readable summary
- Failed test list
- Quick reference log

## How It Works

### 1. Extraction
The test uses the same JSON extraction logic as the real AI assistant:
- `extractJSON()` - Extracts single objects
- `extractJSONArray()` - Extracts arrays
- Regex for `<<<NOTE_START>>>...<<<NOTE_END>>>`

### 2. Cleaning
Removes JSON markers and content from the response:
- Exact string removal for successfully extracted JSON
- Regex fallback for markers
- Catch-all for remaining JSON-like patterns

### 3. Detection
Scans cleaned message for leaked JSON:
- **High severity:** Markers like `TASKS_JSON:`, `<<<NOTE_START>>>`
- **Medium severity:** JSON objects with known fields
- **Low severity:** Generic array/object patterns

### 4. Analysis
Identifies patterns across failures:
- Common leak types
- Categories most affected
- Severity distribution

## Recommendations

Based on test results, here are recommended fixes:

### Fix 1: Handle Malformed JSON
```javascript
// Current: If extraction fails, marker remains
if (tasksJSON) {
  // Remove only if extraction succeeded
}

// Recommended: Always remove marker, even if extraction fails
const taskMarker = 'TASKS_JSON:';
if (response.includes(taskMarker)) {
  // Remove entire line containing the marker
  displayMessage = displayMessage.replace(/TASKS_JSON:[^\n]*/g, '');
}
```

### Fix 2: Remove All Instances
```javascript
// Current: Only removes first instance
displayMessage.slice(0, startIdx) + displayMessage.slice(endIdx);

// Recommended: Use global regex replacement
displayMessage = displayMessage.replace(/TASKS_JSON:\s*\[[\s\S]*?\]/g, '');
```

### Fix 3: More Aggressive Catch-All
```javascript
// Add after current cleaning logic
displayMessage = displayMessage
  // Remove any remaining markers
  .replace(/<<<[A-Z_]+>>>/g, '')
  .replace(/[A-Z_]+_JSON:/g, '')
  // Remove JSON-like structures
  .replace(/\{[^{}]*\}/g, '')  // Simple objects
  .replace(/\[[^\[\]]*\]/g, ''); // Simple arrays
```

## Adding New Tests

To add a new test case, edit `test-cases.json`:

```json
{
  "id": "TC043",
  "category": "your_category",
  "name": "Test description",
  "mockResponse": "AI response with JSON markers...",
  "expectedDisplay": "Expected clean message"
}
```

Categories:
- `simple_entity_creation`
- `complex_content`
- `multiple_entities`
- `conversational_queries`
- `mixed_requests`
- `edge_cases`
- `boundary_tests`

## Performance Metrics

Average performance per test:
- **Cleaning time:** <1ms
- **Detection time:** <1ms
- **Total time:** <2ms

The test suite runs all 42 tests in under 100ms total.

## CI/CD Integration

Exit codes:
- `0` - All tests passed
- `1` - One or more tests failed

Use in CI/CD:
```yaml
test:
  script:
    - npm run test:ai-leak
```

## Verbose Mode

```bash
npm run test:ai-leak:verbose
```

Shows for each test:
- Original AI response
- Extracted JSON blocks
- Cleaned message
- Detection results
- Performance metrics

Example:
```
================================================================================
🧪 Test: TC007 - Note with JSON code example
Category: complex_content
================================================================================

📝 Extracted JSON:
  note: {"title":"JSON Format Guide","content":"JSON (JavaScript..."}

💬 Cleaned Message:
I've created a note explaining JSON!

Your guide is ready!

✅ No JSON leak detected
```

## Next Steps

1. **Run tests:** `npm run test:ai-leak`
2. **Review failures:** Check `tests/results/latest-run.json`
3. **Implement fixes:** Update `components/AIAssistant.tsx` cleaning logic
4. **Re-test:** Run tests again to verify fixes
5. **Add regression tests:** Add new test cases for any new issues discovered

## Questions?

The test suite is fully automated and requires no manual intervention. All test cases use mocked AI responses for reproducibility - no API calls are made.
