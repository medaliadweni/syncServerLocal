const express = require('express');
const app = express();
const axios = require('axios');
const { execSync } = require('child_process');
const ip = require('ip');
require('dotenv').config(); 

const port = 3000;
const localIPAddress = ip.address();

async function isServerReachable(server) {
  try {
    const response = await axios.get(server);
    console.log(server);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

function syncDatafromLocalToDistant() {  
  const options = {
    cwd: '../huilerie-api-js',
   // stdio: 'inherit', 
  };

  //const command = `npm run strapi transfer -- --to http://192.168.100.22:8811/admin --to-token ${process.env.STRAPI_TOKEN_TRANSFER} --force --exclude files`;
  const command = `npm run strapi transfer -- --to http://192.168.100.22:8811/admin  --to-token ${process.env.STRAPI_TOKEN_TRANSFER} --force`;

  try {
    execSync(command, options);
    console.log('Sync Successfully 😀😍🎉');
  } catch (error) {
    console.error(`Error sync 😔🥺: ${error.message}`);
  }
}

app.listen(port, () => {
  console.log(`Server is 🚀 running on port ${port} 🎉🎉🎉`);
});

const syncInterval = 30000; // 30 seconds

setInterval(async () => {
  const isReachable = await isServerReachable(`http://192.168.100.22:8811/admin`);
  
  if (isReachable) {
    syncDatafromLocalToDistant();
  } else {
    console.log('No INTERNET 😔🥺❌');
  }
}, syncInterval);
