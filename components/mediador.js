import { descricaoPorPapel, imagemPorPapel, atualizarStatusJogador, showAlert, criarBotaoChat, exibirMensagensRecebidas } from './main.js';


gsap.fromTo('#modal',
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );


        if (!localStorage.getItem('protecoesMedico')) {
            localStorage.setItem('protecoesMedico', JSON.stringify({}));
        }

        const modal = document.getElementById('modal');
        const continuarBtnModal = document.getElementById('continuar-btn');
        const conteudoPrincipal = document.getElementById('pagina-mediador');
        const nomeJogador = document.getElementById('nome-jogador');
        const papelJogador = document.getElementById('papel-jogador');
        const imagemJogador = document.getElementById('imagem-jogador');

        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        let posicaoAtual = JSON.parse(localStorage.getItem('posicaoAtual')) || 0;
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

        const jogadorAtual = jogadoresStatus[posicaoAtual];



        let ordemDeJogo = JSON.parse(localStorage.getItem('ordemDeJogo')) || [];
        localStorage.setItem('ordemDeJogo', JSON.stringify(ordemDeJogo));

        const exibirJogadorModal = () => {

            let jogadorAtual = jogadoresStatus[posicaoAtual];

            if (!jogadorAtual || jogadorAtual.status === 'morto') {
                proximoJogador();
                jogadorAtual = jogadoresStatus[posicaoAtual];
            }

            document.querySelector('.nome-pessoa .comando').textContent = 'Passe o aparelho para:';
            document.querySelector('.nome-pessoa .espaco').textContent = `${jogadorAtual?.nome || 'Mestre do Jogo'}`;
        };

        const proximoJogador = () => {
            const maxJogadores = jogadoresStatus.length;

            do {
                posicaoAtual = (posicaoAtual + 1) % maxJogadores;
                ordemDeJogo = JSON.parse(localStorage.getItem('ordemDeJogo')) || [];

                if (posicaoAtual >= maxJogadores) {
                    window.location.href = 'relatorio.html';
                    return;
                }
            } while (jogadoresStatus[posicaoAtual].status === 'morto');

            localStorage.setItem('posicaoAtual', posicaoAtual);

        };

        continuarBtnModal.addEventListener('click', () => {
            modal.style.display = 'none';

            const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
            let ordemDeJogo = JSON.parse(localStorage.getItem('ordemDeJogo')) || [];

            jogadoresStatus.forEach(jogador => {
                if (jogador.status === 'morto' && !ordemDeJogo.includes(jogador.nome)) {
                    ordemDeJogo.push(jogador.nome);
                }
            });

            localStorage.setItem('ordemDeJogo', JSON.stringify(ordemDeJogo));

            setTimeout(() => {
                atualizarJogadorInfo();
                proximoJogador();
            }, 500);
        });

        const abrirJanela = (nomeAtual, callbackConfirmar, listaExcluidos = null) => {
            const modalAtaque = document.createElement('div');
            modalAtaque.className = 'modal-ataque';

            // Filtrar jogadores vivos e aplica a lista de exclusão
            const jogadoresVivos = jogadoresStatus.filter(jogador =>
                jogador.status !== 'morto' && jogador.status !== 'ressuscitado' &&
                jogador.nome !== nomeAtual &&
                (!listaExcluidos || !listaExcluidos.includes(jogador.nome))
            );

            modalAtaque.innerHTML = `
                <div class="modal-content">
                    <h2>Escolha um jogador</h2>
                    <ul class="lista-jogadores">
                        ${jogadoresVivos.map(jogador =>
                `<li>
                                <label for="jogador-${jogador.nome}" class="item-jogador">
                                    <input type="radio" name="jogador" value="${jogador.nome}" id="jogador-${jogador.nome}">
                                    <span>${jogador.nome}</span>
                                </label>
                            </li>`
            ).join('')}
                    </ul>
                    <button id="cancelar">Cancelar</button>
                    <button id="confirmar">Confirmar</button>
                </div>
            `;

            document.body.appendChild(modalAtaque);

            document.getElementById('confirmar').addEventListener('click', () => {
                const jogadorSelecionado = document.querySelector('input[name="jogador"]:checked');
                if (jogadorSelecionado) {
                    callbackConfirmar(jogadorSelecionado.value);
                } else {
                    showAlert('Selecione um jogador para continuar.');
                }
                modalAtaque.remove();
            });

            document.getElementById('cancelar').addEventListener('click', () => {
                modalAtaque.remove();
            });
        };


        const abrirJanelaDetetive = (nomeAtual, callbackConfirmar, modo = 'detetive') => {
            const modalDetetive = document.createElement('div');
            modalDetetive.className = 'modal-detetive';

            const jogadoresVivos = jogadoresStatus.filter(jogador =>
                jogador.status !== 'morto' && jogador.status !== 'ressuscitado' &&
                jogador.nome !== nomeAtual
            );

            modalDetetive.innerHTML = `
                <div class=modal-content>
                    <h3>Escolha dois jogadores</h3>
                    <div class="grid">
                        <div class="coluna">
                            <h3>Jogador 1</h3>
                            <ul class="lista-jogadores" id="lista-jogadores-duplo">
                                ${jogadoresVivos.map(jogador =>
                `<li>
                                        <label for="jogador1-${jogador.nome}" class="item-jogador">
                                            <input type="radio" name="jogador1" value="${jogador.nome}" id="jogador1-${jogador.nome}">
                                            <span>${jogador.nome}</span>
                                        </label>
                                    </li>`).join('')}
                            </ul>
                        </div>
                        <div class="coluna">
                            <h3>Jogador 2</h3>
                            <ul class="lista-jogadores" id="lista-jogadores-duplo">
                                ${jogadoresVivos.map(jogador =>
                    `<li>
                                        <label for="jogador2-${jogador.nome}" class="item-jogador">
                                            <input type="radio" name="jogador2" value="${jogador.nome}" id="jogador2-${jogador.nome}">
                                            <span>${jogador.nome}</span>
                                        </label>
                                    </li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <button id="cancelar-detetive">Cancelar</button>
                    <button id="confirmar-detetive">Confirmar</button>
                </div>
            `;

            document.body.appendChild(modalDetetive);

            document.getElementById('confirmar-detetive').addEventListener('click', () => {
                const jogador1Selecionado = document.querySelector('input[name="jogador1"]:checked');
                const jogador2Selecionado = document.querySelector('input[name="jogador2"]:checked');

                if (jogador1Selecionado && jogador2Selecionado) {
                    if (jogador1Selecionado.value === jogador2Selecionado.value) {
                        showAlert('Os dois jogadores selecionados devem ser diferentes.', () => {
                            return;
                        });

                    }
                    callbackConfirmar(jogador1Selecionado.value, jogador2Selecionado.value);
                    modalDetetive.remove();
                } else {
                    showAlert('Selecione dois jogadores para continuar.');
                }
            });

            document.getElementById('cancelar-detetive').addEventListener('click', () => {
                modalDetetive.remove();
            });
        };

        const abrirJanelaAtaqueDuplo = (nomeAtual, callbackConfirmar) => {
            const modalAtaqueDuplo = document.createElement('div');
            modalAtaqueDuplo.className = 'modal-ataque';

            const jogadoresVivos = jogadoresStatus.filter(jogador =>
                jogador.status !== 'morto' && jogador.status !== 'ressuscitado' &&
                jogador.nome !== nomeAtual
            );

            modalAtaqueDuplo.innerHTML = `
                <div class="modal-content">
                    <h3>Escolha um ou dois jogadores</h3>
                    <div class="grid">
                        <div class="coluna">
                            <h3>Jogador 1</h3>
                            <ul class="lista-jogadores" id="lista-jogadores-duplo">
                                ${jogadoresVivos.map(jogador =>
                `<li>
                                        <label for="jogador1-${jogador.nome}" class="item-jogador">
                                            <input type="radio" name="jogador1" value="${jogador.nome}" id="jogador1-${jogador.nome}">
                                            <span>${jogador.nome}</span>
                                        </label>
                                    </li>`).join('')}
                            </ul>
                        </div>
                        <div class="coluna">
                            <h3>Jogador 2</h3>
                            <ul class="lista-jogadores" id="lista-jogadores-duplo">
                                ${jogadoresVivos.map(jogador =>
                    `<li>
                                        <label for="jogador2-${jogador.nome}" class="item-jogador">
                                            <input type="radio" name="jogador2" value="${jogador.nome}" id="jogador2-${jogador.nome}">
                                            <span>${jogador.nome}</span>
                                        </label>
                                    </li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <button id="cancelar-ataque-duplo">Cancelar</button>
                    <button id="confirmar-ataque-duplo">Confirmar</button>
                </div>
            `;

            document.body.appendChild(modalAtaqueDuplo);

            document.getElementById('confirmar-ataque-duplo').addEventListener('click', () => {
                const jogador1Selecionado = document.querySelector('input[name="jogador1"]:checked');
                const jogador2Selecionado = document.querySelector('input[name="jogador2"]:checked');

                if (jogador1Selecionado) {

                    const jogadoresSelecionados = [
                        { nome: jogador1Selecionado.value }
                    ];

                    jogadoresSelecionados.forEach(jogador => {
                        const jogadorAlvo = jogadoresStatus.find(j => j.nome === jogador.nome);

                        if (jogadorAlvo !== 'protegido' && jogadorAlvo.status !== 'envenenado' && jogadorAlvo !== 'ressuscitado') {
                            atualizarStatusJogador(jogador.nome, 'condenado');
                        }
                    });

                    callbackConfirmar(jogador1Selecionado.value);
                    modalAtaqueDuplo.remove();
                }

                if (jogador1Selecionado && jogador2Selecionado) {
                    if (jogador1Selecionado.value === jogador2Selecionado.value) {
                        showAlert('Os dois jogadores selecionados devem ser diferentes.', () => {
                            return;
                        });
                    }

                    const jogadoresSelecionados = [
                        { nome: jogador1Selecionado.value },
                        { nome: jogador2Selecionado.value }
                    ];

                    jogadoresSelecionados.forEach(jogador => {
                        const jogadorAlvo = jogadoresStatus.find(j => j.nome === jogador.nome);

                        if (jogadorAlvo && jogadorAlvo.status !== 'protegido' && jogadorAlvo.status !== 'envenenado') {
                            atualizarStatusJogador(jogador.nome, 'condenado');
                        }
                    });

                    callbackConfirmar(jogador1Selecionado.value, jogador2Selecionado.value);
                    modalAtaqueDuplo.remove();
                }
            });

            document.getElementById('cancelar-ataque-duplo').addEventListener('click', () => {
                modalAtaqueDuplo.remove();
            });
        };


        const abrirJanelaNecromante = (nomeAtual, callbackConfirmar) => {
            const modalRessuscitar = document.createElement('div');
            modalRessuscitar.className = 'modal-ataque';

            // Filtrar apenas jogadores mortos
            const jogadoresMortos = jogadoresStatus.filter(jogador => jogador.status === 'morto');

            modalRessuscitar.innerHTML = `
                <div class="modal-content">
                    <h2>Escolha um jogador para ressuscitar</h2>
                    <ul class="lista-jogadores">
                        ${jogadoresMortos.map(jogador =>
                `<li>
                                <label for="jogador-${jogador.nome}" class="item-jogador">
                                    <input type="radio" name="jogador" value="${jogador.nome}" id="jogador-${jogador.nome}">
                                    <span>${jogador.nome}</span>
                                </label>
                            </li>`).join('')}
                    </ul>
                    <button id="cancelar">Cancelar</button>
                    <button id="confirmar">Confirmar</button>
                </div>
            `;

            document.body.appendChild(modalRessuscitar);

            document.getElementById('confirmar').addEventListener('click', () => {
                const jogadorSelecionado = document.querySelector('input[name="jogador"]:checked');
                if (jogadorSelecionado) {
                    callbackConfirmar(jogadorSelecionado.value);
                } else {
                    showAlert('Selecione um jogador para continuar.');
                }
                modalRessuscitar.remove();
            });

            document.getElementById('cancelar').addEventListener('click', () => {
                modalRessuscitar.remove();
            });
        };


        const atualizarJogadorInfo = () => {

            const jogadorAtual = jogadoresStatus[posicaoAtual];
            if (!jogadorAtual) {
                console.warn('Nenhum jogador atual encontrado.');
                return;
            }

            const papelAtual = resultadoSorteio.find(jogador => jogador.jogador === jogadorAtual.nome)?.papel || 'Sem papel definido';

            document.getElementById('nome-jogador').textContent = jogadorAtual.nome;
            document.getElementById('papel-jogador').textContent = papelAtual;

            const descricao = descricaoPorPapel?.[papelAtual.toLowerCase()] || 'Nenhuma descrição disponível para este papel.';
            document.getElementById('descricao-papel').textContent = descricao;

            const imagemPapel = imagemPorPapel?.[papelAtual.toLowerCase()] || '../img/mestre.png';
            document.getElementById('imagem-jogador').src = imagemPapel;

            const navegacaoDiv = document.getElementById('navegacao');
            navegacaoDiv.innerHTML = '';

            const botaoContinuar = document.createElement('button');
            botaoContinuar.id = 'botao-conteudo';
            botaoContinuar.textContent = 'Continuar';
            botaoContinuar.addEventListener('click', () => {
                window.location.href = 'mediador.html';
            });
            navegacaoDiv.appendChild(botaoContinuar);


            exibirMensagensRecebidas(jogadorAtual.nome);
            criarBotaoChat(jogadorAtual.nome);





            // -------------------------------------------------

            if (papelAtual.toLowerCase() === 'lobisomem') {
                const jogadoresVivos = jogadoresStatus.filter(jogador =>
                    jogador.status !== 'morto' && jogador.status !== 'ressuscitado' && jogador.nome !== jogadorAtual
                );
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Atacar';

                const jogadorStatusAtual = jogadoresStatus.find(jogador => jogador.nome === jogadorAtual.nome);
                const filhoteDeLobisomem = (localStorage.getItem('filhoteDeLobisomem')) || [];
                const ataques = JSON.parse(localStorage.getItem('ataques')) || [];


                const outrosLobisomensDiv = document.createElement('div');
                outrosLobisomensDiv.style.position = 'fixed';
                outrosLobisomensDiv.style.bottom = '10px';
                outrosLobisomensDiv.style.right = '10px';
                outrosLobisomensDiv.style.color = '#ffffff37';
                outrosLobisomensDiv.style.padding = '10px';
                outrosLobisomensDiv.style.borderRadius = '5px';
                outrosLobisomensDiv.innerHTML = '<strong>Lobisomens:</strong><br>';

                const outrosLobisomens = resultadoSorteio.filter(
                    jogador =>
                        jogador.jogador !== jogadorAtual.nome &&
                        jogadoresStatus.find(vivo =>
                            vivo.nome === jogador.jogador &&
                            vivo.status !== 'morto' &&
                            vivo.status !== 'ressuscitado' &&
                            ['lobisomem', 'lobo alfa', 'filhote de lobisomem'].includes(jogador.papel)
                        )
                );


                if (outrosLobisomens.length > 0) {
                    outrosLobisomens.forEach(lobisomem => {
                        const nomeLobisomem = document.createElement('span');
                        nomeLobisomem.textContent = `- ${lobisomem.jogador}`;
                        outrosLobisomensDiv.appendChild(document.createElement('br'));
                        outrosLobisomensDiv.appendChild(nomeLobisomem);
                    });
                } else {
                    const nenhumLobisomem = document.createElement('span');
                    nenhumLobisomem.textContent = 'Nenhum outro lobisomem vivo.';
                    outrosLobisomensDiv.appendChild(nenhumLobisomem);
                }

                document.body.appendChild(outrosLobisomensDiv);

                if (jogadorStatusAtual && jogadorStatusAtual.status === 'leproso') {
                    botaoAtaque.disabled = true;
                    botaoAtaque.textContent = 'Leproso';

                    atualizarStatusJogador(jogadorAtual.nome, 'vivo');
                } else if (filhoteDeLobisomem.length >= 1 && jogadoresVivos.length > 2) {

                    botaoAtaque.textContent = 'Atacar x2';
                    botaoAtaque.addEventListener('click', () => {
                        abrirJanelaAtaqueDuplo(jogadorAtual.nome, (nome1, nome2) => {
                            const ataques = JSON.parse(localStorage.getItem('ataques')) || [];

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nome1
                            });

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nome2
                            });

                            localStorage.setItem('ataques', JSON.stringify(ataques));

                            window.location.href = 'mediador.html';
                        });
                    });
                }

                else {
                    botaoAtaque.addEventListener('click', () => {
                        abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                            const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                            const ataques = JSON.parse(localStorage.getItem('ataques')) || [];

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nomeSelecionado
                            });

                            localStorage.setItem('ataques', JSON.stringify(ataques));

                            if (jogadorAlvo && (jogadorAlvo.status === 'protegido' || jogadorAlvo.status === 'envenenado')) {
                                window.location.href = 'mediador.html';
                            } else {
                                atualizarStatusJogador(nomeSelecionado, 'condenado');
                                window.location.href = 'mediador.html';
                            }
                        });
                    });
                }

                navegacaoDiv.appendChild(botaoAtaque);
            }


            if (papelAtual.toLowerCase() === 'lobo alfa') {
                const jogadoresVivos = jogadoresStatus.filter(jogador =>
                    jogador.status !== 'morto' && jogador.status !== 'ressuscitado' && jogador.nome !== jogadorAtual
                );
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Atacar';
                const botaoMorder = document.createElement('button');
                botaoMorder.textContent = 'Morder';

                const jogadorStatusAtual = jogadoresStatus.find(jogador => jogador.nome === jogadorAtual.nome);
                const filhoteDeLobisomem = (localStorage.getItem('filhoteDeLobisomem')) || [];
                const ataques = JSON.parse(localStorage.getItem('ataques')) || [];
                const loboAlfa = localStorage.getItem('loboAlfa') || [];


                const outrosLobisomensDiv = document.createElement('div');
                outrosLobisomensDiv.style.position = 'fixed';
                outrosLobisomensDiv.style.bottom = '10px';
                outrosLobisomensDiv.style.right = '10px';
                outrosLobisomensDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                outrosLobisomensDiv.style.color = '#ffffff37';
                outrosLobisomensDiv.style.padding = '10px';
                outrosLobisomensDiv.style.borderRadius = '5px';
                outrosLobisomensDiv.innerHTML = '<strong>Lobisomens:</strong><br>';

                const outrosLobisomens = resultadoSorteio.filter(
                    jogador =>
                        jogador.jogador !== jogadorAtual.nome &&
                        jogadoresStatus.find(vivo =>
                            vivo.nome === jogador.jogador &&
                            vivo.status !== 'morto' &&
                            vivo.status !== 'ressuscitado' &&
                            ['lobisomem', 'lobo alfa', 'filhote de lobisomem'].includes(jogador.papel)
                        )
                );

                if (outrosLobisomens.length > 0) {
                    outrosLobisomens.forEach(lobisomem => {
                        const nomeLobisomem = document.createElement('span');
                        nomeLobisomem.textContent = `- ${lobisomem.jogador}`;
                        outrosLobisomensDiv.appendChild(document.createElement('br'));
                        outrosLobisomensDiv.appendChild(nomeLobisomem);
                    });
                } else {
                    const nenhumLobisomem = document.createElement('span');
                    nenhumLobisomem.textContent = 'Nenhum outro lobisomem vivo.';
                    outrosLobisomensDiv.appendChild(nenhumLobisomem);
                }

                document.body.appendChild(outrosLobisomensDiv);

                if (jogadorStatusAtual && jogadorStatusAtual.status === 'leproso') {
                    botaoAtaque.disabled = true;
                    botaoAtaque.textContent = 'Leproso';

                    atualizarStatusJogador(jogadorAtual.nome, 'vivo');
                } else if (filhoteDeLobisomem.length >= 1 && jogadoresVivos.length > 2) {
                    botaoAtaque.textContent = 'Atacar x2';
                    botaoAtaque.addEventListener('click', () => {
                        abrirJanelaAtaqueDuplo(jogadorAtual.nome, (nome1, nome2) => {
                            const ataques = JSON.parse(localStorage.getItem('ataques')) || [];

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nome1
                            });

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nome2
                            });

                            localStorage.setItem('ataques', JSON.stringify(ataques));

                            window.location.href = 'mediador.html';
                        });
                    });
                }

                else {
                    botaoAtaque.addEventListener('click', () => {
                        abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                            const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                            const ataques = JSON.parse(localStorage.getItem('ataques')) || [];

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nomeSelecionado
                            });

                            localStorage.setItem('ataques', JSON.stringify(ataques));

                            if (jogadorAlvo && (jogadorAlvo.status === 'protegido' || jogadorAlvo.status === 'envenenado')) {
                                window.location.href = 'mediador.html';
                            } else {
                                atualizarStatusJogador(nomeSelecionado, 'condenado');
                                window.location.href = 'mediador.html';
                            }
                        });
                    });

                    if (loboAlfa.length > 0) {
                        botaoMorder.disabled = true;
                        botaoMorder.textContent = 'Já mordeu';
                    } else {
                        botaoMorder.addEventListener('click', () => {
                            abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                                let mordida = localStorage.getItem('mordida') || [];
                                mordida = nomeSelecionado;

                                localStorage.setItem('mordida', JSON.stringify(mordida));
                                localStorage.setItem('loboAlfa', JSON.stringify(jogadorAtual.nome));

                                showAlert('Você mordeu ' + nomeSelecionado + '.', () => {
                                    window.location.href = 'mediador.html';
                                });

                            });
                        });
                    }

                }

                navegacaoDiv.appendChild(botaoAtaque);
                navegacaoDiv.appendChild(botaoMorder);
            }


            if (papelAtual.toLowerCase() === 'filhote de lobisomem') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Atacar';

                const jogadorStatusAtual = jogadoresStatus.find(jogador => jogador.nome === jogadorAtual.nome);

                const outrosLobisomensDiv = document.createElement('div');
                outrosLobisomensDiv.style.position = 'fixed';
                outrosLobisomensDiv.style.bottom = '10px';
                outrosLobisomensDiv.style.right = '10px';
                outrosLobisomensDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                outrosLobisomensDiv.style.color = '#ffffff37';
                outrosLobisomensDiv.style.padding = '10px';
                outrosLobisomensDiv.style.borderRadius = '5px';
                outrosLobisomensDiv.innerHTML = '<strong>Lobisomens:</strong><br>';

                const outrosLobisomens = resultadoSorteio.filter(
                    jogador =>
                        jogador.jogador !== jogadorAtual.nome &&
                        jogadoresStatus.find(vivo =>
                            vivo.nome === jogador.jogador &&
                            vivo.status !== 'morto' &&
                            vivo.status !== 'ressuscitado' &&
                            ['lobisomem', 'lobo alfa', 'filhote de lobisomem'].includes(jogador.papel)
                        )
                );

                if (outrosLobisomens.length > 0) {
                    outrosLobisomens.forEach(lobisomem => {
                        const nomeLobisomem = document.createElement('span');
                        nomeLobisomem.textContent = `- ${lobisomem.jogador}`;
                        outrosLobisomensDiv.appendChild(document.createElement('br'));
                        outrosLobisomensDiv.appendChild(nomeLobisomem);
                    });
                } else {
                    const nenhumLobisomem = document.createElement('span');
                    nenhumLobisomem.textContent = 'Nenhum outro lobisomem vivo.';
                    outrosLobisomensDiv.appendChild(nenhumLobisomem);
                }

                document.body.appendChild(outrosLobisomensDiv);

                if (jogadorStatusAtual && jogadorStatusAtual.status === 'leproso') {
                    botaoAtaque.disabled = true;
                    botaoAtaque.textContent = 'Leproso';

                    atualizarStatusJogador(jogadorAtual.nome, 'vivo');
                } else {
                    botaoAtaque.addEventListener('click', () => {
                        abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                            const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                            const ataques = JSON.parse(localStorage.getItem('ataques')) || [];

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nomeSelecionado
                            });

                            localStorage.setItem('ataques', JSON.stringify(ataques));

                            if (jogadorAlvo && (jogadorAlvo.status === 'protegido' || jogadorAlvo.status === 'envenenado')) {
                                window.location.href = 'mediador.html';
                            } else {
                                atualizarStatusJogador(nomeSelecionado, 'condenado');
                                window.location.href = 'mediador.html';
                            }
                        });
                    });
                }

                navegacaoDiv.appendChild(botaoAtaque);
            }


            if (papelAtual.toLowerCase() === 'caçador de cabeças') {
                const botaoManhunt = document.createElement('button');
                botaoManhunt.textContent = 'Escolher alvo';

                const listaManhunt = JSON.parse(localStorage.getItem('manhunt')) || {};

                if (listaManhunt[jogadorAtual.nome]) {
                    botaoManhunt.disabled = true;
                    botaoManhunt.textContent = 'Alvo selecionado';
                } else {
                    botaoManhunt.addEventListener('click', () => {
                        abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                            const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                            if (jogadorAlvo && jogadorAlvo.status !== 'morto') {
                                listaManhunt[jogadorAtual.nome] = nomeSelecionado;
                                localStorage.setItem('manhunt', JSON.stringify(listaManhunt));

                                window.location.href = 'mediador.html';
                            } else {
                                showAlert('Você só pode selecionar um jogador vivo como alvo.');
                            }
                        }, listaManhunt[jogadorAtual.nome]);
                    });
                }

                navegacaoDiv.appendChild(botaoManhunt);
            }



            if (papelAtual.toLowerCase() === 'necromante') {
                const botaoRessuscitar = document.createElement('button');
                botaoRessuscitar.textContent = 'Ressuscitar';

                botaoRessuscitar.addEventListener('click', () => {
                    abrirJanelaNecromante(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                        if (jogadorAlvo && jogadorAlvo.status === 'morto') {
                            atualizarStatusJogador(nomeSelecionado, 'ressuscitado');
                            const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                            if (jogadorIndex !== -1) {
                                resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                showAlert('Você agora é um aldeão.', () => {
                                    window.location.href = 'mediador.html';
                                });
                            }
                        }

                    });
                });

                navegacaoDiv.appendChild(botaoRessuscitar);
            }

            if (papelAtual.toLowerCase() === 'vidente') {
                const botaoRevelar = document.createElement('button');
                botaoRevelar.textContent = 'Revelar';
                botaoRevelar.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorRevelado = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        if (jogadorRevelado) {
                            showAlert(`${nomeSelecionado} é: ${resultadoSorteio.find(j => j.jogador === nomeSelecionado)?.papel || 'Desconhecido'}`, () => {
                                window.location.href = 'mediador.html';
                            });
                        } else {
                            showAlert('Jogador não encontrado.');
                        }
                    });
                });
                navegacaoDiv.appendChild(botaoRevelar);
            }


            if (papelAtual.toLowerCase() === 'piromaníaco') {
                const jogadoresVivos = jogadoresStatus.filter(jogador =>
                    jogador.status !== 'morto' && jogador.status !== 'ressuscitado' && jogador.nome !== jogadorAtual
                );
                if (jogadorAtual.status !== 'envenenado') {
                    atualizarStatusJogador(jogadorAtual.nome, 'protegido')
                }
                const botaoSelecionar = document.createElement('button');
                botaoSelecionar.textContent = 'Encharcar';

                botaoSelecionar.addEventListener('click', () => {
                    if (jogadoresVivos.length < 3) {
                        abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                            const gasolina = JSON.parse(localStorage.getItem('gasolina')) || {};
                            gasolina[jogadorAtual.nome] = [nomeSelecionado];
                            localStorage.setItem('gasolina', JSON.stringify(gasolina));
                            showAlert('Alvo encharcado!', () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });

                        });
                    } else {
                        abrirJanelaDetetive(jogadorAtual.nome, (jogador1, jogador2) => {
                            const gasolina = JSON.parse(localStorage.getItem('gasolina')) || {};
                            gasolina[jogadorAtual.nome] = [jogador1, jogador2];
                            localStorage.setItem('gasolina', JSON.stringify(gasolina));

                            showAlert('Alvos encharcado!', () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        });
                    }

                });

                navegacaoDiv.appendChild(botaoSelecionar);

                const botaoEnvenenar = document.createElement('button');
                botaoEnvenenar.textContent = 'Queimar';

                botaoEnvenenar.addEventListener('click', () => {
                    const gasolina = JSON.parse(localStorage.getItem('gasolina')) || {};
                    const jogadoresSelecionados = gasolina[jogadorAtual.nome];

                    if (jogadoresSelecionados && jogadoresSelecionados.length > 0) {
                        jogadoresSelecionados.forEach(nomeJogador => {
                            const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeJogador);

                            if (jogadorAlvo && jogadorAlvo.status !== 'morto' && jogadorAlvo.status !== 'ressuscitado') {
                                atualizarStatusJogador(nomeJogador, 'envenenado');
                            }
                        });

                        showAlert('Os jogadores encharcados foram queimados!', () => {
                            localStorage.removeItem('gasolina');
                            window.location.href = 'mediador.html';
                        });
                    } else {
                        showAlert('Nenhum jogador vivo está encharcado.');
                    }
                });


                navegacaoDiv.appendChild(botaoEnvenenar);

                const jogadoresEncharcados = JSON.parse(localStorage.getItem('gasolina'));

                console.log(jogadoresEncharcados);

                const jogadoresEncharcadosDiv = document.createElement('div');

                if (jogadoresEncharcados && Object.keys(jogadoresEncharcados).length > 0) {
                    Object.entries(jogadoresEncharcados).forEach(([jogador, encharcados]) => {
                        const nomeJogador = document.createElement('span');
                        nomeJogador.textContent = 'Encharcados:';
                        jogadoresEncharcadosDiv.appendChild(nomeJogador);
                        jogadoresEncharcadosDiv.appendChild(document.createElement('br'));
                        encharcados.forEach(nomeEncharcado => {
                            const nomeEncharcadoSpan = document.createElement('span');
                            nomeEncharcadoSpan.textContent = `${nomeEncharcado}`;
                            jogadoresEncharcadosDiv.appendChild(nomeEncharcadoSpan);
                            jogadoresEncharcadosDiv.appendChild(document.createElement('br'));
                        });

                    });
                } else {
                    const nenhumEncharcado = document.createElement('span');
                    nenhumEncharcado.textContent = 'Nenhum jogador encharcado.';
                    jogadoresEncharcadosDiv.appendChild(nenhumEncharcado);
                }

                const encharcados = document.createElement('div');
                jogadoresEncharcadosDiv.style.position = 'fixed';
                jogadoresEncharcadosDiv.style.bottom = '10px';
                jogadoresEncharcadosDiv.style.right = '10px';
                jogadoresEncharcadosDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                jogadoresEncharcadosDiv.style.color = '#ffffff37';
                jogadoresEncharcadosDiv.style.padding = '10px';
                jogadoresEncharcadosDiv.style.borderRadius = '5px';

                encharcados.appendChild(jogadoresEncharcadosDiv);
                document.body.appendChild(encharcados);

            }



            if (papelAtual.toLowerCase() === 'depressivo') {
                const botao = document.createElement('button');
                botao.textContent = 'Chorar';

                botao.addEventListener('click', () => {
                    window.location.href = 'mediador.html';
                });

                navegacaoDiv.appendChild(botao);
            }

            if (papelAtual.toLowerCase() === 'cupido') {
                const botaoEscolherCasal = document.createElement('button');
                botaoEscolherCasal.textContent = 'Casar';

                botaoEscolherCasal.addEventListener('click', () => {
                    abrirJanelaDetetive(jogadorAtual.nome, (jogador1, jogador2) => {
                        const casal = JSON.parse(localStorage.getItem('casal')) || {};

                        if (!casal[jogador1] && !casal[jogador2]) {

                            casal[jogador1] = jogador2;

                            localStorage.setItem('casal', JSON.stringify(casal));

                            const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                            if (jogadorIndex !== -1) {
                                resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                showAlert('Você agora é um aldeão.', () => {
                                    window.location.href = 'mediador.html';
                                });
                            }
                        } else {
                            showAlert('Um dos jogadores já está em um casal.');
                        }

                    });
                });

                navegacaoDiv.appendChild(botaoEscolherCasal);
            }



            if (papelAtual.toLowerCase() === 'inquisidor') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Punir';

                botaoAtaque.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorSelecionado = resultadoSorteio.find(jogador => jogador.jogador === nomeSelecionado);
                        if (jogadorSelecionado) {
                            const listaSeita = JSON.parse(localStorage.getItem('seita')) || [];

                            if (jogadorSelecionado.papel.toLowerCase() === 'líder de seita' || listaSeita.includes(jogadorSelecionado.jogador)) {
                                atualizarStatusJogador(nomeSelecionado, 'envenenado');
                                console.log(`${nomeSelecionado} foi envenenado por ser líder de seita ou fazer parte da seita.`);
                            } else {
                                console.log(`${nomeSelecionado} não é líder de seita e não pertence à seita, nada acontece.`);
                            }
                        } else {
                            console.warn(`Jogador "${nomeSelecionado}" não encontrado no sorteio.`);
                        }

                        window.location.href = 'mediador.html';
                    });
                });

                navegacaoDiv.appendChild(botaoAtaque);
            }


            if (papelAtual.toLowerCase() === 'líder de seita') {
                const botaoConverter = document.createElement('button');
                botaoConverter.textContent = 'Converter';

                botaoConverter.addEventListener('click', () => {
                    const membrosSeita = JSON.parse(localStorage.getItem('seita')) || [];

                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorSelecionado = resultadoSorteio.find(j => j.jogador === nomeSelecionado);

                        if (jogadorSelecionado) {
                            if (jogadorSelecionado.papel.toLowerCase() === 'inquisidor') {
                                atualizarStatusJogador(jogadorSelecionado.jogador, 'envenenado');
                                console.log(`${jogadorSelecionado.jogador} foi envenenado porque é um inquisidor.`);
                            }

                            membrosSeita.push(nomeSelecionado);
                            localStorage.setItem('seita', JSON.stringify(membrosSeita));
                            console.log(`${nomeSelecionado} foi convertido para a seita.`);

                        } else {
                            console.warn(`Jogador "${nomeSelecionado}" não encontrado no sorteio.`);
                        }

                        window.location.href = 'mediador.html';
                    }, membrosSeita);
                });

                navegacaoDiv.appendChild(botaoConverter);
            }

            if (papelAtual.toLowerCase() === 'sósia') {

                const botaoSosia = document.createElement('button');
                botaoSosia.textContent = 'Escolher Jogador';

                botaoSosia.addEventListener('click', () => {
                    const sosias = JSON.parse(localStorage.getItem('sosia')) || {};

                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorSelecionado = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        if (jogadorSelecionado) {
                            sosias[jogadorAtual.nome] = nomeSelecionado;
                            localStorage.setItem('sosia', JSON.stringify(sosias));

                            const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                            if (jogadorIndex !== -1) {
                                resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                showAlert('Você agora é um aldeão.', () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            }
                        } else {
                            showAlert('Jogador selecionado não encontrado!');
                        }
                    }, sosias[jogadorAtual.nome]);
                });

                navegacaoDiv.appendChild(botaoSosia);
            }


            if (papelAtual.toLowerCase() === 'feiticeira') {
                const botaoRevelarPapel = document.createElement('button');
                botaoRevelarPapel.textContent = 'Revelar Papel';

                botaoRevelarPapel.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorRevelado = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        if (jogadorRevelado) {
                            const papelSelecionado = resultadoSorteio.find(j => j.jogador === nomeSelecionado)?.papel || 'Desconhecido';
                            if (papelSelecionado.toLowerCase() === 'lobisomem' || papelSelecionado.toLowerCase() === 'lobo solitário' || papelSelecionado.toLowerCase() === 'lobo alfa' || papelSelecionado.toLowerCase() === 'filhote de lobisomem') {

                                showAlert(`${nomeSelecionado} é lobisomem.`, () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });

                            } else if (papelSelecionado.toLowerCase() === 'vidente' || papelSelecionado.toLowerCase() === 'aprendiz de vidente' || papelSelecionado.toLowerCase() === 'vidente de aura') {
                                showAlert(`${nomeSelecionado} é vidente.`, () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            }

                            else {
                                showAlert(`${nomeSelecionado} não é lobisomem nem vidente.`, () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            }
                        } else {
                            showAlert(`Jogador não encontrado`, () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        }
                    });
                });

                navegacaoDiv.appendChild(botaoRevelarPapel);
            }



            if (papelAtual.toLowerCase() === 'lobo solitário') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Atacar';

                const jogadorStatusAtual = jogadoresStatus.find(jogador => jogador.nome === jogadorAtual.nome);
                if (jogadorStatusAtual && jogadorStatusAtual.status === 'leproso') {
                    botaoAtaque.disabled = true;
                    botaoAtaque.textContent = 'Leproso';

                    atualizarStatusJogador(jogadorAtual.nome, 'vivo')
                }
                else {
                    botaoAtaque.addEventListener('click', () => {
                        abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                            const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                            const ataques = JSON.parse(localStorage.getItem('ataques')) || [];

                            ataques.push({
                                atacante: jogadorAtual.nome,
                                alvo: nomeSelecionado
                            });

                            localStorage.setItem('ataques', JSON.stringify(ataques));

                            if (jogadorAlvo && (jogadorAlvo.status === 'protegido' || jogadorAlvo.status === 'envenenado')) {
                                window.location.href = 'mediador.html';
                            } else {
                                atualizarStatusJogador(nomeSelecionado, 'condenado');
                                window.location.href = 'mediador.html';
                            }
                        });
                    });
                }

                navegacaoDiv.appendChild(botaoAtaque);
            }

            if (papelAtual.toLowerCase() === 'pistoleiro') {
                const botaoAtirar = document.createElement('button');
                botaoAtirar.textContent = 'Atirar';
                const pistoleiros = JSON.parse(localStorage.getItem('pistoleiro')) || {};

                const tirosUsados = pistoleiros[jogadorAtual.nome] || 0;

                if (tirosUsados >= 2) {
                    botaoAtirar.disabled = true;
                    botaoAtirar.textContent = 'Sem balas';
                }

                botaoAtirar.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const status = jogadoresStatus.find(status => status.nome === nomeSelecionado);

                        if (status && status.status !== 'morto' && status.status !== 'ressuscitado') {
                            pistoleiros[jogadorAtual.nome] = (pistoleiros[jogadorAtual.nome] || 0) + 1;
                            localStorage.setItem('pistoleiro', JSON.stringify(pistoleiros));

                            atualizarStatusJogador(nomeSelecionado, 'envenenado');

                            const tirosUsados = pistoleiros[jogadorAtual.nome] || 0;


                            if (tirosUsados >= 2) {
                                const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                                if (jogadorIndex !== -1) {
                                    resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                    localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                    showAlert(`Você agora é um aldeão.`, () => {
                                        window.location.href = 'mediador.html';
                                    });
                                }
                            } else {
                                
                                window.location.href = 'mediador.html';
                            }
                            
                        } else {
                            showAlert('O jogador selecionado já está morto ou não pode ser atingido.');
                        }
                    });
                });

                navegacaoDiv.appendChild(botaoAtirar);
            }


            if (papelAtual.toLowerCase() === 'vovó zangada') {
                const botaoSilenciar = document.createElement('button');
                botaoSilenciar.textContent = 'Silenciar alguém';

                botaoSilenciar.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorSelecionado = resultadoSorteio.find(jogador => jogador.jogador === nomeSelecionado);
                        if (jogadorSelecionado) {
                            const silenciados = JSON.parse(localStorage.getItem('silenciado')) || [];

                            if (!silenciados.includes(nomeSelecionado)) {
                                silenciados.push(nomeSelecionado);
                                localStorage.setItem('silenciado', JSON.stringify(silenciados));
                            }

                            console.log(`${nomeSelecionado} foi silenciado.`);
                        } else {
                            console.warn(`Jogador "${nomeSelecionado}" não encontrado no sorteio.`);
                        }

                        window.location.href = 'mediador.html';
                    });
                });

                navegacaoDiv.appendChild(botaoSilenciar);
            }


            if (papelAtual.toLowerCase() === 'prostituta') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Dormir com alguém';

                botaoAtaque.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorSelecionado = resultadoSorteio.find(jogador => jogador.jogador === nomeSelecionado);
                        if (jogadorSelecionado) {

                            const dormindo = JSON.parse(localStorage.getItem('dormindo')) || {};

                            dormindo[jogadorAtual.nome] = nomeSelecionado;
                            localStorage.setItem('dormindo', JSON.stringify(dormindo));

                            if (jogadorSelecionado.papel.toLowerCase() === 'lobisomem' || jogadorSelecionado.papel.toLowerCase() === 'lobo solitário') {
                                atualizarStatusJogador(jogadorAtual.nome, 'condenado');
                            } else {
                                atualizarStatusJogador(jogadorAtual.nome, 'protegido');
                            }
                        } else {
                            console.warn(`Jogador "${nomeSelecionado}" não encontrado no sorteio.`);
                        }

                        window.location.href = 'mediador.html';
                    });
                });

                navegacaoDiv.appendChild(botaoAtaque);
            }

            if (papelAtual.toLowerCase() === 'menino travesso') {
                const botaoTrocar = document.createElement('button');
                botaoTrocar.textContent = 'Trocar papéis';

                botaoTrocar.addEventListener('click', () => {
                    abrirJanelaDetetive(jogadorAtual.nome, (jogador1, jogador2) => {
                        const trocas = JSON.parse(localStorage.getItem('troca')) || [];

                        trocas.push([jogador1, jogador2]);

                        localStorage.setItem('troca', JSON.stringify(trocas));

                        const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                        if (jogadorIndex !== -1) {
                            resultadoSorteio[jogadorIndex].papel = 'aldeão';
                            localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                            showAlert(`Você agora é um aldeão.`, () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        } else {
                            console.warn(`Jogador "${jogadorAtual.nome}" não encontrado na lista de sorteio.`);

                            window.location.href = 'mediador.html';
                        }
                    });

                });

                navegacaoDiv.appendChild(botaoTrocar);
            }

            if (papelAtual.toLowerCase() === 'menininha') {
                const botaoAbrirOlhos = document.createElement('button');
                botaoAbrirOlhos.textContent = 'Abrir os olhos';

                botaoAbrirOlhos.addEventListener('click', () => {
                    const chance = Math.floor(Math.random() * 100);

                    if (chance < 16) {
                        const lobisomensVivos = resultadoSorteio
                            .filter(jogador => jogador.papel.toLowerCase() === 'lobisomem' || jogador.papel.toLowerCase() === 'lobo solitário')
                            .filter(jogador => {
                                const statusJogador = jogadoresStatus.find(js => js.nome === jogador.jogador);
                                return statusJogador && statusJogador.status !== 'morto' && statusJogador.status !== 'ressuscitado';
                            });

                        if (lobisomensVivos.length > 0) {
                            const lobisomemAleatorio = lobisomensVivos[Math.floor(Math.random() * lobisomensVivos.length)];

                            showAlert(`Você viu que ${lobisomemAleatorio.jogador} é um lobisomem.`, () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });

                        } else {
                            showAlert(`Não há lobisomens vivos para ver.`, () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        }
                    } else if (chance >= 16 && chance <= 30) {
                        atualizarStatusJogador(jogadorAtual.nome, 'condenado');
                        showAlert(`O lobisomem viu você!`, () => {
                            window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                        });
                    } else {
                        showAlert(`Você não conseguiu ver nada dessa vez.`, () => {
                            window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                        });
                    }

                });

                navegacaoDiv.appendChild(botaoAbrirOlhos);
            }

            if (papelAtual.toLowerCase() === 'maçom') {
                const botaoRevelarAura = document.createElement('button');
                botaoRevelarAura.textContent = 'Revelar';

                botaoRevelarAura.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorRevelado = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        if (jogadorRevelado) {
                            const papelSelecionado = resultadoSorteio.find(j => j.jogador === nomeSelecionado)?.papel || 'Desconhecido';
                            if (papelSelecionado.toLowerCase() === 'maçom') {
                                showAlert(`${nomeSelecionado} é maçom.`);
                            } else {
                                showAlert(`${nomeSelecionado} não é maçom.`);
                            }
                        } else {
                            showAlert('Jogador não encontrado.');
                        }
                    });
                });

                navegacaoDiv.appendChild(botaoRevelarAura);
            }

            if (papelAtual.toLowerCase() === 'sacerdote') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Abençoar';

                botaoAtaque.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorSelecionado = resultadoSorteio.find(jogador => jogador.jogador === nomeSelecionado);
                        if (jogadorSelecionado) {
                            if (jogadorSelecionado.papel.toLowerCase() === 'lobisomem' || jogadorSelecionado.papel.toLowerCase() === 'lobo solitário') {
                                atualizarStatusJogador(nomeSelecionado, 'envenenado');
                                console.log(`${nomeSelecionado} foi envenenado.`);
                            } else {
                                atualizarStatusJogador(jogadorAtual.nome, 'envenenado');
                                console.log(`${jogadorAtual.nome} foi envenenado.`);
                            }
                        } else {
                            console.warn(`Jogador "${nomeSelecionado}" não encontrado no sorteio.`);
                        }

                        window.location.href = 'mediador.html';
                    });
                });

                navegacaoDiv.appendChild(botaoAtaque);
            }

            if (papelAtual.toLowerCase() === 'médico') {
                const botaoProtecao = document.createElement('button');
                botaoProtecao.textContent = 'Proteger';

                botaoProtecao.addEventListener('click', () => {
                    const protecoesMedico = JSON.parse(localStorage.getItem('protecoesMedico')) || {};

                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        protecoesMedico[jogadorAtual.nome] = nomeSelecionado;

                        const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                        if (jogadorAlvo && (jogadorAlvo.status === 'condenado' || jogadorAlvo.status === 'vivo')) {
                            atualizarStatusJogador(nomeSelecionado, 'protegido');
                        }

                        localStorage.setItem('protecoesMedico', JSON.stringify(protecoesMedico));

                        window.location.href = 'mediador.html';
                    }, protecoesMedico[jogadorAtual.nome]);
                });

                navegacaoDiv.appendChild(botaoProtecao);
            }

            if (papelAtual.toLowerCase() === 'assassino em série') {
                const botaoEnvenenar = document.createElement('button');
                botaoEnvenenar.textContent = 'Matar';

                botaoEnvenenar.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorRevelado = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        if (jogadorRevelado) {
                            atualizarStatusJogador(nomeSelecionado, 'envenenado');
                        } else {
                            alert('Jogador não encontrado.');
                        }
                        window.location.href = 'mediador.html';
                    });
                });

                navegacaoDiv.appendChild(botaoEnvenenar);
            }


            if (papelAtual.toLowerCase() === 'vidente de aura') {
                const botaoRevelarAura = document.createElement('button');
                botaoRevelarAura.textContent = 'Revelar Aura';

                botaoRevelarAura.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorRevelado = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        if (jogadorRevelado) {
                            const papelSelecionado = resultadoSorteio.find(j => j.jogador === nomeSelecionado)?.papel || 'Desconhecido';
                            if (papelSelecionado.toLowerCase() === 'lobisomem' || papelSelecionado.toLowerCase() === 'lobo solitário') {

                                showAlert(`${nomeSelecionado} é lobisomem.`, () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            } else {
                                showAlert(`${nomeSelecionado} não é lobisomem.`, () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            }
                        } else {
                            showAlert(`Jogador não encontrado`, () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        }

                    });
                });
                navegacaoDiv.appendChild(botaoRevelarAura);
            }


            if (papelAtual.toLowerCase() === 'caçador') {

                const botaoCacador = document.createElement('button');
                botaoCacador.textContent = 'Caçar';

                botaoCacador.addEventListener('click', () => {
                    const caçadasCaçador = JSON.parse(localStorage.getItem('cacadasCacador')) || {};

                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);
                        caçadasCaçador[jogadorAtual.nome] = nomeSelecionado;
                        localStorage.setItem('cacadasCacador', JSON.stringify(caçadasCaçador));
                        window.location.href = 'mediador.html';
                    }, caçadasCaçador[jogadorAtual.nome]);
                });

                navegacaoDiv.appendChild(botaoCacador);
            }


            if (papelAtual.toLowerCase() === 'bruxa') {

                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Envenenar';

                let ataquesBruxa = JSON.parse(localStorage.getItem('ataquesBruxa')) || {};

                if (ataquesBruxa[jogadorAtual.nome]) {
                    botaoAtaque.disabled = true;
                    botaoAtaque.textContent = 'Sem poção';
                }

                botaoAtaque.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        let status = jogadoresStatus.find(status => status.nome === nomeSelecionado && status.status === 'envenenado');

                        if (status) {
                            ataquesBruxa[jogadorAtual.nome] = nomeSelecionado;
                            localStorage.setItem('ataquesBruxa', JSON.stringify(ataquesBruxa));

                            ataquesBruxa = JSON.parse(localStorage.getItem('ataquesBruxa')) || {};
                            protecoesBruxa = JSON.parse(localStorage.getItem('protecoesBruxa')) || {};

                            if (protecoesBruxa[jogadorAtual.nome] && ataquesBruxa[jogadorAtual.nome]) {
                                const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                                if (jogadorIndex !== -1) {
                                    resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                    localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                    showAlert(`Você agora é um aldeão.`, () => {
                                        atualizarStatusJogador(nomeSelecionado, 'envenenado');
                                        window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                    });
                                }
                            }

                        } else {
                            ataquesBruxa[jogadorAtual.nome] = nomeSelecionado;
                            localStorage.setItem('ataquesBruxa', JSON.stringify(ataquesBruxa));

                            atualizarStatusJogador(nomeSelecionado, 'envenenado');
                            window.location.href = 'mediador.html';

                            ataquesBruxa = JSON.parse(localStorage.getItem('ataquesBruxa')) || {};
                            protecoesBruxa = JSON.parse(localStorage.getItem('protecoesBruxa')) || {};

                            if (protecoesBruxa[jogadorAtual.nome] && ataquesBruxa[jogadorAtual.nome]) {
                                const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                                if (jogadorIndex !== -1) {
                                    resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                    localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                    showAlert(`Você agora é um aldeão.`, () => {
                                        atualizarStatusJogador(nomeSelecionado, 'envenenado');
                                        window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                    });
                                }
                            }
                        }
                    });
                });

                navegacaoDiv.appendChild(botaoAtaque);

                const botaoProtecao = document.createElement('button');
                botaoProtecao.textContent = 'Proteger';

                let protecoesBruxa = JSON.parse(localStorage.getItem('protecoesBruxa')) || {};

                if (protecoesBruxa[jogadorAtual.nome]) {
                    botaoProtecao.disabled = true;
                    botaoProtecao.textContent = 'Sem poção';
                }

                botaoProtecao.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                        if (jogadorAlvo && (jogadorAlvo.status === 'condenado' || jogadorAlvo.status === 'vivo')) {
                            atualizarStatusJogador(nomeSelecionado, 'protegido');
                            window.location.href = 'mediador.html';
                        }

                        protecoesBruxa[jogadorAtual.nome] = nomeSelecionado;
                        localStorage.setItem('protecoesBruxa', JSON.stringify(protecoesBruxa));

                        ataquesBruxa = JSON.parse(localStorage.getItem('ataquesBruxa')) || {};
                        protecoesBruxa = JSON.parse(localStorage.getItem('protecoesBruxa')) || {};

                        window.location.href = 'mediador.html';

                        if (protecoesBruxa[jogadorAtual.nome] && ataquesBruxa[jogadorAtual.nome]) {
                            const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                            if (jogadorIndex !== -1) {
                                resultadoSorteio[jogadorIndex].papel = 'aldeão';
                                localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                                showAlert(`Você agora é um aldeão.`, () => {
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            }
                        }

                    });
                });

                navegacaoDiv.appendChild(botaoProtecao);
            }

            if (papelAtual.toLowerCase() === 'aprendiz de vidente') {
                const botaoAprender = document.createElement('button');
                botaoAprender.textContent = 'Aprender';

                botaoAprender.addEventListener('click', () => {
                    const aprendizesDeVidente = JSON.parse(localStorage.getItem('aprendizesDeVidente')) || {};
                    const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

                    if (aprendizesDeVidente[jogadorAtual.nome]) {
                        aprendizesDeVidente[jogadorAtual.nome]++;
                    } else {
                        aprendizesDeVidente[jogadorAtual.nome] = 1;
                    }

                    localStorage.setItem('aprendizesDeVidente', JSON.stringify(aprendizesDeVidente));

                    if (aprendizesDeVidente[jogadorAtual.nome] === 2) {
                        const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                        if (jogadorIndex !== -1) {
                            resultadoSorteio[jogadorIndex].papel = 'vidente';
                            localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                            console.log(`Jogador "${jogadorAtual.nome}" agora é vidente.`);
                            showAlert(`Você agora é um vidente!`, () => {
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        }

                    } else {
                        showAlert(`Você está aprendendo. Nível atual: ${aprendizesDeVidente[jogadorAtual.nome]}`, () => {
                            window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                        });
                    }
                });

                navegacaoDiv.appendChild(botaoAprender);
            }

            if (papelAtual.toLowerCase() === 'pacifista') {
                const botaoPacifista = document.createElement('button');
                botaoPacifista.textContent = 'Pacificar';

                const pacifistas = JSON.parse(localStorage.getItem('pacifistas')) || {};

                if (pacifistas[jogadorAtual.nome]) {
                    botaoPacifista.disabled = true;
                    botaoPacifista.textContent = 'Já pacificou';
                }

                botaoPacifista.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        pacifistas[jogadorAtual.nome] = nomeSelecionado;
                        localStorage.setItem('pacifistas', JSON.stringify(pacifistas));

                        const listaDoPacifista = JSON.parse(localStorage.getItem('listaDoPacifista')) || [];
                        listaDoPacifista.push({ jogador: nomeSelecionado, papel: resultadoSorteio.find(j => j.jogador === nomeSelecionado)?.papel || 'Desconhecido' });
                        localStorage.setItem('listaDoPacifista', JSON.stringify(listaDoPacifista));

                        let vilaPacificada = JSON.parse(localStorage.getItem('vilaPacificada')) || [];
                        vilaPacificada = 1;
                        localStorage.setItem('vilaPacificada', JSON.stringify(vilaPacificada));

                        window.location.href = 'mediador.html';
                    });
                });

                navegacaoDiv.appendChild(botaoPacifista);
            }

            if (papelAtual.toLowerCase() === 'prefeito') {
                const botaoRevelar = document.createElement('button');
                botaoRevelar.textContent = 'Revelar';

                const prefeitos = JSON.parse(localStorage.getItem('prefeito')) || [];

                if (prefeitos.includes(jogadorAtual.nome)) {
                    botaoRevelar.disabled = true;
                    botaoRevelar.textContent = 'Já revelado';
                }

                botaoRevelar.addEventListener('click', () => {
                    prefeitos.push(jogadorAtual.nome);
                    localStorage.setItem('prefeito', JSON.stringify(prefeitos));

                    botaoRevelar.disabled = true;
                    botaoRevelar.textContent = 'Já revelado';

                    window.location.href = 'mediador.html';
                });

                navegacaoDiv.appendChild(botaoRevelar);
            }

            if (papelAtual.toLowerCase() === 'guarda-costas') {
                const botaoProtecao = document.createElement('button');
                botaoProtecao.textContent = 'Proteger';

                botaoProtecao.addEventListener('click', () => {
                    const protecoesGuardaCostas = JSON.parse(localStorage.getItem('guardaCostas')) || {};

                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                        if (jogadorAlvo && (jogadorAlvo.status === 'vivo' || jogadorAlvo.status === 'condenado')) {
                            atualizarStatusJogador(nomeSelecionado, 'protegido');
                        }

                        protecoesGuardaCostas[jogadorAtual.nome] = nomeSelecionado;
                        localStorage.setItem('guardaCostas', JSON.stringify(protecoesGuardaCostas));

                        window.location.href = 'mediador.html';
                    }, protecoesGuardaCostas[jogadorAtual.nome]);
                });

                navegacaoDiv.appendChild(botaoProtecao);
            }



            if (papelAtual.toLowerCase() === 'detetive') {
                const botaoInvestigar = document.createElement('button');
                botaoInvestigar.textContent = 'Investigar';

                botaoInvestigar.addEventListener('click', () => {
                    abrirJanelaDetetive(jogadorAtual.nome, (jogador1, jogador2) => {
                        const investigacao = [jogador1, jogador2];
                        localStorage.setItem('investigacao', JSON.stringify(investigacao));

                        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
                        const jogadores = investigacao.map(nome => resultadoSorteio.find(j => j.jogador === nome));

                        if (jogadores[0] && jogadores[1]) {
                            const antagonistas = [
                                'lobisomem',
                                'filhote de lobisomem',
                                'humano amaldiçoado',
                                'feiticeira',
                                'lobo alfa',
                                'assassino em série',
                                'depressivo',
                                'líder de seita',
                                'piromaníaco',
                                'caçador de cabeças',
                                'lobo solitário'
                            ];

                            const timeJogador1 = antagonistas.includes(jogadores[0].papel.toLowerCase()) ? 'antagonista' : 'vila';
                            const timeJogador2 = antagonistas.includes(jogadores[1].papel.toLowerCase()) ? 'antagonista' : 'vila';

                            if (timeJogador1 === timeJogador2) {
                                showAlert(`${jogador1} e ${jogador2} são do mesmo time.`, () => {

                                    localStorage.removeItem('investigacao');
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            } else {
                                showAlert(`${jogador1} e ${jogador2} são de times diferentes.`, () => {

                                    localStorage.removeItem('investigacao');
                                    window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                });
                            }
                        } else {
                            showAlert(`Um ou ambos os jogadores selecionados não foram encontrados.`, () => {

                                localStorage.removeItem('investigacao');
                                window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                            });
                        }


                    });
                });

                navegacaoDiv.appendChild(botaoInvestigar);
            }

            if (papelAtual.toLowerCase() === 'portador do amuleto') {
                const botaoProtecao = document.createElement('button');

                botaoProtecao.textContent = 'Vestir amuleto';

                const amuleto = JSON.parse(localStorage.getItem('amuleto')) || {};


                if (amuleto[jogadorAtual.nome] === 1) {
                    botaoProtecao.disabled = true;
                    botaoProtecao.textContent = 'Espere 1 dia';

                    amuleto[jogadorAtual.nome] = 2;
                    localStorage.setItem('amuleto', JSON.stringify(amuleto));
                }

                botaoProtecao.addEventListener('click', () => {
                    if (amuleto[jogadorAtual.nome] !== 1) {
                        amuleto[jogadorAtual.nome] = 1;
                        localStorage.setItem('amuleto', JSON.stringify(amuleto));

                        let status = jogadoresStatus.find(status => status.nome === jogadorAtual.nome && status.status === 'envenenado');

                        if (status) {
                            atualizarStatusJogador(jogadorAtual.nome, 'envenenado');
                        } else {
                            atualizarStatusJogador(jogadorAtual.nome, 'protegido');
                        }

                        window.location.href = 'mediador.html';
                    }
                });

                navegacaoDiv.appendChild(botaoProtecao);
            }

        };

        // ------------------- MAIN

        function main() {
            jogadoresStatus.forEach(jogador => {
                if (jogador.status === 'morto' && !ordemDeJogo.includes(jogador.nome)) {
                    ordemDeJogo.push(jogador.nome);
                }
            });

            localStorage.setItem('ordemDeJogo', JSON.stringify(ordemDeJogo));

            if (ordemDeJogo.length >= jogadoresStatus.length) {

                document.querySelector('.nome-pessoa .comando').textContent = 'Passe o aparelho para:';
                document.querySelector('.nome-pessoa .espaco').textContent = 'o Mestre do Jogo';

                posicaoAtual = null;

                continuarBtnModal.addEventListener('click', () => {
                    window.location.href = 'relatorio.html';
                });

            }
            else {
                exibirJogadorModal();

                let ordemDeJogo = JSON.parse(localStorage.getItem('ordemDeJogo')) || [];
                ordemDeJogo.push(jogadorAtual.nome);
                localStorage.setItem('ordemDeJogo', JSON.stringify(ordemDeJogo));
            }
        }

        main();
 