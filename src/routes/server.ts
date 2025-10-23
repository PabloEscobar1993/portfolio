// src/server.ts

import express, { Request, Response } from 'express';
import path from 'path';

// Importa as rotas (que criaremos no Passo 3)
import portfolioRoutes from './routes/index.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================================
// Configurações do EXPRESS
// ==========================================================

// 1. Configura o EJS como o Template Engine
// A pasta 'views' será a raiz para os arquivos .ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// 2. Configura a pasta 'public' para arquivos estáticos (CSS, JS, Imagens)
// Permite que você acesse: http://localhost:3000/css/style.css
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. Middlewares para processar requisições (POST, PUT, DELETE)
// Necessário para processar dados de formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================================
// Definição das Rotas
// ==========================================================

// Usa o arquivo de rotas importado para todas as rotas da aplicação
app.use('/', portfolioRoutes);

// Rota de Erro 404 (deve ser a última rota a ser definida)
app.use((req: Request, res: Response) => {
    res.status(404).render('404', { title: 'Página Não Encontrada' });
});


// ==========================================================
// Inicialização do Servidor
// ==========================================================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Pressione CTRL+C para parar.');
});