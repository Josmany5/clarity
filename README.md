# Clarity Dashboard

A modern, elegant productivity dashboard for managing your notes, tasks, and projects with a beautiful glassmorphic design.

## Features

### Notes Management
- Create, edit, and delete notes with real-time auto-save
- Full-text search across all notes
- Clean, distraction-free editor interface
- LocalStorage persistence

### Task Management (Eisenhower Matrix)
- Organize tasks by urgency and importance
- Four quadrants: Do First, Schedule, Delegate, Eliminate
- Visual indicators with dots (urgent) and stars (important)
- Filter tasks by category or completion status
- Mark tasks as complete with checkbox

### Project Tracking
- Create and manage projects with descriptions
- Track project status: Planning, In Progress, Completed, On Hold
- Color-coded status indicators
- Grid view with quick status updates

### Additional Features
- **Focus Timer**: 25-minute Pomodoro timer with visual progress indicator
- **Interactive Calendar**: Month navigation with today highlighting
- **Search**: Global search across notes
- **Keyboard Shortcuts**: Quick actions (Ctrl+N for new note, Ctrl+K for search, etc.)
- **Dark/Light Mode**: Toggle between themes
- **Data Export**: Backup all your data as JSON
- **Fully Responsive**: Works on desktop, tablet, and mobile

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **LocalStorage** - Data persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Keyboard Shortcuts

- **Ctrl+N** - Create new note
- **Ctrl+K** - Focus search
- **Ctrl+D** - Toggle dark/light mode
- **Ctrl+H** - Go to dashboard

## Data Storage

All data is stored locally in your browser's LocalStorage:
- Notes are auto-saved as you type
- Tasks persist across sessions
- Projects are saved automatically
- Use Settings → Export Data to backup

## Project Structure

```
clarity-dashboard/
├── components/
│   ├── App.tsx              # Main app component
│   ├── DashboardGrid.tsx    # Dashboard with widgets
│   ├── NotesPage.tsx        # Notes editor
│   ├── TasksPage.tsx        # Eisenhower Matrix
│   ├── ProjectsPage.tsx     # Project management
│   ├── SettingsPage.tsx     # Settings and data export
│   ├── Header.tsx           # Top navigation
│   ├── Sidebar.tsx          # Side navigation
│   ├── FocusTimer.tsx       # Pomodoro timer
│   ├── MiniCalendar.tsx     # Calendar widget
│   └── ...
├── index.html
├── index.tsx
├── vite.config.ts
└── package.json
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.
