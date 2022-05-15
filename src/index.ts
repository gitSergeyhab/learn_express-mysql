import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; 


dotenv.config();

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
                <a href="/search">Search</a>
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


// app.get('/search/:queryName', (req, res) => {
//     const queryName = req.params.queryName;
//     pool.query(`
//         SELECT abonents.name, phones.number 
//         FROM abonents JOIN phones ON abonents.id = phones.abonent_id 
//         WHERE abonents.name LIKE ?
//     `, `%${queryName}%`)
//         // .then((data) => res.json(data))
//     .then((data: any[]) => res.send(`
//     <!DOCTYPE html>
//     <html>
//         <body>
//             <main>
//             <h3>Find : ${data[0].length}</h3>
//                 <ul>

//                 ${data[0].map((item) => `<li>${item.name} ${item.number}</li>`).join(' ')}
//                 </ul>
//             </main>
//         </body>
//     </html>

//     `))
// })


app.get('/search', async (req, res) => {
    const queryName = req.query.name;
    // console.log(req.query)
    
    const data: any[] = await pool.query(`
        SELECT abonents.name, phones.number 
        FROM abonents JOIN phones ON abonents.id = phones.abonent_id 
        WHERE abonents.name LIKE ?
    `, `%${queryName}%`);

    
    res.send(`
    <!DOCTYPE html>
    <html>
        <body>
            <main>
            <a href='/'>Main</a>
            <h3>Find : ${data[0].length}</h3>
                <ul>

                ${data[0].map((item) => `<li>${item.name} ${item.number}</li>`).join(' ')}
                </ul>
                <form method="GET" action="/search">
                    <label>
                        Enter Name
                        <input type='text' name='name' placeholder='name' value="${queryName || ''}"/>
                        <button type="submit">Search</button>
                    <label>
                </form>

            </main>
        </body>
    </html>

    `)
})

app.listen(port, () => console.log(`Running on port ${port}`));