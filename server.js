const http = require('http');

const host = 'localhost';
const port = 8000;

const requestListener = (req, res) => {
  if (req.url == '/geekbrains') {
    res.writeHead(200);
    res.end('Успешно');
  } else {
    res.writeHead(404);
    res.end('Error 404');
  }
  
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Сервер запущен по адресу http://${host}:${port}`);
});

