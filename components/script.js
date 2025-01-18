document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nomeInput = document.getElementById('nome');
    const tabelaCorpo = document.querySelector('table tbody');
    const page = document.body.dataset.page;
    const papeisLobisomens = ['lobo solitário', 'filhote de lobisomem', 'lobo alfa'];
    let posicaoAtual = parseInt(localStorage.getItem('posicaoAtual')) || 0;

    function showAlert(message, callback) {
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        document.body.appendChild(overlay);

        const modal = document.createElement('div');
        modal.id = 'background-alert';
        modal.classList.add('custom-alert-hidden');
        modal.innerHTML = `
            <div class="custom-alert-box">
                <div id="custom-alert-message">${message}</div>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => {
            overlay.style.display = 'block'; // Exibe a sobreposição
            modal.classList.remove('custom-alert-hidden');
            modal.classList.add('show');
        }, 0);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                overlay.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                    overlay.remove();
                    if (callback) callback(); // Chama o callback após o modal ser fechado
                }, 300);
            }
        });
    }

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

    window.addEventListener('load', () => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';
    });

    // Entrada da página 
    gsap.fromTo('body',
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href;

            gsap.to('body', {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    window.location.href = url;
                }
            });
        });
    });


    const papeisPerigosos = [
        "bruxa",
        "sacerdote",
        "vovó zangada",
        "pistoleiro",
        "assassino em série",
        "necromante",
        "piromaníaco",
        "lobisomem",
        "lobo solitário",
        "filhote de lobisomem",
        "lobo alfa"
    ]

    const criarBotaoChat = (jogadorAtual) => {
        const botaoChat = document.createElement('button');
        botaoChat.id = 'botao-chat';
        botaoChat.textContent = 'Chat';

        const chat = JSON.parse(localStorage.getItem('chat')) || [];

        // Verifica se o jogadorAtual já é remetente em alguma mensagem
        const jaEnviouMensagem = chat.some(mensagem => mensagem.remetente === jogadorAtual);

        if (jaEnviouMensagem) {
            botaoChat.disabled = true;
            botaoChat.textContent = 'Enviado';
        } else {
            botaoChat.addEventListener('click', () => {
                abrirChatModal(jogadorAtual);
            });
        }

        document.body.appendChild(botaoChat);
    };

    const abrirModalCadastro = () => {
        const modalCadastro = document.createElement('div');
        modalCadastro.className = 'modal-cadastro';
        modalCadastro.innerHTML = `
            <div class="modal-content">
                <div id="adicionar">
                    <form id="form-cadastro" action="#" method="post">
                        <label for="nome">Nome:</label>
                        <input type="text" id="nome" name="nome" required placeholder="Nome do jogador">
                        <hr>
                        <div id="div-botoes">
                            <button id="cancelar-cadastro" type="button">Cancelar</button>
                            <button class="cadastrar" type="submit">Adicionar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modalCadastro);

        // Foco automático no input
        const nomeInput = document.getElementById('nome');
        nomeInput.focus();

        // Cancelar cadastro
        document.getElementById('cancelar-cadastro').addEventListener('click', () => {
            modalCadastro.remove();
        });

        // Carregar jogadores
        carregarJogadores();

        // Submissão do formulário
        const form = document.getElementById('form-cadastro');
        form.addEventListener('submit', (event) => {
            // Prevenir comportamento padrão de envio
            event.preventDefault();

            const nome = nomeInput.value.trim();

            if (nome) {
                const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
                jogadores.push(nome);
                localStorage.setItem('jogadores', JSON.stringify(jogadores));

                // Limpar o input e fechar o modal
                nomeInput.value = '';
                modalCadastro.remove();
                carregarJogadores();
            } else {
                showAlert('Por favor, insira um nome.');
            }
        });
    };



    // --------------------------

    const abrirChatModal = (jogadorAtual) => {
        const modalChat = document.createElement('div');
        modalChat.className = 'modal-chat';
        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];

        const jogadoresVivos = jogadoresStatus.filter(jogador =>
            jogador.status !== 'morto' && jogador.nome !== jogadorAtual
        );

        modalChat.innerHTML = `
        <div class="modal-content">
            <h2>Enviar Mensagem</h2>
            <div id="selecao-mensagem">
            <select id="jogador-selecionado">
                ${jogadoresVivos.map(jogador =>
            `<option value="${jogador.nome}">${jogador.nome}</option>`
        ).join('')}
            </select>
            </div>
            <div>
            <textarea id="mensagem-chat" placeholder="Digite sua mensagem..."></textarea>
            </div>
            <div>
            <button id="cancelar-chat">Cancelar</button>
            <button id="enviar-chat">Enviar</button>
            </div>
        </div>
    `;

        document.body.appendChild(modalChat);

        document.getElementById('enviar-chat').addEventListener('click', () => {
            const jogadorSelecionado = document.getElementById('jogador-selecionado').value;
            const mensagem = document.getElementById('mensagem-chat').value;

            if (!jogadorSelecionado || !mensagem.trim()) {
                showAlert('Escolha um jogador e digite uma mensagem.');
                return;
            }

            const chat = JSON.parse(localStorage.getItem('chat')) || [];
            chat.push({
                remetente: jogadorAtual,
                destinatario: jogadorSelecionado,
                mensagem: mensagem.trim()
            });
            localStorage.setItem('chat', JSON.stringify(chat));

            showAlert('Mensagem enviada!');
            modalChat.remove();

            // Desabilitar o botão após o envio
            const botaoChat = document.getElementById('botao-chat');
            if (botaoChat) {
                botaoChat.disabled = true;
                botaoChat.textContent = 'Enviado';
            }
        });

        document.getElementById('cancelar-chat').addEventListener('click', () => {
            modalChat.remove();
        });
    };

    const exibirMensagensRecebidas = (jogadorAtual) => {

        const chatAgora = JSON.parse(localStorage.getItem('chatAgora')) || [];
        const mensagensRecebidas = chatAgora.filter(mensagem => mensagem.destinatario === jogadorAtual);

        if (mensagensRecebidas.length > 0) {
            const modalMensagens = document.createElement('div');
            modalMensagens.className = 'modal-mensagens';

            modalMensagens.innerHTML = `
                <div class="modal-content">
                    <h2>Mensagens:</h2>
                    <ul>
                        ${mensagensRecebidas.map(mensagem =>
                `<p style="font-size: 1.4rem">${mensagem.mensagem};</p><br>`
            ).join('')}
                    </ul>
                    <button id="fechar-mensagens">Fechar</button>
                </div>
            `;

            document.body.appendChild(modalMensagens);

            document.getElementById('fechar-mensagens').addEventListener('click', () => {
                modalMensagens.remove();
            });
        }
    };


    function votacaoOuFim() {

        const vilaPacificada = localStorage.getItem('vilaPacificada');
        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
        const listaPresidentes = JSON.parse(localStorage.getItem('presidente')) || [];

        function atualizarVivos() {
            const jogadoresStatusAtualizados = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
            return jogadoresStatusAtualizados.filter(jogador => jogador.status !== 'morto');
        }

        let vivos = jogadoresStatus.filter(jogador => jogador.status !== 'morto');
        const mortos = jogadoresStatus.filter(jogador => jogador.status === 'morto');

        const papeisImunes = [
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

        vivos = atualizarVivos();

        let papeisUnicos = resultadoSorteio.filter(jogador =>
            [
                'líder de seita',
                'assassino em série',
                'depressivo',
                'piromaníaco',
                'lobo solitário'
            ].includes(jogador.papel) &&
            vivos.some(vivo => vivo.nome === jogador.jogador)
        );

        console.log(JSON.stringify(papeisUnicos));

        const presidenteMorto = listaPresidentes.some(nomePresidente =>
            jogadoresStatus.some(jogador => jogador.nome === nomePresidente && jogador.status === 'morto')
        );

        if (presidenteMorto) {
            jogadoresStatus.forEach(jogador => {
                const papelDoJogador = resultadoSorteio.find(r => r.jogador === jogador.nome)?.papel;
                if (!papeisImunes.includes(papelDoJogador)) {
                    atualizarStatusJogador(jogador.nome, 'morto');
                }
            });

            vivos = atualizarVivos();
            const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

            localStorage.setItem('vitoria', JSON.stringify({
                vencedores: "Nenhum (todos eliminados pela morte do presidente)",
                vivos: vivos.map(j => j.nome),
                mortos: mortosAtualizados.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
            }));
        }

        function atualizarVivos() {
            const jogadoresStatusAtualizados = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
            return jogadoresStatusAtualizados.filter(jogador => jogador.status !== 'morto');
        }


        let lobisomensVivos = resultadoSorteio.filter(jogador =>
            ['lobisomem', 'lobo alfa', 'filhote de lobisomem'].includes(jogador.papel) &&
            vivos.some(v => v.nome === jogador.jogador)
        );

        let loboSolitarioVivo = resultadoSorteio.find(jogador =>
            jogador.papel === 'lobo solitário' && vivos.some(v => v.nome === jogador.jogador)
        );

        const feiticeirasVivas = resultadoSorteio.filter(jogador =>
            jogador.papel === 'feiticeira' && vivos.some(v => v.nome === jogador.jogador)
        );

        vivos = atualizarVivos();
        mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

        const assassinoEmSerieVivo = resultadoSorteio.find(jogador =>
            jogador.papel === 'assassino em série' && vivos.some(v => v.nome === jogador.jogador)
        );

        const aldeoesVivos = resultadoSorteio.filter(jogador =>
            !['lobisomem', 'lobo solitário', 'lobo alfa', 'filhote de lobisomem', 'piromaníaco', 'assassino em série', 'feiticeira'].includes(jogador.papel) &&
            vivos.some(v => v.nome === jogador.jogador)
        );

        console.log(aldeoesVivos)

        if (lobisomensVivos.length === 0) {
            feiticeirasVivas.forEach(feiticeira => {
                atualizarStatusJogador(feiticeira.jogador, 'morto');
                console.log(`${feiticeira.jogador} foi eliminada porque não há lobisomens vivos.`);
            });
        }

        lobisomensVivos = resultadoSorteio.filter(jogador =>
            ['lobisomem', 'lobo alfa', 'filhote de lobisomem'].includes(jogador.papel) &&
            vivos.some(v => v.nome === jogador.jogador)
        );

        const papeisExcluidos = [
            'lobo solitário',
            'humano amaldiçoado',
            'assassino em série',
            'líder de seita',
            'piromaníaco',
            'caçador de cabeças'
        ];


        // ---------------------------------------

        const papeisDosVivos = vivos.map(jogador => {
            const papel = resultadoSorteio.find(r => r.jogador === jogador.nome)?.papel || null;
            return { nome: jogador.nome, papel };
        });

        const liderDeSeitaPresente = papeisDosVivos.some(j => j.papel === 'líder de seita')
        const depressivoPresente = papeisDosVivos.some(j => j.papel === 'depressivo')
        const bruxaPresente = papeisDosVivos.some(j => j.papel === 'bruxa');
        const sacerdotePresente = papeisDosVivos.some(j => j.papel === 'sacerdote');
        const vovoZangadaPresente = papeisDosVivos.some(j => j.papel === 'vovó zangada');
        const pistoleiroPresente = papeisDosVivos.some(j => j.papel === 'pistoleiro');
        const assassinoSeriePresente = papeisDosVivos.some(j => j.papel === 'assassino em série');
        const necromantePresente = papeisDosVivos.some(j => j.papel === 'necromante');
        const piromaniacoPresente = papeisDosVivos.some(j => j.papel === 'piromaníaco');
        const lobisomemPresente = papeisDosVivos.some(j =>
            ['lobisomem', 'lobo alfa', 'filhote de lobisomem', 'lobo solitário'].includes(j.papel)
        );

        const condicoesPerigosas = [
            bruxaPresente,
            sacerdotePresente,
            vovoZangadaPresente,
            pistoleiroPresente,
            assassinoSeriePresente,
            necromantePresente,
            piromaniacoPresente,
            depressivoPresente,
            liderDeSeitaPresente
        ];

        // ---------------------------------------
        // CONDIÇÕES PADRÃO

        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];

        const vilaVence = lobisomensVivos.length === 0 && papeisUnicos.length === 0;
        const lobisomensVencem = lobisomensVivos.length >= aldeoesVivos.length && lobisomensVivos.length >= 1 && !condicoesPerigosas.some(Boolean);

        // ---------------------------------------
        // LOBO SOLITÁRIO MORRE SE HOUVER OUTRO LOBISOMEM VIVO AO FINAL DA PARTIDA

        const lobisomensSemExcluidos = lobisomensVivos.filter(
            lobisomem => !papeisExcluidos.includes(lobisomem.papel)
        );

        if (lobisomensSemExcluidos.length > 0 && loboSolitarioVivo) {
            atualizarStatusJogador(loboSolitarioVivo.jogador, 'morto');
            vivos = atualizarVivos();
        }

        // ---------------------------------------
        // OUTRAS CONDIÇÕES ESPECÍFICAS

        const listaSeita = JSON.parse(localStorage.getItem('seita')) || [];
        const liderDeSeitaVence = (jogadores.length - 1) <= listaSeita.length;

        const loboSolitarioVence =
            loboSolitarioVivo &&
            lobisomensVivos.length === 0 &&
            aldeoesVivos.length <= 1 &&
            !condicoesPerigosas.some(Boolean);

        const assassinoEmSerieVence =
            assassinoEmSerieVivo &&
            vivos.length === 1 &&
            vivos[0].nome === assassinoEmSerieVivo.jogador;

        const manhunt = resultadoSorteio.find(jogador => jogador.papel === 'caçador de cabeças');
        if (manhunt && jogadoresStatus.some(jogador => jogador.nome === manhunt.jogador && jogador.status === 'hunter')) {

            atualizarStatusJogador(manhunt.jogador, 'vivo');
            const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');
            vivos = atualizarVivos();

            localStorage.setItem('vitoria', JSON.stringify({
                vencedores: "O caçador de cabeças",
                vivos: vivos.map(j => j.nome),
                mortos: mortosAtualizados.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
            }));

            setTimeout(() => window.location.href = 'vitoria.html', 100);
            return;
        }

        const depressivo = resultadoSorteio.find(jogador => jogador.papel === 'depressivo');
        if (depressivo && jogadoresStatus.some(jogador => jogador.nome === depressivo.jogador && jogador.status === 'linchado')) {

            atualizarStatusJogador(depressivo.jogador, 'morto');
            const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');
            vivos = atualizarVivos();

            localStorage.setItem('vitoria', JSON.stringify({
                vencedores: "O depressivo",
                vivos: vivos.map(j => j.nome),
                mortos: mortosAtualizados.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
            }));

            setTimeout(() => window.location.href = 'vitoria.html', 100);
            return;
        }

        if (loboSolitarioVence) {
            const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');
            vivos = atualizarVivos();

            localStorage.setItem('vitoria', JSON.stringify({
                vencedores: "O lobo solitário",
                vivos: vivos.map(j => j.nome),
                mortos: mortosAtualizados.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
            }));

            setTimeout(() => window.location.href = 'vitoria.html', 100);
            return;
        }

        if (assassinoEmSerieVence) {
            const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');
            vivos = atualizarVivos();

            localStorage.setItem('vitoria', JSON.stringify({
                vencedores: "O assassino em série",
                vivos: vivos.map(j => j.nome),
                mortos: mortosAtualizados.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
            }));

            setTimeout(() => window.location.href = 'vitoria.html', 100);
            return;
        }

        // ------------------------------------------------
        // CONDIÇÕES DE VITÓRIA

        if (vilaVence || lobisomensVencem || liderDeSeitaVence) {
            const vencedores = vilaVence
                ? "A vila"
                : liderDeSeitaVence
                    ? "O líder de seita"
                    : "A alcateia";

            vivos = atualizarVivos();
            const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

            const vitoria = {
                vencedores,
                vivos: vivos.map(j => j.nome),
                mortos: mortosAtualizados.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel })),
            };

            localStorage.setItem('vitoria', JSON.stringify(vitoria));
            window.location.href = 'vitoria.html';
        }

        // -------------------------------------------------
        // DOIS JOGADORES OU MENOS

        else if (vivos.length <= 2) {

            // ----------------------------------------------
            // Caso os dois últimos sejam de times separados e não possam se eliminar

            if (!condicoesPerigosas.some(Boolean)) {
                const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

                localStorage.setItem('vitoria', JSON.stringify({
                    vencedores: "NINGUÉM",
                    vivos: vivos.map(j => j.nome),
                    mortos: mortosAtualizados.map(j => j.nome),
                    papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
                }));

                setTimeout(() => window.location.href = 'vitoria.html', 100);
                return;
            }

            // ----------------------------------------------
            // PIROMANÍACO VENCE CONTRA 1 LOBISOMEM

            if (piromaniacoPresente && lobisomensVivos.length < 2 && aldeoesVivos.length < 1 && papeisUnicos.length < 2) {

                const vivos = atualizarVivos();
                const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

                localStorage.setItem('vitoria', JSON.stringify({
                    vencedores: "O piromaníaco",
                    vivos: vivos.map(j => j.nome),
                    mortos: mortosAtualizados.map(j => j.nome),
                    papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
                }));

                window.location.href = 'vitoria.html';
                return;
            }

            // ----------------------------------------------
            // Caso reste apenas um jogador que não seja da vila e nem da aldeia, e nem tenha cumprido seu papel

            if (condicoesPerigosas.some(Boolean) && vivos.length === 1) {
                const mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

                localStorage.setItem('vitoria', JSON.stringify({
                    vencedores: "NINGUÉM",
                    vivos: vivos.map(j => j.nome),
                    mortos: mortosAtualizados.map(j => j.nome),
                    papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel }))
                }));

                setTimeout(() => window.location.href = 'vitoria.html', 100);
                return;
            }

        }



        // ------------------------------------------------------------
        // ------------------------------------------------------------

        if (page === "relatorio") {
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
        };
    };


    const carregarJogadores = () => {
        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        tabelaCorpo.innerHTML = '';

        jogadores.forEach((jogador, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${index + 1}</td>
                <td>${jogador}</td>
            `;
            tabelaCorpo.appendChild(linha);
        });

        return jogadores;
    };

    const salvarJogadores = (jogadores) => {
        localStorage.setItem('jogadores', JSON.stringify(jogadores));
    };

    const carregarPapeis = () => JSON.parse(localStorage.getItem('papeisSessao')) || [];

    const salvarSorteados = (sorteados) => {
        localStorage.setItem('resultadoSorteio', JSON.stringify(sorteados));
    };

    const carregarSorteados = () => JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

    const deletarJogadores = () => {
        localStorage.removeItem('jogadores');
    };

    const calcularSorteio = (chances, excluir = []) => {
        const chancesFiltradas = Object.entries(chances).filter(([papel]) => !excluir.includes(papel));
        const total = chancesFiltradas.reduce((sum, [, chance]) => sum + chance, 0);
        const random = Math.random() * total;
        let acumulado = 0;
        for (const [papel, chance] of chancesFiltradas) {
            acumulado += chance;
            if (random <= acumulado) {
                return papel;
            }
        }
    };

    const calcularSorteioLobisomem = (chances) => {
        const total = Object.values(chances).reduce((sum, chance) => sum + chance, 0);
        const random = Math.random() * total;
        let acumulado = 0;
        for (const [papel, chance] of Object.entries(chances)) {
            acumulado += chance;
            if (random <= acumulado) {
                return papel;
            }
        }
    };

    const imagemPorPapel = {
        'aldeão': 'img/aldeao.png',
        'vidente': 'img/vidente.png',
        'médico': 'img/medico.png',
        'caçador': 'img/cacador.png',
        'bruxa': 'img/bruxa.png',
        'aprendiz de vidente': 'img/aprendiz-de-vidente.png',
        'pacifista': 'img/pacifista.png',
        'sacerdote': 'img/sacerdote.png',
        'prefeito': 'img/prefeito.png',
        'guarda-costas': 'img/guarda-costas.png',
        'detetive': 'img/detetive.png',
        'portador do amuleto': 'img/portador-do-amuleto.png',
        'vidente de aura': 'img/vidente-de-aura.png',
        'príncipe bonitão': 'img/principe-bonitao.png',
        'maçom': 'img/macom.png',
        'menininha': 'img/menininha.png',
        'cientista maluco': 'img/cientista-maluco.png',
        'caçador de cabeças': 'img/cacador-de-cabecas.png',
        'humano leproso': 'img/humano-leproso.png',
        'valentão': 'img/valentao.png',
        'menino travesso': 'img/menino-travesso.png',
        'prostituta': 'img/prostituta.png',
        'vovó zangada': 'img/vovo-zangada.png',
        'bêbado': 'img/bebado.png',
        'idiota': 'img/idiota.png',
        'pistoleiro': 'img/pistoleiro.png',
        'humano amaldiçoado': 'img/humano-amaldicoado.png',
        'feiticeira': 'img/feiticeira.png',
        'assassino em série': 'img/assassino-em-serie.png',
        'inquisidor': 'img/inquisidor.png',
        'sósia': 'img/sosia.png',
        'líder de seita': 'img/lider-de-seita.png',
        'cupido': 'img/cupido.png',
        'depressivo': 'img/depressivo.png',
        'necromante': 'img/necromante.png',
        'piromaníaco': 'img/piromaniaco.png',
        'presidente': 'img/presidente.png',
        'lobisomem': 'img/lobisomem.png',
        'lobo alfa': 'img/lobo-alfa.png',
        'lobo solitário': 'img/lobo-solitario.png',
        'filhote de lobisomem': 'img/filhote-de-lobisomem.png'
    };

    const descricaoPorPapel = {
        "aldeão": "Durante o dia, você discute com a aldeia sobre quem pode ser o lobisomem e decide alguém para matar.",
        "vidente": "Toda noite você poderá descobrir o papel de outro jogador.",
        "médico": "Durante a noite, você acorda e seleciona um jogador que não poderá ser morto pelos lobisomens naquela noite. Você não poderá proteger o mesmo jogador duas vezes seguidas.",
        "caçador": "Quando você morrer poderá escolher outra pessoa para morrer com você.",
        "bruxa": "Você tem duas poções que podem ser usadas durante a noite: uma que irá salvar outro jogador de ser morto pelos lobisomens e um veneno que irá matar outro jogador.",
        "aprendiz de vidente": "Você pode aprender vidência durante a noite. Se aprender por 2 noites, você se torna vidente.",
        "pacifista": "Uma vez por jogo você pode revelar o papel de um jogador para todos e pular a votação daquele dia.",
        "sacerdote": "Você poderá usar a água benta em outro jogador. Se esse jogador for um lobisomem, ele morre. Se não, você morre. Só pode ser usada uma única vez.",
        "prefeito": "Se você revelar seu papel para a aldeia, seu voto conta duas vezes durante o dia.",
        "guarda-costas": "Durante a noite, você poderá selecionar um jogador para proteger. Se os lobisomens tentarem matar esse jogador, você morre no lugar.",
        "detetive": "Cada noite você pode selecionar dois jogadores para ver se eles pertencem ao mesmo time.",
        "portador do amuleto": "Você não poderá ser morto por lobisomens durante a noite se vestir o amuleto. Você não pode vestir o amuleto duas noites seguidas.",
        "vidente de aura": "Toda noite você seleciona um jogador para saber se ele é o lobisomem.",
        "príncipe bonitão": "A primeira vez que a aldeia tentar te matar na votação, você mostra seu papel e sobrevive.",
        "maçom": "Você pode ver quem são os outros maçons.",
        "menininha": "Se você abrir seus olhos, há 15% de chance de detectar um lobisomem; mas também há 15% de chance dos lobisomens te encontrarem e te matarem.",
        "cientista maluco": "Você é um aldeão normal, exceto que quando você morrer uma substância tóxica será liberada e ela irá matar as duas pessoas ao seu lado.",
        "humano leproso": "Quando você é morto pelos lobisomens, eles não serão capazes de matar na próxima noite.",
        "valentão": "Quando atacado pelos lobisomens, você sangra e só morre no próximo dia.",
        "menino travesso": "Apenas uma vez por jogo você pode trocar os papéis de dois jogadores. Após isso, você se torna um aldeão",
        "prostituta": "Durante a noite você pode ficar na casa de outro jogador. Se esse jogador for um lobisomem ou for morto por um, você também morrerá. Se os lobisomens tentarem te matar e você estiver na casa de outra pessoa, você sobrevive.",
        "vovó zangada": "Todo dia você escolhe algum jogador que não poderá votar durante o dia.",
        "bêbado": "Você está constantemente bêbado e não deve falar durante o jogo.",
        "idiota": "Se a aldeia tentar te matar na votação, você não morrerá, mas perderá seu direito de votar.",
        "pistoleiro": "Você têm duas balas que podem ser usadas para matar alguém. Os tiros são muito barulhentos, seu papel será revelado logo depois do primeiro tiro.",
        "lobisomem": "Durante a noite, você acorda junto com seus amigos lobisomens e escolhe uma vítima para atacar. Durante o dia, tenta parecer um aldeão comum para não ser morto.",
        "lobo solitário": "Você é um lobisomem comum, exceto que você só ganhará se for o último lobisomem vivo.",
        "filhote de lobisomem": "Você é um lobisomem normal, exceto que, se você morrer na votação da vila, os lobisomens matarão duas pessoas na próxima noite.",
        "humano amaldiçoado": "Você é um aldeão normal até os lobisomens tentarem te matar. Caso aconteça, você se torna um lobisomem e os lobisomens ficam leprosos por uma noite.",
        "feiticeira": "A cada noite você seleciona um jogador para ver se ele é o vidente ou um lobisomem. Seu papel é ajudar o lobisomem a ganhar.",
        "lobo alfa": "Apenas uma vez por jogo, você pode morder um jogador para ele virar um lobisomem.",
        "assassino em série": "A cada noite você pode matar outro jogador. Se você for o último jogador vivo, você vence.",
        "inquisidor": "Cada noite você pode selecionar um jogador. Se ele é o líder da seita ou parte de uma seita, o jogador morrerá.",
        "sósia": "Você seleciona um jogador. Se esse jogador morrer, você tomará o seu papel.",
        "líder de seita": "Toda noite você escolhe alguém para unir à sua seita. Quando todos os jogadores se unirem, você vence.",
        "cupido": "Você pode selecionar duas pessoas para formarem um casal. Se uma pessoa do casal morrer em qualquer momento, a outra também morrerá. Se houverem 2 casais no jogo e um se desfazer, todos os casais serão desfeitos.",
        "depressivo": "Você está muito triste. Seu objetivo é ser morto pela aldeia. Se você for linchado pela aldeia, você vence.",
        "necromante": "Uma vez por jogo, você poderá reviver um jogador morto.",
        "piromaníaco": "Toda noite você seleciona dois jogadores para encharcar com gasolina ou queimar todos os jogadores já encharcados. Você ganha se você for o último jogador vivo. Você não pode ser morto pelos lobisomens.",
        "caçador de cabeças": "Seu objetivo é fazer seu alvo ser linchado pela vila durante o dia. Se conseguir, você ganha; se o seu alvo morrer de outra maneira, você morre.",
        "presidente": "Você é o presidente! Todo mundo sabe quem você é. Se você morrer, a aldeia perderá.",
        "feiticeira": "A cada noite, você seleciona um jogador para ver se ele é lobisomem ou vidente. Seu objetivo é fazer o lobisomem ganhar."
    };

    const chancesPapeisConfig = {
        'aldeão': 16,
        'vidente': 4,
        'médico': 4,
        'caçador': 4,
        'bruxa': 4,
        'aprendiz de vidente': 4,
        'pacifista': 4,
        'sacerdote': 2,
        'prefeito': 2,
        'guarda-costas': 4,
        'detetive': 6,
        'portador do amuleto': 4,
        'vidente de aura': 2,
        'príncipe bonitão': 4,
        'maçom': 6,
        'menininha': 4,
        'cientista maluco': 2,
        'caçador de cabeças': 1,
        'humano leproso': 4,
        'valentão': 4,
        'menino travesso': 2,
        'prostituta': 3,
        'vovó zangada': 3,
        'bêbado': 2,
        'idiota': 4,
        'pistoleiro': 2,
        'humano amaldiçoado': 1,
        'feiticeira': 1,
        'assassino em série': 1,
        'inquisidor': 1,
        'sósia': 1,
        'líder de seita': 1,
        'cupido': 1,
        'depressivo': 1,
        'necromante': 1,
        'piromaníaco': 1,
        'presidente': 1,
    };

    const chancesEspeciais = {
        'lobo alfa': 1,
        'lobo solitário': 2,
        'filhote de lobisomem': 2,
    };

    const processarLobisomens = () => {
        const sorteados = carregarSorteados();
        const jogadoresLobisomem = sorteados.filter(({ papel }) => papel === 'lobisomem');

        if (jogadoresLobisomem.length === 0) {
            alert('Nenhum jogador com papel de lobisomem encontrado.');
            return;
        }

        let resultadoEspeciais = [];
        if (jogadoresLobisomem.length >= 2) {
            jogadoresLobisomem.forEach(jogador => {
                if (Math.random() < 0.3) {
                    const papelEspecial = calcularSorteioLobisomem(chancesEspeciais);
                    resultadoEspeciais.push({ ...jogador, papel: papelEspecial });
                } else {
                    resultadoEspeciais.push(jogador);
                }
            });

            const lobisomemComum = jogadoresLobisomem.find(j => resultadoEspeciais.every(r => r.jogador !== j.jogador));
            if (!lobisomemComum) {
                resultadoEspeciais[0].papel = 'lobisomem';
            }
        } else {
            resultadoEspeciais = jogadoresLobisomem;
        }
        const novosSorteados = sorteados.filter(({ jogador }) =>
            !jogadoresLobisomem.some(lobisomem => lobisomem.jogador === jogador)
        );

        const atualizados = [...novosSorteados, ...resultadoEspeciais];
        salvarSorteados(atualizados);
    };

    const calcularLobisomens = (numJogadores) => {
        if (numJogadores <= 6) return 1;
        const maxLobisomens = Math.floor(numJogadores / 3.5);
        const extraLobisomens = Math.floor((numJogadores - 6) / 2);
        return Math.min(maxLobisomens, 1 + extraLobisomens);
    };

    //--------------------------------------

    if (page === 'index') {
        localStorage.removeItem('manhunt');
        localStorage.removeItem('filhoteDeLobisomem');
        localStorage.removeItem('chatAgora');
        localStorage.removeItem('chat');
        localStorage.removeItem('presidente');
        localStorage.removeItem('gasolina');
        localStorage.removeItem('casal');
        localStorage.removeItem('seita');
        localStorage.removeItem('sosia');
        localStorage.removeItem('pistoleiro');
        localStorage.removeItem('idiota');
        localStorage.removeItem('silenciado');
        localStorage.removeItem('dormindo');
        localStorage.removeItem('troca');
        localStorage.removeItem('principe');
        localStorage.removeItem('vitoria');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('guardaCostas');
        localStorage.removeItem('ataques');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('prefeito');
        localStorage.removeItem('vilaPacificada');
        localStorage.removeItem('pacifistas');
        localStorage.removeItem('aprendizesDeVidente');
        localStorage.removeItem('jogadoresStatus');
        localStorage.removeItem('protecoesBruxa');
        localStorage.removeItem('ataquesBruxa');
        localStorage.removeItem('posicaoAtual');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('vitoria');
        localStorage.removeItem('cacadasCacador');
        localStorage.removeItem('contadorMestre');
        localStorage.removeItem('protecoesMedico');
    }

    //--------------------------------------

    if (page === 'papeis') {

        localStorage.removeItem('manhunt');
        localStorage.removeItem('filhoteDeLobisomem');
        localStorage.removeItem('chatAgora');
        localStorage.removeItem('chat');
        localStorage.removeItem('presidente');
        localStorage.removeItem('gasolina');
        localStorage.removeItem('casal');
        localStorage.removeItem('seita');
        localStorage.removeItem('sosia');
        localStorage.removeItem('pistoleiro');
        localStorage.removeItem('idiota');
        localStorage.removeItem('silenciado');
        localStorage.removeItem('dormindo');
        localStorage.removeItem('troca');
        localStorage.removeItem('principe');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('guardaCostas');
        localStorage.removeItem('ataques');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('prefeito');
        localStorage.removeItem('vilaPacificada');
        localStorage.removeItem('pacifistas');
        localStorage.removeItem('aprendizesDeVidente');
        localStorage.removeItem('jogadoresStatus');
        localStorage.removeItem('protecoesBruxa');
        localStorage.removeItem('ataquesBruxa');
        localStorage.removeItem('posicaoAtual');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('cacadasCacador');
        localStorage.removeItem('contadorMestre');
        localStorage.removeItem('protecoesMedico');

        document.getElementById('salvar-sessao-ut').addEventListener('click', function (event) {
            const papeisSelecionados = JSON.parse(localStorage.getItem('papeisSessao')) || [];
            const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];

            if (jogadores.length < 3 || papeisSelecionados.length < 2) {
                showAlert('Certifique-se de que há ao menos 3 jogadores na sessão e 2 papéis salvos na sessão.');
            } else {
                window.location.href = 'mestre.html'
            }
        });

        document.getElementById('form-papeis').addEventListener('submit', function (event) {
            event.preventDefault();

            const papeisSelecionados = [];
            const checkboxes = document.querySelectorAll('input[name="papel"]:checked');
            checkboxes.forEach(checkbox => {
                papeisSelecionados.push(checkbox.value);
            });

            if (papeisSelecionados.length < 2) {
                showAlert('Selecione ao menos 2 papéis para essa sessão.');
            } else {
                localStorage.setItem('papeisSessao', JSON.stringify(papeisSelecionados));
                showAlert('Papéis selecionados salvos! Clique "Começar jogo" para iniciar a sessão com essas configurações.');
            }
        });
        document.getElementById('toggle-all').addEventListener('click', function () {
            const checkboxes = document.querySelectorAll('#form-papeis input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
            });
        });
    }

    //--------------------------------------

    if (page === 'cadastro') {

        localStorage.removeItem('manhunt');
        localStorage.removeItem('filhoteDeLobisomem');
        localStorage.removeItem('chatAgora');
        localStorage.removeItem('chat');
        localStorage.removeItem('presidente');
        localStorage.removeItem('gasolina');
        localStorage.removeItem('casal');
        localStorage.removeItem('seita');
        localStorage.removeItem('sosia');
        localStorage.removeItem('pistoleiro');
        localStorage.removeItem('idiota');
        localStorage.removeItem('silenciado');
        localStorage.removeItem('dormindo');
        localStorage.removeItem('troca');
        localStorage.removeItem('principe');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('guardaCostas');
        localStorage.removeItem('ataques');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('prefeito');
        localStorage.removeItem('vilaPacificada');
        localStorage.removeItem('pacifistas');
        localStorage.removeItem('aprendizesDeVidente');
        localStorage.removeItem('jogadoresStatus');
        localStorage.removeItem('protecoesBruxa');
        localStorage.removeItem('ataquesBruxa');
        localStorage.removeItem('posicaoAtual');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('cacadasCacador');
        localStorage.removeItem('contadorMestre');
        localStorage.removeItem('protecoesMedico');

        document.getElementById('salvar-sessao-ut').addEventListener('click', (event) => {
            const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        });

        document.getElementById('adicionar-jogador').addEventListener('click', (event) => {
            abrirModalCadastro();
        })

        carregarJogadores();


        document.getElementById('deletar-todos').addEventListener('click', () => {
            deletarJogadores();
        });
    }

    //--------------------------------------

    if (page === 'mestre') {
        localStorage.removeItem('manhunt');
        localStorage.removeItem('filhoteDeLobisomem');
        localStorage.removeItem('chatAgora');
        localStorage.removeItem('chat');
        localStorage.removeItem('presidente');
        localStorage.removeItem('gasolina');
        localStorage.removeItem('casal');
        localStorage.removeItem('seita');
        localStorage.removeItem('sosia');
        localStorage.removeItem('pistoleiro');
        localStorage.removeItem('idiota');
        localStorage.removeItem('silenciado');
        localStorage.removeItem('dormindo');
        localStorage.removeItem('troca');
        localStorage.removeItem('principe');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('amuleto');
        localStorage.removeItem('guardaCostas');
        localStorage.removeItem('ataques');
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('prefeito');
        localStorage.removeItem('vilaPacificada');
        localStorage.removeItem('pacifistas');
        localStorage.removeItem('aprendizesDeVidente');
        localStorage.removeItem('jogadoresStatus');
        localStorage.removeItem('protecoesBruxa');
        localStorage.removeItem('ataquesBruxa');
        localStorage.removeItem('posicaoAtual');
        localStorage.removeItem('ordemDeJogo');
        localStorage.removeItem('cacadasCacador');
        let contador = parseInt(localStorage.getItem("contadorMestre")) || 0;


        contador += 1;
        localStorage.setItem("contadorMestre", contador);

        if (contador >= 2) {
            exibirMensagemReinicio();
        }

        function exibirMensagemReinicio() {
            const mensagem = document.createElement("div");
            mensagem.style.position = "fixed";
            mensagem.style.top = "0";
            mensagem.style.left = "0";
            mensagem.style.width = "100%";
            mensagem.style.height = "100%";
            mensagem.style.backgroundColor = "#000";
            mensagem.style.color = "#fff";
            mensagem.style.display = "flex";
            mensagem.style.flexDirection = "column";
            mensagem.style.justifyContent = "center";
            mensagem.style.alignItems = "center";
            mensagem.style.fontFamily = "'Righteous', sans-serif";
            mensagem.style.fontSize = "2rem";
            mensagem.style.textAlign = "center";
            mensagem.style.zIndex = "1000";

            mensagem.textContent = "Todo o progresso foi perdido, inicie o jogo novamente.";

            const botaoVoltar = document.createElement("button");
            botaoVoltar.textContent = "Voltar";

            botaoVoltar.addEventListener("click", () => {
                window.location.href = "index.html";

                localStorage.removeItem("contadorMestre");
            });

            mensagem.appendChild(botaoVoltar);

            document.body.appendChild(mensagem);
        }

        const carregarJogadores = () => JSON.parse(localStorage.getItem('jogadores')) || [];
        const carregarPapeis = () => JSON.parse(localStorage.getItem('papeisSessao')) || [];

        const calcularSorteio = (chances, excluir = []) => {
            const chancesFiltradas = Object.entries(chances).filter(([papel]) => !excluir.includes(papel));
            const total = chancesFiltradas.reduce((sum, [, chance]) => sum + chance, 0);
            const random = Math.random() * total;
            let acumulado = 0;
            for (const [papel, chance] of chancesFiltradas) {
                acumulado += chance;
                if (random <= acumulado) {
                    return papel;
                }
            }
        };

        const carregarSorteados = () => JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
        const salvarSorteados = (sorteados) => localStorage.setItem('resultadoSorteio', JSON.stringify(sorteados));

        const calcularSorteioLobisomem = (chances) => {
            const total = Object.values(chances).reduce((sum, chance) => sum + chance, 0);
            const random = Math.random() * total;
            let acumulado = 0;
            for (const [papel, chance] of Object.entries(chances)) {
                acumulado += chance;
                if (random <= acumulado) {
                    return papel;
                }
            }
        };

        const chancesEspeciais = {
            'lobo alfa': 4,
            'lobo solitário': 8,
            'filhote de lobisomem': 8,
        };

        const processarLobisomens = () => {
            const sorteados = carregarSorteados();
            const jogadoresLobisomem = sorteados.filter(({ papel }) => papel === 'lobisomem');

            if (jogadoresLobisomem.length === 0) {
                showAlert('Nenhum jogador com papel de lobisomem encontrado.');
                return;
            }

            let resultadoEspeciais = [];
            if (jogadoresLobisomem.length >= 2) {
                jogadoresLobisomem.forEach(jogador => {
                    if (Math.random() < 0.3) {
                        const papelEspecial = calcularSorteioLobisomem(chancesEspeciais);
                        resultadoEspeciais.push({ ...jogador, papel: papelEspecial });
                    } else {
                        resultadoEspeciais.push(jogador);
                    }
                });

                const lobisomemComum = jogadoresLobisomem.find(j => resultadoEspeciais.every(r => r.jogador !== j.jogador));
                if (!lobisomemComum) {
                    resultadoEspeciais[0].papel = 'lobisomem';
                }
            } else {
                resultadoEspeciais = jogadoresLobisomem;
            }
            const novosSorteados = sorteados.filter(({ jogador }) =>
                !jogadoresLobisomem.some(lobisomem => lobisomem.jogador === jogador)
            );

            const atualizados = [...novosSorteados, ...resultadoEspeciais];
            salvarSorteados(atualizados);

        };

        const calcularLobisomens = (numJogadores) => {
            if (numJogadores <= 6) return 1;
            const maxLobisomens = Math.floor(numJogadores / 3);
            const extraLobisomens = Math.floor((numJogadores - 6) / 2);
            return Math.min(maxLobisomens, 1 + extraLobisomens);
        };

        document.getElementById('sortear').addEventListener('click', () => {
            const jogadores = carregarJogadores();
            const papeisSelecionados = carregarPapeis();
            const chancesPapeis = Object.fromEntries(
                Object.entries(chancesPapeisConfig).filter(([papel]) =>
                    papeisSelecionados.includes(papel)
                )
            );

            const numLobisomens = calcularLobisomens(jogadores.length);
            const resultados = [];
            const restanteJogadores = [...jogadores];

            const papeisUnicos = [
                'lobo alfa',
                'lobo solitário',
                'filhote de lobisomem',
                'feiticeira',
                'assassino em série',
                'inquisidor',
                'sósia',
                'líder de seita',
                'cupido',
                'depressivo',
                'necromante',
                'piromaníaco',
                'presidente'
            ];

            const papeisUnicosSorteados = new Set();

            for (let i = 0; i < numLobisomens; i++) {
                const index = Math.floor(Math.random() * restanteJogadores.length);
                const lobisomemJogador = restanteJogadores.splice(index, 1)[0];

                resultados.push({ jogador: lobisomemJogador, papel: 'lobisomem' });
            }

            restanteJogadores.forEach(jogador => {
                let papelSorteado;

                do {
                    papelSorteado = calcularSorteio(chancesPapeis);
                } while (
                    papeisUnicos.includes(papelSorteado) &&
                    papeisUnicosSorteados.has(papelSorteado)
                );

                if (papeisUnicos.includes(papelSorteado)) {
                    papeisUnicosSorteados.add(papelSorteado);
                }

                resultados.push({ jogador, papel: papelSorteado });
            });

            const jogadoresStatus = jogadores.map(jogador => ({
                nome: jogador, status: 'vivo'
            }));

            localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
            localStorage.setItem('resultadoSorteio', JSON.stringify(resultados));

            processarLobisomens();
            window.location.href = 'noite.html';
        });

    }

    //--------------------------------------

    if (page === 'mediador') {

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

            // Filtrar jogadores vivos e, se fornecido, aplicar a lista de exclusão
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
                            <ul class="lista-jogadores">
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
                            <ul class="lista-jogadores">
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
                            <ul class="lista-jogadores">
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
                            <ul class="lista-jogadores">
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

            const imagemPapel = imagemPorPapel?.[papelAtual.toLowerCase()] || 'img/mestre.png';
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
                                        window.location.href = 'mediador.html'; // Só executa após o modal ser fechado
                                    });
                                }
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

    }

    //--------------------------------------

    if (page === 'relatorio') {
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

                    nomeJogador.innerHTML += `${nomeProtetor} morreu durante a noite<br>`;

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

            // Busca o sósia onde o jogador morto é o valor no objeto
            const nomeJogadorSosia = Object.entries(sosias).find(
                ([_, valor]) => valor.toLowerCase() === nomeJogadorMorto
            )?.[0]; // Retorna a chave (o sósia)

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

                    if (jogadorEsquerda) {
                        atualizarStatusJogador(jogadorEsquerda, 'envenenado');
                    }

                    if (jogadorDireita) {
                        atualizarStatusJogador(jogadorDireita, 'envenenado');
                    }
                }
            }

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

    }

    //--------------------------------------

    if (page === 'noite') {
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

        continuarBtn = document.getElementById('continuar-noite')
        continuarBtn.addEventListener('click', () => {
            humanoMordido();
            trocarPapeis();
            localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
            localStorage.removeItem('troca');
        });

    }

    if (page === 'resultadoVotacao') {
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
    }

    if (page === 'votacao') {
        localStorage.removeItem('votacao');
        localStorage.removeItem('ordemDeVotacao');
        const listaJogadores = document.getElementById('lista-jogadores');
        const continuarBtn = document.getElementById('continuar-btn');
        const pularBtn = document.getElementById('pular-btn');
        const nomeJogadorAtual = document.getElementById('nome-jogador-votacao');

        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        const ordemDeVotacao = JSON.parse(localStorage.getItem('ordemDeVotacao')) || [];
        const votacao = JSON.parse(localStorage.getItem('votacao')) || {};

        const jogadoresVivos = jogadoresStatus.filter(jogador => jogador.status !== 'morto' && jogador.status !== 'ressuscitado');

        function atualizarModal() {
            const jogadorAtual = jogadoresVivos.find(jogador => !ordemDeVotacao.includes(jogador.nome));
            if (!jogadorAtual) {
                showAlert(`Votação concluída!`, () => {
                    window.location.href = 'resultadoVotacao.html'; // Só executa após o modal ser fechado
                    return;
                });
            }

            const silenciados = JSON.parse(localStorage.getItem('silenciado')) || [];
            const idiota = JSON.parse(localStorage.getItem('idiota')) || [];

            const jogadorAtualNome = jogadorAtual.nome;

            if (silenciados.includes(jogadorAtualNome)) {
                ordemDeVotacao.push(jogadorAtualNome);
                localStorage.setItem('ordemDeVotacao', JSON.stringify(ordemDeVotacao));

                showAlert(`${jogadorAtualNome} está silenciado pela Vovó Zangada e não pode votar.`);
                atualizarModal();
            }
            else if (idiota.includes(jogadorAtualNome)) {
                ordemDeVotacao.push(jogadorAtualNome);
                localStorage.setItem('ordemDeVotacao', JSON.stringify(ordemDeVotacao));

                showAlert(`${jogadorAtualNome} é um idiota e não pode votar.`);
                atualizarModal();
            }
            else {
                nomeJogadorAtual.textContent = jogadorAtual.nome;

                listaJogadores.innerHTML = '';
                jogadoresVivos
                    .filter(jogador => jogador.nome !== jogadorAtual.nome)
                    .forEach(jogador => {
                        const li = document.createElement('li');
                        li.classList.add('item-jogador');
                        li.innerHTML = `
            <label class="item-jogador" >
                <input type="radio" name="voto" value="${jogador.nome}" />
                <span>${jogador.nome}</span>
            </label>
        `;
                        listaJogadores.appendChild(li);
                    });
            }

        }

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

        function registrarVoto() {
            const votoSelecionado = document.querySelector('input[name="voto"]:checked');
            if (!votoSelecionado) {
                showAlert('Por favor, selecione um jogador para votar.');
                return;
            }

            const jogadorSelecionado = votoSelecionado.value;
            const jogadorAtual = nomeJogadorAtual.textContent.replace('É a vez de: ', '');

            const prefeitos = JSON.parse(localStorage.getItem('prefeito')) || [];

            const pesoDoVoto = prefeitos.includes(jogadorAtual) ? 2 : 1;

            votacao[jogadorSelecionado] = (votacao[jogadorSelecionado] || 0) + pesoDoVoto;

            localStorage.setItem('votacao', JSON.stringify(votacao));

            ordemDeVotacao.push(jogadorAtual);
            localStorage.setItem('ordemDeVotacao', JSON.stringify(ordemDeVotacao));

            atualizarModal();
        }


        function pularVez() {
            const jogadorAtual = nomeJogadorAtual.textContent.replace('É a vez de: ', '');

            ordemDeVotacao.push(jogadorAtual);
            localStorage.setItem('ordemDeVotacao', JSON.stringify(ordemDeVotacao));

            atualizarModal();
        }

        continuarBtn.addEventListener('click', registrarVoto);
        pularBtn.addEventListener('click', pularVez);

        atualizarModal();
    }

    if (page === 'vitoria') {
        const vitoria = JSON.parse(localStorage.getItem('vitoria')) || {};

        const topo = document.getElementById('topo');
        const imagemPapel = document.getElementById('imagem-papel');

        if (vitoria.vivos.length === 0) {
            topo.textContent = 'NINGUÉM VENCEU';
            imagemPapel.src = 'img/mestre.png';
            imagemPapel.alt = 'Imagem do Mestre';
        } else {
            topo.textContent = `${vitoria.vencedores} venceu!`;

            if (vitoria.vencedores === 'A alcateia') {
                imagemPapel.src = 'img/lobisomem.png';
                imagemPapel.alt = 'Imagem de Lobisomem';
            } else if (vitoria.vencedores === 'A vila') {
                imagemPapel.src = 'img/aldeao.png';
                imagemPapel.alt = 'Imagem de Aldeão';
            }
        }

        document.getElementById('resumo').textContent = 'Resumo do jogo';

        const vivosComPapeis = vitoria.vivos.map(nome => {
            const papel = vitoria.papeis.find(p => p.jogador === nome)?.papel || 'Papel desconhecido';
            return `${nome} (${papel})`;
        });

        const mortosComPapeis = vitoria.mortos.map(nome => {
            const papel = vitoria.papeis.find(p => p.jogador === nome)?.papel || 'Papel desconhecido';
            return `${nome} (${papel})`;
        });

        const conteudo = `
            <div id="vitoria-vivos">
                ${vivosComPapeis.join('<br>')}
            </div>
            
            <div id="vitoria-mortos">
                ${mortosComPapeis.join('<br>')}
            </div>
        `;

        const container = document.querySelector('.espaco-vitoria');
        container.innerHTML = conteudo;
    }


});
