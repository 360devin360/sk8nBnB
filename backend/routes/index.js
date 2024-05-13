// create an express router
const express = require('express');
const router = express.Router();

// test route
router.get('/hello/world',function(req,res){
    res.cookie('XSRF-TOKEN',req.csrfToken());
    res.send('Hello World!');
});

// export the router
module.exports = router