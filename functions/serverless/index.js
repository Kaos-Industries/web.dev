const {EleventyServerless} = require('@11ty/eleventy');

// Explicit dependencies for the bundler from config file and global data.
// The file is generated by the Eleventy Serverless Bundler Plugin.
require('./eleventy-bundler-modules.js');

async function handler(event) {
  const elev = new EleventyServerless('serverless', {
    path: event.path,
    query: event.queryStringParameters,
    inputDir: '.',
    functionsDir: './functions/',
  });

  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
      body: await elev.render(),
    };
  } catch (error) {
    // Only console log for matching serverless paths
    // (otherwise you’ll see a bunch of BrowserSync 404s for non-dynamic URLs during --serve)
    if (elev.isServerlessUrl(event.path)) {
      console.log('Serverless Error:', error);
    }

    return {
      statusCode: error.httpStatusCode || 500,
      body: JSON.stringify(
        {
          error: error.message,
        },
        null,
        2,
      ),
    };
  }
}

// Choose one:
// * Runs on each request: AWS Lambda (or Netlify Function)
// * Runs on first request only: Netlify On-demand Builder
//   (don’t forget to `npm install @netlify/functions`)

exports.handler = handler;

//const { builder } = require("@netlify/functions");
//exports.handler = builder(handler);