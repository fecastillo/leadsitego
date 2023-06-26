// Importar módulos necesarios
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

// Almacenar tokens de acceso en un objeto para facilitar su gestión
const tokens = {
    dinero: process.env.TOKEN_DINERO,
    viviendaLescano: process.env.TOKEN_LESCANO,
    viviendaAle: process.env.TOKEN_ALE,
    nueva_imagen_vivienda: process.env.TOKEN_NUEVO_IMAGEN_VIVIENDA,
    facebookPage: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
};

// Inicializar servidor Express y definir puerto
const app = express();
const port = process.env.PORT || 3000;

// Variables para almacenar datos de formulario e ID de cliente potencial
let form;
let idLead;

// Aceptar cuerpo JSON en solicitudes POST
app.use(bodyParser.json());

// Ruta GET /webhook
app.get('/webhook', (req, res) => {
    // Verificar que el webhook esté configurado correctamente
    if (req.query['hub.verify_token'] === process.env.CUSTOM_WEBHOOK_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
        return;
    }
});

// Ruta POST /webhook
app.post('/webhook', async (req, res) => {
    // Verificar que se haya recibido un objeto "entry" para el evento de webhook "leadgen"
    if (!req.body.entry) {
        return res.status(500).send({ error: 'Invalid POST data received' });
    }

    // Recorrer entradas y cambios y procesar ID de clientes potenciales
    for (const entry of req.body.entry) {
        for (const change of entry.changes) {
            // Procesar nuevo cliente potencial (leadgen_id)
            await processNewLead(change.value.leadgen_id, change.value.form_id);
        }
    }

    // Éxito
    res.send({ success: true });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});

// Función para procesar nuevo cliente potencial
async function processNewLead(leadId, form_id) {
    let response;
    let itego = {token: '', prospecto: {}};
    let obj = {};

    try {
        // Obtener detalles del cliente potencial mediante ID de la API de Facebook
        response = await axios.get(`https://graph.facebook.com/v12.0/${leadId}/?access_token=${tokens.facebookPage}`);
       //printLead(response);
       //console.log(response.data);
    } catch (err) {
        // Registrar errores
        console.warn(`An error occurred while trying to process a new lead:`, err);
        return console.warn(`An invalid response was received from the Facebook API:`, err.response.data ? JSON.stringify(err.response.data) : err.response);
    }

    // Verificar que se haya recibido una respuesta válida de la API
    if (!response.data || (response.data && (response.data.error || !response.data.field_data))) {
        return console.warn(`An invalid response was received from the Facebook API: ${response}`);
    }

    // Extraer campos del formulario y almacenarlos en un objeto
    if (form_id == 650993983620616 || form_id == 1175746696379045) {
        itego.token = tokens.dinero;
    } else if (form_id == 122081190913707 || form_id == 809830906640455) {
        itego.token = tokens.viviendaLescano;
    } else if (form_id == 6602994939723228 || form_id == 207302345223994) {
        itego.token = tokens.viviendaAle;
    } else if (form_id == 967442801256466) {
        itego.token = tokens.nueva_imagen_vivienda;
    }

    
    response.data.field_data.forEach(function(element) {itego.prospecto[element.name] = element.values[0];})
    
    itego.prospecto.telefono = parseInt(`92${itego.prospecto.telefono.substring(itego.prospecto.telefono.length - 10)}`);
    
    //itego.prospecto = obj;
    
    //console.log(response.data);
    
    console.log(itego);
    
    sendData(itego);
}

// Función para enviar datos a una URL específica
async function sendData(data) {
    try{
        respuesta = await axios.post('https://autocredito.itego.com.ar/index.php?r=webService/apiLanding', data);
        //console.log(respuesta.data);  
    } catch(err) {
        console.log(err);
    }
}