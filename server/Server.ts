import {Express, Request, Response} from "express";
import express from "express";
import bodyParser from 'body-parser'
import companion from '@uppy/companion'
import * as path from "path";

const session = require('express-session')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const cors = require('cors')

const DATA_DIR = path.join(__dirname, 'tmp')

export class Server {

    private app: Express;

    constructor(app: Express) {
        this.app = app;

        this.app.use(cors({
            origin: ['http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'PATCH'],
          }))

        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000')
            next()
        })

        // Routes
        this.app.get('/', (req, res) => {
            res.setHeader('Content-Type', 'text/plain')
            res.send('Welcome to Companion')
        })

        this.app.use(bodyParser.json())
        this.app.use(cookieParser)
        this.app.use(session({
            secret: 'some-secret-II',
            resave: true,
            saveUninitialized: true,
        }))
          
        // Initialize uppy
        const uppyOptions = {
            providerOptions: {
                s3: {
                getKey: (req, filename, metadata) => `${req.user.id}/${filename}`,
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
            allowLocalUrls: true, // Only enable this in development
            acl: 'private',
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

        this.app.use('/companion', companion.app(uppyOptions))

        // handle 404
        this.app.use((req, res) => {
            return res.status(404).json({ message: 'Not Found' })
        })

        // handle server errors
        this.app.use((err, req, res, next) => {
            console.error('\x1b[31m', err.stack, '\x1b[0m')
            res.status(err.status || 500).json({ message: err.message, error: err })
        })
}

    public start(port: number): void {
        companion.socket(this.app.listen(port, (err?: any) => {
            if (err) throw err;
            console.log(`> Ready on localhost:${port}`);
            console.log('> Welcome to Companion!')
          }));
    }
}

// add companion emitter to keep track of the state of the upload
