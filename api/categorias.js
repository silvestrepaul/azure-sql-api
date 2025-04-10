// /api/categorias.js (Vercel API)

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allow requests from any origin (You can restrict this to your Wix site)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle preflight CORS request (OPTIONS)
  if (req.method === 'OPTIONS') {
      return res.status(200).end();  // Respond to preflight request with 200 status
  }

  // Retrieve the Authorization header
  const apiKey = req.headers['authorization'];

  // Check if the API key is missing or incorrect
  if (!apiKey || apiKey !== 'Bearer Emt250863*') {
      return res.status(401).json({ error: 'Unauthorized' });  // 401 Unauthorized if API key is invalid
  }

  // If API key is valid, return the categories data
  res.status(200).json({
      categories: [
          { id: 1, name: 'Category 1' },
          { id: 2, name: 'Category 2' },
          { id: 3, name: 'Category 3' },
      ]
  });
}
