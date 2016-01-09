(function () {
    'use strict';

    var express = require('express');
    var path = require('path');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var cookieSession = require('cookie-session');

    // Setup localStorage
    require('./config/localstorage');

    var routes = require('./routes/index');

    // @TODO - move api keys to local config file
    
    var app = express();

    app.set('trust proxy', 1); // trust first proxy
    
    // Configure reddit snoocore
    var reddit = require('./config/snoocore/index');
    var redditRoutes = require('./routes/reddit/index')(reddit, app);

    // Configure medium client
    var mediumConfig = require('./config/medium/index');
    var mediumRoutes = require('./routes/medium/index')(mediumConfig.medium, mediumConfig.client, app);
    
    // Configure twitter client
    var twitterClient = require('./config/twitter/index');
    var twitterRoutes = require('./routes/twitter/index')(twitterClient, app);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    
    // Setup session
    app.use(cookieSession({
        name: 'session',
        keys: ['key1', 'key2']
    }));

    app.use(express.static(path.join(__dirname, '../')));
    app.use(express.static(path.join(__dirname, '../client')));

    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With,X-Powered-By,Content-Type");
        if (req.method === 'OPTIONS') {
            res.status(200).end();
        } else {
            next();
        }
    });

    app.use('/', routes);
    
    // API routes
    app.use('/api/reddit', redditRoutes);
    app.use('/api/medium', mediumRoutes);
    app.use('/api/twitter', twitterRoutes);

    app.set('port', process.env.PORT || 3000);

    var server = app.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + server.address().port);
    });

    module.exports = app;
} ());
