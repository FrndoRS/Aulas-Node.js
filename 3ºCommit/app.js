import sqlite3 from 'sqlite3'; 
import express from 'express';
import bodyParser from 'body-parser';

import { rotasProduto } from './routes/produtos.js';
import { rotasPedido } from './routes/pedidos.js';

import { sequelize } from './models.js';

const app = express();

/*novo: next é pra mandar para o prox middlewares*/

app.use(bodyParser.json());

app.use(rotasProduto);

app.use(rotasPedido);

/* RIP: fs.writeFile e fs.readFile - Pois agora temos q indicar para o nosso servidor http q partir de agora é a
aplicação express que sera responsavel por processar as requisições e q n será mais papel da função de rotas */

async function inicializaApp(){ /*Novo: DB veio para cá e mudamos o nome pq a function n inicia mais so servidor http*/
    const db = new sqlite3.Database('./tic.db', (erro) => {
        if (erro) {
            console.log('Falha ao inicializar o banco de dados');
            return;
        }
        console.log('Banco de dados inicializado');
    }) 
    
    await sequelize.authenticate();
    await sequelize.sync();

    const porta = 3000;

   app.listen(porta);

};

inicializaApp();
