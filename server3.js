const express = require('express');
const app = express();
const axios = require('axios');
const {
    execSync
} = require('child_process');
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
async function getFromServe() {
    try {
        await axios.get(
            `${process.env.SERVER_REMOTE}/api/data/${process.env.SOURCE}`
        ).then(async response => {
            for (const item of response.data) {

                const weighingData = await axios.post(
                    `http://localhost:${process.env.PORT}/api/weighings`,
                   {data : item.weighing}
                );
    


                item.data.weighing = weighingData.data.data.id;
       item.data.from = null  ;

                const transferData = await axios.post(
                    `http://localhost:${process.env.PORT}/api/transports`,
                    {data :  item.data }
                );
    
                await axios.put(
                    `${process.env.SERVER_REMOTE}/api/data/${process.env.SOURCE}/${item.id}`,
                    { state: 'DONE' }
                  );
            }
        }).catch(error => {
            // Handle errors here
            console.error('Error fetching data:', error);
        });

       

    } catch (error) {
        console.error('Error:', error.message, error.response?.data);
    }
}



async function pushToServe() {
    try {
        const strapiResponse = await axios.get(
            `http://localhost:${process.env.PORT}/api/transports?populate=*&filters[receiver][id][$eq]=1&filters[isSync][$eq]=false`
        );


        // Use Promise.all to wait for all async operations to complete

        // ask wael for better code
        await Promise.all(
            strapiResponse.data.data.map(async (record) => {
                try {
                    const weighingData = {
                        gross: record.attributes.weighing.data.attributes.gross,
                        extruction_rate: record.attributes.weighing.data.attributes.extruction_rate,
                        unit_price: record.attributes.weighing.data.attributes.unit_price,
                        tare: record.attributes.weighing.data.attributes.tare,
                        total_price: record.attributes.weighing.data.attributes.total_price,
                        net: record.attributes.weighing.data.attributes.net,
                        hab: record.attributes.weighing.data.attributes.hab,
                        dal: record.attributes.weighing.data.attributes.dal,
                        tax: record.attributes.weighing.data.attributes.tax,
                        batch : null ,
                        state: "TRANSFERT"
                    };




                    const dataToUpdate = {
                        weight: record.attributes.weight,
                        vehicule: record.attributes.vehicule,
                        amount: record.attributes.amount ? record.attributes.amount : 0,
                        matricule: record.attributes.matricule,
                        transportation_price:  record.attributes.brut ?  record.attributes.transportation_price :0,
                        brut: record.attributes.brut ? record.attributes.brut : 0,
                        tar: record.attributes.tar ? record.attributes.tar : 0,
                        isSync: true,
                        from:  record.attributes.from && record.attributes.from.data ? record.attributes.from.data.id : null,
                        to: record.attributes.to && record.attributes.to.data ? record.attributes.to.data.id : null,
                        sender: record.attributes.sender && record.attributes.sender.data ? record.attributes.sender.data.id : null,
                        receiver: record.attributes.receiver && record.attributes.receiver.data ? record.attributes.receiver.data.id : null,
                    };
                    let destinationWarehouse = record.attributes.receiver.data.name.replaceAll(' ', '')

                    await axios.post(`${process.env.SERVER_REMOTE}/api/data`, {
                        destination: destinationWarehouse,
                        state: 'PENDING',
                        data: dataToUpdate,
                        weighing: weighingData
                    }).then(async response => {
                        await axios.put(`http://localhost:${process.env.PORT}/api/transports/${record.id}`, {
                            data: {
                                'isSync': true
                            }
                        });
    
                    }).catch(error => {
                        // Handle errors here
                        console.error('Error fetching data:', error);
                    });


                  
                } catch (error) {
                    console.error('Error processing record:', error.message);
                }
            })
        );

        console.log('Synchronization completed successfully');

    } catch (error) {
        console.error('Error retrieving data from Strapi:', error.message);
    }
}



app.listen(port, () => {
    console.log(`Server is 🚀 running on port ${port} 🎉🎉🎉`);
});

const syncInterval = 10000; // 30 seconds

setInterval(async () => {
    const isReachable = await isServerReachable(`https://8.8.8.8/`);

    if (isReachable) {
        getFromServe();
        pushToServe();
    } else {
        console.log('No INTERNET 😔🥺❌');
    }
}, syncInterval);