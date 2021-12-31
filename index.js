const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");


const TokenDinero = "5476255A-D84D-4F7B-87B2-C72B3CA8085B";
const TokenVivienda = "83D6D11D-D029-40C9-AB1E-AB423C63598C";

const app = express();
const port = process.env.PORT || 3000;;
var form ="";

// Enter the Page Access Token from the previous step
const FACEBOOK_PAGE_ACCESS_TOKEN = 'EAAkRzhbejN8BANjF3EHiHVfwbIeWVzbiXhuZA8UMH7dvCACe6ZAIoNCw7uAqaZAQqcxUwqitMoy6MwQV1feKbFnoQ93qsT6LWwP3ltEVjNJ7s2zZBoFq59lr9ca5VaErHDyVGZBfp5faul1pHyJZBQmjzTXBtJqoB1SMZAmDEcoXiPD7uint2A68RgPcNMwYC0ZD';

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

    itego.token = form == 825951068323717 ? TokenDinero : TokenVivienda;
    itego.prospecto = new Object();
    itego.prospecto.nombre = response.data.field_data[0].values[0];
    itego.prospecto.telefono = parseInt("7"+response.data.field_data[2].values[0].substring(response.data.field_data[2].values[0].length - 10));
    itego.prospecto.localidad = response.data.field_data[1].values[0];
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
<<<<<<< HEAD
    }    
=======
    }
>>>>>>> 41805f7eb1c7a226f5bd0e080e05d7b15474f992
    finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}
