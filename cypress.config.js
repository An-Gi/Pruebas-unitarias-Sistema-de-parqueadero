const { defineConfig } = require("cypress");
const mysql = require('mysql2');


function queryTestDb(query, config) {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'parqueadero_user',      
    password: 'A84461976',      
    database: 'parqueadero' 
  });

  return new Promise((resolve, reject) => {
    connection.connect();
    connection.query(query, (error, results) => {
      connection.end(); 
      if (error) reject(error);
      else resolve(results);
    });
  });
}

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      
      on('task', {
        queryDb: (query) => {
          return queryTestDb(query, config);
        },
      });
    },
  },
});