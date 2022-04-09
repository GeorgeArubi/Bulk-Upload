# Uppy AWS-Companion built with Typescript, Express, React, and TailwindCSS

This application uses @uppy/companion with a custom AWS S3 configuration.
Files are uploaded to a randomly named directory inside the `whatever/` directory in a bucket.

## Run it

To run this template, clone this repository and then run these commands from the root folder:

## Backend commands
Run these commands from the root folder.

- `npm install` Install dependencies.
- `npm run build` Builds the backend app to the `build` directory.

## Frontend commands
Run these commands from the `client` folder.

- `npm run build` Builds the frontend app to the `build/client` directory.

Then, set up the `COMPANION_AWS_KEY`, `COMPANION_AWS_SECRET`, `COMPANION_AWS_REGION`, and `COMPANION_AWS_BUCKET` environment variables for @uppy/companion.

Then, again in the **repository root**, start this application by doing:

```bash
npm run start
```





