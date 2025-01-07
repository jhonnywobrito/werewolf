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
        'filhote de lobisomem': 'img/filhote-lobisomem.png'
    };

    const descricaoPorPapel = {
        "aldeão": "Durante o dia, você discute com a aldeia sobre quem pode ser o lobisomem e decide alguém para matar.",
        "vidente": "Toda noite você poderá descobrir o papel de outro jogador.",
        "médico": "Durante a noite, você acorda e seleciona um jogador que não poderá ser morto pelos lobisomens naquela noite. Você não poderá proteger o mesmo jogador duas noites seguidas.",
        "caçador": "Quando você morrer poderá escolher outra pessoa para morrer com você.",
        "bruxa": "Você tem duas poções que podem ser usadas durante a noite: uma que irá salvar outro jogador de ser morto pelos lobisomens e um veneno que irá matar outro jogador.",
        "aprendiz de vidente": "Se o vidente morrer, você tomará seu lugar e começará a procurar por lobisomens.",
        "pacifista": "Uma vez por jogo você pode revelar o papel de um jogador para todos e evitar qualquer pessoa de votar durante aquele dia.",
        "sacerdote": "Você poderá usar a água benta em outro jogador. Se esse jogador for um lobisomem, ele morre. Se não, você morre. Só pode ser usada uma única vez.",
        "prefeito": "Se você revelar seu papel para a aldeia, seu voto conta duas vezes durante o dia.",
        "guarda-costas": "Durante a noite, você poderá selecionar um jogador para proteger. Se os lobisomens tentarem matar esse jogador, você morre no lugar.",
        "detetive": "Cada noite você pode selecionar dois jogadores para ver se eles pertencem ao mesmo time.",
        "portador do amuleto": "Você não poderá ser morto por lobisomens durante a noite.",
        "vidente de aura": "Toda noite você seleciona um jogador para saber se ele é o lobisomem.",
        "príncipe bonitão": "A primeira vez que a aldeia tentar te matar na votação, você mostra seu papel e sobrevive.",
        "maçom": "Você pode ver quem são os outros maçons.",
        "menininha": "Se você abrir seus olhos, há 20% de chance de detectar um lobisomem; mas também há 5% de chance dos lobisomens te encontrarem e te matarem.",
        "cientista maluco": "Você é um aldeão normal, exceto que quando você morrer uma substância tóxica será liberada e ela irá matar as duas pessoas ao seu lado.",
        "caçador de cabeças": "Seu objetivo é fazer seu alvo ser linchado pela vila durante o dia. Se o seu alvo morrer de outra maneira, você irá virar um aldeão normal.",
        "humano leproso": "Quando você é morto pelos lobisomens, eles não serão capazes de matar na próxima noite.",
        "valentão": "Quando atacado pelos lobisomens, você sobrevive até o próximo dia.",
        "menino travesso": "Apenas uma vez por jogo você pode trocar os papéis de dois jogadores.",
        "prostituta": "Durante a noite você pode ficar na casa de outro jogador. Se esse jogador for um lobisomem ou for morto por um, você também morrerá. Se os lobisomens tentarem te matar e você estiver na casa de outra pessoa, você sobrevive.",
        "vovó zangada": "Todo dia você escolhe algum jogador que não poderá votar durante o dia.",
        "bêbado": "Você está constantemente bêbado e não deve falar durante o jogo.",
        "idiota": "Se a aldeia tentar te matar na votação, você não morrerá, mas perderá seu direito de votar.",
        "pistoleiro": "Você têm duas balas que podem ser usadas para matar alguém. Os tiros são muito barulhentos, seu papel será revelado logo depois do primeiro tiro.",
        "lobisomem": "Durante a noite, você acorda junto com seus amigos lobisomens e decide uma vítima para matar. Durante o dia, tenta parecer um aldeão comum para não ser morto.",
        "lobo solitário": "Você é um lobisomem comum, exceto que você só ganhará se for o último lobisomem vivo.",
        "filhote de lobisomem": "Você é um lobisomem normal, exceto que, se você morrer, os lobisomens matarão duas pessoas na próxima noite.",
        "humano amaldiçoado": "Você é um aldeão normal até os lobisomens tentarem te matar. Caso aconteça, você se torna um lobisomem.",
        "feiticeira": "A cada noite você seleciona um jogador para ver se ele é o vidente ou um lobisomem.",
        "lobo alfa": "Apenas uma vez por jogo, você pode morder um jogador para ele virar um lobisomem.",
        "assassino em série": "A cada noite você pode matar outro jogador. Se você for o último jogador vivo, você vence.",
        "inquisidor": "Cada noite você pode selecionar um jogador. Se ele é o líder da seita ou parte de uma seita, o jogador morrerá.",
        "sósia": "Na primeira noite você seleciona um jogador. Se esse jogador morrer, você tomará o seu papel.",
        "líder de seita": "Toda noite você escolhe alguém para unir à sua seita. Quando todos os jogadores se unirem, você vence.",
        "cupido": "Durante a primeira noite, você seleciona duas pessoas para formarem um casal. Esse casal só ganhará se eles forem as duas últimas pessoas vivas. Se uma pessoa do casal morrer em qualquer momento, a outra também morrerá.",
        "depressivo": "Você está muito triste. Seu objetivo é ser morto pela aldeia. Se você for linchado pela aldeia, você vence.",
        "necromante": "Uma vez por jogo, você poderá reviver um jogador morto.",
        "piromaníaco": "Toda noite você seleciona dois jogadores para encharcar com gasolina ou queimar todos os jogadores já encharcados. Você ganha se você for o último jogador vivo. Você não pode ser morto pelos lobisomens.",
        "presidente": "Você é o presidente! Todo mundo sabe quem você é. Se você morrer, a aldeia perderá."
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
    localStorage.removeItem('ordemDeJogo');
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
        
        const jogadoresStatus = jogadores.map(jogador => ({ nome: jogador, status: 'vivo'
        }));
    
        localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));

        localStorage.setItem('resultadoSorteio', JSON.stringify(resultados));
        processarLobisomens();

        window.location.href = 'noite.html';
    });
}

    //--------------------------------------

    if (page === 'mediador') {
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
    
            if (papelAtual.toLowerCase() === 'lobisomem') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Atacar';
                botaoAtaque.addEventListener('click', () => abrirJanelaAtaque(jogadorAtual.nome));
                navegacaoDiv.appendChild(botaoAtaque);
    
                const botaoEstrategia = document.createElement('button');
                botaoEstrategia.textContent = 'Estratégia';
                botaoEstrategia.addEventListener('click', () => {
                    alert(`Jogador "${jogadorAtual.nome}" está planejando uma estratégia!`);
                });
                navegacaoDiv.appendChild(botaoEstrategia);
            }
        };
    
        const abrirJanelaAtaque = (jogadorAtual) => {
            const modalAtaque = document.createElement('div');
            modalAtaque.className = 'modal-ataque';
    
            const jogadoresVivos = jogadoresStatus.filter(jogador => jogador.status !== 'morto' && jogador.nome !== jogadorAtual);
    
            modalAtaque.innerHTML = `
                <div class="modal-content">
                    <h2>Escolha um jogador para atacar</h2>
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
                    <button id="cancelar-ataque">Cancelar</button>
                    <button id="confirmar-ataque">Confirmar</button>
                </div>
            `;
    
            document.body.appendChild(modalAtaque);
    
            document.getElementById('confirmar-ataque').addEventListener('click', () => {
                const jogadorSelecionado = document.querySelector('input[name="jogador"]:checked');
                if (jogadorSelecionado) {
                    const nomeSelecionado = jogadorSelecionado.value;
                    console.log(`Jogador atacado: ${nomeSelecionado}`);
                    atualizarStatusJogador(nomeSelecionado, 'condenado');
                    alert(`Você atacou o jogador: ${nomeSelecionado}`);
                    window.location.href = 'mediador.html';
                } else {
                    alert('Selecione um jogador para continuar.');
                }
            });
    
            document.getElementById('cancelar-ataque').addEventListener('click', () => {
                modalAtaque.remove();
            });
        };

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

        // ------------------- MAIN

        jogadoresStatus.forEach(jogador => {
            if (jogador.status === 'morto' && !ordemDeJogo.includes(jogador.nome)) {
                ordemDeJogo.push(jogador.nome);
            }
        });
        
        localStorage.setItem('ordemDeJogo', JSON.stringify(ordemDeJogo));

        if (ordemDeJogo.length >= jogadoresStatus.length) {
            window.location.href = 'relatorio.html';
        }
        else {
            exibirJogadorModal();
            
            let ordemDeJogo = JSON.parse(localStorage.getItem('ordemDeJogo')) || [];
            ordemDeJogo.push(jogadorAtual.nome);
            localStorage.setItem('ordemDeJogo', JSON.stringify(ordemDeJogo));
        }
    }
    
    //--------------------------------------

    if (page === 'relatorio') {
        localStorage.removeItem('ordemDeJogo');
        
        let jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
    
        const jogadoresCondenados = jogadoresStatus.filter(jogador => jogador.status === 'condenado');
    
        let jogadorSorteado = null;
    
        if (jogadoresCondenados.length === 1) {
            jogadorSorteado = jogadoresCondenados[0];
            jogadorSorteado.status = 'morto';
        } else if (jogadoresCondenados.length > 1) {
            jogadorSorteado = jogadoresCondenados[Math.floor(Math.random() * jogadoresCondenados.length)];
            jogadorSorteado.status = 'morto';
        }
    
        jogadoresStatus = jogadoresStatus.map(jogador => {
            if (jogador === jogadorSorteado) {
                jogador.status = 'morto';
            } else if (jogador.status === 'condenado') {
                jogador.status = 'vivo';
            }
            return jogador;
        });
    
        localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
    
        const nomeJogador = document.getElementById('relatorio-jogador');
        const descricaoRelatorio = document.getElementById('descricao-relatorio');
    
        const descricoes = [
            'Essa vila fica mais perigosa a cada noite...',
            'Pelo menos não foi eu.',
            'Cara, ainda bem que eu não sou você.'
        ];
    
        const numero = Math.floor(Math.random() * descricoes.length);
    
        nomeJogador.textContent = `${jogadorSorteado ? jogadorSorteado.nome + ' foi morto durante a noite.' : 'Nenhum jogador morto'}`;
        descricaoRelatorio.textContent = descricoes[numero];
    
        const divRelatorio = document.getElementById('relatorio');
        divRelatorio.style.display = 'block';
    
        posicaoAtual = 0;
        localStorage.setItem('posicaoAtual', posicaoAtual);
    
        console.log(`Jogador sorteado: ${jogadorSorteado ? jogadorSorteado.nome : 'Nenhum jogador morto'}`);
    }
    
    
    
    

    //--------------------------------------

    if (page === 'noite') {
        
    }

});
