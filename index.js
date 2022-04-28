const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const { response } = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dq2tc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).send({ message: "UnAuthorization access" });
  }
  const token = auth.split(" ")[1];
  console.log("this valid token ", token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
  // console.log(auth);
}

//mongoDB data async function
async function run() {
  try {
    //connection database
    await client.connect();
    //service collection
    const serviceCollection = client
      .db("geniusCarService")
      .collection("service");
    //order collection
    const orderCollection = client.db("geniusCarService").collection("order");
    // get all service data
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // find one data
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    // post
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });
    // delete
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
    //update
    app.put("/service/:id", async (req, res) => {
      const id = req.params.id;
      const updateService = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateService.name,
          description: updateService.description,
          price: updateService.price,
          img: updateService.img,
        },
      };
      const result = await serviceCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // order collection api data
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // show order in client side API
    app.get("/orders", verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (decodedEmail === email) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });
    // jwt token
    app.post("/getToken", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
  } finally {
  }
}
run().catch(console.dir);

// data  get
app.get("/", (req, res) => {
  res.send("genius car server is running");
});
// port listening
app.listen(port, () => {
  console.log("This port is running", port);
});
