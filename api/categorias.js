import sql from 'mssql';

res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
  if (req.method === 'GET') {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM Categorias');
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener las categorías' });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body;
    try {
      const pool = await sql.connect(dbConfig);
      await pool
        .request()
        .input('Nombre', sql.VarChar, name)
        .query('INSERT INTO Categorias (Nombre) VALUES (@Nombre)');
      res.status(201).json({ message: 'Nueva categoría creada' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear la categoría' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
