import fs from 'fs';

export default function rotas(req, res, dado) {
    res.setHeader('Content-Type', 'application/json');

    /*Utilizando json como resposta podemos definir atributos específicos com base no contexto de cada rota
    além de permitir que esses atributos sejam facilmente documentados atendendo assim às especificações
    de design de uma API Restful*/

    if (req.method === 'GET' && req.url === '/') {
        const { conteudo } = dado;

        res.statusCode = 200;

        const resposta = {
            mensagem: conteudo
        };

        res.end(JSON.stringify(resposta));
        return;
    }

    /*OBS: não é necessário indicar no nome da rota o que ela faz, pois a utilização do método PUT por si só
    já mostra que ela tem finalidade de criar ou atualizar um recurso. Métodos PUT, POST, PATCH recebem info
    no corpo da requisição e temos que fazer alguns tratamentos específicos que geralmente não são necessários
    aos olhos de GET e LIST*/

    if (req.method === 'PUT' && req.url === '/arquivos') {
        const corpo = [];

        req.on('data', (parte) => {
            corpo.push(parte);
        });

        req.on('end', () => {
            const buffer = Buffer.concat(corpo);
            let arquivo;

            try {
                arquivo = JSON.parse(buffer.toString());
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

            if (!arquivo?.nome) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'nome' não foi encontrado, porém é obrigatório para a criação do arquivo`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }

            fs.writeFile(`${arquivo.nome}.txt`, arquivo?.conteudo ?? '', 'utf-8', (erro) => {
                if (erro) {
                    console.log('Falha ao criar o arquivo', erro);
                    res.statusCode = 500;

                    const resposta = {
                        erro: {
                            mensagem: `Falha ao criar o arquivo ${arquivo.nome}`
                        }
                    };

                    res.end(JSON.stringify(resposta));
                    return;
                }

                res.statusCode = 201;
                const resposta = {
                    mensagem: `Arquivo ${arquivo.nome} criado com sucesso`
                };

                res.end(JSON.stringify(resposta));
                return;
            });
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

    if (req.method === 'PATCH' && req.url === '/arquivos') {
        const corpo = [];

        req.on('data', (parte) => {
            corpo.push(parte);
        });

        req.on('end', () => {
            const arquivo = JSON.parse(corpo);

            res.statusCode = 400;

            if (!arquivo?.nome) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'nome' não foi encontrado, porém é obrigatório para a atualização do arquivo`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }

            /*Iremos incluir uma nova validacao condicional para garantir que alem do nome o atributo conteudo
            tbm seja obrigatorio, afinal não queremos que por um acidente alguem apague todo o conteudo do arquivo
            apenas por ter esquecido de enviar o conteudo atributo na requisição, o que deve ocorrer se apenas uma 
            string vazia for enviada nesse conteudo.*/

             if (!arquivo?.conteudo) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'conteudo' não foi encontrado, porém é obrigatório para a atualização do arquivo`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }

            /*Tbm sera necessario incluir uma verificação nova, pois como se trata de uma rota de atualização precisamos 
            garantir que o arquivo de fato exite antes de tentar atualiza-lo. Verificação necessaria para previnir
            erros e tambem possibilitar uma resposta adequada ao usuario e tbm usar o metodo access do fs. Esse metodo
            tem a finalidade de verificar se um usuario tem as permissoes necessarias para determinado caminho ou 
            arquivo armazenado em disco retornando um erro caso o arquivo não exista ou usario não posso executar alterações*/

            
        fs.access(`${arquivo.nome}.txt`, fs.constants.W_OK, (erro) => {
            if (erro) {
                console.log('Falha ao acessar o arquivo', erro);
                res.statusCode = erro.code === 'ENOENT' ? 404 : 403;
                res.end(JSON.stringify({
                    erro: { mensagem: `Falha ao acessar arquivo ${arquivo.nome}` }
                }));
                return;
            }

            fs.appendFile(`${arquivo.nome}.txt`, `\n${arquivo.conteudo}`, 'utf-8', (erro) => {
                if (erro) {
                    console.log('Falha ao atualizar o arquivo', erro);
                    res.statusCode = 500;
                    res.end(JSON.stringify({
                        erro: { mensagem: `Falha ao atualizar o arquivo ${arquivo.nome}` }
                    }));
                    return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({
                    mensagem: `Arquivo ${arquivo.nome} atualizado com sucesso`
                }));
            });
        });
    });

    req.on('error', (erro) => {
        console.log('Falha ao processar a requisição', erro);
        res.statusCode = 400;
        res.end(JSON.stringify({
            erro: { mensagem: 'Falha ao processar a requisição' }
        }));
    });

    return;
}

        if (req.method === 'DELETE' && req.url === '/arquivos') {
        const corpo = [];

        req.on('data', (parte) => {
            corpo.push(parte);
        }); /*Ele tinha comentado q o listener req.on data era so para rotas PUT, POST, PATCH, mas continua sendo usado
        pq nesse caso não temos um identificador numerico que possa ser enviado como um indexiador do arqivo, que precisa ser 
        resumido algo como delete arquivo 1,2,3,4,5. Mesmo não sendo o usual estamos enviado no corpo da requisição o identificador unico
        do arquivo a ser resumido ,que no nosso exemplo é o numero do arquivo */

        req.on('end', () => {
            const arquivo = JSON.parse(corpo);

            res.statusCode = 400;

            if (!arquivo?.nome) {
                const resposta = {
                    erro: {
                        mensagem: `O atributo 'nome' não foi encontrado, porém é obrigatório para a atualização do arquivo`
                    }
                };

                res.end(JSON.stringify(resposta));
                return;
            }
            
        fs.access(`${arquivo.nome}.txt`, fs.constants.W_OK, (erro) => {
            if (erro) {
                console.log('Falha ao acessar o arquivo', erro);
                res.statusCode = erro.code === 'ENOENT' ? 404 : 403;
                res.end(JSON.stringify({
                    erro: { mensagem: `Falha ao acessar arquivo ${arquivo.nome}` }
                }));
                return;
            }

            fs.rm(`${arquivo.nome}.txt`, (erro) => {
                if (erro) {
                    console.log('Falha ao remover o arquivo', erro);
                    res.statusCode = 500;
                    res.end(JSON.stringify({
                        erro: { mensagem: `Falha ao remover o arquivo ${arquivo.nome}` }
                    }));
                    return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({
                    mensagem: `Arquivo ${arquivo.nome} removido com sucesso`
                }));
            });
        });
    });

    req.on('error', (erro) => {
        console.log('Falha ao processar a requisição', erro);
        res.statusCode = 400;
        res.end(JSON.stringify({
            erro: { mensagem: 'Falha ao processar a requisição' }
        }));
    });

    return;
}
    res.statusCode = 404;

    const resposta = {
        erro: {
            mensagem: 'Rota não encontrada!',
            url: req.url
        }
    };

    res.end(JSON.stringify(resposta));

    // importante lembrar de colocar o return como último comando a ser usado no escopo da condicional if
    // de cada rota que não seja padrão. Afim de evitar que o nosso app tente enviar novamente uma resposta
    // a uma requisição que já foi atendida por uma das rotas específicas, como por exemplo a de GET
}

//Acabamos de desenvolver uma API rest utilizando method put localmente. Existem formas melhores de guardar 
//do q em um arquivo não estruturado, mas um caso de uso valido ser registro de sugestões dos clientes.