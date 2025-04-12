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

  // Handle GET request to fetch records from Pruebas table
  if (req.method === 'GET') {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM Pruebas');
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Error fetching Pruebas:', err);
      res.status(500).json({ error: 'Error fetching Pruebas' });
    }
  } 
  // Handle POST request to insert a new record into Pruebas table
  else if (req.method === 'POST') {
    const { Nombre, Contraseña, email, tarjeta, monto } = req.body;

    if (!Nombre || !Contraseña || !email || !tarjeta || typeof monto !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
      const pool = await sql.connect(dbConfig);
      
      // Prepare SQL query to insert the data
      await pool
        .request()
        .input('Nombre', sql.NVarChar, Nombre)
        .input('Contraseña', sql.NVarChar, Contraseña)
        .input('email', sql.NVarChar, email)
        .input('tarjeta', sql.NVarChar, tarjeta)
        .input('monto', sql.Float, monto)
        .query(`
          INSERT INTO Pruebas (Nombre, Contraseña, email, tarjeta, monto)
          VALUES (@Nombre, @Contraseña, @email, @tarjeta, @monto)
        `);
      
      // Return success response
      res.status(201).json({ message: 'New record created' });

    } catch (err) {
      console.error('Error creating record:', err);
      res.status(500).json({ error: 'Error creating record' });
    }
  } 
  // Method not allowed
  else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
