import { Sequelize } from 'sequelize'; 

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './tic.db'
});

sequelize.authenticate();

export const Produto = sequelize.define('produto', {
    id:{
        type: Sequelize.INTEGER, /* Valor numerico inteiro*/
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING, /*ja q é nome é string*/
        allowNull: false, /*Não permite armazenamento de valores nulos*/
        unique: true
    },
    preco: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }

} ); 


export async function criarProduto(produto) { /*novo: criou uma constante, retornou ela e alterou ${produto.nome} para o q ta*/
   try {
    const resultado = await Produto.create(produto);
    console.log(`O produto ${resultado.nome} foi criado com sucesso!`);
    return resultado;
   } catch(erro){
    console.log('Erro ao criar o produto', erro);
    throw erro; /*novo: quando ocorrer um erro ele seja lançado para a função q o lanço*/
   }
}

export async function leProdutos() { /*alterado*/
   try {
    const resultado = await Produto.findAll()
    console.log(`Produtos consultados com sucesso!`, resultado);
    return resultado;
   } catch(erro){
    console.log('Erro ao buscar produto', erro);
    throw erro;
   }
}

export async function leProdutoPorId(id) { /*alterado*/
   try {
    const resultado = await Produto.findByPk(id)
    console.log(`Produto consultado com sucesso!`, resultado);
    return resultado;
   } catch(erro){
    console.log('Erro ao buscar produto', erro);
    throw erro;
   }
}

export async function atualizaProdutoPorId(id, dadosProduto) { 
   try {
    const resultado = await Produto.findByPk(id) /*alterado: problema na atualização */
    if(resultado?.id) {
       for (const chave in dadosProduto){
           if (chave in resultado) {
            resultado[chave] = dadosProduto[chave]
           }
       }
    resultado.save(); /*para persistir essas alterações no banco*/
    console.log(`Produto atualizado com sucesso!`, resultado);
    }
    return resultado;
   } catch(erro){
    console.log('Erro ao atualizar produto', erro);
    throw erro;

   }
}

export async function deletaProdutoPorId(id) { 
   try {
    const resultado = await Produto.destroy({where: {id:id}}) /*queremos buscar pelo id utilizando o id q recebemos por parametro na chamada da função */
    console.log(`Produto deletado com sucesso!`, resultado);
   } catch(erro){
    console.log('Erro ao deletar produto', erro);
    throw erro;
   }
}

export const Pedido = sequelize.define('pedido', { /*novo*/
     id: {
        type: Sequelize.INTEGER, /* Valor numerico inteiro*/
        primaryKey: true,
        autoIncrement: true
    },
    valor_total: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export const ProdutosPedido = sequelize.define('produtos_pedido', { /*novo*/
    id: {
        type: Sequelize.INTEGER, /* Valor numerico inteiro*/
        primaryKey: true,
        autoIncrement: true
    },
    quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    preco: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }
});

Produto.belongsToMany(Pedido, { through: ProdutosPedido }); /*Indica para o sequelize que um produto pd pertencer a diversos pedidos*/
Pedido.belongsToMany(Produto, { through: ProdutosPedido }); /*Um pedido pd ter diversos produtos */

/*Então ambas as relações sao definidas atraves dessa entidade intermediaria, assim o sequelize ele vai criar automaticamente colunas
nesse estrutura produtos pedidos, q n estao definidas no nosso modelo, mas q iram armazenar o id do pedido e o id do produto
relativo a linha q foi inserida para esse relacionamento entre as duas tabelas, como info adcional nessa linha poderemos armazenar a 
quant e o preco, ja q o preco atualiza com o tempo, mas o da venda deve continuar sendo o msm, n podendo ser alterado*/

export async function criaPedido(novoPedido) {
    try {
        const pedido = await Pedido.create({
            valor_total: novoPedido.valorTotal,
            estado: 'ENCAMINHADO'
        });

        /*Temos que mostrar para o sequelize q alem de criar pedido nos queremos estabelecer um relacionamento com uma serie de
        produtos que iram compor esse pedido, q esse produtos eles foram fornecidos no nosso params de novo pedido*/

        for (const prod of novoPedido.produtos) {
            /* sequelize tem q entender q nos queremos criar esse relacionamento entre a tabela de pedidos e a de produto*/
            const produto = await Produto.findByPk(prod.id);
            if (produto) {
                await pedido.addProduto(produto, {
                    through: { quantidade: prod.quantidade, preco: produto.preco }
                });
                console.log(`Produto ${produto.nome} associado ao pedido ${pedido.id}`);
            }
        }

        console.log('Pedido criado com sucesso!');
        return pedido;

    } catch (erro) {
        console.log('Falha ao Criar Pedido', erro);
        throw erro;
    }
};

export async function lePedidos(){
    try {
        const resultado = await ProdutosPedido.findAll();
        console.log('Pedidos foram consultados com sucesso', resultado);
        return resultado;
    }catch(erro){
        console.log('Falha ao consultar pedidos', erro)
        throw erro;
    }
}

export async function lePedidoPorId(id){
    try {
        const resultado = await Pedido.findByPk(id);
        console.log('Pedido foi consultado com sucesso', resultado);
        return resultado;

    }catch(erro){
        console.log('Falha ao consultar pedido', erro)
        throw erro;
    }
}

