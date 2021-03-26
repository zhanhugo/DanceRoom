const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

let daysDB;
let reservesDB;

MongoClient.connect('mongodb://localhost:27017/days', { useUnifiedTopology: true }, async function(err, client) {
    if (err) throw err

    daysDB = client.db('days');

    await daysDB.collection('days').deleteMany({ "_id": {$gt: objectIdWithTimestamp(new Date()) }});
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

app.get('/days', async (req, res) => {
    const {date, size, duration} = req.query;
    const day = await daysDB.collection('days').findOne({ "_id": objectIdWithTimestamp(date) });
    if (day) {
        console.log(day)
        let times = [];
        var found = 0;
        var i = 0;
        while (i < day.capacity.length) {
            if (day.capacity[i] >= size) {
                found++;
            } else {
                found = 0;
            }
            if (found == duration) {
                times.push(i - duration + 9)
                found--;
            }
            i++;
        }
        res.json(times);
    } else {
        res.json(Array.from({length: 17 - duration}, (_, i) => i + 8));
    }
})

app.post('/days', async (req, res) => {
    const {date, size, duration, start} = req.body;
    const id = objectIdWithTimestamp(date);
    const day = await daysDB.collection('days').findOne({ "_id": id });
    if (day) {
        const capacity = day.capacity;
        for (var i = start - 8; i < start + duration - 8; i++) {
            capacity[i] -= size;
        }
        await daysDB.collection('days').updateOne( 
            { "_id": id}, 
            { $set: { "capacity": capacity } }
        );
    } else {
        const capacity = Array.from({length: 16}, (_, i) => 6);
        for (var i = start - 8; i < start + duration - 8; i++) {
            capacity[i] -= size;
        }
        await daysDB.collection('days').insertOne( { "_id": id, "capacity": capacity } );
    }
})


MongoClient.connect('mongodb://localhost:27017/reserves', { useUnifiedTopology: true }, async function(err, client) {
    if (err) throw err
    reservesDB = client.db('reserves');
})


app.get('/reserves', async (req, res) => {
    const reserves = await reservesDB.collection('reserves').find().toArray();
    res.json(reserves);
});

app.post('/reserves', async (req, res) => {
    await reservesDB.collection('reserves').insertOne(req.body);
});

app.listen(3001, () => {
    console.log("lit")
});