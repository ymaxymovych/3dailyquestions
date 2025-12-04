# Voice Input "Magic Draft" Implementation Plan

## Goal
Implement a voice input feature for the "My Day" (Daily Report) page that allows users to dictate their report. The system will simulate an AI parsing the voice input to pre-fill the report form.

## User Review Required
> [!NOTE]
> This implementation uses a **Mock AI Parser** as requested. It will not actually call an external LLM API yet, but will simulate the experience using keyword matching and hardcoded logic.

## Proposed Changes

### Frontend Components

#### [NEW] [VoiceInput.tsx](file:///c:/Users/yaros/.gemini/antigravity/playground/crystal-kuiper/apps/web/src/components/my-day/VoiceInput.tsx)
- **UI**: Floating Action Button (FAB) with a Microphone icon in the bottom-right corner.
- **Interaction**:
  - Click opens a modal/overlay.
  - Shows a "Listening" state with a CSS wave animation.
  - Shows a "Processing" state with a "Magic Sparkles" animation.
  - Returns the simulated transcribed text to the parent component.

#### [NEW] [mockAIParser.ts](file:///c:/Users/yaros/.gemini/antigravity/playground/crystal-kuiper/apps/web/src/lib/mockAIParser.ts)
- **Function**: `parseDailyReport(text: string): Partial<DailyReportState>`
- **Logic**:
  - Takes raw text input.
  - Uses simple keyword matching (e.g., "yesterday", "today", "blocker", "help") to map content to specific fields in the `DailyReportState`.
  - Returns a partial state object to be merged with the current form state.

#### [MODIFY] [MyReportPage.tsx](file:///c:/Users/yaros/.gemini/antigravity/playground/crystal-kuiper/apps/web/src/app/my-day/page.tsx)
- Import `VoiceInput` and `parseDailyReport`.
- Add `handleVoiceInput` function:
  - Receives text from `VoiceInput`.
  - Calls `parseDailyReport`.
  - Merges the result into `reportState`.
  - Shows a success toast ("Звіт заповнено з голосу").
- Render `<VoiceInput />` at the end of the component (outside the main grid, fixed position).

## Verification Plan

### Manual Verification
1.  **Open "My Day" Page**: Navigate to `/my-day`.
2.  **Check UI**: Verify the Microphone FAB appears in the bottom-right.
3.  **Test Interaction**:
    - Click the FAB.
    - Verify the "Listening" modal appears.
    - "Speak" (click a "Simulate Voice" button in the mock UI or wait for a timeout).
    - Verify "Processing" animation.
4.  **Verify Data**:
    - Check if the form fields (Yesterday, Today, Help) are populated with the mock data.
    - Verify the toast message appears.
5.  **Save**: Click "Save" and ensure the data persists (using the existing save logic).
