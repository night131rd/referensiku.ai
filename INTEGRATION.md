# Frontend-Backend Integration for referensiku.ai

This document provides information about how the frontend and backend of referensiku.ai are connected.

## Setup

### Environment Variables

The frontend connects to the backend using the `NEXT_PUBLIC_API_URL` environment variable defined in the `.env` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change this URL if your backend is hosted elsewhere.

## API Integration

### API Client

The frontend uses an API client defined in `src/lib/api.ts` to communicate with the backend. This client provides functions for:

- Starting a search query
- Checking the status of a search
- Getting the answer and references for a completed search

### CORS Handling

To handle CORS (Cross-Origin Resource Sharing) issues, the frontend includes an API proxy route at `src/app/api/proxy/[...path]/route.ts` that forwards requests to the backend.

### Server Actions

The Next.js application uses server actions defined in `src/app/actions.ts` to handle user interactions. The `searchJournals` action connects to the backend and processes search requests.

## Search Flow

1. User submits a search query from the frontend
2. The frontend sends the query to the backend via the `searchJournals` action
3. The backend processes the search and returns a task ID
4. The frontend polls the backend for the task status until completion
5. Once completed, the frontend fetches the answer and references from the backend
6. Results are displayed to the user

## Error Handling

If the backend is unavailable or returns an error, the frontend falls back to mock data to ensure the UI continues to function.

## Bibliography Integration

Bibliography functionality is currently not implemented as it's still in development on the backend.
