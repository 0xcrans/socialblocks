export default async function handler(req, res) {
  try {
    const response = await fetch(`https://api.near.social${req.url}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : null,
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*'); // Dostosuj do swojej domeny
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
