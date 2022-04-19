import express from 'express';
import bodyParser from 'body-parser'
import companion from '@uppy/companion'
import * as path from "path";

const session = require('express-session')
const fs = require('fs')
const cors = require('cors')

const app = express();
const port = 8080
const DATA_DIR = path.join(__dirname, 'tmp')

const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'OPTIONS', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Uppy-Versions', 'Accept'],
  exposedHeaders: ['Access-Control-Allow-Headers'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(session({
    secret: 'some-secret-II',
    resave: true,
    saveUninitialized: true,
}))
          
// Initialize uppy
const uppyOptions = {
  providerOptions: {
    s3: {
      getKey: (req, filename, metadata) => `uppy/${Math.random().toString(32).slice(2)}/${filename}`,
      key: process.env.COMPANION_AWS_KEY,
      secret: process.env.COMPANION_AWS_SECRET,
      bucket: process.env.COMPANION_AWS_BUCKET,
      region: process.env.COMPANION_AWS_REGION,
    },
    // you can also add options for additional providers here
  },
  server: {
    host: 'localhost:8080',
    protocol: 'http', // 'http' || 'https'
  },
  filePath: DATA_DIR,
  secret: 'some-secret',
  uploadUrls: 'http://localhost:3000',
  debug: true,
  allowLocalUrls: true, // Only enable in development
  maxFileSize: 1000000000,
}

// Create the data directory here for test purposes only
try {
  fs.accessSync(DATA_DIR)
} catch (err) {
  fs.mkdirSync(DATA_DIR)
}
process.on('exit', () => {
  fs.rmSync(DATA_DIR, { recursive: true, force: true })
})

try {
  const server = app.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on localhost:${port}`);
    console.log('> Welcome to Companion!')
  })
  companion.socket(server);
  app.options('*', cors(corsOptions));
  app.use(companion.app(uppyOptions));
} catch (error) {
console.log(error);
}

// add companion emitter to keep track of the state of the upload
