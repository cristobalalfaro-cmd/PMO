# Dashboard · Gestión de Proyectos

## Overview
This is a Project Management Dashboard (in Spanish) that provides a comprehensive view of project tasks, deadlines, and status tracking. The application connects to Google Sheets for data and provides interactive filtering, status editing, and reporting capabilities.

## Project Type
Static HTML/CSS/JavaScript website with:
- Vanilla JavaScript (no framework)
- External CDN libraries: PapaParse (CSV parsing), Chart.js (visualizations)
- Google Sheets integration for data storage
- Apps Script integration for updates

## Key Features
1. **Cascading Filters**: Type, Client, Project, Status, Owner - filters update dynamically based on previous selections
2. **Executive Summary**: KPI dashboard with option to include/exclude finished tasks
3. **Status Breakdown**: Accordion view showing:
   - Finished tasks (all tasks with "Finalizado" status)
   - Overdue tasks (tasks with deadline before yesterday and not finished)
   - Tasks due within 21 days
   - Tasks due in 3+ weeks
4. **Status Editing**: Edit task status directly in the dashboard with save/discard functionality
5. **Data Refresh**: Pull latest data from Google Sheets
6. **Share Links**: Generate filtered URLs with email-based access control
7. **Password Protection**: Access key "Tomi.2016" required

## Architecture
```
/
├── index.html          - Main HTML page
├── css/
│   └── styles.css      - Dark theme styling
├── js/
│   ├── app.js         - Main application logic
│   └── utils.js       - Helper functions
├── data/
│   ├── config.js      - Configuration (CSV URL, Apps Script URL, column mappings)
│   └── sample.csv     - Sample data file
├── scripts/
│   ├── apps_script_webapp_api.gs    - Apps Script for status updates
│   └── apps_script_pmo_emails.gs    - Apps Script for automated emails
└── server.py          - Simple HTTP server for Replit deployment
```

## Configuration
The application is configured via `data/config.js`:
- `csvUrl`: Published Google Sheets CSV endpoint
- `gsUpdateUrl`: Apps Script Web App URL for saving status changes
- `columns`: Column name mappings
- `estatusOptions`: Available status values

## Data Integration
- **Data Source**: Google Sheets (published as CSV)
- **Updates**: Via Apps Script Web App (POST requests)
- **Automated Emails**: Apps Script triggers on Mon/Wed/Fri at 8:00 AM (America/Santiago timezone)

## Access Control
1. **Password Access**: Default password "Tomi.2016"
2. **Shared Links**: URL parameters with email validation
   - Format: `?cliente=<Client>&proyecto=<Project>&share=1&email=<email>`
   - Access granted if email exists in the Email column for that Client/Project

## Recent Changes
- **2025-11-03**: Enhanced features
  - Implemented cascading filters (filters update dynamically based on selections)
  - Added "Finalizados" category in Status Breakdown section
  - Modified "Atrasados" to only show tasks with deadline before yesterday (not finished)
  - Added "Descartar cambios" (Discard changes) button next to "Guardar cambios"
  - Improved save functionality to refresh data and rebuild filters after saving
  - Added discard functionality to revert unsaved status changes
- **2025-11-03**: Initial Replit setup
  - Created Python HTTP server (server.py) to serve static files
  - Configured workflow to run on port 5000
  - Added cache-control headers to prevent caching issues

## Deployment Notes
- Server binds to 0.0.0.0:5000 for Replit compatibility
- Cache-Control headers added to ensure updates are visible
- No backend processing - all logic runs client-side
- External dependencies loaded via CDN

## Development
- Run: `python3 server.py`
- The server serves all files from the root directory
- No build process required
