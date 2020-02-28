// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');
const request = require('superagent');

// Initiate database connection
client.connect();

// Auth
const ensureAuth = require('./lib/auth/ensure-auth');
const createAuthRoutes = require('./lib/auth/create-auth-routes');
const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
            SELECT id, email, hash, display_name as "displayName" 
            FROM users
            WHERE email = $1;
        `,
            [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        console.log(user);
        return client.query(`
            INSERT into users (email, hash, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, email, display_name as "displayName";
        `,
            [user.email, hash, user.displayName]
        ).then(result => result.rows[0]);
    }
});

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data

// setup authentication routes
app.use('/api/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api/me', ensureAuth);


// API Routes
// *** TODOS ***
app.get('/api/quotes', async (req, res) => {
    try {
        const query = req.query.search;
        console.log('query is', query);

        // get the data from the third party API
        const result = await request.get(`${process.env.TIINGO_SEARCH_URL}?query=${query}&token=${process.env.TIINGO_KEY}`);

        res.json(result.body);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.get('/api/me/favorites', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT * FROM favorites
            WHERE user_id = $1;
        `,
        [req.userId]);
        // WTF? const favorites = await client.query(myQuery, [req.userId]);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/me/favorites', async (req, res) => {
    try {
        const result = await client.query(`
            INSERT INTO favorites (user_id, name, ticker, start_date, end_date, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *; 
        `,
        [req.userId, req.body.name, req.body.ticker, req.body.start_date, req.body.end_date, req.body.description]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/todos', async (req, res) => {
    const todo = req.body;

    try {
        const result = await client.query(`
            
        `,
            [/* pass in data */]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    const id = req.params.id;
    const todo = req.body;

    try {
        const result = await client.query(`
            
        `, [/* pass in data */]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    // get the id that was passed in the route:

    try {
        const result = await client.query(`

        `, [/* pass data */]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});