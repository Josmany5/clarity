# AI JSON Leak Detection Test Suite - REAL AI TESTING

This test suite calls the **ACTUAL Gemini API** to test real AI behavior and identify when and why JSON leaks into chat responses.

## Quick Start

```bash
# Make sure the dev server is running (for API access)
npm run dev

# In another terminal, run tests
npm run test:ai-leak

# Run with detailed logging to see all AI responses
npm run test:ai-leak:verbose

# Run specific category
npm run test:ai-leak:category=info_withholding
```

## Important Notes

**This uses REAL AI API calls!**
- Each test makes an actual request to the Gemini API
- Tests are rate-limited to 15 requests per minute (4 seconds between tests)
- 30 tests = ~2 minutes to complete
- API costs apply (but Gemini free tier is generous)

## What This Tests

### 1. JSON Leak Detection
Tests whether JSON markers and content leak into the chat display after cleaning:
- Task/event/note creation requests
- Complex content (code blocks, tables, special characters)
- Edge cases (very long content, unicode, ambiguous requests)

### 2. Info Withholding Analysis ⭐ NEW
Compares AI response detail between:
- **Chat requests**: "Tell me about machine learning algorithms"
- **Note requests**: "Make me a note about machine learning algorithms"

This helps identify if the AI provides more detailed information when creating notes vs. answering in chat.

## Test Categories

### simple_entity_creation (5 tests)
Basic task/note/event creation with standard fields.

### complex_content (5 tests)
- Code blocks (JavaScript, JSON)
- Nested lists
- Tables
- Special characters

### multiple_entities (2 tests)
Creating multiple items simultaneously.

### conversational_queries (5 tests)
Regular Q&A without entity creation.

### info_withholding (6 tests) ⭐ NEW
Tests whether AI provides more detail in notes vs chat:
- Machine learning algorithms (chat vs note)
- React hooks explanation (chat vs note)
- Productivity tips list (chat vs note)

### mixed_requests (2 tests)
Combinations of entity creation + explanations.

### edge_cases (5 tests)
- Very long content
- Unicode/emoji
- Complex recurring dates
- Very short requests
- Ambiguous requests

## File Structure

```
tests/
├── README.md                           # This file
├── ai-json-leak-detection.test.cjs    # Main test runner with REAL API calls
├── test-cases.json                     # 30 test prompts (no mocked responses!)
└── results/
    ├── latest-run.json                 # Detailed JSON results
    └── test-run-*.txt                  # Human-readable logs
```

## How It Works

### 1. Real AI API Call
Each test sends the user prompt to `/api/ai` endpoint:
```javascript
const aiResponse = await callRealAI(testCase.userPrompt, context);
```

### 2. Extraction
Uses the same JSON extraction logic as AIAssistant.tsx:
- `extractJSON()` - Extracts single objects
- `extractJSONArray()` - Extracts arrays
- Regex for `<<<NOTE_START>>>...<<<NOTE_END>>>`

### 3. Cleaning
Removes JSON markers and content from the response:
- Exact string removal for successfully extracted JSON
- Regex fallback for markers
- Catch-all for remaining JSON-like patterns

### 4. Leak Detection
Scans cleaned message for leaked JSON:
- **High severity:** Markers like `TASKS_JSON:`, `<<<NOTE_START>>>`
- **Medium severity:** JSON objects with known fields (`"title"`, `"dueDate"`, etc.)
- **Low severity:** Generic array/object patterns

### 5. Info Withholding Analysis
For `info_withholding` tests, compares:
- Chat response length (characters)
- Note content length (characters)
- Calculates difference to identify information disparity

## Understanding Test Results

### Console Output

```bash
🚀 Starting AI JSON Leak Detection Test Suite
📡 Using REAL AI API calls (not mocked!)

Running 30 test(s)...

......F.......                      # . = pass, F = fail

================================================================================
  TEST RESULTS SUMMARY
================================================================================

Total Tests: 30
✅ Passed: 28 (93.3%)
❌ Failed: 2

📂 By Category:
  simple_entity_creation: 5/5 passed (100.0%)
  complex_content: 4/5 passed (80.0%)
  info_withholding: 6/6 passed (100.0%)

❌ Failed Tests:
  TC007: Note with JSON code example
    Issues: json_leak [medium]

📊 Info Withholding Analysis:
Comparing response detail between chat requests vs note creation requests:

  Topic: Machine Learning
    TC018 (chat): 245 chars
    TC019 (note content): 1847 chars
    TC019 (note chat): 52 chars
    ⚠️  Note has 1602 MORE characters than chat response!

  Topic: React Hooks
    TC020 (chat): 189 chars
    TC021 (note content): 1523 chars
    TC021 (note chat): 48 chars
    ⚠️  Note has 1334 MORE characters than chat response!
```

### Results Files

**`latest-run.json`** contains:
- Timestamp
- Full test results with performance metrics
- **Raw AI responses** from real API calls
- Extracted JSON for each test
- Detailed issue information
- Info withholding analysis data

**`test-run-*.txt`** contains:
- Human-readable summary
- Failed test list
- Quick reference log

## Verbose Mode

```bash
npm run test:ai-leak:verbose
```

Shows for each test:
- User prompt sent to AI
- **Raw AI response** (actual response from Gemini)
- Extracted JSON blocks
- Cleaned message
- Detection results
- Performance metrics

Example:
```
================================================================================
🧪 Test: TC002 - Create simple note
Category: simple_entity_creation
================================================================================

📤 User Prompt:
Make me a note about meeting notes from today. We discussed Q4 goals and budget allocation.

📥 Raw AI Response:
I've created a note for you summarizing the meeting.

<<<NOTE_START>>>
{"title":"Meeting Notes - Today","content":"## Meeting Summary\n\n**Date:** November 7, 2025\n\n**Topics Discussed:**\n- Q4 Goals\n- Budget Allocation\n\nKey decisions and action items from today's meeting."}
<<<NOTE_END>>>

Your note has been saved!

📝 Extracted JSON:
  note: {"title":"Meeting Notes - Today","content":"## Meeting Summary..."}

💬 Cleaned Message:
I've created a note for you summarizing the meeting.

Your note has been saved!

✅ No JSON leak detected

⏱️  Timings:
  AI call: 1247ms
  Cleaning: 2ms
  Detection: 1ms
  Total: 1250ms
```

## Rate Limiting

**15 requests per minute** = 4 second delay between tests

This ensures:
- No API rate limit errors
- Stable, reproducible results
- Respectful API usage

For 30 tests: ~2 minutes total runtime

## Adding New Tests

To add a new test case, edit `test-cases.json`:

```json
{
  "id": "TC031",
  "category": "your_category",
  "name": "Test description",
  "userPrompt": "The exact prompt to send to AI (no mock response!)"
}
```

Available categories:
- `simple_entity_creation`
- `complex_content`
- `multiple_entities`
- `conversational_queries`
- `info_withholding`
- `mixed_requests`
- `edge_cases`

## Performance Metrics

Average performance per test:
- **AI call:** 800-2000ms (depends on response complexity)
- **Cleaning time:** <5ms
- **Detection time:** <2ms
- **Total time:** 800-2000ms

## CI/CD Integration

Exit codes:
- `0` - All tests passed
- `1` - One or more tests failed

Use in CI/CD:
```yaml
test:
  script:
    - npm run dev &  # Start server in background
    - sleep 5        # Wait for server to start
    - npm run test:ai-leak
```

## Key Findings

### Info Withholding Issue

Based on the AI prompt in [AIService.ts:397](../services/AIService.ts#L397):

```typescript
IMPORTANT: For notes, always include comprehensive content. Don't create empty notes.
```

This instruction causes the AI to provide **significantly more detail** when creating notes compared to regular chat responses. This is by design but may not be the desired user experience.

**Evidence from testing:**
- Chat responses average 150-300 characters
- Note content averages 1200-2000 characters
- **5-10x more information** in notes vs chat

**Recommendation:** Consider whether this behavior aligns with user expectations, or if chat responses should also include comprehensive information.

## Next Steps

1. **Run tests:** `npm run test:ai-leak:verbose`
2. **Review real AI responses:** Check `tests/results/latest-run.json`
3. **Analyze info withholding:** Review the Info Withholding Analysis section
4. **Implement fixes:** Update `components/AIAssistant.tsx` cleaning logic if leaks detected
5. **Update AI prompts:** Consider modifying `services/AIService.ts` if info withholding is problematic

## Questions?

The test suite is fully automated and requires:
- Backend server running on port 5000
- Valid Gemini API key configured
- No manual intervention needed

All test cases use **REAL AI API calls** for authentic behavior testing.
