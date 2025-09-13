import { carregarJogadores, carregarPapeis, calcularSorteio } from './main.js';
import { showAlert } from './main.js';
import { votacaoOuFim } from './main.js';


localStorage.removeItem('silenciado');
        localStorage.removeItem('dormindo');
        localStorage.removeItem('ataques');
        localStorage.removeItem('vilaPacificada');
        let jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

        votacaoOuFim();

        localStorage.removeItem('posicaoAtual');
        localStorage.removeItem('listaDoPacifista');
        let contagemNoite = JSON.parse(localStorage.getItem('contagemNoite')) || 0;

        contagemNoite = contagemNoite + 1;
        const noite = document.getElementById('noite');
        noite.textContent = contagemNoite + 'ª NOITE';
        localStorage.setItem("contagemNoite", contagemNoite);

        localStorage.removeItem('cacadasCacador');

        jogadoresStatus = jogadoresStatus.map(jogador => {
            if (jogador.status === 'protegido') {
                return { ...jogador, status: 'vivo' };
            }
            return jogador;
        });

        const moverMensagensParaChatAgora = () => {
            const chat = JSON.parse(localStorage.getItem('chat')) || [];
            const chatAgora = JSON.parse(localStorage.getItem('chatAgora')) || [];

            const mensagensMovidas = chat.map(mensagem => ({ ...mensagem }));

            localStorage.setItem('chatAgora', JSON.stringify([...chatAgora, ...mensagensMovidas]));
            localStorage.setItem('chat', JSON.stringify([]));
        };

        moverMensagensParaChatAgora();

        jogadoresStatus = jogadoresStatus.map(jogador => {
            if (jogador.status === 'ressuscitado') {
                return { ...jogador, status: 'vivo' };
            }
            return jogador;
        });

        const humanoMordido = () => {
            const mordida = JSON.parse(localStorage.getItem('mordida'));

            if (mordida) {

                const jogadorMordidoNome = mordida;
                const jogadorMordido = resultadoSorteio.find(j => j.jogador === jogadorMordidoNome);

                jogadorMordido.papel = 'lobisomem';
                localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));

                localStorage.removeItem('mordida')
            }
        }


        const trocarPapeis = () => {
            const trocas = JSON.parse(localStorage.getItem('troca')) || [];

            trocas.forEach(troca => {
                const jogador1Nome = troca[0];
                const jogador2Nome = troca[1];

                const jogador1 = jogadoresStatus.find(j => j.nome === jogador1Nome);
                const jogador2 = jogadoresStatus.find(j => j.nome === jogador2Nome);

                if (jogador1 && jogador2) {
                    if (jogador1.status !== 'morto' && jogador2.status !== 'morto') {
                        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

                        const jogador1 = resultadoSorteio.find(j => j.jogador === jogador1Nome);
                        const jogador2 = resultadoSorteio.find(j => j.jogador === jogador2Nome);

                        if (jogador1 && jogador2) {
                            const papelTemp = jogador1.papel;
                            jogador1.papel = jogador2.papel;
                            jogador2.papel = papelTemp;

                            localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));

                            window.location.href = 'mediador.html';
                        } else {
                            showAlert('Um ou ambos os jogadores selecionados não foram encontrados.');
                        }

                        const papelTemp = jogador1.papel;
                        jogador1.papel = jogador2.papel;
                        jogador2.papel = papelTemp;

                        console.log(`Troca realizada: ${jogador1Nome} agora é ${jogador1.papel}, ${jogador2Nome} agora é ${jogador2.papel}`);

                    } else {
                        console.log(`Troca não realizada. Um ou ambos os jogadores não estão vivos.)`);
                    }
                } else {
                    console.error('Jogadores não encontrados para a troca:', jogador1Nome, jogador2Nome);
                }
            });

        };

        let continuarBtn = document.getElementById('continuar-noite')

        continuarBtn.addEventListener('click', () => {
            humanoMordido();
            trocarPapeis();
            localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
            localStorage.removeItem('troca');
        });