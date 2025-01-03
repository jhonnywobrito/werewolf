document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nomeInput = document.getElementById('nome');
    const tabelaCorpo = document.querySelector('table tbody');
    const page = document.body.dataset.page;
    const papeisLobisomens = ['lobo solitário', 'filhote de lobisomem', 'lobo alfa'];
    let posicaoAtual = parseInt(localStorage.getItem('posicaoAtual')) || 0;

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
        'portador do amuleto': 'img/portador-d0-amuleto.png',
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
        'humano amaldiçoado': 'img/humano-amaldiçoado.png',
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
        'filhote de lobisomem': 'img/filhote-lobisomem.png'
    };
    
    const chancesPapeisConfig = {
        'aldeão': 10,
        'vidente': 2,
        'médico': 2,
        'caçador': 2,
        'bruxa': 2,
        'aprendiz de vidente': 1,
        'pacifista': 2,
        'sacerdote': 1,
        'prefeito': 1,
        'guarda-costas': 2,
        'detetive': 3,
        'portador do amuleto': 1,
        'vidente de aura': 1,
        'príncipe bonitão': 2,
        'maçom': 3,
        'menininha': 1,
        'cientista maluco': 1,
        'caçador de cabeças': 1,
        'humano leproso': 2,
        'valentão': 2,
        'menino travesso': 1,
        'prostituta': 1,
        'vovó zangada': 1,
        'bêbado': 1,
        'idiota': 2,
        'pistoleiro': 1,
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
        'lobo alfa': 4,
        'lobo solitário': 8,
        'filhote de lobisomem': 8,
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

if (page === 'index'){
    localStorage.removeItem('contadorMestre');
}

    //--------------------------------------

if (page === 'papeis'){
    localStorage.removeItem('contadorMestre');
}

    //--------------------------------------

if (page === 'cadastro') {
    localStorage.removeItem('contadorMestre');

    document.getElementById('salvar-sessao-ut').addEventListener('click', (event) => {
        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        if (jogadores.length < 2) {
            event.preventDefault();
            alert('Adicione ao menos 2 jogadores na sessão.')
        };
    });

    carregarJogadores();

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const nome = nomeInput.value.trim();

    if (nome) {
        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        jogadores.push(nome);
        localStorage.setItem('jogadores', JSON.stringify(jogadores));

        carregarJogadores();
        nomeInput.value = '';
    } else {
        alert('Por favor, insira um nome.');
    }
    });

    document.getElementById('deletar-todos').addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja excluir todos os jogadores?')) {
            deletarJogadores();
        }
    });
}

    //--------------------------------------

if (page === 'mestre') {
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

    localStorage.removeItem('posicaoAtual');
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
        const maxLobisomens = Math.floor(numJogadores / 3);
        const extraLobisomens = Math.floor((numJogadores - 6) / 2);
        return Math.min(maxLobisomens, 1 + extraLobisomens);
    };

    document.getElementById('sortear').addEventListener('click', () => {
        const jogadores = carregarJogadores();
        const papeisSelecionados = carregarPapeis();

        if (jogadores.length < 2 || papeisSelecionados.length < 2) {
            alert('Certifique-se de que há ao menos 2 jogadores e 2 papéis salvos.');
            return;
        }

        if (!papeisSelecionados.includes('lobisomem')) {
            alert('O papel "lobisomem" deve estar entre os papéis selecionados.');
            return;
        }

        const chancesPapeis = Object.fromEntries(
            Object.entries(chancesPapeisConfig).filter(([papel]) =>
                papeisSelecionados.includes(papel)
            )
        );

        const numLobisomens = calcularLobisomens(jogadores.length);

        const resultados = [];
        const restanteJogadores = [...jogadores];

        const lobisomensGarantidos = [];
        for (let i = 0; i < numLobisomens; i++) {
            const index = Math.floor(Math.random() * restanteJogadores.length);
            const lobisomemJogador = restanteJogadores.splice(index, 1)[0];

            resultados.push({ jogador: lobisomemJogador, papel: 'lobisomem' });
        }

        const lobisomensRestantes = lobisomensGarantidos.slice();
        lobisomensRestantes.forEach(lobisomem => {
            if (Math.random() < 0.5) { 
                const papelEspecial = calcularSorteio(chancesPapeis, ['lobisomem']);
                resultados.push({ jogador: lobisomemJogador, papel: papelEspecial });
            }
        
        });

        restanteJogadores.forEach(jogador => {
            const papelSorteado = calcularSorteio(chancesPapeis);
            resultados.push({ jogador, papel: papelSorteado });
        });

        localStorage.setItem('resultadoSorteio', JSON.stringify(resultados));
        processarLobisomens();

        window.location.href = 'noite.html';
    });
}

    //--------------------------------------

if (page === 'mediador') {
        const modal = document.getElementById('modal');
        const continuarBtnModal = document.getElementById('continuar-btn');  // Botão no modal
        const conteudoPrincipal = document.getElementById('pagina-mediador');  // Conteúdo principal
        const nomeJogador = document.getElementById('nome-jogador');
        const papelJogador = document.getElementById('papel-jogador');
        const imagemJogador = document.getElementById('imagem-jogador');  // Elemento para a imagem do jogador
        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        let posicaoAtual = parseInt(localStorage.getItem('posicaoAtual')) || 0;
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];
    
        // Função para exibir o jogador atual no modal
        const exibirJogadorModal = () => {
            const jogadorAtual = jogadores[posicaoAtual] || 'Nenhum jogador encontrado.';
            document.querySelector('.nome-pessoa .comando').textContent = `Passe o aparelho para: ${jogadorAtual}`;
        };
    
        // Função para atualizar o nome, papel e imagem do jogador no conteúdo principal
        const atualizarJogadorInfo = () => {
            const jogadorAtual = jogadores[posicaoAtual];
            const papelAtual = resultadoSorteio.find(jogador => jogador.jogador === jogadorAtual)?.papel || 'Sem papel definido';
            
            nomeJogador.textContent = `Jogador: ${jogadorAtual}`;
            papelJogador.textContent = `Papel: ${papelAtual}`;
            
            // Atualiza a imagem de acordo com o papel do jogador
            setTimeout(() => {
                const imagemPapel = imagemPorPapel[papelAtual.toLowerCase()] || 'img/default.png';
                imagemJogador.src = imagemPapel;  // Troca a imagem do jogador
            }, 500);  // Atraso de 1 segundo para a troca da imagem
        };
    
        // Atualiza o jogador no início do modal
        exibirJogadorModal();
        
    
        // Função para passar para o próximo jogador
        const proximoJogador = () => {
            posicaoAtual = (posicaoAtual + 1) % jogadores.length;
            localStorage.setItem('posicaoAtual', posicaoAtual);
            exibirJogadorModal(); // Atualiza o jogador no modal
        };
    
        // Botão "Continuar" no modal
        continuarBtnModal.addEventListener('click', () => {
            
            modal.style.display = 'none'; // Oculta o modal
    
            // Atualiza as informações do jogador após o modal (atrasa para garantir que o modal feche primeiro)
            setTimeout(() => {
                atualizarJogadorInfo();  // Atualiza a informação do jogador no conteúdo principal
            }, 500);  // Atraso de 500ms
        });

        proximoJogador();
    }
    


});

