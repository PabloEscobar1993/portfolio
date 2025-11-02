import express from 'express';
import type { Request, Response, NextFunction} from 'express'; 


const app = express();
const PORT = 3000;

// Tipagem e Dados em Memória

interface Projeto {
    id: number;
    titulo: string;
    tecnologias: string;
    descricao: string;
    link: string;
}

// Armazenando os projetos
const projetos: Projeto[] = [
    { id: 1, titulo: "Projeto X - E-Commerce", tecnologias: "HTML, CSS, Node.js", descricao: "Descrição do projeto X.", link: "#" },
    { id: 2, titulo: "Projeto Y - API REST", tecnologias: "TypeScript, Express", descricao: "Descrição do projeto Y.", link: "#" },
];

// Configurações do Express

app.set('view engine', 'ejs');

app.set('views', './views');


app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const ADMIN_PASSWORD = "123";


const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
    
    const isAuthenticated = req.query.auth === 'true';

    if (isAuthenticated) {
       
        next();
    } else {
        
        res.redirect('/login');
    }
};

// ROTAS DE APRESENTAÇÃO (GET)


// ROTA 1: Página Inicial (GET)
app.get('/', (req: Request, res: Response) => {
    const dadosPortifolio = {
        nome: "Pablo Rafael Rosa da Silva",
        cargo: "Estudante de Análise e Desenvolvimento de Sistemas",
        biografia: "Meu interesse pela área de Tecnologia começou durante minha experiência na USP, o que me motivou a buscar uma formação especializada. Mudei-me para São José dos Campos (SJC) e iniciei o curso de Análise e Desenvolvimento de Sistemas (ADS) na FATEC, onde aprofundei meus conhecimentos técnicos e participei de uma Iniciação Científica, consolidando minha base acadêmica. Com uma visão prática, adquiri experiência profissional atuando como Suporte de T.I. em duas empresas, o que me proporcionou um entendimento sólido de infraestrutura e atendimento ao usuário. Atualmente, estou focado no desenvolvimento de software, trabalhando como Desenvolvedor (DEV) com Unity 3D no PIT. Minha trajetória demonstra uma progressão contínua: da curiosidade acadêmica à experiência em T.I., culminando no desenvolvimento especializado. Estou sempre em busca de novos desafios e pronto para aplicar minhas habilidades em projetos inovadores.",
        linkedin: "https://www.linkedin.com/in",
        github: "https://github.com/",
    };
    
    res.render('index', { dados: dadosPortifolio });
});

// ROTA 2: Projetos (GET) - Apresenta os projetos
app.get('/projetos', (req: Request, res: Response) => {
    res.render('projetos', { listaProjetos: projetos });
});



// ROTAS DE GERENCIAMENTO/CRUD (ADMIN)


// Rota 3: ADMIN - Ler/Listar (GET) - Exibe o formulário 
app.get('/admin', adminAuth,(req: Request, res: Response) => {
    res.render('admin-crud', { listaProjetos: projetos });
});

// Rota 4: ADMIN - Criar (POST)
app.post('/admin/projetos',(req: Request, res: Response): void => {
    
    const { titulo, tecnologias, descricao, link } = req.body;
    
    
    const newId = projetos.length > 0 ? Math.max(...projetos.map(p => p.id)) + 1 : 1;
    
    const novoProjeto: Projeto = { 
        id: newId,
        titulo,
        tecnologias,
        descricao,
        link
    };
    
    projetos.push(novoProjeto);
    console.log("Projeto Criado:", novoProjeto.titulo); 
    res.redirect('/admin'); 
});


/// Rota 5: ADMIN - Atualizar (PUT/POST)
app.post('/admin/projetos/update/:id', (req: Request, res: Response): void => {
    
    const id = parseInt(req.params.id!);
    const { titulo, tecnologias, descricao, link } = req.body;
    
    
    if (isNaN(id)) {
        res.status(400).send("ID do projeto inválido.");
        return;
    }

    const index = projetos.findIndex(p => p.id === id);

    
    if (index !== -1) {
       
        const projetoExistente = projetos[index]!; 
        
        const projetoAtualizado: Projeto = {
            id: projetoExistente.id,
            
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

// Rota 6: ADMIN - Excluir (DELETE/POST)
app.post('/admin/projetos/delete/:id',(req: Request, res: Response): void => {
    

    const id = parseInt(req.params.id!);

    
    if (isNaN(id)) {
        res.status(400).send("ID do projeto inválido.");
        return;
    }
    
    const initialLength = projetos.length;
    
    const index = projetos.findIndex(p => p.id === id);

   if (index !== -1) {
        // Remove o projeto pelo ID

        const projetoExcluido: Projeto[] = projetos.splice(index, 1);

        
        if (projetoExcluido.length > 0) {
            
            const itemExcluido = projetoExcluido[0]!; 
            console.log("Projeto Excluído:", itemExcluido.titulo);
        } else {
            
            console.log(`Projeto com ID ${id} não pôde ser excluído.`);
        }
    } else {
        console.log(`Projeto com ID ${id} não encontrado.`);
    }

    res.redirect('/admin');
});

// Rota login
app.get('/login', (req: Request, res: Response) => {
    
    res.render('login', { error: false }); 
});

// Rota para processar o envio do formulário de login
app.post('/login', (req: Request, res: Response): void => {
    const { senha } = req.body;

    if (senha === ADMIN_PASSWORD) {
        
        res.redirect('/admin?auth=true'); 
    } else {
        
        res.render('login', { error: true });
    }
});


//rota teste

app.get('/rota-teste', (req, res) => {
    
    const dadosParaTeste = { 
        
        mensagem: "Bem-vindo!" 
    };
    
    
    res.render('rota-teste', dadosParaTeste);
    
    
});



// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log("Pressione CTRL + C para encerrar.");
});