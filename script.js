const jogo = document.getElementById("jogo");
jogo.style.cursor = 'none';

// Obtendo o contexto de renderização 2D do elemento canvas com o id "jogo".
const renderizacaoDeContexto = jogo.getContext('2d');

// Função para definir as dimensões do canvas com base no tamanho da janela.
const ajustarTamanhoDoCanvas = () => {
    jogo.width = window.innerWidth;
    jogo.height = window.innerHeight;
};

// Variável para rastrear a posição vertical do toque na tela.
let touchY = 0;

// Inicializa o tamanho do canvas com base no tamanho da janela.
ajustarTamanhoDoCanvas();

// Função para desenhar a mesa.
const desenharMesa = (x, y, w, h, cor) => {
    renderizacaoDeContexto.fillStyle = cor;
    renderizacaoDeContexto.fillRect(x, y, w, h);
};

// Função para desenhar um rebatedor.
const desenharRebatedor = (x, y, radius, cor) => {
    renderizacaoDeContexto.fillStyle = cor;
    renderizacaoDeContexto.beginPath();
    renderizacaoDeContexto.arc(x, y, radius, 0, 2 * Math.PI, false);
    renderizacaoDeContexto.closePath();
    renderizacaoDeContexto.fill();
};

// Função para desenhar uma linha horizontal que divide a mesa.
const desenharLinhaHorizontal = (x, y, w, h, cor) => {
    renderizacaoDeContexto.fillStyle = cor;
    renderizacaoDeContexto.fillRect(x, y, w, h);
};

// Função para desenhar o disco.
const desenharDisco = (x, y, r, cor) => {
    renderizacaoDeContexto.fillStyle = cor;
    renderizacaoDeContexto.beginPath();
    renderizacaoDeContexto.arc(x, y, r, 0, 2 * Math.PI, false);
    renderizacaoDeContexto.closePath();
    renderizacaoDeContexto.fill();
};

// Função para desenhar texto no canvas.
const desenharTexto = (text, x, y, cor) => {
    renderizacaoDeContexto.fillStyle = cor;
    renderizacaoDeContexto.font = '25px sans-serif';
    renderizacaoDeContexto.fillText(text, x, y);
};

// Classe para representar um jogador.
class Jogador {
    constructor(x, y, r, cor, pontuacao) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.cor = cor;
        this.pontuacao = pontuacao;
    }
}

// Criando os jogadores.
const usuario = new Jogador(20, jogo.height / 2 - 50, 30, '	#0000CD', 0);
const computador = new Jogador(jogo.width - 50, jogo.height / 2 - 50, 30, '#4682B4', 0);

// Configurações iniciais do disco.
const disco = {
    x: jogo.width / 2,
    y: jogo.height / 2,
    r: 16,
    cor: '#FFFF00',
    velocidade: 10,
    velocidadeX: 3,
    velocidadeY: 4,
    parado: true
};

// Função para mover o rebatedor do usuário com base no movimento do mouse.
const moverRebatedorMouse = (e) => {
    let area = jogo.getBoundingClientRect();
    let areaDoRebatedorY = e.clientY - area.top - usuario.r;
    let areaDoRebatedorX = e.clientX - area.left - usuario.r;

    if (areaDoRebatedorX < jogo.width / 2) {
        usuario.y = areaDoRebatedorY;
        usuario.x = areaDoRebatedorX;
        disco.parado = false;
    }
};

// Adicionando um ouvinte de evento para o movimento do mouse.
jogo.addEventListener('mousemove', moverRebatedorMouse);

// Função para mover o rebatedor com base no toque na tela.
const moverRebatedorTouch = (e) => {
    let area = jogo.getBoundingClientRect();
    touchY = e.touches[0].clientY - area.top - usuario.r;
    disco.parado = false;
};

// Adicione um ouvinte de evento para o toque na tela.
jogo.addEventListener('touchstart', moverRebatedorTouch);

// Função para verificar a colisão entre o disco e um rebatedor.
const colisao = (disco, rebatedor) => {
    // Calculando os limites dos objetos.
    disco.top = disco.y - disco.r;
    disco.bottom = disco.y + disco.r;
    disco.left = disco.x - disco.r;
    disco.right = disco.x + disco.r;

    rebatedor.top = rebatedor.y - rebatedor.r;
    rebatedor.bottom = rebatedor.y + rebatedor.r;
    rebatedor.left = rebatedor.x - rebatedor.r;
    rebatedor.right = rebatedor.x + rebatedor.r;

    // Verificando se há colisão.
    if (
        disco.top < rebatedor.bottom &&
        disco.bottom > rebatedor.top &&
        disco.left < rebatedor.right &&
        disco.right > rebatedor.left
    ) {
        // Calcular o ângulo de reflexão com base na posição do rebatedor.
        let deltaY = disco.y - rebatedor.y;
        let normalizedDeltaY = deltaY / (rebatedor.r * 2);
        let bounceAngle = normalizedDeltaY * (Math.PI / 4); // Ângulo máximo de reflexão

        // Definir a direção X do disco com base no lado do rebatedor que foi atingido.
        if (disco.x < rebatedor.x) {
            disco.velocidadeX = disco.velocidade * Math.cos(bounceAngle);
        } else {
            disco.velocidadeX = -disco.velocidade * Math.cos(bounceAngle);
        }

        // Inverter a direção Y do disco.
        disco.velocidadeY = -disco.velocidade * Math.sin(bounceAngle);

        return true;
    }

    return false;
};

// Função para reiniciar a posição do disco.
const reiniciarPosicaoDoDisco = () => {
    disco.x = jogo.width / 2;
    disco.y = jogo.height / 2;
    disco.velocidade = 10;
    disco.velocidadeX = 3;
    disco.velocidadeY = 4;
    disco.parado = true;
};

// Função para atualizar o estado do jogo.
const atualizar = () => {
    if (!disco.parado) {
        disco.x += disco.velocidadeX;
        disco.y += disco.velocidadeY;
    }
    // Invertendo a velocidade vertical quando o disco atinge as bordas da tela.
    if (disco.y + disco.r > jogo.height || disco.y - disco.r < 0) {
        disco.velocidadeY = -disco.velocidadeY;
    }

    let lvl = 10;
    // Função para ajustar o movimento do jogador computador de acordo com a posição do disco.
    const ajustarMovimentoJogadorComputador = (lvl) => {
        const centroDisco = disco.y;
        const centroJogadorComputador = computador.y + computador.r;

        if (centroDisco < centroJogadorComputador - 20) {
            computador.y -= lvl;
        } else if (centroDisco > centroJogadorComputador + 20) {
            computador.y += lvl;
        }

        // Limitando o movimento vertical do jogador computador.
        if (computador.y < 0) {
            computador.y = 0;
        } else if (computador.y > jogo.height) {
            computador.y = jogo.height;
        }
    };

    // Chamando a função para ajustar o movimento do jogador computador.
    ajustarMovimentoJogadorComputador(lvl);

    let jogador = (disco.x < jogo.width / 2) ? usuario : computador;

    // Verificando a colisão entre o disco e o jogador e ajustando a velocidade do disco.
    if (colisao(disco, jogador)) {
        let cruzar = disco.y - (jogador.y + jogador.r);
        cruzar /= jogador.r;

        let taxaMaximaDeRejeicao = Math.PI / 3;

        let anguloDeSalto = cruzar * taxaMaximaDeRejeicao;

        let direcao = (disco.x < jogo.width / 2) ? 1 : -1;

        disco.velocidadeX = direcao * disco.velocidade * Math.cos(anguloDeSalto);

        disco.velocidadeY = disco.velocidade * Math.sin(anguloDeSalto);

        disco.velocidade += 0.5;
    }

    // Verificando se o disco ultrapassou as bordas da tela e atualizando a pontuação.
    if (disco.x > jogo.width) {
        usuario.pontuacao++;
        reiniciarPosicaoDoDisco();
    } else if (disco.x < 0) {
        computador.pontuacao++;
        reiniciarPosicaoDoDisco();
    }
};

// Função para verificar o vencedor e exibir o texto correspondente.
const verificarVencedor = (pontosUsuario, pontosComputador) => {
    if (pontosUsuario >= 5) {
        desenharTexto('VOCÊ VENCEU!', jogo.width / 2, 100, '#008000');
    } else if (pontosComputador >= 5) {
        desenharTexto('GAME OVER!', jogo.width / 2, 100, '#00FF00');
    }
};

// Função para renderizar o jogo.
const renderizarJogo = () => {
    desenharMesa(0, 0, jogo.width, jogo.height, '#000000');
    desenharLinhaHorizontal(jogo.width / 2, 0, 2, jogo.height, '#fff');

    desenharRebatedor(usuario.x, usuario.y, usuario.r, usuario.cor);
    desenharRebatedor(computador.x, computador.y, computador.r, computador.cor);

    desenharDisco(disco.x, disco.y, disco.r, disco.cor);

    verificarVencedor(usuario.pontuacao, computador.pontuacao);

    desenharTexto(usuario.pontuacao, jogo.width / 4, 100, '#fff');
    desenharTexto(computador.pontuacao, 3 * jogo.width / 4, 100, '#fff');
};

// Função para inicializar o jogo e chamar as funções de atualização e renderização periodicamente.
const inicializarJogo = () => {
    ajustarTamanhoDoCanvas(); // Redefine as dimensões do canvas com base no tamanho da janela
    atualizar();
    renderizarJogo();
};

// Chama a função inicializarJogo a cada 1/50 de segundo para atualizar o jogo.
setInterval(inicializarJogo, 1000 / 50);

// Atualiza o tamanho do canvas quando a janela for redimensionada.
window.addEventListener('resize', ajustarTamanhoDoCanvas);
``
