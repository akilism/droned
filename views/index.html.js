import {
  default as React,
} from "react";

import {
  WebpackScriptEntry,
  WebpackStyleEntry,
} from "reacthtmlpack/lib/entry";

export default (
  <html>
    <head>
      <title>Droned Out</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <meta charSet="UTF-8" />
      <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />
      <link href='https://fonts.googleapis.com/css?family=Roboto+Slab:400,700,300,100' rel='stylesheet' type='text/css' />
      <WebpackStyleEntry
        chunkName="client"
        chunkFilepath="../scripts/client.js"
        configFilepath="../Client.webpackConfig.js"
      />

    </head>
    <body>
      <div id="react-container" />
      <script src="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js"></script>
      <WebpackScriptEntry
        chunkName="client"
        chunkFilepath="../scripts/client.js"
        configFilepath="../Client.webpackConfig.js"
      />
    </body>
  </html>
);
