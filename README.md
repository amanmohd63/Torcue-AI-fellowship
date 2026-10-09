# Order Assistant

A full-stack web application with an AI assistant that answers questions about an online store's orders. Built with React (Vite), FastAPI, and OpenAI's tool-calling API.

## Architecture

- **Frontend**: React + Vite
- **Backend**: Python + FastAPI
- **AI Integration**: Gemini API (gemini-2.5-flash default) with function calling
- **Data processing**: Pandas (reading from `orders.csv`)

## Prerequisites

- Node.js (v18+)
- Python (3.9+)
- A Gemini API Key

## Setup & Running Locally

### 1. Clone the repository

```bash
git clone <repository_url>
cd order-assistant
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\\Scripts\\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create a .env file INSIDE the `backend` directory and add your Gemini API Key
# You can also specify the model using GEMINI_MODEL
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "GEMINI_MODEL=gemini-2.5-flash" >> .env

# Run the FastAPI server
uvicorn main:app --reload
```
The backend API will run at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install

# Optional: If your backend is not on localhost:8000, create a .env file 
# INSIDE the `frontend` directory with the following variable:
# echo "VITE_BACKEND_URL=http://localhost:8000" > .env

npm run dev
```
The frontend UI will run at `http://localhost:5173`.

## Tests

To run the backend tests:

```bash
cd backend
pytest test_main.py
```

## Deployment

- **Backend** is deployed using Render. (`render.yaml` provided). Make sure to set `GEMINI_API_KEY` in the Render dashboard.
- **Frontend** is deployed using Vercel. Set `VITE_BACKEND_URL` in the Vercel project settings to point to your deployed Render URL.

Live URLs:
- Frontend: `https://[your-vercel-deployment-url].vercel.app`
- Backend: `https://[your-render-deployment-url].onrender.com`
