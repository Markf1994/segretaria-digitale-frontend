const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing OpenAI key' });
    return;
  }

  const { messages } = req.body || {};
  if (!messages) {
    res.status(400).json({ error: 'Missing messages' });
    return;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
};
