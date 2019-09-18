let mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'db'
});

// connect to the MySQL server
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  let createTodos = `create table if not exists notifications(
                          id int primary key auto_increment,
                          user_id int default null,
                          order_id int default null,
                          deleted tinyint(1) not null default 0,
                          readed tinyint(1) not null default 0,
                          text varchar(255),
                          notify_type varchar(255),
                          created_on varchar(255) not null,
                          updated_at varchar(255)      
                      )`;

  connection.query(createTodos, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.end(function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});