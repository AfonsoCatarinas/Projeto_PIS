//ligação á base de dados, com os dados da db
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', //colocar a pass correspondente
    database: 'pis_moviesdb'
});

module.exports = pool;