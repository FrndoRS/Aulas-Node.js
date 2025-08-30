import http from 'http';
import fs from 'fs';
import rotas from './routes.js';

// o Sync deixa assincrono, tiramos o sync para realizar encapsulamento
    fs.writeFile('./mensagem.txt', 'Olá, TIC em Trilas do arquivo!', 'utf-8', 
    (erro) => {
        if (erro) {
            console.log('Falha ao escrever o arquivo', erro);
            return;
        }
        console.log('Arquivo criado com sucesso');
    });

    // o Sync é para deixar assincrono, tiramos o sync para realizar encapsulamento
    fs.readFile('./mensagem.txt', 'utf-8', 
        (erro, conteudo) => {
        if (erro) {
            console.log('Falha na leitura do arquivo', erro);
            return;
        }

        console.log(`Conteudo: ${conteudo}`);
        
        iniciaServidorHttp(conteudo)
    });


    function iniciaServidorHttp(conteudo){
    const servidor = http.createServer((req, res) => {
        rotas(req, res, { conteudo });
    });

    const porta = 3000;
    const host = 'localhost'

    servidor.listen(porta, host, () => {
    console.log(`Servidor executado em http://${host}:${porta}/`)
});

};
