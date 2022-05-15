import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; 

// const express = require('express');
// const dotenv = require('dotenv');
// const mysql = require('mysql2/promise');



dotenv.config();
type DataType = { id: number, name: string }

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'phone_book',
    password: 'root'

})

const app = express();
const port = process.env.PORT || 4000;
app.get('/', (request, response) => {
    pool.query('SELECT * FROM abonents')
        // .then((data) => response.json(data[1]))
        .then((data: any[]) => response.send(`
        <!DOCTYPE html>
        <html>
            <body>
                <main>
                    <ul>
                    ${data[0].map((item) => {
                        return (
                            `<li>
                                ${item.id}. 
                                ${item.name}
                            </li>`
                        )
                    }).join(' ')}
                    </ul>
                </main>
            </body>
        </html>

        `))
});

app.listen(port, () => console.log(`Running on port ${port}`));