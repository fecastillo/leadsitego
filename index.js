const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");


const TokenDinero = "5476255A-D84D-4F7B-87B2-C72B3CA8085B";
const TokenVivienda = "83D6D11D-D029-40C9-AB1E-AB423C63598C";
const TokenViviendaStorino = "1B4CEEAF-E046-442B-AD6C-732653A7B390";

const app = express();
const port = process.env.PORT || 3000;;
var form ="";
var idLead = "";

// Enter the Page Access Token from the previous step
const FACEBOOK_PAGE_ACCESS_TOKEN = 'EAAkRzhbejN8BACzn9IaTDfK59k70RcZBSF679ZCLRYpgMHCSTyBSwZAXvJNCeu1ITU70zHSCpjzh0ObVoZBLSjMxHwQidzNVHLGTOP051aXHbMAEhacByEVkZBWsLwhc1UaeOrNg2ZCiDFw0wD6xFGB44f9muUNUg0Yvp8DhlZBta8ESHPmCFB9Ge7mRfPQhGYZBpJNte44V5gZDZD';

// Accept JSON POST body
app.use(bodyParser.json());

// GET /webhook
app.get('/webhook', (req, res) => {
    // Facebook sends a GET request
    // To verify that the webhook is set up
    // properly, by sending a special challenge that
    // we need to echo back if the "verify_token" is as specified
    if (req.query['hub.verify_token'] === 'CUSTOM_WEBHOOK_VERIFY_TOKEN') {
        res.send(req.query['hub.challenge']);
        return;
    }
})

// POST /webhook
app.post('/webhook', async (req, res) => {
    // Facebook will be sending an object called "entry" for "leadgen" webhook event
    form = req.body.entry[0].changes[0].value.form_id;
    idLead = req.body.entry[0].changes[0].value.leadgen_id;
    if (!req.body.entry) {
        return res.status(500).send({ error: 'Invalid POST data received' });
    }

    // Travere entries & changes and process lead IDs
    for (const entry of req.body.entry) {
        for (const change of entry.changes) {
            // Process new lead (leadgen_id)
            await processNewLead(change.value.leadgen_id);
        }
    }

    // Success
    res.send({ success: true });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

async function processNewLead(leadId) {
    let response;
    var itego =  new Object();
    var obj = new Object();

    try {
        // Get lead details by lead ID from Facebook API
        response = await axios.get(`https://graph.facebook.com/v12.0/${leadId}/?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`);
    }
    catch (err) {
        // Log errors
        return console.warn(`An invalid response was received from the Facebook API:`, err.response.data ? JSON.stringify(err.response.data) : err.response);
    }

    // Ensure valid API response returned
    if (!response.data || (response.data && (response.data.error || !response.data.field_data))) {
        return console.warn(`An invalid response was received from the Facebook API: ${response}`);
    }
    // Extract fields

<<<<<<< HEAD
    switch (form) {
        case 665950964439281:
            itego.token = TokenDinero;
            break;
        case 809830906640455:
            itego.token = TokenVivienda;
            break;
        case 970738230263366:
            itego.token = TokenViviendaStorino;
            break;    
        default:
            break;
    }

    //itego.token = form == 665950964439281 ? TokenDinero : TokenVivienda;
=======
    itego.token = form == 665950964439281 ? TokenDinero : TokenVivienda;
>>>>>>> 84a02329e76a2e829d70e3a9ec653f9faf2b625b
    response.data.field_data.forEach(function(element) {obj[element.name] = element.values[0];})
    obj.telefono = parseInt(`8${obj.telefono.substring(obj.telefono.length - 10)}`);
    itego.prospecto = obj;


    console.log(response.data);
    console.log(itego);
    sendData(itego);

}

async function sendData(data) {
    let respuesta; 
    let mongoData = new Object();
    try{
        respuesta = await axios.post('https://autocredito.itego.com.ar/index.php?r=webService/apiLanding', data);
        //console.log(respuesta.data);
        mongoData.nombre = data.prospecto.nombre;
        mongoData.telefono = data.prospecto.telefono;
        mongoData.localidad = data.prospecto.localidad;
        mongoData.estado = respuesta.data.estado;
        mongoData.mensaje = respuesta.data.mensaje;
        mongoData.fecha = new Date();
        mongoData.formulario = form;
        mongoData.idLead = idLead;
        addRecord(mongoData);
        console.log(mongoData);
  
    }
    catch(err){
        console.log(err);
    }
}

async function addRecord(dataRecord){
  
    const uri = "mongodb+srv://app:%40Emilio595@leads.hsfok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const result = await client.db("leads").collection("leads").insertOne(dataRecord);
        console.log(`Registro agregado correctamente ID: ${result.insertedId}`);
    } 
    finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}