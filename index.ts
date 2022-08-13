import express from 'express';
import bodyParser from 'body-parser'
import companion from '@uppy/companion'
import * as path from "path";

const session = require('express-session')
const fs = require('fs')
const cors = require('cors')

const port = 8080
const DATA_DIR = path.join(__dirname, 'uploads')

// Companion requires body-parser and express-session middleware.
// You can add it like this if you use those throughout your app.
//
// If you are using something else in your app, you can add these
// middleware in the same subpath as Companion instead.
const app = express();

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

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  next()
})

// Routes
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('Welcome to Companion')
})
          
// Initialize uppy
const uppyOptions = {
  providerOptions: {
    s3: {
      getKey: (req, filename, _metadata) => `${req.user.id}/${filename}`,
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
    path: '/companion',
  },
  filePath: DATA_DIR,
  secret: 'some-secret',
  uploadUrls: 'http://localhost:3000',
  debug: true,
  allowLocalUrls: true, // Only enable in development
  maxFileSize: 1000000000,
  corsOrigins: true,
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
  app.use('/companion', companion.app(uppyOptions));
} catch (error) {
console.log(error);
}

// add companion emitter to keep track of the state of the upload
const companionApp = companion.app(uppyOptions)
const { companionEmitter: emitter }: any = companionApp

emitter.on('upload-start', ({ token }) => {
  console.log('Upload started', token)

  function onUploadEvent ({ action, payload }) {
    if (action === 'success') {
      emitter.off(token, onUploadEvent) // avoid listener leak
      console.log('Upload finished', token, payload.url)
    } else if (action === 'error') {
      emitter.off(token, onUploadEvent) // avoid listener leak
      console.error('Upload failed', payload)
    }
  }
  emitter.on(token, onUploadEvent)
})
