const client = require("./client");

const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const { Kafka, Partitioners } = require("kafkajs");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const kafkaClient = new Kafka({
  clientId: "my-app-producer",
  brokers: ["127.0.0.1:9092"],
  retry: undefined,
  connectionTimeout: 60000,
})

const producer = kafkaClient.producer({
})

app.get("/", (req, res) => {
  client.getAllMenu(null, (err, data) => {
    if (!err) {
      res.render("menu", {
        results: data.menu,
      });
    }
  });
});

var amqp = require("amqplib");

app.post("/placeorder", async (req, res) => {
  //const updateMenuItem = {
  var orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
  };

  // Send the order msg to RabbitMQ
  const connection = await amqp.connect("amqp://localhost");

  const channel = await connection.createChannel();
  const exchange = "order_exchange";

  channel.assertExchange(exchange, "direct", {
    durable: true,
  });

  channel.publish(exchange, req.body.type, Buffer.from(JSON.stringify(orderItem)), {
    persistent: true,
  })

  res.status(201).json({ message: "Order placed successfully" })
  console.log("[x] Sent '%s' to exchange '%s'", orderItem, req.body.type);
});

app.post("/placeorder-kafka", async (req, res) => {
  var orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
  };

  await producer.connect()
  const _res = await producer.send({
    topic: req.body.type,
    messages: [
      { value: JSON.stringify(orderItem) }
    ],
  })

  console.log(_res)

  res.status(201).json({ message: "Order placed successfully" })
  console.log("[x] Sent '%s' to topic '%s'", orderItem, req.body.type);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});

//var data = [{
//   name: '********',
//   company: 'JP Morgan',
//   designation: 'Senior Application Engineer'
//}];
