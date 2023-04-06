const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");


const TokenDinero = "5476255A-D84D-4F7B-87B2-C72B3CA8085B";
const TokenVivienda = "83D6D11D-D029-40C9-AB1E-AB423C63598C";
const TokenViviendaStorino = "1B4CEEAF-E046-442B-AD6C-732653A7B390";
const TokenViviendaGral = "C1E7EEBE-2640-4E38-9EBD-B08C58DD6A74";
const TokenAle = "BFBD61F8-C85C-4226-8A4B-EAA944984375";

const app = express();
const port = process.env.PORT || 3000;;
var form ="";
var idLead = "";

// Enter the Page Access Token from the previous step
// VENCE 07/12/2022
const FACEBOOK_PAGE_ACCESS_TOKEN = 'EAAkRzhbejN8BALDcUBoZA1GUyZArBVN9TZATqd9gNxJF3k2aM7wPcQYeYxw0qxEuecWZCDJg40B37QJMZCerkXcH6Lzje9aZCfdPmZBjt6ERIYRBJdIXNegxorUBtCDkGHcGUprXq7daUHj3UK7kBA3wh1fF93tocfxpetvYePGhZC3ncEVMXsWKibP4s6YTEfv6WA0yZBRNzOgZDZD';

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

    if(form ==665950964439281){
        itego.token = TokenDinero;
    }
    else if(form ==809830906640455){
        itego.token = TokenVivienda;
    }
    else if(form ==970738230263366){
        itego.token = TokenViviendaStorino;
    }
    else if(form == 1175746696379045){
        itego.token = TokenViviendaGral;
    }
    else if(form == 207302345223994){
        itego.token = TokenAle;
    }

    //itego.token = form == 665950964439281 ? TokenDinero : TokenVivienda;
    response.data.field_data.forEach(function(element) {obj[element.name] = element.values[0];})
    obj.telefono = parseInt(`92${obj.telefono.substring(obj.telefono.length - 10)}`);
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
  
try{
    respuesta = await axios.post('https://enumwb3hr5c7rvf.m.pipedream.net', dataRecord);
}
   catch(err){
        console.log(err);
    }
}
