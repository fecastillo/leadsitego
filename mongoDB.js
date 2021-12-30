const { MongoClient } = require('mongodb');


async function addRecord(dataRecord){
  
    const uri = "mongodb+srv://app:%40Emilio595@leads.hsfok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    const client = new MongoClient(uri);


    try {
        await client.connect();
        const result = await client.db("leads").collection("leads").insertOne(dataRecord);
        console.log(`Registro agregado correctamente ID: ${result.insertedId}`);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

