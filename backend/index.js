import express from 'express';
import db from './db.js';

const app = express()


app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})