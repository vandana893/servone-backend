/**
 * AI Service for Intent Matching and Chat
 * Proxies requests to the Python AI Backend (SarvanBetaBackend-main)
 */
const resolveIntent = async (message, location) => {
  if (!message || typeof message !== 'string') {
    const error = new Error('Message is required');
    error.statusCode = 400;
    throw error;
  }

  const aiBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';
  
  try {
    const response = await fetch(`${aiBackendUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, location })
    });

    if (!response.ok) {
      let errorMsg = `AI Backend Error: ${response.status} ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.detail) errorMsg = JSON.stringify(errData.detail);
      } catch (e) {}
      console.error(errorMsg);
      const error = new Error(errorMsg);
      error.statusCode = response.status === 422 ? 400 : 500;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error communicating with AI backend:', err);
    if (err.statusCode) throw err;
    const error = new Error('Failed to connect to AI service');
    error.statusCode = 503;
    throw error;
  }
};

module.exports = {
  resolveIntent
};
