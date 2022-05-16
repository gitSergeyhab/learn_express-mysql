import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; 
import bodyParser from 'body-parser'


dotenv.config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'phone_book',
    password: 'root', 
    port: 8889

})

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))

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
                                <a href="/abonent/${item.id}">
                                    ${item.id}. 
                                    ${item.name}
                                </a>
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
    
    const [data]: any[] = await pool.query(`
        SELECT abonents.name, phones.number, abonents.id
        FROM abonents JOIN phones ON abonents.id = phones.abonent_id 
        WHERE abonents.name LIKE ?
    `, `${queryName || ''}%`);


    
    res.send(`
    <!DOCTYPE html>
    <html>
        <body>
            <main>
            <a href='/'>Main</a>
            <h3>Find : ${data.length} </h3>
                <ul>

                        ${data.map((item) => `
                            <li>
                                <a href="/abonent/${item.id}">
                                    ${item.name} ${item.number}
                                </a>
                            </li>
                        `).join(' ')}
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
});


app.get('/search-dynamic', async (req, res) => {
    const queryName = req.query.name;
    // console.log(req.query)
    
    const [data]: any[] = await pool.query(`
        SELECT abonents.name, phones.number, abonents.id
        FROM abonents JOIN phones ON abonents.id = phones.abonent_id 
        WHERE abonents.name LIKE ?
    `, `${queryName || ''}%`);

    res.send(`
    <!DOCTYPE html>
    <html>
        <body>
        <script>
        const getList = (array) => (
            \`\${array.map((item) => \`
            <li>
                <a href="/abonent/\${item.id}">
                    \${item.name} \${item.number}
                </a>
            </li>
        \`).join(' ')}\`
        );

        const onInput = async () => {
            const input = document.querySelector('.input');
            const ul = document.querySelector('.ul');
            const data = await fetch('/search-dynamic-data?name=' + input.value);
            const jsonData = await data.json();
            const listLi = getList(jsonData);
            ul.innerHTML = listLi;

        };
        
        </script>
            <main>
            <a href='/'>Main</a>
            <form method="GET" action="/search">
                <label>
                    Enter Name
                    <input class="input" type='text' name='name' oninput="javascript:onInput()" placeholder='name' value="${queryName || ''}"/>
                <label>
            </form>
            <h3>Find : ${data.length} </h3>
                <ul class="ul">
                </ul>


            </main>
        </body>
    </html>

    `)
});

app.get('/search-dynamic-data', async (req, res) => {
    const queryName = req.query.name;
    const [data]: any[] = await pool.query(`
        SELECT abonents.name, phones.number, abonents.id
        FROM abonents JOIN phones ON abonents.id = phones.abonent_id 
        WHERE abonents.name LIKE ?
    `, `${queryName || ''}%`);

    res.json(data)


    
    
});


app.get('/abonent/:id', async(req, res) => {
    const { id } = req.params;

    const [data]: any[] = await pool.query(`
        SELECT abonents.name, phones.type, phones.number, phones.id
        FROM phones JOIN abonents ON abonents.id = phones.abonent_id 
        WHERE abonents.id = ?
    `, id)

    const [[dataName]]: any = await pool.query(`
        SELECT name
        FROM  abonents 
        WHERE abonents.id = ?
    `, id)

    // res.json(data[0])
    res.send(`
    <!DOCTYPE html>
    <html>
        <body>
            <main>
            <a href='/'>Main</a>
            <h3>Find : ${data.length} numbers of ${dataName.name}</h3>
                <ul>

                ${data.map((item) => `<li>Number: ${item.number}; ${item.type ? `type: ${item.type}` : ''} <a href="/remove-phone/${item.id}"> Remove</a> </li>`).join(' ')}
                </ul>
                <form method="POST" action="/add-number/${id}">
                    <input type="text" name="number" placeholder="number" required />
                    <input type="text" name="type" placeholder="type" />
                    <button type="submit"> Add the Number</button>
                </form>

            </main>
        </body>
    </html>
    `)
})


app.post('/add-number/:id', async(req, res) => {
    const { id } = req.params;
    const { type, number } = req.body;
    await pool.query(`
        INSERT INTO phones SET ?
    `, { abonent_id: id, type, number });

    res.redirect(`/abonent/${id}`)
})

app.get('/remove-phone/:id', async(req, res) => {
    const { id } = req.params;

    const [[data]]: any = await pool.query(`
        SELECT abonent_id, id
        FROM phones
        WHERE phones.id = ?
    `, id )

    await pool.query(`
        DELETE FROM phones WHERE id = ?
    `, data.id );

    res.redirect(`/abonent/${data.abonent_id}`)
})

app.listen(port, () => console.log(`Running on port ${port}`));