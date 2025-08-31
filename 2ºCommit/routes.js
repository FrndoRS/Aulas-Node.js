import { sequelize, criarProduto, leProdutos, leProdutoPorId, 
    atualizaProdutoPorId, deletaProdutoPorId} from './models.js'; 

export default async function rotas(req, res, dado) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === '/') {
        const { conteudo } = dado;

        res.statusCode = 200;

        const resposta = {
            mensagem: conteudo
        };

        res.end(JSON.stringify(resposta));
        return;
    }

    if (req.method === 'POST' && req.url === '/produtos') { /*novo: alteração de PUT para POST*/
        const corpo = [];

        req.on('data', (parte) => {
            corpo.push(parte);
        });

        req.on('end', async () => {
            const buffer = Buffer.concat(corpo);
            let produto;

            try {
                produto = JSON.parse(buffer.toString());
            } catch (erro) {
                res.statusCode = 400;
                const resposta = {
                    erro: {
                        mensagem: 'JSON inválido no corpo da requisição'
                    }
                };
                res.end(JSON.stringify(resposta));
                return;
            }

            res.statusCode = 400;

            if (!produto?.nome) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'nome' não foi encontrado, porém é obrigatório para a criação do produto`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }

             if (!produto?.preco) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'preco' não foi encontrado, porém é obrigatório para a criação do produto`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }
            try {
                const resposta = await criarProduto(produto);
                
                res.statusCode = 201;

                res.end(JSON.stringify(resposta));
                
                return;
            } catch (erro) {
              console.log('Falha ao criar o produto', erro);
              res.statusCode = 500;

                const resposta = {
                    erro: {
                        mensagem: `Falha ao criar o produto ${produto.nome}`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }
            /*RIP: fs.writeFile */
        });

        req.on('error', (erro) => {
            console.log('Falha ao processar a requisição', erro);

            res.statusCode = 400;

            const resposta = {
                erro: {
                    mensagem: 'Falha ao processar a requisição'
                }
            };

            res.end(JSON.stringify(resposta));
            return;
        });

        return;
    }
    
    /* A rota verifica se a url recebida segue o seguinte padrão /produtos/12345 
    se algm enviar /produtos/teste essa requisição entrará no nosso fluxo padrão de rota não encontrada*/
    if (req.method === 'PATCH' && req.url.split('/')[1] === 'produtos' && !isNaN(req.url.split('/')[2])) {
        const corpo = [];

        req.on('data', (parte) => {
            corpo.push(parte);
        });

        req.on('end', async () => {
            const buffer = Buffer.concat(corpo);
            const produto = JSON.parse(buffer.toString());


            res.statusCode = 400;

            if (!produto?.nome && !produto.preco) {
                const resposta = {
                    erro: {
                        mensagem: `Nenhum atributo foi encontrado, porém ao menos um é obrigatório para a atualização do produto`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }

            const id = req.url.split('/')[2];
            try{
                const resposta = await atualizaProdutoPorId(id, produto);
                 
                res.statusCode = 200;

                if(!resposta){  /* Verificação para caso n exista o produto */
                    res.statusCode = 404
                }
                
                res.end(JSON.stringify(resposta));

                return;
            } catch(erro) {
            
                console.log('Falha ao atualizar o produto', erro);
                    res.statusCode = 500;
                    
                    const resposta = {
                        erro: { mensagem: `Falha ao atualizar o produto ${produto.nome}` 
                        }
                    };
                    
                    res.end(JSON.stringify(resposta));
                    return;
            }
            /*RIP: A verificação - fs.access e fs.appendFile*/
    })

    req.on('error', (erro) => {
        console.log('Falha ao processar a requisição', erro);
        res.statusCode = 400;
        res.end(JSON.stringify({
            erro: { mensagem: 'Falha ao processar a requisição' }
        }));
    });
    return;
}
        if (req.method === 'DELETE' && req.url.split('/')[1] === 'produtos' && !isNaN(req.url.split('/')[2])) {
        const id = req.url.split('/')[2]; /*Recebe o id definido na URL*/

        try{
        const encontrado = await deletaProdutoPorId(id); /*trocamos a const de resposta para encontrado */

        res.statusCode = 204; 

        if(!encontrado) {
            res.statusCode = 404;
        }

        res.end();

        return;

        } catch (erro){
            console.log('Falha ao remover o produto', erro);
            res.statusCode = 500;

            const resposta = {
                erro: { 
                    mensagem: `Falha ao remover o produto ${id}` 
                }
            };

            res.end(JSON.stringify(resposta));
            return;
        }
        /*RIP: listener */
        /*RIP: req.on('end', () => {})*/
    }

   if (req.method === 'GET' && req.url.split('/')[1] === 'produtos' && !isNaN(req.url.split('/')[2])) {
        const id = req.url.split('/')[2]; 

        try{
            const resposta = await leProdutoPorId(id);

            res.statusCode = 200; 

            if(!resposta) { /*Ao inves de verificar se foi encontrado vai verificar se a reposta existe*/
            res.statusCode = 404;
        }

            res.end(JSON.stringify(resposta));

            return;
        } catch (erro){
            console.log('Falha ao buscar o produto', erro);
            res.statusCode = 500;

            const resposta = {
                erro: { 
                    mensagem: `Falha ao buscar o produto ${id}` 
                }
            };

            res.end(JSON.stringify(resposta));

            return;
        }
    }

   if (req.method === 'GET' && req.url === '/produtos') { /*novo*/
        try{
            const resposta = await leProdutos();

            res.statusCode = 200; 

            res.end(JSON.stringify(resposta));

            return;
        } catch (erro){
            console.log('Falha ao buscar o produtos', erro);
            res.statusCode = 500;

            const resposta = {
                erro: { 
                    mensagem: `Falha ao buscar o produtos` 
                }
            };

            res.end(JSON.stringify(resposta));

            return;
        }
    }
    res.statusCode = 404;

    const resposta = {
        erro: {
            mensagem: 'Rota não encontrada!',
            url: req.url
        }
    };

    res.end(JSON.stringify(resposta));
}