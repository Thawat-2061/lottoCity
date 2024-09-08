import http from 'http';
import express from 'express';
import { app } from './app';


// Middleware และ routing ของคุณที่นี่
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
