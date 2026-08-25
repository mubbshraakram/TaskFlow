TaskFlow — Kanban Project Management App

A full-featured project management application built with React and Vite. Manage tasks across multiple boards with drag-and-drop, activity tracking, and a clean dashboard — all with localStorage persistence.

🔗 Live Demo: task-flow-nine-pink.vercel.app

Features
Multi-Board Workspace — Organize boards by category (Personal / Professional)
Kanban Board — Drag & drop cards across To Do, In Progress, In Review, and Done columns
Activity Log — Real-time log of every action (move, add, edit, delete) with unread badge
Dashboard — Overview of all tasks with charts and board progress
Calendar — View tasks by due date across all boards
Team Management — Add team members and track their assigned tasks
Reports — Analytics with bar charts and priority breakdown
Settings — Profile management and notification preferences
localStorage Persistence — All data saved locally, survives page refresh
Mobile Responsive — Hamburger sidebar, responsive grids, mobile-friendly modals
Tech Stack
React 18 — UI library
Vite — Build tool
Recharts — Charts and data visualization
Lucide React — Icons
localStorage — Client-side data persistence
Getting Started
bash
# Clone the repo
git clone https://github.com/mubbshraakram/TaskFlow.git
cd TaskFlow

# Install dependencies
npm install

# Run locally
npm run dev

Open http://localhost:5173 in your browser.

Build for Production
bash
npm run build
Project Structure
taskflow/
├── src/
│   ├── App.jsx        # All components in one file
│   └── main.jsx       # Entry point
├── index.html
├── vite.config.js
└── package.json
Deployed On
Frontend: Vercel
Author

Mubbshra Akram

GitHub: @mubbshraakram
LinkedIn: Mubbshra Akram
Fiverr: Available for freelance React projects
