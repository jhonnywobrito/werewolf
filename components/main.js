
    export const form = document.querySelector('form');
    export const nomeInput = document.getElementById('nome');
    export const tabelaCorpo = document.querySelector('table tbody');
    export const page = document.body.dataset.page;
    export const papeisLobisomens = ['lobo solitário', 'filhote de lobisomem', 'lobo alfa'];
    export let posicaoAtual = parseInt(localStorage.getItem('posicaoAtual')) || 0;

    export function showAlert(message, callback) {
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
            
            <div id="fechar-alerta"><button>Fechar</button></div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => {
            overlay.style.display = 'block'; 
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
                    if (callback) callback(); 
                }, 300);
            }
        });

        const fecharBtn = modal.querySelector('#fechar-alerta button');
fecharBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    overlay.style.display = 'none';
    setTimeout(() => {
        modal.remove();
        overlay.remove();
        if (callback) callback();
    }, 300);
});
    }

    export function atualizarStatusJogador(nomeJogador, novoStatus) {
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

    export const papeisPerigosos = [
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

    export const criarBotaoChat = (jogadorAtual) => {
        const botaoChat = document.createElement('button');
        botaoChat.id = 'botao-chat';
        botaoChat.textContent = 'Chat';

        const chat = JSON.parse(localStorage.getItem('chat')) || [];

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

    export const abrirModalCadastro = () => {
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

        const nomeInput = document.getElementById('nome');
        nomeInput.focus();

        document.getElementById('cancelar-cadastro').addEventListener('click', () => {
            modalCadastro.remove();
        });

        carregarJogadores();

        const form = document.getElementById('form-cadastro');
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const nome = nomeInput.value.trim();

            if (nome) {
                const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
                jogadores.push(nome);
                localStorage.setItem('jogadores', JSON.stringify(jogadores));

                nomeInput.value = '';
                modalCadastro.remove();
                carregarJogadores();
            } else {
                showAlert('Por favor, insira um nome.');
            }
        });
    };



    // --------------------------

    export const abrirChatModal = (jogadorAtual) => {
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

    export const exibirMensagensRecebidas = (jogadorAtual) => {

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


    export function votacaoOuFim() {

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
        let mortosAtualizados = jogadoresStatus.filter(jogador => jogador.status === 'morto');

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
    }

    export const carregarJogadores = () => {
        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        tabelaCorpo.innerHTML = '';
        if (jogadores.length === 0) {
                const linha = document.createElement('tr');
            linha.innerHTML = `
                <td class="jogador-cadastrado">Nenhum jogador cadastrado</td>
            `;
            tabelaCorpo.appendChild(linha);
            } else {
jogadores.forEach((jogador, index) => {
            
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td class="jogador-cadastrado">${jogador}</td>
            `;
            tabelaCorpo.appendChild(linha);
            
        });

        return jogadores;
            }

        
    };

    export const salvarJogadores = (jogadores) => {
        localStorage.setItem('jogadores', JSON.stringify(jogadores));
    };

    export const carregarPapeis = () => JSON.parse(localStorage.getItem('papeisSessao')) || [];

    export const salvarSorteados = (sorteados) => {
        localStorage.setItem('resultadoSorteio', JSON.stringify(sorteados));
    };

    export const carregarSorteados = () => JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

    export const deletarJogadores = () => {
        localStorage.removeItem('jogadores');
    };

    export const calcularSorteio = (chances, excluir = []) => {
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

    export const calcularSorteioLobisomem = (chances) => {
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

    export const imagemPorPapel = {
        'aldeão': '../img/aldeao.png',
        'vidente': '../img/vidente.png',
        'médico': '../img/medico.png',
        'caçador': '../img/cacador.png',
        'bruxa': '../img/bruxa.png',
        'aprendiz de vidente': '../img/aprendiz-de-vidente.png',
        'pacifista': '../img/pacifista.png',
        'sacerdote': '../img/sacerdote.png',
        'prefeito': '../img/prefeito.png',
        'guarda-costas': '../img/guarda-costas.png',
        'detetive': '../img/detetive.png',
        'portador do amuleto': '../img/portador-do-amuleto.png',
        'vidente de aura': '../img/vidente-de-aura.png',
        'príncipe bonitão': '../img/principe-bonitao.png',
        'maçom': '../img/macom.png',
        'menininha': '../img/menininha.png',
        'cientista maluco': '../img/cientista-maluco.png',
        'caçador de cabeças': '../img/cacador-de-cabecas.png',
        'humano leproso': '../img/humano-leproso.png',
        'valentão': '../img/valentao.png',
        'menino travesso': '../img/menino-travesso.png',
        'prostituta': '../img/prostituta.png',
        'vovó zangada': '../img/vovo-zangada.png',
        'bêbado': '../img/bebado.png',
        'idiota': '../img/idiota.png',
        'pistoleiro': '../img/pistoleiro.png',
        'humano amaldiçoado': '../img/humano-amaldicoado.png',
        'feiticeira': '../img/feiticeira.png',
        'assassino em série': '../img/assassino-em-serie.png',
        'inquisidor': '../img/inquisidor.png',
        'sósia': '../img/sosia.png',
        'líder de seita': '../img/lider-de-seita.png',
        'cupido': '../img/cupido.png',
        'depressivo': '../img/depressivo.png',
        'necromante': '../img/necromante.png',
        'piromaníaco': '../img/piromaniaco.png',
        'presidente': '../img/presidente.png',
        'lobisomem': '../img/lobisomem.png',
        'lobo alfa': '../img/lobo-alfa.png',
        'lobo solitário': '../img/lobo-solitario.png',
        'filhote de lobisomem': '../img/filhote-de-lobisomem.png'
    };

    export const descricaoPorPapel = {
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
        "cientista maluco": "Você é um aldeão normal, exceto que quando você morrer uma substância tóxica será liberada e ela irá matar as duas pessoas ao seu lado na próxima noite.",
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
        "cupido": "Você pode selecionar duas pessoas para formarem um casal. Se uma pessoa do casal morrer em qualquer momento, a outra também morrerá na noite seguinte. Se houverem 2 casais no jogo e um se desfazer, todos os casais serão desfeitos.",
        "depressivo": "Você está muito triste. Seu objetivo é ser morto pela aldeia. Se você for linchado pela aldeia, você vence.",
        "necromante": "Uma vez por jogo, você poderá reviver um jogador morto.",
        "piromaníaco": "Toda noite você seleciona dois jogadores para encharcar com gasolina ou queimar todos os jogadores já encharcados. Você ganha se você for o último jogador vivo. Você não pode ser morto pelos lobisomens.",
        "caçador de cabeças": "Seu objetivo é fazer seu alvo ser linchado pela vila durante o dia. Se conseguir, você ganha; se o seu alvo morrer de outra maneira, você morre.",
        "presidente": "Você é o presidente! Todo mundo sabe quem você é. Se você morrer, a aldeia perderá.",
        "feiticeira": "A cada noite, você seleciona um jogador para ver se ele é lobisomem ou vidente. Seu objetivo é fazer o lobisomem ganhar."
    };

    export const chancesPapeisConfig = {
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

    export const chancesEspeciais = {
        'lobo alfa': 1,
        'lobo solitário': 2,
        'filhote de lobisomem': 2,
    };

    export const processarLobisomens = () => {
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

    export const calcularLobisomens = (numJogadores) => {
        if (numJogadores <= 6) return 1;
        const maxLobisomens = Math.floor(numJogadores / 3.5);
        const extraLobisomens = Math.floor((numJogadores - 6) / 2);
        return Math.min(maxLobisomens, 1 + extraLobisomens);
    };