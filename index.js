const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())

// verify jwt 
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).send({ message: 'unauthorized access' })
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err)
        return res.status(401).send({ message: 'unauthorized access' })
      }
      console.log(decoded)

      req.user = decoded
      next()
    })
  }
}

// database


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const foodRequests = client.db('community_food_hub').collection('foodRequests')
    // 1
    app.get('/foods', async (req, res) => {
     
      console.log(req.body)
      const result = await foodCollections.find({ status: 'available' }).toArray()
      res.json(result)
    })

    // 2

    app.post('/foods', async (req, res) => {
   
      const result = await foodCollections.insertOne(req.body)
      res.json(result)
    })

    //  3
    app.get('/api/foods/search', async (req, res) => {
      try {
        const { foodName } = req.query; // Corrected the query parameter name
        const result = await foodCollections.find({ foodName: { $regex: foodName, $options: 'i' } }).toArray(); // Converted the result to an array
        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Sending a generic error response
      }
    });

    // 4

    app.get('/api/sortedFoods', async (req, res) => {
      const sortOrder = req.query.order || 'asc'; // Default to ascending order if order is not provided
      try {
        let foods;
        if (sortOrder === 'asc') {
          foods = await foodCollections.find().sort({ expiredDateTime: 1 }).toArray(); // Ascending order
        } else {
          foods = await foodCollections.find().sort({ expiredDateTime: -1 }).toArray(); // Descending order
        }
        res.json(foods);
      } catch (error) {
        console.error('Error fetching sorted foods:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 5

    app.get('/api/foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await foodCollections.findOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 6

    app.get('/posted-food/:email', async (req, res) => {
      try {
        
        const email = req.params.email;
        const result = await foodCollections.find({ "donator.email": email }).toArray();
       
        res.json(result);
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // 7 put
    app.put('/foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const { userEmail, requestedDate, status, additionalNotes } = req.body; // Destructure the fields from req.body

        // Here, you can update the document in your collection using the received data
        const result = await foodCollections.updateOne({ _id: new ObjectId(id) }, { $set: { userEmail, requestedDate, status, additionalNotes } });

        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
// done 

    // update foods
    app.put('/update-foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const { foodName, status, additionalNotes, foodUrl, expiredDateTime, pickupLocation,foodQuantity } = req.body; // Destructure the fields from req.body

        // Here, you can update the document in your collection using the received data
        const result = await foodCollections.updateOne({ _id: new ObjectId(id) }, { $set: { foodName, status, additionalNotes, foodUrl, expiredDateTime, pickupLocation,foodQuantity } });

        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


// delete food
    app.delete('/delete-foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id)
        const result = await foodCollections.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    // jwt authorization  this is main file....

    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;
        console.log(user,'188line')
        const token = jwt.sign(user, process.env.DB_TOKEN_SECRET, {
          expiresIn: '356d'
        });
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        }).send({ success: true });
      } catch (error) {
        console.error('Error generating JWT:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    });
    
// clear cookies
    app.get('/logout', (req, res) => {
     res
     .clearCookie('token',{
       httpOnly: true,
       secure:process.env.NODE_ENV === 'production',
       sameSite:process.env.NODE_ENV === 'production'? 'none' :'strict',
       maxAge: 0,
     }) 
     .send({ success : true})
    })

    // 9 post










    // 8 get


    app.get('/foodRequests', async (req, res) => {
      try {
       

        const userEmail = req.query.userEmail; // Get the userEmail query parameter from the request
        console.log(userEmail)
        // Fetch food requests from the collection based on the userEmail
        const result = await foodCollections.find({ userEmail: userEmail }).toArray();
        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    // 10 get

    app.get('/update-food/:id', async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id)
        const result = await foodCollections.findOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });






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