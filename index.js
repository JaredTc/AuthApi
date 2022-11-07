const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt')

app.use(bodyparser.json());
const connect = require('./database')


app.get('/api/testing', (req, res) => {
    res.send('Hola desarrollador')
});

app.post('/api/signUp', async (req, res) => {

    // const id = req.body.id;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const rol = req.body.rol;
    let passwordHash = await bcrypt.hash(password, 8)

    connect.query('INSERT INTO users SET ?', {
        username: username,
        email: email,
        password: passwordHash,
        rol: rol
    })


    jwt.sign(username, 'secret_key', (err, token) => {

        if (err) {
            res.status(400).send({ msg: 'Error' });
        }
        else {
            res.send({ msg: 'Succes', token: token })
        }

    })


});

function verifyToken(req, res, next) {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(403);
    jwt.verify(token, "secret_key", (err, user) => {
        req.user = user;
        next();
    })

}

app.post('/api/signIn', verifyToken, (req, res) => {
    res.send("You are Authorized!");
})


app.put('/api/logOut', verifyToken, function (req, res) {
    const authHeader = req.header["authorization"];
    jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
        if (logout) {
            res.send({ msg: 'Has sido desconectado' });
        } else {
            res.send({ msg: 'Error' });
        }
    })
});


app.listen(9999, () => console.log('El servidor esta en funcionamiento'));
