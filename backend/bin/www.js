#!/usr/bin/env node
// import environment variables
require('dotenv').config()
const {port} = require('../config');
const app = require('../app');
const db = require('../db/models');
// check the database connection before starting the app
db.sequelize
    .authenticate()
    .then(()=>{
        console.log('Database connection success! Sequelize is ready to use...');
        // start listening for connections
        app.listen(port,  ()=> console.log(`Listening on port ${port}...`));
    })
    .catch((err) => {
        console.log('Database connectino failure.');
        console.error(err);
    });

