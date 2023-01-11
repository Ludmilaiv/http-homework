const http = require('http');
const fs = require('fs');

const host = 'localhost';
const port = 8000;

const requestListener = (req, res) => {
  if (req.url == "/get") {
    if (req.method == "GET") {
      fs.readdir("files", "utf8", (err, data) => {
        if (err) console.log(err);
        res.writeHead(200);
        res.end(data.join(","));
      } )
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else if (req.url == "/delete") {
    if (req.method == "DELETE") {
      res.writeHead(200);
      res.end('success');
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else if (req.url == "/post") {
    if (req.method == "POST") {
      res.writeHead(200);
      res.end('success');
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else if (req.url == "/redirect") {
    if (req.method == "GET") {
      res.writeHead(302, {
        'Location': '/redirected'
      });
      res.end();
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else if (req.url == "/redirected") {
    res.writeHead(200);
    res.end('Ресурс теперь постоянно доступен по адресу /redirected');
  } else {
    res.writeHead(404);
    res.end('Error 404');
  }
}

const server = http.createServer(requestListener);
server.listen( port, host, () => {
  console.log( `Сервер запущен по адресу http://${host}:${port}` );
} );