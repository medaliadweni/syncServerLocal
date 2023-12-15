const express = require('express');
const app = express();
const axios = require('axios');
const { execSync } = require('child_process');
const ip = require('ip');
require('dotenv').config(); 

const port = 3000;
const localIPAddress = ip.address();
async function syncDatafromLocalToDistant() { 
try {


  const apiUrl = `http://${localIPAddress}:1337/api/auth/local`; // Replace with your actual authentication endpoint
  const credentials = {
    identifier: '541209',
    password: '541209'
  };
  
 await axios.post(apiUrl, credentials)
    .then(response => {
      const authToken = response.data.jwt; // Assuming the token is returned in the response
      console.log('Authentication Token:', authToken);
    })
    .catch(error => {
      console.error('Error obtaining token:', error.response ? error.response.data : error.message);
    });

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAyMDQ0MDU4LCJleHAiOjE3MDQ2MzYwNTh9.cZt89KQ-XiVrAfY-a0e7kcnRcefwva5ivJ6h0Hyem48', // Replace with your actual access token
    };
    const headersImport = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAyMDUzMjY5LCJleHAiOjE3MDQ2NDUyNjl9.PYPId_VrlJIE7A9IjLOFAwwao134IRzmPIT6vEKzMQ4', // Replace with your actual access token
    };
    const requestData = 
      {
        "slug": "custom:db",
        "search": "",
        "applySearch": true,
        "exportFormat": "json-v2",
        "relationsAsId": true,
        "deepness": 5,
      };
    
    const response = await axios.post(`http://${localIPAddress}:1337/import-export-entries/export/contentTypes`,requestData,{headers});
    
    const requestDataImport = 
    {
      "slug": "custom:db",
      "data": JSON.parse(response.data.data),
      "format": "json",
      "idField": "id"
  } ;
    
    const responsed = await axios.post(`http://${localIPAddress}:8811/import-export-entries/content/import`,requestDataImport,{headersImport});


    console.error(responsed.data);
  } catch (error) {
    console.error(error);
  }
}
  
app.listen(port, () => {
    console.log(`Server is 🚀 running on port ${port} 🎉🎉🎉`);
    syncDatafromLocalToDistant();
  });
  