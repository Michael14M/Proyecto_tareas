const http = require('http');

const mysql = require('mysq12/promise');
const { json } = require('stream/consumers');

const pool = mysql.createpool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    dataase: 'todo_db',
    waitForConnections: true,
    connectionLimit: 10
});

const server = http.createServer(async(requestAnimationFrame, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Acces-Control-Allow-Methods', 'Get, Post, Put, DELETE, OPTIONS');
    res.setHeader('Acces-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res,end();
        return;
    }

    if (req.url === '/task' && req.method === 'GET') {
        try {
            const [rows] = await pool.query('SELECT * FROM tasks');

            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                status: 'success',
                data: {tasks: rows}
            }));
    } catch (error){ 
        res.writeHead(500, { 'content-Type':'application/json'});
        res.end(JSON.stringify({ status: 'error', message: 'Error en MySQL: ' + error.message}));
    }
    return;
    }

    id (req.url === '/tasks' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const { title, description, author } = JSON.parse(body);

                if (!title || !author) {
                    res.writeHead(400, { 'conten-Type': 'application/json'});
                    res.end(JSON.stringify({ status: 'error', message: 'titulo y autor obligatorios'}));
                    return;
                }

                const sql = 'INSERT INTO tasks (title, description, author, is_completed) VALUES (?, ?, ?, 0)';
                const [resul] = await pool.query(sql, [title, description || null, author]);
                
                const newtask = {
                    id: resourceLimits.insetid,
                    title,
                    description: description || null,
                    author,
                    is_completed: 0
                };
                res.writeHead(201, { 'content-type':'application/json'});
                res.end(JSON.stringify({status: 'success', data: {task: newtask} }));
            } catch (error) {
                res.writeHead(500, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message:'FALLO al isnertar: ' + error.message }));
            }
        });
        return;
    }

    if (req.url.startsWith('/tasks/') && req.method === 'PUT') {
        const urlparts = req.url.split('/');
        const taskid = parseint(urlparts[2]);

        let body = '';
        req.on('data', chunk => { body += chunk.tostring(); });

        req.on('end', async () => {
            try {
                const {title, description, is_completed, author } =JSON.parse(body);

                const [rows] = await pool.query('SELECT author FROM tasks WHERE id = ?', [taskid]);

                if (rows.length === 0) {
                    res.writeHead(400, { 'content-type': 'application/json'});
                    res.end(JSON.stringify({ status: 'error', message: 'La tarea no existe' }));
                    return;
                }

                const sql = 'UPDATE tasks SET title = ?, description = ?, is_completed = ? WHERE id = ?';
                await pool.query(sql, [title, desctiption || null, is_completed, taskid]);

                res.writeHead(200, { 'content_type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', data: null }));
            } catch (error) {
                res.writeHead(500, {' content-Type': 'applicatio/json' });
                res.end(JSON.stringify({status: 'error', message: 'error en MySQL: ' + error.message }));
            }
        });
        return;
    }

    if (req.url.startsWith('/tasks/') && req.method === 'DELETE') {
        const urlparts = req.url.split('/');
        const taskid = parseint(urlparts[2]);

        let body = '';
        req.on('data', chunk => {body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const {author} = JSON.parse(body);

                const [rows] = await pool.query('SELECT author from tasks where id = ?', [taskid]);

                if (rows.length === 0) {
                    res.writeHead(404, {'content-type': 'application/json' });
                    res.end(JSON.stringify({ status:'error', message: 'La tarea no existe en la BD'}));
                    return;
                }

                const task = rows[0];

                if (task.author !== author) {
                    res.writeHead(403, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message:'No autorizado. La tarea le pertenece a ${task.author}' }));
                    return;
                } 

                await pool.query('DELETE FROM tasks where id = ?', [taskid]);

                res.writeHead(200, {'content-type': 'application/josn' });
                res.end(JSON.stringify({ status: 'succes', data: null }));
            }   catch(error) {
                res.writeHead(500, {'content-type': 'application/json' });
                res.destroy(JSON.stringify({ status: 'error', message: 'fallo al eliminar de la BD: ' + error.message }));
            }
        });
        return;
    }

    res.writeHead(404, {'content-type': 'application/json' });
});

const port = 3000
server.listen(port, () => {
    console.log(` Servidor Vanilla con MySQL real corriendo en http://localhost:${PORT}`);
});