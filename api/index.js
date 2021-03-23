const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

let daysDB;
let reservesDB;

MongoClient.connect('mongodb://localhost:27017/reserves', { useUnifiedTopology: true }, async function(err, client) {
    if (err) throw err

    reservesDB = client.db('reserves');
})

MongoClient.connect('mongodb://localhost:27017/days', { useUnifiedTopology: true }, async function(err, client) {
    if (err) throw err

    daysDB = client.db('days');
})

function objectIdWithTimestamp(timestamp) { 
    /* Convert string date to Date object (otherwise assume timestamp is a date) */ 
    if (typeof(timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }

    timestamp.setHours(0, 0, 0, 0);
    /* Convert date object to hex seconds since Unix epoch */
    var hexSeconds = Math.floor(timestamp/1000).toString(16);

    /* Create an ObjectId with that hex timestamp */
    var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");
    return constructedObjectId
}

app.get('/reserves', async (req, res) => {
    const reserves = await reservesDB.collection('reserves').find().toArray();
    res.json(reserves);
});

app.get('/days', async (req, res) => {
    const {date, size, duration, plan} = req.query
    try {
        const day = await daysDB.collection('days').findOne({ "_id": objectIdWithTimestamp(date) });
        console.log(day)
        if (plan === "Pay by Hour") {
            let times = day.available.filter( time =>
                time + duration > 24
            ); 
            res.json(times);
        } else if (size) {
            let times = [];
            var found = 0;
            var i = 0;
            while (i < day.capacity.length) {
                if (day.capacity[i] >= size) {
                    found++;
                } else {
                    found = 0
                }
                if (found == duration) {
                    times.push(i - duration + 9)
                    found--;
                }
                i++;
            }
        res.json(times);
        }
    } catch (err) {
        console.log(err)
        res.json(Array.from({length: 17 - duration}, (_, i) => i + 8))
    }
})

app.listen(3001, () => {
    console.log("lit")
});