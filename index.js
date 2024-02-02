import 'dotenv/config';
import app from './src/app.js';

const { HOST, PORT } = process.env;
const host = HOST || 'localhost';
const port = PORT || 3333;

app.listen( port, host, () => {
    console.log( `Server listen on ${ host }:${ port }` )
})