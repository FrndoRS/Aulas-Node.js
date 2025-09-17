import express from "express";
import { criaPedido, lePedidoPorId, lePedidos } from "../models.js";

export const rotasPedido = express.Router();

rotasPedido.post('/pedidos', async (req, res, next) => {
    const pedido = req.body;

res.statusCode = 400;

    if(!pedido?.produtos || !pedido.produtos.length) {
        const resposta = {
            erro: {
                mensagem: `O atributo 'produtos' não foi encontrado ou está vazio, porém é obrigatório para a criação do pedido`
            }
        };
        return res.send(resposta);
    }

   if (pedido?.valorTotal == null || pedido.valorTotal <= 0) {
        const resposta = {
            erro: {
                mensagem: `O atributo 'valorTotal' não foi encontrado ou é menor igual a zero, porém é obrigatório para a criação do pedido`
            }
        };
        return res.send(resposta);
    }

    try {
       const resposta = await criaPedido(pedido);
       res.status(201).send(resposta); // 201 indica q a criação de algo foi realizada com sucesso
    }catch (erro) {
        console.log('Falha ao criar o pedido', erro);

        const resposta = {
            erro: {
                mensagem: 'Falha ao criar o pedido'
            }
        };
        res.status(500).send(resposta);
    }
});

rotasPedido.get('/pedidos/:id', async (req, res, next) => {
     const id = req.params.id; 
    
            try{
                const resposta = await lePedidoPorId(id);
    
                res.statusCode = 200; 
    
                if(!resposta) { /*Ao inves de verificar se foi encontrado vai verificar se a reposta existe*/
                res.statusCode = 404;
            }
    
                res.send(resposta);
    
                return;
            } catch (erro){
                console.log('Falha ao buscar o pedido', erro);
                res.statusCode = 500;
    
                const resposta = {
                    erro: { 
                        mensagem: `Falha ao buscar o pedido ${id}` 
                    }
                };
    
                res.send(resposta);
    
                return;
            }

});

rotasPedido.get('/pedidos', async (req, res, next) => {
     try{
            const resposta = await lePedidos();
        
            res.statusCode = 200; 
        
            res.send(resposta);
        
            return;
        } catch (erro){
            console.log('Falha ao buscar pedidos', erro);
            res.statusCode = 500;
        
            const resposta = {
                erro: { 
                    mensagem: `Falha ao buscar pedidos` 
                }
            };
        
            res.send(resposta);
        
        }

});
