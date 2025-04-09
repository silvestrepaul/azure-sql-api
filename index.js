const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, 
        trustServerCertificate: false
    }
};

app.get('/categorias', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Categorias');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener las categorias');
    }
});

app.get('/movimientos', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Movimientos');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los movimientos');
    }
});


app.post('/categorias', async (req, res) => {
    const { name } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
        pool.request()
        .input('Nombre', sql.VarChar, name)
        .query('INSERT INTO Categorias (Nombre) VALUES (@Nombre)');    
        res.status(201).send('Nueva categoria creada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear categoria');
    }
    console.log('Datos recibidos:', req.body);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});