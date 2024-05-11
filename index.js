const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();
// middleware

const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json())



// database


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zuuvjs1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // collections
    const foodCollections = client.db('community_food_hub').collection('foodsCollection')
// 1
    app.get('/foods', async (req, res) => {
      console.log(req.body)
      const result = await foodCollections.find().toArray()
      res.json(result)
    })

// 2
 
 app.post('/foods', async (req, res) => {
      const result = await foodCollections.insertOne(req.body)
      res.json(result)
    })


















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);



















app.get('/', (req, res) => {
  res.send('hello world server is running hello')
})
app.listen(port, () => console.log(` listening on ${port}`));