import express from 'express';
import type { Request, Response, NextFunction} from 'express'; // Removido NextFunction, pois não é usado nessas rotas
// O EJS não precisa ser importado, apenas configurado no Express.

const app = express();
const PORT = 3000;

// ==========================================================
// Tipagem e Dados em Memória
// ==========================================================

// Define a interface para garantir a tipagem dos projetos
interface Projeto {
    id: number;
    titulo: string;
    tecnologias: string;
    descricao: string;
    link: string;
}

// Simulação de "Banco de Dados" em memória para os projetos
const projetos: Projeto[] = [
    { id: 1, titulo: "Projeto X - E-Commerce", tecnologias: "HTML, CSS, Node.js", descricao: "Descrição do projeto X.", link: "#" },
    { id: 2, titulo: "Projeto Y - API REST", tecnologias: "TypeScript, Express", descricao: "Descrição do projeto Y.", link: "#" },
];

// ==========================================================
// Configurações do Express
// ==========================================================

// Configuração do EJS como View Engine
app.set('view engine', 'ejs');
// Define o diretório das views
app.set('views', './views');

// Configuração para servir arquivos estáticos (CSS, JS, Imagens)
app.use(express.static('public'));

// Middleware para processar dados de formulário (body parser)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Senha simples e fixa para demonstração
const ADMIN_PASSWORD = "123";

// Novo Middleware: Verifica se a autenticação foi bem-sucedida
const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
    // 1. Verifica se a chave 'auth=true' está na URL
    const isAuthenticated = req.query.auth === 'true';

    if (isAuthenticated) {
        // Se autenticado, prossiga para a rota (ex: /admin)
        next();
    } else {
        // Se não autenticado, redireciona para a página de login
        res.redirect('/login');
    }
};
// ==========================================================
// ROTAS DE APRESENTAÇÃO (GET)
// ==========================================================

// ROTA 1: Página Inicial (GET)
app.get('/', (req: Request, res: Response) => {
    const dadosPortifolio = {
        nome: "Nome Completo do Aluno",
        cargo: "Estudante de Desenvolvimento Web",
        biografia: "Uma breve biografia sobre sua jornada acadêmica e profissional.",
        linkedin: "https://www.linkedin.com/in/seu-perfil",
        github: "https://github.com/seu-perfil",
    };
    
    res.render('index', { dados: dadosPortifolio });
});

// ROTA 2: Projetos (GET) - Demonstração de Renderização Dinâmica
app.get('/projetos', (req: Request, res: Response) => {
    res.render('projetos', { listaProjetos: projetos });
});


// ==========================================================
// ROTAS DE GERENCIAMENTO/CRUD (ADMIN)
// ==========================================================

// Rota 3: ADMIN - Ler/Listar (GET) - Exibe o formulário e a lista para CRUD
app.get('/admin', adminAuth,(req: Request, res: Response) => {
    res.render('admin-crud', { listaProjetos: projetos });
});

// Rota 4: ADMIN - Criar (POST)
app.post('/admin/projetos',(req: Request, res: Response): void => {
    // Adicionado ': void' para resolver o erro de tipagem no res.redirect/console.log
    const { titulo, tecnologias, descricao, link } = req.body;
    
    // Lógica para gerar um novo ID
    const newId = projetos.length > 0 ? Math.max(...projetos.map(p => p.id)) + 1 : 1;
    
    const novoProjeto: Projeto = { // Tipagem explícita adicionada
        id: newId,
        titulo,
        tecnologias,
        descricao,
        link
    };
    
    projetos.push(novoProjeto);
    console.log("Projeto Criado:", novoProjeto.titulo); // 'titulo' é string, corrigido o erro
    res.redirect('/admin'); 
});

// *CORREÇÃO NA ROTA 5: Adicionado o parâmetro ':id' na URL
/// Rota 5: ADMIN - Atualizar (PUT/POST) - Processa a edição
app.post('/admin/projetos/update/:id', (req: Request, res: Response): void => {
    
    const id = parseInt(req.params.id!);
    const { titulo, tecnologias, descricao, link } = req.body;
    
    // Validação para garantir que 'id' é um número
    if (isNaN(id)) {
        res.status(400).send("ID do projeto inválido.");
        return;
    }

    const index = projetos.findIndex(p => p.id === id);

    // MUDANÇA PRINCIPAL: Acessamos o projeto e checamos se ele existe
    if (index !== -1) {
        // Criamos uma referência ao projeto que TEMOS CERTEZA que existe.
        // O operador '!' (non-null assertion) informa ao TypeScript que sabemos que o item não é 'undefined'.
        const projetoExistente = projetos[index]!; 
        
        const projetoAtualizado: Projeto = {
            id: projetoExistente.id,
            // Utilizamos o valor do body ou mantemos o valor existente
            titulo: titulo || projetoExistente.titulo, 
            tecnologias: tecnologias || projetoExistente.tecnologias,
            descricao: descricao || projetoExistente.descricao,
            link: link || projetoExistente.link,
        };
        
        projetos[index] = projetoAtualizado;
        console.log("Projeto Atualizado:", projetos[index].titulo);
    }
    
    res.redirect('/admin');
});

// Rota 6: ADMIN - Excluir (DELETE/POST) - Processa a exclusão
app.post('/admin/projetos/delete/:id',(req: Request, res: Response): void => {
    // Adicionado ': void' para resolver o erro de tipagem no res.redirect/console.log

    const id = parseInt(req.params.id!);

    // Validação para garantir que 'id' é um número
    if (isNaN(id)) {
        res.status(400).send("ID do projeto inválido.");
        return;
    }
    
    const initialLength = projetos.length;
    
    const index = projetos.findIndex(p => p.id === id);

   if (index !== -1) {
        // Remove o projeto pelo ID
        // Garantimos que 'projetoExcluido' é um array de objetos Projeto
        const projetoExcluido: Projeto[] = projetos.splice(index, 1);

        // Verificamos se o array de excluídos não está vazio
        if (projetoExcluido.length > 0) {
            // Criamos uma referência direta para o item excluído. 
            // Usamos '!' (non-null assertion) para dizer ao TS que o [0] existe.
            const itemExcluido = projetoExcluido[0]!; 
            console.log("Projeto Excluído:", itemExcluido.titulo);
        } else {
            // Este 'else' captura o caso teórico de splice falhar
            console.log(`Projeto com ID ${id} não pôde ser excluído.`);
        }
    } else {
        console.log(`Projeto com ID ${id} não encontrado.`);
    }

    res.redirect('/admin');
});

// Rota para exibir o formulário de login
app.get('/login', (req: Request, res: Response) => {
    // Renderiza a view 'login.ejs'
    res.render('login', { error: false }); 
});

// Rota para processar o envio do formulário de login
app.post('/login', (req: Request, res: Response): void => {
    const { senha } = req.body;

    if (senha === ADMIN_PASSWORD) {
        // *** IMPORTANTE: Em um projeto real, aqui você criaria uma SESSÃO ou JWT ***
        // Para este exemplo simples, redirecionaremos com uma chave temporária na URL
        res.redirect('/admin?auth=true'); 
    } else {
        // Senha incorreta, renderiza a página de login novamente com mensagem de erro
        res.render('login', { error: true });
    }
});

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log("Pressione CTRL + C para encerrar.");
});