var express = require('express'); 
var mustacheExpress = require('mustache-express');
var path = require('path');
var fs = require('fs');
var app = express();
const port = 8081;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/*// Pedido de GET para a raíz
app.get('/', (req, res) => {
 res.send(`Verbo: ${req.method} URL: ${req.url}`);
});

// Pedido de POST para a raíz
app.post('/', (req, res) => {
 res.send(`Verbo: ${req.method} URL: ${req.url} BODY: ${req.body}`);
});*/

//Listen e link na consola
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});