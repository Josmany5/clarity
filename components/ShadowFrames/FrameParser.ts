// Parse AI responses for frame commands
// Format: [FRAME:type:data]

export interface FrameCommand {
  type: 'task-list' | 'project-card' | 'calendar' | 'notes';
  data: any;
  id: string;
}

export interface ParsedContent {
  type: 'text' | 'frame';
  content?: string;
  frame?: FrameCommand;
}

export function parseFrameCommands(text: string): {
  frames: FrameCommand[];
  cleanText: string;
  contentParts: ParsedContent[];
} {
  const frames: FrameCommand[] = [];
  const contentParts: ParsedContent[] = [];
  let cleanText = text;
  let lastIndex = 0;

  // Find all [FRAME:type: patterns
  const frameStartRegex = /\[FRAME:([^:]+):/g;
  let match;

  while ((match = frameStartRegex.exec(text)) !== null) {
    const type = match[1];
    const startIndex = match.index + match[0].length;

    // Add text before this frame
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        contentParts.push({ type: 'text', content: textBefore });
      }
    }

    // Find the matching JSON object by counting braces
    let braceCount = 0;
    let jsonStart = -1;
    let jsonEnd = -1;

    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === '{') {
        if (braceCount === 0) jsonStart = i;
        braceCount++;
      } else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0 && jsonStart !== -1) {
          jsonEnd = i + 1;
          break;
        }
      }
    }

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const dataStr = text.substring(jsonStart, jsonEnd);
      const fullMatch = text.substring(match.index, jsonEnd + 1);

      try {
        const data = JSON.parse(dataStr);
        const frameCommand: FrameCommand = {
          type: type as any,
          data,
          id: `frame-${Date.now()}-${Math.random()}`
        };

        frames.push(frameCommand);
        contentParts.push({ type: 'frame', frame: frameCommand });

        // Remove frame command from text
        cleanText = cleanText.replace(fullMatch, '');

        // Update lastIndex to after the frame
        lastIndex = jsonEnd + 1;
        frameStartRegex.lastIndex = lastIndex;
      } catch (e) {
        // Silently skip invalid frames
      }
    }
  }

  // Add remaining text after last frame
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
      contentParts.push({ type: 'text', content: textAfter });
    }
  }

  return { frames, cleanText: cleanText.trim(), contentParts };
}

// Helper to create frame command for AI
export function createTaskListFrame(tasks: any[]): string {
  const data = { tasks: tasks.slice(0, 10) }; // Limit to 10 tasks
  return `[FRAME:task-list:${JSON.stringify(data)}]`;
}

export function createProjectFrame(projects: any | any[]): string {
  // Handle both single project and array of projects
  const projectsArray = Array.isArray(projects) ? projects : [projects];
  const data = { projects: projectsArray };
  return `[FRAME:project-card:${JSON.stringify(data)}]`;
}

export function createCalendarFrame(events: any[]): string {
  const data = { events: events.slice(0, 10) };
  return `[FRAME:calendar:${JSON.stringify(data)}]`;
}

export function createNotesFrame(notes: any[]): string {
  const data = { notes: notes.slice(0, 5) };
  return `[FRAME:notes:${JSON.stringify(data)}]`;
}
