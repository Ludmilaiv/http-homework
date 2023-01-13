const http = require('http');
const fs = require('fs');

const host = 'localhost';
const port = 8000;

const user = {
  id: 123,
  username: 'testuser',
  password: 'qwerty'
};

const cookieParse = (cookieString) => {
  const cookie = {};
  cookieString.split('; ').forEach(el => {
    const cookieArray = el.split('=');
    cookie[cookieArray[0]] = cookieArray[1];
  });
  return cookie;
}

const requestListener = (req, res) => {
  if (req.url == "/get") {
    if (req.method == "GET") {
      fs.readdir("files", "utf8", (err, data) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end('Что-то пошло не так');
          return;
        }
        res.writeHead(200);
        res.end(data.join(","));
      })
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else if (req.url == "/delete") {
    if (req.method == "DELETE") {
      if (req.headers.cookie) {
        const {authorized, userId} = cookieParse(req.headers.cookie);
        if (authorized && userId) {
          let buffer = '';
          req.on('data', chunk => {
            buffer += chunk;
          });
          req.on('end', () => {
            const {filename} = JSON.parse(buffer);
            if (filename) {
              fs.unlink(`files/${filename}.txt`, (err) => {
                if (err) {
                  console.log(err);
                  res.writeHead(500);
                  if (err.code === 'ENOENT') {
                    res.end('Файла с таким именем не существует');
                  } else {
                    res.end('Что-то пошло не так');
                  }
                  return;
                }
                res.writeHead(200);
                res.end(`Файл ${filename}.txt удален`);
              })
            } else {
              res.writeHead(400);
              res.end('Не указано имя файла');
            }
          });
          
        } else {
          res.writeHead(400);
          res.end('Пользователь не авторизирован');
        }
      } else {
        res.writeHead(400);
        res.end('Пользователь не авторизирован');
      }
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else if (req.url == "/post") {
    if (req.method == "POST") {
      if (req.headers.cookie) {
        const {authorized, userId} = cookieParse(req.headers.cookie);
        if (authorized && userId) {
          let buffer = '';
          req.on('data', chunk => {
            buffer += chunk;
          });
          req.on('end', () => {
            const {filename, content} = JSON.parse(buffer);
            if (filename && content) {
              fs.writeFile(`files/${filename}.txt`, content, 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  res.writeHead(500);
                  res.end('Что-то пошло не так');
                  return;
                }
                res.writeHead(200);
                res.end(`Файл ${filename}.txt создан`);
              })
            } else {
              res.writeHead(400);
              res.end('Не указано имя файла или контент');
            }
          });
          
        } else {
          res.writeHead(400);
          res.end('Пользователь не авторизирован');
        }
      } else {
        res.writeHead(400);
        res.end('Пользователь не авторизирован');
      }
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
  } else if (req.url == "/auth") {
    if (req.method == "POST") {
      let buffer = '';
      req.on('data', chunk => {
        buffer += chunk;
      });
      req.on('end', () => {
        const {username, password} = JSON.parse(buffer);
        if (username === user.username && password === user.password) {
          const cookieHeaders = [
            ['Set-Cookie', `userId=${user.id}; MAX_AGE=${60*60*24*2}`],
            ['Set-Cookie', `authorized=true; MAX_AGE=${60*60*24*2}`]
          ]
          res.writeHead(200, cookieHeaders);
          res.end('Авторизация прошла успешно');
        } else {
          res.writeHead(400);
          res.end('Неверный логин или пароль');
        }
      });
    } else {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }
  } else {
    res.writeHead(404);
    res.end('Error 404');
  }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Сервер запущен по адресу http://${host}:${port}`);
});