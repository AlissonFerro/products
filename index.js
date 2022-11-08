const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

routes(app);

const server = app.listen(port, () => console.log(`listening on port ${port}`));

// const ENV = 'TEST'; 
// const ENV = 'PRODUCTION'; 

module.exports = server;
// module.exports = ENV;