import { votacaoOuFim } from './main.js';

const vilaPacificada = localStorage.getItem('vilaPacificada');
            const contadorElemento = document.getElementById('contador');
            const botaoIniciar = document.getElementById('iniciar-contagem');
            const botaoPular = document.getElementById('pular');
            let contadorInterval;

            botaoIniciar.addEventListener('click', () => {
                let tempoRestante = 89;

                botaoIniciar.disabled = true;

                contadorInterval = setInterval(() => {
                    const minutos = Math.floor(tempoRestante / 60);
                    const segundos = tempoRestante % 60;

                    contadorElemento.textContent =
                        `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

                    if (tempoRestante === 0) {
                        clearInterval(contadorInterval);

                        if (vilaPacificada === '1') {
                            alert('O pacifista pulou a votação.');
                            setTimeout(() => {
                                window.location.href = 'noite.html';
                            }, 200);
                        } else {
                            window.location.href = 'votacao.html';
                        }
                    }

                    tempoRestante--;
                }, 1000);
            });

            botaoPular.addEventListener('click', () => {
                if (vilaPacificada === '1') {
                    alert('O pacifista pulou a votação.');
                    setTimeout(() => {
                        window.location.href = 'noite.html';
                    }, 200);
                } else {
                    window.location.href = 'votacao.html';
                }
            });
        
    
const modal = document.getElementById('modal-reuniao');
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
        const filhoteDeLobisomem = JSON.parse(localStorage.getItem('filhoteDeLobisomem')) || [];
        let jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];

        localStorage.removeItem('filhoteDeLobisomem');
        localStorage.removeItem('chatAgora');

        let contagemDia = JSON.parse(localStorage.getItem('contagemDia')) || 0;

        contagemDia = contagemDia + 1;
        const noite = document.getElementById('dia');
        noite.textContent = contagemDia + 'ª DIA';
        localStorage.setItem("contagemDia", contagemDia);

        function atualizarStatusJogador(nomeJogador, novoStatus) {
            const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
            const jogadorIndex = jogadoresStatus.findIndex(jogador => jogador.nome === nomeJogador);

            if (jogadorIndex !== -1) {
                jogadoresStatus[jogadorIndex].status = novoStatus;
                localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
                console.log(`Status do jogador "${nomeJogador}" atualizado para "${novoStatus}".`);
            } else {
                console.warn(`Jogador "${nomeJogador}" não encontrado na lista.`);
            }
        }

        localStorage.removeItem('ordemDeJogo');

        const botaoContinuar = document.getElementById('sortear');
        botaoContinuar.addEventListener('click', () => {
            modal.style.display = 'block';
            votacaoOuFim();
        });

        const nomeJogador = document.getElementById('relatorio-jogador');
        const descricaoRelatorio = document.getElementById('descricao-relatorio');

        const jogadoresCondenados = jogadoresStatus.filter(jogador => jogador.status === 'condenado');
        const jogadoresEnvenenados = jogadoresStatus.filter(jogador => jogador.status === 'envenenado');

        const descricoes = [
            'Essa vila fica mais perigosa a cada noite...',
            'Pelo menos não foi eu.',
            'Cara, ainda bem que eu não sou você.',
            'Quem com ferro fere, com ferro ferido ferro.',
            'Eu sei quem é...',
            'A vida dá dessas.'
        ];

        const numero = Math.floor(Math.random() * descricoes.length);

        const divRelatorio = document.getElementById('relatorio');
        divRelatorio.style.display = 'block';

        let jogadorSorteado = null;

        const jogadorRessuscitado = jogadoresStatus.find(jogador => jogador.status === 'ressuscitado')
        if (jogadorRessuscitado) {
            nomeJogador.innerHTML += `${jogadorRessuscitado.nome} está saindo da tumba!<br>`;
        }

        if (jogadoresCondenados.length === 1) {
            jogadorSorteado = jogadoresCondenados[0];
            jogadorSorteado.status = 'morto';
        } else if (filhoteDeLobisomem.length >= 1) {

            let jogadoresCondenados = jogadoresStatus.filter(jogador => jogador.status === 'condenado');
            jogadorSorteado = jogadoresCondenados[Math.floor(Math.random() * jogadoresCondenados.length)];

            nomeJogador.innerHTML += `${jogadorSorteado.nome} morreu durante a noite.<br>`;
            jogadorSorteado.status = 'morto';

            localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
            jogadoresCondenados = jogadoresStatus.filter(jogador => jogador.status === 'condenado');

            jogadorSorteado = jogadoresCondenados[Math.floor(Math.random() * jogadoresCondenados.length)];
            jogadorSorteado.status = 'morto';

        } else if (jogadoresCondenados.length > 1) {
            jogadorSorteado = jogadoresCondenados[Math.floor(Math.random() * jogadoresCondenados.length)];
            jogadorSorteado.status = 'morto';
        }

        const humanoAmaldiçoado = resultadoSorteio.find(resultado => resultado.papel === 'humano amaldiçoado' && resultado.jogador === jogadorSorteado.nome);

        if (humanoAmaldiçoado) {
            humanoAmaldiçoado.papel = 'lobisomem';

            const jogadorStatus = jogadoresStatus.find(jogador => jogador.nome === jogadorSorteado.nome);
            if (jogadorStatus) {
                jogadorStatus.status = 'leproso';
                localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
                jogadorSorteado = null;
            }

            const lobisomensVivos = resultadoSorteio
                .filter(jogador => jogador.papel.toLowerCase() === 'lobisomem')
                .filter(jogador => {
                    const statusJogador = jogadoresStatus.find(js => js.nome === jogador.jogador);
                    return statusJogador && statusJogador.status === 'vivo';
                });

            lobisomensVivos.forEach(jogador => {
                atualizarStatusJogador(jogador.jogador, 'leproso');
            });

            localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));

        }

        jogadoresEnvenenados.forEach(jogador => {
            nomeJogador.innerHTML += `${jogador.nome} morreu durante a noite.<br>`;
        });

        jogadoresStatus = jogadoresStatus.map(jogador => {
            if (jogador === jogadorSorteado) {
                jogador.status = 'morto';
            } else if (jogador.status === 'condenado') {
                jogador.status = 'vivo';
            }
            return jogador;
        });

        const ataques = JSON.parse(localStorage.getItem('ataques')) || [];
        const guardaCostas = JSON.parse(localStorage.getItem('guardaCostas')) || {};

        ataques.forEach(ataque => {
            const { atacante, alvo } = ataque;

            const jogadorProtegido = jogadoresStatus.find(jogador => jogador.nome === alvo && jogador.status === 'protegido');

            if (jogadorProtegido) {
                const protetor = Object.entries(guardaCostas).find(([protetor, protegido]) => protegido === alvo);

                if (protetor) {
                    let nomeProtetor = protetor[0];
                    atualizarStatusJogador(nomeProtetor, 'morto');

                    const guardaCostasIndex = jogadoresStatus.findIndex(jogador => jogador.nome === nomeProtetor);
                    if (guardaCostasIndex !== -1) {
                        jogadoresStatus[guardaCostasIndex].status = 'morto';
                    }

                    const guardaCostasMorto = jogadoresStatus.find(jogador => jogador.nome === nomeProtetor && jogador.status === 'morto');
                    if (!guardaCostasMorto) {
                        nomeJogador.innerHTML += `${nomeProtetor} morreu durante a noite<br>`;
                    }

                } else {

                    console.log(`${alvo} está protegido e não morreu.`);
                }
            }
        });

        // -----------------------------

        jogadoresStatus = jogadoresStatus.map(jogador => {
            if (jogador.status === 'envenenado') {
                jogador.status = 'morto';
            }
            return jogador;
        });
        
        localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));

        const manhunt = JSON.parse(localStorage.getItem('manhunt')) || {};

        let manhuntArray = Object.entries(manhunt);
        let manhuntNome = manhuntArray.length ? manhuntArray[0][0] : null;

        if (manhuntNome) {
            const manhuntMorto = jogadoresStatus.find(j => j.nome === manhunt[manhuntNome]);

            if (manhuntMorto && manhuntMorto.status === 'morto') {
                const manhuntIndex = jogadoresStatus.findIndex(jogador => jogador.nome === manhuntNome);
                if (manhuntIndex !== -1) {
                    jogadoresStatus[manhuntIndex].status = 'morto';
                    nomeJogador.innerHTML += `${manhuntNome} morreu durante a noite.<br>`;
                    localStorage.removeItem('manhunt');
                }
            }
        }

        localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
        console.log("Todos os jogadores envenenados e condenados foram atualizados para 'morto'.");

        const jogadoresMortos = jogadoresStatus.filter(jogador => jogador.status === 'morto');

        jogadoresMortos.forEach(jogadorMorto => {
            const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

            const sosias = JSON.parse(localStorage.getItem('sosia')) || {};

            const nomeJogadorMorto = jogadorMorto.nome.toLowerCase();
            console.log('Jogador morto:', nomeJogadorMorto);
            console.log('Sósias disponíveis:', sosias);

            const nomeJogadorSosia = Object.entries(sosias).find(
                ([_, valor]) => valor.toLowerCase() === nomeJogadorMorto
            )?.[0]; 

            console.log('Sósia encontrado:', nomeJogadorSosia);

            if (nomeJogadorSosia) {
                let resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
                const jogadorSelecionado = resultadoSorteio.find(jogador => jogador.jogador === nomeJogadorSosia);

                if (jogadorSelecionado) {
                    const papelMorto = resultadoSorteio.find(jogador => jogador.jogador === jogadorMorto.nome);


                    jogadorSelecionado.papel = papelMorto.papel;


                    console.log(`${nomeJogadorSosia} agora tem o papel de ${papelMorto.papel}`);

                    resultadoSorteio =
                        localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                } else {
                    console.warn(`Jogador sósia ${nomeJogadorSosia} não encontrado no sorteio.`);
                }
            } else {
                console.log(`Nenhum sósia encontrado para o jogador ${jogadorMorto.nome}.`);
            }

            const caçador = resultadoSorteio.find(resultado => resultado.papel === 'caçador' && resultado.jogador === jogadorMorto.nome);

            const casal = JSON.parse(localStorage.getItem('casal')) || {};

            const casalMorto = Object.entries(casal).find(([jogador1, jogador2]) =>
                jogador1.toLowerCase() === jogadorMorto.nome.toLowerCase() || jogador2.toLowerCase() === jogadorMorto.nome.toLowerCase()
            );

            if (casalMorto) {
                const [jogador1, jogador2] = casalMorto;

                const jogadorMortoOutro = (jogador1.toLowerCase() === jogadorMorto.nome.toLowerCase()) ? jogador2 : jogador1;

                atualizarStatusJogador(jogadorMortoOutro, 'morto');
                console.log(`${jogadorMortoOutro} morreu devido à morte de seu parceiro(a).`);

                nomeJogador.innerHTML += ` ${jogadorMortoOutro} morreu durante a noite.<br>`;

                localStorage.removeItem('chatAgora');

            } else {
                console.log(`Jogador "${jogadorMorto.nome}" não está em um casal registrado.`);
            }

            if (caçador) {

                let caçadasCaçador = JSON.parse(localStorage.getItem('cacadasCacador')) || {};

                const nomeCaçadorNormalizado = caçador.jogador.toLowerCase();

                const nomeJogadorCaca = Object.entries(caçadasCaçador).find(
                    ([chave, valor]) => chave.toLowerCase() === nomeCaçadorNormalizado
                )?.[1];

                if (nomeJogadorCaca) {

                    atualizarStatusJogador(nomeJogadorCaca, 'morto');
                    nomeJogador.innerHTML += ` ${nomeJogadorCaca} morreu durante a noite.<br>`;
                } else {
                    console.warn(`Nenhuma caça encontrada para o caçador: ${caçador.jogador}`);
                }
            }

            const cientistaMaluco = resultadoSorteio.find(resultado => resultado.papel === 'cientista maluco' && resultado.jogador === jogadorMorto.nome);
            if (cientistaMaluco) {
                const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
                const indexCientista = jogadores.indexOf(cientistaMaluco.jogador);


                if (indexCientista !== -1) {
                    const jogadorEsquerda = jogadores[(indexCientista - 1 + jogadores.length) % jogadores.length];
                    const jogadorDireita = jogadores[(indexCientista + 1) % jogadores.length];

                    const vivos = jogadoresStatus.filter(jogador => jogador.status === 'vivo');
                    const jogadorEsquerdaVivo = vivos.find(j => j.nome === jogadorEsquerda);
                    const jogadorDireitaVivo = vivos.find(j => j.nome === jogadorDireita);
                    if (jogadorEsquerdaVivo) {
                        atualizarStatusJogador(jogadorEsquerda, 'cientista');
                    }
                    if (jogadorDireitaVivo) {
                        atualizarStatusJogador(jogadorDireita, 'cientista');
                    }
                }

            }

            const envenenadosCientista = jogadoresStatus.filter(jogador => jogador.status === 'cientista');
            console.log('Jogadores com status cientista:', envenenadosCientista);

            envenenadosCientista.forEach(jogador => {
                atualizarStatusJogador(jogador.nome, 'morto');
                nomeJogador.innerHTML += ` ${jogador.nome} morreu durante a noite.<br>`;
            });


            const humanoLeproso = resultadoSorteio.find(resultado => resultado.papel === 'humano leproso' && resultado.jogador === jogadorSorteado.nome);
            if (humanoLeproso) {
                const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
                const lobisomensVivos = resultadoSorteio
                    .filter(jogador => jogador.papel.toLowerCase() === 'lobisomem')
                    .filter(jogador => {
                        const statusJogador = jogadoresStatus.find(js => js.nome === jogador.jogador);
                        return statusJogador && statusJogador.status === 'vivo';
                    });

                lobisomensVivos.forEach(jogador => {
                    atualizarStatusJogador(jogador.jogador, 'leproso');
                });

            }

        });

        if (jogadorSorteado) {
            const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
            const valentao = resultadoSorteio.find(resultado => resultado.papel === 'valentão' && resultado.jogador === jogadorSorteado.nome);

            const dormindo = JSON.parse(localStorage.getItem('dormindo')) || [];
            const [prost, client] = Object.entries(dormindo).find(([playerName, protegido]) => protegido === jogadorSorteado.nome) || [];

            if (prost) {
                let nomeProtetor = prost;
                atualizarStatusJogador(nomeProtetor, 'morto');
                nomeJogador.innerHTML += `${nomeProtetor} morreu durante a noite<br>`;
            }

            if (valentao) {
                atualizarStatusJogador(jogadorSorteado.nome, 'envenenado')
                nomeJogador.innerHTML += `${jogadorSorteado.nome} está sangrando!<br>`;
            }
            else {
                nomeJogador.innerHTML += `${jogadorSorteado.nome} morreu durante a noite.<br>`;
            }

            localStorage.removeItem('dormindo');

        }

        const listaDoPacifista = JSON.parse(localStorage.getItem('listaDoPacifista')) || [];

        listaDoPacifista.forEach(entry => {
            const { jogador, papel } = entry;
            nomeJogador.innerHTML += `O pacifista alerta: ${jogador} é ${papel}.<br>`;
        });

        descricaoRelatorio.textContent = `Mensagem do dia: "${descricoes[numero]}"`;

        const listaPrefeitos = JSON.parse(localStorage.getItem('prefeito')) || [];

        const listaPistoleiros = Object.keys(JSON.parse(localStorage.getItem('pistoleiro')) || {});
        listaPistoleiros.forEach(pistoleiro => {
            nomeJogador.innerHTML += `A vila tem um pistoleiro: ${pistoleiro}<br>`;
        });

        listaPrefeitos.forEach(prefeito => {
            nomeJogador.innerHTML += `A vila tem um Prefeito: ${prefeito}<br>`;
        });

        const listaPresidentes = resultadoSorteio
            .filter(jogador => jogador.papel.toLowerCase() === 'presidente')
            .map(jogador => jogador.jogador);

        localStorage.setItem('presidente', JSON.stringify(listaPresidentes));


        if (listaPresidentes.length > 0) {
            listaPresidentes.forEach(presidente => {
                nomeJogador.innerHTML += `A vila tem um Presidente: ${presidente}<br>`;
            });
        }

        const casal = JSON.parse(localStorage.getItem('casal')) || {};
        const vivos = jogadoresStatus.filter(jogador => jogador.status === 'vivo');

        if (!nomeJogador) {
            console.error('Elemento nomeJogador não encontrado.');
        } else {
            Object.entries(casal).forEach(([jogador1, jogador2]) => {
                const jogador1Vivo = vivos.find(j => j.nome === jogador1);
                const jogador2Vivo = vivos.find(j => j.nome === jogador2);

                if (jogador1Vivo && jogador2Vivo) {
                    nomeJogador.innerHTML += `${jogador1} e ${jogador2} estão apaixonados.<br>`;
                }
            });
        }

        if (!nomeJogador.innerHTML.trim()) {
            nomeJogador.innerHTML = 'Nada acontece, feijoada.';
        }


