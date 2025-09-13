import { atualizarStatusJogador } from './main.js';
import { votacaoOuFim } from './main.js';

const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        const votos = JSON.parse(localStorage.getItem('votacao')) || {};
        const manhunt = JSON.parse(localStorage.getItem('manhunt')) || {};
        const filhoteDeLobisomem = JSON.parse(localStorage.getItem('filhoteDeLobisomem')) || [];

        let maxVotos = 0;
        let jogadoresComMaxVotos = [];

        for (let jogador in votos) {
            if (votos[jogador] > maxVotos) {
                maxVotos = votos[jogador];
                jogadoresComMaxVotos = [jogador];
            } else if (votos[jogador] === maxVotos) {
                jogadoresComMaxVotos.push(jogador);
            }
        }

        const resultadoP = document.getElementById('resultadoP');
        const principeJogadores = JSON.parse(localStorage.getItem('principe')) || [];
        const idiotaJogadores = JSON.parse(localStorage.getItem('idiota')) || [];

        if (jogadoresComMaxVotos.length > 1) {
            resultadoP.textContent = 'Votos empatados! Ninguém morreu.';
        } else if (jogadoresComMaxVotos.length === 1) {
            const vencedor = jogadoresComMaxVotos[0];

            const jogadorStatus = resultadoSorteio.find(jogador => jogador.jogador === vencedor);

            if (jogadorStatus) {
                if (jogadorStatus.papel === 'príncipe bonitão' && !principeJogadores.includes(vencedor)) {
                    resultadoP.textContent = `${vencedor} é um Príncipe Bonitão e não morrerá dessa vez.`;
                    principeJogadores.push(vencedor);
                    localStorage.setItem('principe', JSON.stringify(principeJogadores));
                } else if (jogadorStatus.papel === 'idiota' && !idiotaJogadores.includes(vencedor)) {
                    resultadoP.textContent = `${vencedor} é um Idiota e não morrerá dessa vez.`;
                    idiotaJogadores.push(vencedor);
                    localStorage.setItem('idiota', JSON.stringify(idiotaJogadores));
                } else if (jogadorStatus.papel === 'filhote de lobisomem') {
                    filhoteDeLobisomem.push(vencedor);
                    localStorage.setItem('filhoteDeLobisomem', JSON.stringify(filhoteDeLobisomem));
                    atualizarStatusJogador(vencedor, 'morto');
                    resultadoP.textContent = `${vencedor} recebeu ${maxVotos} voto(s) e morreu pela vila.`;
                }
                else if (jogadorStatus.papel === 'depressivo') {
                    atualizarStatusJogador(vencedor, 'linchado');
                    votacaoOuFim(vencedor);
                } else {
                    const cacaCabeça = Object.keys(manhunt).find(
                        chave => manhunt[chave] === vencedor
                    );

                    if (cacaCabeça) {
                        const cacaJogador = resultadoSorteio.find(
                            jogador => jogador.jogador === cacaCabeça && jogador.papel === 'caçador de cabeças'
                        );

                        const cacaStatus = jogadoresStatus.find(jogador => jogador.nome === cacaJogador.jogador)

                        if (cacaStatus) {
                            if (cacaStatus.status !== 'morto') {
                                atualizarStatusJogador(cacaCabeça, 'hunter');
                                atualizarStatusJogador(vencedor, 'morto');
                            }
                            resultadoP.textContent = `${vencedor} recebeu ${maxVotos} voto(s) e morreu pela vila.`;

                            atualizarStatusJogador(vencedor, 'morto');
                        } else {

                            atualizarStatusJogador(vencedor, 'morto');
                            resultadoP.textContent = `${vencedor} recebeu ${maxVotos} voto(s) e morreu pela vila.`;
                        }
                    } else {
                        atualizarStatusJogador(vencedor, 'morto');
                        resultadoP.textContent = `${vencedor} recebeu ${maxVotos} voto(s) e morreu pela vila.`;
                    }
                }
            }
        } else {
            resultadoP.textContent = 'Não houve votação.';
        }

        localStorage.removeItem('votacao');
        localStorage.removeItem('ordemDeVotacao');