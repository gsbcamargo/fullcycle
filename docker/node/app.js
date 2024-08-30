const http = require('http');
const { Client } = require('pg');
const RETRY_DELAY = 5000;

function connectToDatabase() {
  const client = new Client({
    user: 'postgres',
    host: 'db',
    database: 'fullcycle',
    password: 'password',
    port: 5432,
  });

  client.connect((err) => {
    if (err) {
      console.error('Failed to connect to database. Retrying in 5 seconds...', err);
      return setTimeout(connectToDatabase, RETRY_DELAY);
    }
    
    console.log('Connected to database.');
    initializeServer(client);
  });
}

function initializeServer(client) {
  client.query(`
    CREATE TABLE IF NOT EXISTS names (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    );
  `, (err) => {
    if (err) {
      return console.error('Error creating table:', err.stack);
    }
    
    insertNames(client);
  });

  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
  
    if (req.method === 'GET' && req.url === '/') {
      client.query('SELECT name FROM names', (err, result) => {
        if (err) {
          if (!res.headersSent) {
            res.writeHead(500);
            res.end('Internal Server Error');
          }
          console.error('Error querying the database:', err.stack);
          return;
        }
  
        const namesList = result.rows.map(row => `<li>${row.name}</li>`).join('');
        const responseHTML = `<h1>Full Cycle Rocks!</h1><ul>${namesList}</ul>`;
  
        if (!res.headersSent) {
          res.writeHead(200);
          res.end(responseHTML);
        }
      });
      return;
    }
  
    if (!res.headersSent) {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  const PORT = process.env.PORT || 8081;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function insertNames(client) {
  const names = ['Lhara Leal', 'Joao Silva', 'Roberto Linhares', 'Alice dos Santos', 'Andressa Cavalcante'];

  names.forEach(name => {
    client.query('INSERT INTO names (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name], (err) => {
      if (err) {
        console.error('Error inserting name:', err.stack);
      }
    });
  });
}

connectToDatabase();
