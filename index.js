import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const porta = 3000;
const host = '0.0.0.0';
var listaUsuarios = [];
var listaMensagens = [];

function processaCadastroUsuario(req, res) {
    
    const dados = req.body;
    let conteudoResposta = '';
    

    if(!(dados.nome && dados.sobreNome && dados.telefone && dados.email)) {

        conteudoResposta = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastrar Usuario</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>   
            <div class="container-menu">
                <h2>Cadastro</h2>
                <form action="/cadastrarUsuario" method="POST">
        
                    <div>
                        <label for="nome">Nome:</label>
                        <input type="text" id="nome" name="nome" placeholder="Digite seu nome" required>
                    </div>
        `;
        if(!dados.nome) {
            conteudoResposta += `
            <div>
                <p class="invalido">O campo nome é obrigatório</p>
            </div>
            `;
        }

        conteudoResposta += `
        <div>
            <label for="sobreNome">Sobrenome:</label>
            <input type="text" id="sobreNome" name="sobreNome" placeholder="Digite seu sobrenome" required>
        </div>
        `;   
        if(!dados.sobreNome) {
            conteudoResposta += `
            <div>
                <p class="invalido">O campo sobre-nome é obrigatório</p>
            </div>
            `;
        }   

        conteudoResposta += `
        <div>
            <label for="telefone">Telefone:</label>
            <input type="text" id="telefone" name="telefone" placeholder="Digite seu telefone" required>
        </div>
        `;   
        if(!dados.telefone) {
            conteudoResposta += `
            <div>
                <p class="invalido">O campo telefone é obrigatório</p>
            </div>
            `;
        }   

        conteudoResposta += `
        <div>
            <label for="email">E-mail:</label>
            <input type="email" id="email" name="email" placeholder="Digite seu e-mail" required>
         </div>   
        `;   
        if(!dados.email) {
            conteudoResposta += `
            <div>
                <p class="invalido">O campo e-mail é obrigatório</p>
            </div>
            `;
        } 

        conteudoResposta += ` 
                <button type="submit">Cadastrar</button>
                </form>
            </div>
        </body>
        </html>
        `;

        res.end(conteudoResposta);

    }   else {

        const usuario = {
            nome: dados.nome,
            sobreNome: dados.sobreNome,
            telefone: dados.telefone,
            email: dados.email,
        }

        listaUsuarios.push(usuario);

        res.redirect("/");
    }
}

function autenticar(req, res, next) {
    if(req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect("/login.html");
    }
}  

const app = express();

app.use(cookieParser());

app.use(session({
    secret: "CH2V3S3CR3T4N0D3J5",
    resave: true, 
    saveUninitialized:  true,
    cookie: {
        maxAge: 1000 * 60 * 30 
    }
}))

app.use(express.urlencoded({extended: true}));


app.use(express.static(path.join(process.cwd(), './paginas')));

app.get('/', autenticar, (req, res) => {
    const dataUltimoAcesso = req.cookies.DataUltimoAcesso;
    const data = new Date();
    let conteudoResposta = '';

    res.cookie("DataUltimoAcesso", data.toLocaleString(), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    });

    conteudoResposta = `
    <!DOCTYPE html>
    <html lang="pt-br">
    
        <head>
            <meta charset="UTF-8">
            <title>Menu do Sistema</title>
            <link rel="stylesheet" href="style.css">
        </head>
    
        <body>
            <div class="container">
                <h1 class="menu-titulo">Menu</h1>   
                <a href="/cadastrarUsuario.html" class="menu-cadastro">Cadastrar Usuário</a><br /><br />
        
                <form action="/enviarMensagem" method="POST">
                    <div>
                        <label for="usuarios" id="label-menu">Selecione o usuário:</label>
                        <select id="usuarios" name="usuario">`;

    for (const usuario of listaUsuarios) {
        conteudoResposta += `<option value="${usuario.nome}">${usuario.nome}</option>`;
    }

    conteudoResposta += `
                        </select>
                        </div>
                        <div>
                            <label for="mensagem">Digite sua mensagem:</label>
                            <input id="mensagem" name="mensagem" required></input>
                        </div>
                        <button type="submit">Enviar Mensagem</button>
                    </form>
                    <br />
    `;

    conteudoResposta += `
            <textarea id="listar-mensagem" name="listar-mensagem" readonly>      
    `;

    for (const mensagem of listaMensagens) {
        conteudoResposta += `${mensagem.usuario}: ${mensagem.mensagem}  \n  ${mensagem.dataHora} \n\n`;
    }

    conteudoResposta += `
            </textarea>
        </body>
        <footer>
            <p> Seu último acesso foi em ${dataUltimoAcesso}</p>
        </footer>
    </html>
    `;
    res.end(conteudoResposta);
});




app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    const senha =  req.body.senha;
    if (usuario && senha && (usuario === 'gabriel') && (senha === '1234')) {
        req.session.usuarioAutenticado = true;
        res.redirect('/');
    } else {
        res.end(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Falha na autenticacao</title>
            </head>
            <body>
                <h2>Usuário ou senha inválidos!</h2>
                <a href="/login.html">Voltar ao login</a>
            </body>
        </html>            
        `)
    }
});

//rota para processar o cadastro de usuários endpoint = '/cadastrarUsuario'
app.post('/cadastrarUsuario', autenticar, processaCadastroUsuario);

app.post('/enviarMensagem', autenticar, (req, res) => {
    const usuarioSelecionado = req.body.usuario;
    const mensagem = req.body.mensagem;
    const dataHora = new Date().toLocaleString();

    // Armazena a mensagem no array
    listaMensagens.push({ usuario: usuarioSelecionado, mensagem, dataHora});
    // Redireciona de volta à página principal
    res.redirect('/');
});

app.listen(porta, host, () => {
    console.log(`servidor executando na URL http://${host}:${porta}`);
});