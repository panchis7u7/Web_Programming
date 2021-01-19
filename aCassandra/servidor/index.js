const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const casssandra = require('cassandra-driver');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors({origin: '*'}));

let cliente = new casssandra.Client({contactPoints: ['127.0.0.1'], localDataCenter: 'dc1', keyspace: 'prueba'})

cliente.connect(error => {
    if (error) throw error;
    console.log('Conexion con cassandra exitosa!');
})

app.listen('3001', () => {
    console.log("Servidor corriendo en el puerto 3001!");
});

//SELECT * FROM starbucks WHERE id_tienda = 0 AND estado = 'Michoacan';
//SELECT * FROM starbucks WHERE id_tienda = 580 AND estado = 'Michoacan';

app.post('/starbucks/add', (req, res) => {
    let getId = 0;
    cliente.execute('SELECT MAX(id_tienda) AS id FROM starbucks;').then(result => {
       getId =(result.rows[0].id) + 1;
       let query = `INSERT INTO starbucks (estado, id_tienda, ciudad, codigo_postal, direccion, latitud, longitud, no_tienda, nombre) VALUES `+ 
        `('${req.body.estado}', ${getId}, '${req.body.ciudad}', ` +
        `'${req.body.codigo_postal}', '${req.body.direccion}', ${req.body.latitud}, ` +
        `${req.body.longitud}, '${req.body.no_tienda}', '${req.body.nombre}');`;
        cliente.execute(query).then(result => {
        console.log('Fila insertada satisfactoriamente!');
        });
    res.send();
    });
});

app.post('/starbucks/update', (req, res) => {
    let query = `UPDATE starbucks SET ciudad='${req.body.ciudad}', ` +
    `no_tienda='${req.body.no_tienda}', nombre='${req.body.nombre}', codigo_postal='${req.body.codigo_postal}', ` +
    `direccion='${req.body.direccion}', latitud=${req.body.latitud}, longitud=${req.body.longitud} ` +
    `WHERE id_tienda = ${req.body.id_tienda} AND estado = '${req.body.estado}';`
    cliente.execute(query).then(result => {
        console.log('Fila actualizada satisfactoriamente!');
        res.send();
    });
});

app.post('/starbucks/delete', (req, res) => {
    let query = `DELETE FROM starbucks WHERE id_tienda = ${req.body.id_tienda} AND estado='${req.body.estado}';`;
    cliente.execute(query).then(result => {
        console.log('Fila eliminada satisfactoriamente!');
        res.send();
    });
});

app.get("/starbucks", (req, res) => {
    let query = "SELECT * FROM starbucks";
    cliente.execute(query).then(result => {
        console.log(result.rows[0]);
        res.send(JSON.stringify({status: 200, error: null, response: result}));
    }
)});
