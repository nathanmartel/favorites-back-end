const client = require('../lib/client');

// async/await needs to run in a function
run();

async function run() {

    try {
        // initiate connecting to db
        await client.connect();

        // run a query to create tables
        await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    display_name VARCHAR(512),
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE favorites (
                    id SERIAL PRIMARY KEY NOT NULL,
                    user_id INTEGER REFERENCES users(id) NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    ticker VARCHAR(64) NOT NULL,
                    start_date VARCHAR(64) NOT NULL,
                    end_date VARCHAR(64) NOT NULL,
                    description VARCHAR(512)
            );
        `);

        console.log('create tables complete');
    }
    catch (err) {
        // problem? let's see the error...
        console.log(err);
    }
    finally {
        // success or failure, need to close the db connection
        client.end();
    }

}