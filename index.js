require('dotenv').config();
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
const TokenDinero = process.env.TOKEN_DINERO;
const TokenVivienda = process.env.TOKEN_VIVIENDA;
const TokenViviendaStorino = process.env.TOKEN_STORINO;
const TokenViviendaGral = process.env.TOKEN_VIVIENDA_GENERAL;
const TokenAle = process.env.TOKEN_ALE;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const app = express();
const port = process.env.PORT || 3000;;
var form;
var idLead;
// Accept JSON POST body
app.use(bodyParser.json());

// GET /webhook
app.get('/webhook', (req, res) => {
    // Facebook sends a GET request
    // To verify that the webhook is set up
    // properly, by sending a special challenge that
    // we need to echo back if the "verify_token" is as specified
    if (req.query['hub.verify_token'] === process.env.CUSTOM_WEBHOOK_VERIFY_TOKEN) {
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
    console.log(`Server listening at http://localhost:${port}`)
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
        case 1175746696379045:
            itego.token = TokenViviendaGral;
            break;
        case 207302345223994:
            itego.token = TokenAle;
            break;
        default:
            break;
    }
    response.data.field_data.forEach(function(element) {obj[element.name] = element.values[0];})
    obj.telefono = parseInt(`92${obj.telefono.substring(obj.telefono.length - 10)}`);
    itego.prospecto = obj;
    console.log(response.data);
    console.log(itego);
    sendData(itego);

}

async function sendData(data) {
    try{
        respuesta = await axios.post('https://autocredito.itego.com.ar/index.php?r=webService/apiLanding', data);
        //console.log(respuesta.data);  
    }
    catch(err){
        console.log(err);
    }
}
