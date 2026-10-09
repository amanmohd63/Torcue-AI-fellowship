# Order Assistant Write-up

## Architecture
The application uses a standard decoupled client-server architecture:
1. **Frontend (React/Vite)**: A lightweight chat interface that communicates with the backend via REST.
2. **Backend (FastAPI)**: Serves a `/chat` endpoint. It receives the conversation history and coordinates with OpenAI.
3. **Agent/Tool Calling (OpenAI + Pandas)**: The core intelligence. The backend registers local Python functions (tools) mapped to a pandas DataFrame containing the e-commerce dataset (`orders.csv`).

## Tool Decision Logic
The agent decides when to use tools based on the system prompt and tool descriptions provided to the OpenAI API:
- When a user asks about a specific ID (e.g., "ORD-1025"), the LLM selects the `get_order_by_id` tool.
- When asked about aggregates (e.g., "Total revenue in August for Electronics"), the LLM maps parameters to `calculate_revenue`.
- For broader filtering ("How many cancelled orders?"), it uses `filter_orders`.
- For top customers, it uses `get_top_customer`.

OpenAI natively handles parameter extraction. The backend invokes the target function and feeds the structured JSON string back to the LLM so it can formulate a natural response.

## Guardrails & Error Handling
1. **Input Validation**: FastAPI/Pydantic automatically validates the structure of the incoming `/chat` request.
2. **Graceful Tool Failures**: If a user asks for a non-existent ID, the local function returns `{"error": "Order X not found"}`. The agent reads this and politely informs the user.
3. **API Resilience**: Catch blocks around the OpenAI client calls ensure that network issues or invalid API keys respond with a clear backend error rather than crashing the server.
4. **Data Isolation**: Read-only Pandas operations guarantee the original `orders.csv` is never accidentally mutated.

## Deployment Strategy
- **Backend (Render)**: Utilizes a `render.yaml` infrastructure-as-code approach to automatically pull the repository, install Python dependencies, and run Uvicorn. Secrets (OpenAI key) are injected via the Render Dashboard.
- **Frontend (Vercel)**: Connects to the GitHub repository. Vite is automatically detected. We use an environment variable `VITE_BACKEND_URL` to dynamically point the React app to the Render API instance.

## Future Improvements
Given more time, I would:
1. **Database Integration**: Replace the static CSV and Pandas in-memory dataframe with a proper PostgreSQL database or an ORM like SQLAlchemy for robust and scalable querying.
2. **Streaming Responses**: Implement Server-Sent Events (SSE) in FastAPI to stream chunks of the LLM response to the UI, reducing perceived latency.
3. **UI Enhancements**: Render markdown tables in the frontend when the agent lists orders, rather than just returning raw text.

## AI Tools Used
During development, AI (Gemini/OpenAI) assisted in rapidly scaffolding the Vite application structure, generating the synthetic `orders.csv` dataset according to the constraints, and providing boilerplate CSS for the chat interface to save time on styling.
