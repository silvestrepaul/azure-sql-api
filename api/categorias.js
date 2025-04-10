import sql from 'mssql';

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

export default async function handler(req, res) {
  // Set CORS headers to allow any domain (for testing) or your Wix domain
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or use your Wix domain (e.g., 'https://your-wix-site.com')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Allow GET and POST methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header
  
  // Handle OPTIONS requests (preflight request for CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond to OPTIONS request
  }

  // Add API Key validation in the Authorization header
  const apiKey = process.env.API_KEY;  // Retrieve API Key from environment variables
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    // If API Key is missing or incorrect, return 401 Unauthorized
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle GET request to fetch categories
  if (req.method === 'GET') {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM Categorias');
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Error fetching categories' });
    }
  } 
  // Handle POST request to create a new category
  else if (req.method === 'POST') {
    const { name } = req.body;
    try {
      const pool = await sql.connect(dbConfig);
      await pool
        .request()
        .input('Nombre', sql.VarChar, name)
        .query('INSERT INTO Categorias (Nombre) VALUES (@Nombre)');
      res.status(201).json({ message: 'New category created' });
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ error: 'Error creating category' });
    }
  } 
  // Method not allowed
  else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
