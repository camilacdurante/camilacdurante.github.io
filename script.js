// Determina o conjunto de posições possíveis para as respostas aparecerem e cria uma variável para salvar a posição da resposta correta
const posicoes = ['up', 'down', 'left', 'right'];
let posicaoCorreta = '';

// Função responsável por gerar a pergunta matemática
function gerarPergunta() {
    // Espera 20 milissegundos para tocar o áudio de feedback (foi realizada uma pergunta)
    setTimeout(() => {
        document.getElementById("pergunta").play(); 
    }, 20);
    // Define o conjunto de operadores para a equação matemática
    const operadores = ['+', '-', '×', '÷'];
    // Define o operador matemático de maneira randomizada (gera um número de 0 a 1, multiplica pelo tamanho de 'operadores' e arredonda para baixo)
    const operador = operadores[Math.floor(Math.random() * operadores.length)];
    // Define dois valores aleatórios entre 1 e 10 (gera um número de 0 a 1, multiplica por 100, arredonda para baixo e soma 1)
    let n1 = Math.floor(Math.random() * 10) + 1;
    let n2 = Math.floor(Math.random() * 10) + 1;
    let correta;
    // Para cada um dos operadores lógicos
    switch (operador) {
        // Caso o operador sorteado seja '+'
        case '+':
            // Faz o cálculo da equação
            correta = n1 + n2;
        break;
        // Caso o operador sorteado seja '-'
        case '-':
            // Verifica se o valor salvo em 'n2' é maior que 'n1' e se for, inverte os valores salvos
            if (n2 > n1) [n1, n2] = [n2, n1];
            // Faz o cálculo da equação
            correta = n1 - n2;
        break;
        // Caso o operador sorteado seja '×'
        case '×':
            // Faz o cálculo da equação
            correta = n1 * n2;
        break;
        // Caso o operador sorteado seja '÷'
        case '÷':
            // Para garantir a divisão exata, 'correta' recebe o valor salvo em 'n1'
            correta = n1;
            // 'n1' recebe um novo valor de 'correta' multiplicado por 'n2', para que 'n1' dividido por 'n2' resulte em 'correta'
            n1 = correta * n2;
        break;
    }

    // Exibe a questão
    document.getElementById("questao").innerText = `Quanto é ${n1} ${operador} ${n2}?`;

    // Para gerar 3 alternativas incorretas, sem duplicatas
    let respostasErradas = new Set();
    // Enquanto não houver 3 alternativas incorretas
    while (respostasErradas.size < 3) {
        // Gera um número aleatório de 1 a 5
        let incorretas = Math.floor(Math.random() * 5) + 1;
        // Gera um número aleatório de 0 a 1, se este número for maior que 0.5, soma-se 'incorretas' ao valor de 'correta', caso não, subtrai-se 'incorretas' do valor 'correta'
        let alternativa = correta + (Math.random() > 0.5 ? incorretas : -incorretas);
        // Se o valor salvo em 'alternativa' for diferente do valor de 'correta' e maior ou igual a 0, a alternativa é adicionada na 'lista' de respostas incorretas
        if (alternativa !== correta && alternativa >= 0) respostasErradas.add(alternativa);
    }
    // Transforma 'respostasErradas' em um array comum
    const todasRespostas = [...respostasErradas];
    // Gera um número aleatório entre 0 e 3 para a posição da alternativa correta (gera um número aleatório entre 0 e 1, multiplica por 4 e arredonda para baixo)
    const posCorreta = Math.floor(Math.random() * 4);
    // Adiciona a alternativa correta na posição gerada acima do array 'todasRespostas'
    todasRespostas.splice(posCorreta, 0, correta);
    // Salva a posição da alternativa correta de acordo com as posições possíveis (up, down, left, right)
    posicaoCorreta = posicoes[posCorreta];
    // Exibe cada alternativa na posição de acordo com a posição no array 'todasRespostas'
    posicoes.forEach((pos, i) => {
        document.getElementById(pos).innerText = todasRespostas[i];
    });
}

// Função para iniciar o reconhecimento de voz (async porque existem operações assíncronas dentro dela 'await')
async function iniciarReconhecimento() {
    // Cria um objeto de reconhecimento de fala; 'BROWSER_FFT' especifica o tipo de modelo que será carregado, utiliza FFT para identificar padrões de áudio.
    const reconhecer = speechCommands.create('BROWSER_FFT');
    // Garante que o modelo tenha sido carregado completamente, ocorre de forma assíncrona, por isso, não continua até terminar de carregar
    await reconhecer.ensureModelLoaded();
    // Processa os comandos de áudio detectados pelo modelo
    reconhecer.listen(resultado => {
        // 'pontuacao' recebe os escores do modelo, ou seja, a probabilidade de cada palavra que ele reconhece de ter sido a realmente dita
        const pontuacao = resultado.scores;
        // 'labels' recebe as possíveis palavras, ou seja, todas as palavras que o modelo reconhece
        const labels = reconhecer.wordLabels();
        // 'topIndex' recebe a posição do maior valor de 'pontuacao', ou seja, a posição da palavra mais provável de ter sido dita, segundo o modelo
        const topIndex = pontuacao.indexOf(Math.max(...pontuacao));
        // 'comando' salva a palavra com maior probabilidade de ter sido dita
        const comando = labels[topIndex];
        // Verifica se 'comando' está dentro das possíveis posições, ou seja, se 'comando' é up, down, left ou right
        if (posicoes.includes(comando)) {
            // Verifica se 'comando' é igual a posição da alternativa correta
            if (comando === posicaoCorreta) {
                // Exibe qual foi a posição entendida
                document.getElementById("status").innerText = `Você disse: ${comando}`;
                // Exibe o feedback visual (o jogador acertou a resposta)
                document.getElementById("deuCerto").innerText = "✅ Acertou! Próxima pergunta...";
                // Toca o feedback auditivo de que o jogador acertou o resultado
                document.getElementById("acertou").play();
                // Para o reconhecimento de voz
                reconhecer.stopListening();
                // Espera 1500 milissegundos
                setTimeout(() => {
                    // Limpa o feedback visual
                    document.getElementById("deuCerto").innerText = "";
                    // Exibe a instrução de jogo
                    document.getElementById("status").innerText = "Fale: up, down, left ou right";
                    // Gera uma nova pergunta
                    gerarPergunta();
                    // Ativa novamente o reconhecimento de voz
                    iniciarReconhecimento();
                }, 1500);

            } else {
                // Exibe qual foi a posição entendida
                document.getElementById("status").innerText = `Você disse: ${comando}`;
                // Para o reconhecimento de voz
                reconhecer.stopListening();
                // Exibe o feedback visual (o jogador errou a resposta)
                document.getElementById("deuCerto").innerText = "❌ Errou! Fim de jogo.";
                // Exibe que o jogo foi encerrado
                document.getElementById("status").innerText = "Jogo encerrado.";
                // Toca o feedback auditivo que o jogador errou o resultado
                document.getElementById("errou").play();
                // Espera 2000 milissegundos
                setTimeout(() => {
                    // Redireciona para a página inicial
                    window.location.href = "index.html";
                }, 2000);            
            }
        }
    }, {
        // O espectrograma não será incluído na resposta
        includeSpectrogram: false,
        // Define um limiar de confiança para aceitar ou não o comando de voz detectado
        probabilityThreshold: 0.75
    });
}

// Gera a pergunta inicial
gerarPergunta();
// Ativa o reconhecimento de voz
iniciarReconhecimento();