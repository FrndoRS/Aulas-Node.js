import express from 'express';
import { sequelize, criarProduto, leProdutos, leProdutoPorId, 
    atualizaProdutoPorId, deletaProdutoPorId} from '../models.js'; 

export const rotasProduto = express.Router();

rotasProduto.post('/produtos', async (req, res, next) => {
            const produto = req.body;

            res.statusCode = 400

            if (!produto?.nome) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'nome' não foi encontrado, porém é obrigatório para a criação do produto`
                    }
                };

                res.send(resposta)
                return;
            }

             if (!produto?.preco) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'preco' não foi encontrado, porém é obrigatório para a criação do produto`
                    }
                };

                res.send(resposta)
                return;
            }
            try {
                const resposta = await criarProduto(produto);
                
                res.statusCode = 201;

                res.send(resposta)
                
                return;
            } catch (erro) {
              console.log('Falha ao criar o produto', erro);
              res.statusCode = 500;

                const resposta = {
                    erro: {
                        mensagem: `Falha ao criar o produto ${produto.nome}`
                    }
                };

                res.send(resposta)
                return;
            }
        });

        
        rotasProduto.patch('/produtos/:id', async (req, res, next) => {
            const produto = req.body;
            
            res.statusCode = 400;

            if (!produto?.nome && !produto.preco) {
                const resposta = {
                    erro: {
                        mensagem: `Nenhum atributo foi encontrado, porém ao menos um é obrigatório para a atualização do produto`
                    }
                };

                res.send(resposta)
                return;
            }

            const id = req.params.id; //para acessar é por req.params.placeholder escolhido
            try{
                const resposta = await atualizaProdutoPorId(id, produto);
                 
                res.statusCode = 200;

                if(!resposta){  /* Verificação para caso n exista o produto */
                    res.statusCode = 404
                }
                
                res.send(resposta)

                return;
            } catch(erro) {
            
                console.log('Falha ao atualizar o produto', erro);
                    res.statusCode = 500;
                    
                    const resposta = {
                        erro: { mensagem: `Falha ao atualizar o produto ${id}` 
                        }
                    };
                    
                    res.send(resposta)
                    return;
            }
    
});

rotasProduto.delete('/produtos/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const encontrado = await deletaProdutoPorId(id);

        if (!encontrado) {
            res.status(404).send();
            return;
        }

        res.status(204).send();
        return;

    } catch (erro) {
        console.log('Falha ao remover o produto', erro);
        res.status(500).send({
            erro: {
                mensagem: `Falha ao remover o produto ${id}`
            }
        });
        return;
    }
});


rotasProduto.get('/produtos/:id', async (req, res, next) => {
    const id = req.params.id; 

        try{
            const resposta = await leProdutoPorId(id);

            res.statusCode = 200; 

            if(!resposta) { /*Ao inves de verificar se foi encontrado vai verificar se a reposta existe*/
            res.statusCode = 404;
        }

            res.send(resposta);

            return;
        } catch (erro){
            console.log('Falha ao buscar o produto', erro);
            res.statusCode = 500;

            const resposta = {
                erro: { 
                    mensagem: `Falha ao buscar o produto ${id}` 
                }
            };

            res.send(resposta);

            return;
        }
    
});

rotasProduto.get('/produtos', async (req, res, next) => {
    try{
        const resposta = await leProdutos();
    
        res.statusCode = 200; 
    
        res.send(resposta);
    
        return;
    } catch (erro){
        console.log('Falha ao buscar produtos', erro);
        res.statusCode = 500;
    
        const resposta = {
            erro: { 
                mensagem: `Falha ao buscar produtos` 
            }
        };
    
        res.send(resposta);
    
    }
    
});