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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your actual Wix domain for production
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT'); // Added PUT method
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API Key check
  const apiKey = process.env.API_KEY;
  const authHeader = req.headers['authorization'];

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle GET request
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

  // Handle POST request
  else if (req.method === 'POST') {
    const { Nombre, Contraseña, email, tarjeta, monto } = req.body;

    if (!Nombre || !Contraseña || !email || !tarjeta || !monto || typeof monto !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
      const pool = await sql.connect(dbConfig);

      const result = await pool
        .request()
        .input('Nombre', sql.NVarChar, Nombre)
        .input('Contraseña', sql.NVarChar, Contraseña)
        .input('email', sql.NVarChar, email)
        .input('tarjeta', sql.NVarChar, tarjeta)
        .input('monto', sql.Float, monto)
        .query(`
          INSERT INTO Pruebas (Nombre, Contraseña, email, tarjeta, monto)
          VALUES (@Nombre, @Contraseña, @email, @tarjeta, @monto);
          SELECT SCOPE_IDENTITY() AS Consecutivo;
        `);

      const newConsecutivo = result.recordset[0].Consecutivo;

      res.status(201).json({ message: 'New record created', Consecutivo: newConsecutivo });

    } catch (err) {
      console.error('Error creating record:', err);
      res.status(500).json({ error: 'Error creating record' });
    }
  }

  //Handle PUT request (update record)
  else if (req.method === 'PUT') {
    const { Consecutivo, Nombre, Contraseña, email, tarjeta, monto } = req.body;

    if (!Consecutivo || typeof monto !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
      const pool = await sql.connect(dbConfig);

      const result = await pool
        .request()
        .input('Consecutivo', sql.Int, Consecutivo)
        .input('Nombre', sql.NVarChar, Nombre)
        .input('Contraseña', sql.NVarChar, Contraseña)
        .input('email', sql.NVarChar, email)
        .input('tarjeta', sql.NVarChar, tarjeta)
        .input('monto', sql.Float, monto)
        .query(`
          UPDATE Pruebas
          SET 
            Nombre = @Nombre,
            Contraseña = @Contraseña,
            email = @email,
            tarjeta = @tarjeta,
            monto = @monto
          WHERE Consecutivo = @Consecutivo;
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.status(200).json({ message: 'Record updated successfully' });
    } catch (err) {
      console.error('Error updating record:', err);
      res.status(500).json({ error: 'Error updating record' });
    }
  }

  // Fallback for unsupported methods
  else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
