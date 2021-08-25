/* 
****
****
    http сервер с использованием "стандартных" библиотек node js 
****
****
*/
const http = require('http');
const fs = require('fs');

// обработчик всех запросов на наш сервер localhost:3000
const requestHandler = (req, res) => {
	const url = req.url;
	const method = req.method;

	// обрабатываем get запрос на index страницу
	// в ответ отправляем html страницу
	if (url === '/') {
		res.write('<html>');
		res.write('<head><title>Enter Message</title></head>');
		res.write(
			'<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>'
		);
		res.write('</html>');
		return res.end();
	}

	// обрабатываем post запрос на /message
	if (url === '/message' && method === 'POST') {
		const body = [];
		// получаем chunk'и содержемого POST запроса
		req.on('data', (chunk) => {
			console.log(chunk);
			body.push(chunk);
		});
		return req.on('end', () => {
			// собираем все chunk'и в buffer и переводим в строку
			// получаем строку 'message=${переданный текст с фронта}'
			const parsedBody = Buffer.concat(body).toString();
			// отделяем переденный текст
			const message = parsedBody.split('=')[1];
			// создаем текстовый файл в текущей директории и записываем туда наше сообщение
			fs.writeFile('message.txt', message, (err) => {
				res.statusCode = 302;
				res.setHeader('Location', '/');
				return res.end();
			});
		});
	}

	// обрабатываем все другие маршруты, не указанные выше
	res.setHeader('Content-Type', 'text/html');
	res.write('<html>');
	res.write('<head><title>My First Page</title><head>');
	res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
	res.write('</html>');
	res.end();
};

// раскоментировать строки для запуска http сервера без express.js
// const server = http.createServer(requestHandler);
// server.listen(3000);

/* 
****
****
    http сервер с использованием express.js
****
****
*/
const express = require('express');
// создаем express приложение
const app = express();
// добавляем middleware чтобы парсить body у запросов
app.use(express.urlencoded({ extended: false }));
// добавляем middleware для обработки get запроса на index страницу
app.get('/', (req, res) => {
	res.send(`
        <html>
            <head><title>Enter Message</title></head>
            <body>
                <form action="/message" method="POST">
                    <input type="text" name="message"><button type="submit">Send</button>
                </form>
            </body>
        </html>
    `);
});
// добавляем middleware для обработки post запроса /message
app.post('/message', (req, res) => {
	const { message } = req.body;
	fs.writeFile('message.txt', message, (err) => {
		res.status(200).redirect('/');
	});
});
// добавляем middleware для обработки всех остальных запросов
app.use((req, res) => {
	res.send(`
        <html>
	        <head><title>My First Page</title><head>
	        <body><h1>Hello from my Node.js Server!</h1></body>
	    </html>
    `);
});

// раскоментировать строку для запуска http сервера с express.js
// app.listen(3000);
