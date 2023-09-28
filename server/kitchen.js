#!/usr/bin/env node

var process = require('process');

const argv = process.argv

argv.splice(0, 2)

var amqp = require('amqplib');

async function startQueue() {
  const connection = await amqp.connect('amqp://localhost');

  const channel = await connection.createChannel();
  const exchange = 'order_exchange'

  await channel.assertExchange(exchange, 'direct', {
    durable: true
  });

  const queue = await channel.assertQueue('', {
    durable: true,
    exclusive: true
  })

  channel.prefetch(1)
  console.log("[*] Waiting for messages in %s. To exit press CTRL+C", queue.queue);

  argv.forEach(function(type) {
    channel.bindQueue(queue.queue, exchange, type)
  })

  channel.consume(queue.queue, function(msg) {
    var secs = msg.content.toString().split('.').length - 1;
    console.log("[x] Received");
    console.log(JSON.parse(msg.content));

    setTimeout(function() {
      console.log("[x] Done");
      channel.ack(msg);
    }, secs * 1000);
  }, {
    noAck: false,
    
  })
}

startQueue()