document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nomeInput = document.getElementById('nome');
    const tabelaCorpo = document.querySelector('table tbody');
    const page = document.body.dataset.page;
    const papeisLobisomens = ['lobo solitário', 'filhote de lobisomem', 'lobo alfa'];
    let posicaoAtual = parseInt(localStorage.getItem('posicaoAtual')) || 0;

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

    function votacaoOuFim() {
        const vilaPacificada = localStorage.getItem('vilaPacificada');
        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

        const vivos = jogadoresStatus.filter(jogador => jogador.status !== 'morto');
        const mortos = jogadoresStatus.filter(jogador => jogador.status === 'morto');

        const lobisomensVivos = resultadoSorteio.filter(jogador =>
            (jogador.papel === 'lobisomem' || jogador.papel === 'feiticeira' || jogador.papel === 'assassino em série') &&
            vivos.some(v => v.nome === jogador.jogador)
        );

        const loboSolitarioVivo = resultadoSorteio.find(jogador =>
            jogador.papel === 'lobo solitário' && vivos.some(v => v.nome === jogador.jogador)
        );

        const assassinoEmSerieVivo = resultadoSorteio.find(jogador =>
            jogador.papel === 'assassino em série' && vivos.some(v => v.nome === jogador.jogador)
        );

        const aldeoesVivos = resultadoSorteio.filter(jogador =>
            jogador.papel !== 'lobisomem' && jogador.papel !== 'lobo solitário' &&
            jogador.papel !== 'assassino em série' && vivos.some(v => v.nome === jogador.jogador)
        );

        const vilaVence = lobisomensVivos.length === 0 && !loboSolitarioVivo && !assassinoEmSerieVivo;
        let lobisomensVencem = lobisomensVivos.length > aldeoesVivos.length;

        // Excluir "lobo solitário" do cálculo de maioria
        const lobisomensSemLoboSolitario = lobisomensVivos.filter(
            lobisomem => lobisomem.papel !== 'lobo solitário'
        );

        // Caso especial: "lobo solitário" perde se há outros lobisomens vivos
        if (lobisomensVencem && loboSolitarioVivo && lobisomensSemLoboSolitario.length > 0) {
            atualizarStatusJogador(loboSolitarioVivo.jogador, 'morto');
            lobisomensVivos.splice(
                lobisomensVivos.findIndex(l => l.jogador === loboSolitarioVivo.jogador),
                1
            );
            lobisomensVencem = lobisomensSemLoboSolitario.length > aldeoesVivos.length;
        }

        // Condição para o "lobo solitário" vencer
        const loboSolitarioVence =
            loboSolitarioVivo &&
            lobisomensVivos.length === 0 &&
            aldeoesVivos.length === 0;

        // Condição para o "assassino em série" vencer
        const assassinoEmSerieVence =
            assassinoEmSerieVivo &&
            vivos.length === 1 &&
            vivos[0].nome === assassinoEmSerieVivo.jogador;

        if (vilaVence || lobisomensVencem || loboSolitarioVence || assassinoEmSerieVence) {
            const vencedores = vilaVence
                ? "Os aldeões"
                : loboSolitarioVence
                    ? "O lobo solitário"
                    : assassinoEmSerieVence
                        ? "O assassino em série"
                        : "Os lobisomens";

            const vitoria = {
                vencedores,
                vivos: vivos.map(j => j.nome),
                mortos: mortos.map(j => j.nome),
                papeis: resultadoSorteio.map(j => ({ jogador: j.jogador, papel: j.papel })),
            };

            localStorage.setItem('vitoria', JSON.stringify(vitoria));

            window.location.href = 'vitoria.html';
        }



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
        "aprendiz de vidente": "Você pode aprender vidência durante a noite. Se aprender por 3 noites seguidas, você se torna vidente.",
        "pacifista": "Uma vez por jogo você pode revelar o papel de um jogador para todos e pular a votação daquele dia.",
        "sacerdote": "Você poderá usar a água benta em outro jogador. Se esse jogador for um lobisomem, ele morre. Se não, você morre. Só pode ser usada uma única vez.",
        "prefeito": "Se você revelar seu papel para a aldeia, seu voto conta duas vezes durante o dia.",
        "guarda-costas": "Durante a noite, você poderá selecionar um jogador para proteger. Se os lobisomens tentarem matar esse jogador, você morre no lugar.",
        "detetive": "Cada noite você pode selecionar dois jogadores para ver se eles pertencem ao mesmo time.",
        "portador do amuleto": "Você não poderá ser morto por lobisomens durante a noite se vestir o amuleto. Você não pode vestir o amuleto duas noites seguidas",
        "vidente de aura": "Toda noite você seleciona um jogador para saber se ele é o lobisomem.",
        "príncipe bonitão": "A primeira vez que a aldeia tentar te matar na votação, você mostra seu papel e sobrevive.",
        "maçom": "Você pode ver quem são os outros maçons.",
        "menininha": "Se você abrir seus olhos, há 15% de chance de detectar um lobisomem; mas também há 15% de chance dos lobisomens te encontrarem e te matarem.",
        "cientista maluco": "Você é um aldeão normal, exceto que quando você morrer uma substância tóxica será liberada e ela irá matar as duas pessoas ao seu lado.",
        "humano leproso": "Quando você é morto pelos lobisomens, eles não serão capazes de matar na próxima noite.",
        "valentão": "Quando atacado pelos lobisomens, você sobrevive até o próximo dia.",
        "menino travesso": "Apenas uma vez por jogo você pode trocar os papéis de dois jogadores. Após isso, você se torna um aldeão",
        "prostituta": "Durante a noite você pode ficar na casa de outro jogador. Se esse jogador for um lobisomem ou for morto por um, você também morrerá. Se os lobisomens tentarem te matar e você estiver na casa de outra pessoa, você sobrevive.",
        "vovó zangada": "Todo dia você escolhe algum jogador que não poderá votar durante o dia.",
        "bêbado": "Você está constantemente bêbado e não deve falar durante o jogo.",
        "idiota": "Se a aldeia tentar te matar na votação, você não morrerá, mas perderá seu direito de votar.",
        "pistoleiro": "Você têm duas balas que podem ser usadas para matar alguém. Os tiros são muito barulhentos, seu papel será revelado logo depois do primeiro tiro.",
        "lobisomem": "Durante a noite, você acorda junto com seus amigos lobisomens e decide uma vítima para matar. Durante o dia, tenta parecer um aldeão comum para não ser morto.",
        "lobo solitário": "Você é um lobisomem comum, exceto que você só ganhará se for o último lobisomem vivo.",
        "filhote de lobisomem": "Você é um lobisomem normal, exceto que, se você morrer, os lobisomens matarão duas pessoas na próxima noite.",
        "humano amaldiçoado": "Você é um aldeão normal até os lobisomens tentarem te matar. Caso aconteça, você se torna um lobisomem e os lobisomens ficam leprosos por uma noite.",
        "feiticeira": "A cada noite você seleciona um jogador para ver se ele é o vidente ou um lobisomem. Seu papel é ajudar o lobisomem a ganhar.",
        "lobo alfa": "Apenas uma vez por jogo, você pode morder um jogador para ele virar um lobisomem.",
        "assassino em série": "A cada noite você pode matar outro jogador. Se você for o último jogador vivo, você vence.",
        "inquisidor": "Cada noite você pode selecionar um jogador. Se ele é o líder da seita ou parte de uma seita, o jogador morrerá.",
        "sósia": "Na primeira noite você seleciona um jogador. Se esse jogador morrer, você tomará o seu papel.",
        "líder de seita": "Toda noite você escolhe alguém para unir à sua seita. Quando todos os jogadores se unirem, você vence.",
        "cupido": "Durante a primeira noite, você seleciona duas pessoas para formarem um casal. Esse casal só ganhará se eles forem as duas últimas pessoas vivas. Se uma pessoa do casal morrer em qualquer momento, a outra também morrerá.",
        "depressivo": "Você está muito triste. Seu objetivo é ser morto pela aldeia. Se você for linchado pela aldeia, você vence.",
        "necromante": "Uma vez por jogo, você poderá reviver um jogador morto.",
        "piromaníaco": "Toda noite você seleciona dois jogadores para encharcar com gasolina ou queimar todos os jogadores já encharcados. Você ganha se você for o último jogador vivo. Você não pode ser morto pelos lobisomens.",
        "caçador de cabeças": "Seu objetivo é fazer seu alvo ser linchado pela vila durante o dia. Se conseguir, você ganha; se o seu alvo morrer de outra maneira, você morre.",
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

    if (page === 'index') {
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
    }

    //--------------------------------------

    if (page === 'cadastro') {
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

        const abrirJanela = (nomeAtual, callbackConfirmar, protegidoAnterior) => {
            const modalAtaque = document.createElement('div');
            modalAtaque.className = 'modal-ataque';

            const jogadoresVivos = jogadoresStatus.filter(jogador =>
                jogador.status !== 'morto' &&
                jogador.nome !== nomeAtual
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
                    alert('Selecione um jogador para continuar.');
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
                jogador.status !== 'morto' &&
                jogador.nome !== nomeAtual
            );

            modalDetetive.innerHTML = `
                <div class=modal-content>
                    <h3>Escolha dois jogadores</h3>
                    <div class="selecao-jogadores">
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
                        alert('Os dois jogadores selecionados devem ser diferentes.');
                        return;
                    }
                    callbackConfirmar(jogador1Selecionado.value, jogador2Selecionado.value);
                    modalDetetive.remove();
                } else {
                    alert('Selecione dois jogadores para continuar.');
                }
            });

            document.getElementById('cancelar-detetive').addEventListener('click', () => {
                modalDetetive.remove();
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




            // -------------------------------------------------

            if (papelAtual.toLowerCase() === 'lobisomem') {
                const botaoAtaque = document.createElement('button');
                botaoAtaque.textContent = 'Atacar';

                const jogadorStatusAtual = jogadoresStatus.find(jogador => jogador.nome === jogadorAtual.nome);

                const outrosLobisomensDiv = document.createElement('div');
                outrosLobisomensDiv.style.position = 'fixed';
                outrosLobisomensDiv.style.bottom = '10px';
                outrosLobisomensDiv.style.right = '10px';
                outrosLobisomensDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                outrosLobisomensDiv.style.color = '#fff';
                outrosLobisomensDiv.style.padding = '10px';
                outrosLobisomensDiv.style.borderRadius = '5px';
                outrosLobisomensDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
                outrosLobisomensDiv.innerHTML = '<strong>Outros Lobisomens:</strong><br>';

                const outrosLobisomens = resultadoSorteio.filter(
                    jogador =>
                        jogador.papel === 'lobisomem' &&
                        jogador.jogador !== jogadorAtual.nome &&
                        jogadoresStatus.some(vivo => vivo.nome === jogador.jogador && vivo.status !== 'morto')
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
                            window.location.href = 'mediador.html';
                        } else {
                            alert('Jogador selecionado não encontrado!');
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
                            if (papelSelecionado.toLowerCase() === 'lobisomem') {
                                alert(`${nomeSelecionado} é lobisomem.`);
                            } else if (papelSelecionado.toLowerCase() === 'vidente') {
                                alert(`${nomeSelecionado} é vidente.`);
                            } else {
                                alert(`${nomeSelecionado} não é lobisomem nem Vidente.`);
                            }
                        } else {
                            alert('Jogador não encontrado.');
                        }
                        window.location.href = 'mediador.html';
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

                        if (status && status.status !== 'morto') {
                            pistoleiros[jogadorAtual.nome] = (pistoleiros[jogadorAtual.nome] || 0) + 1;
                            localStorage.setItem('pistoleiro', JSON.stringify(pistoleiros));

                            atualizarStatusJogador(nomeSelecionado, 'envenenado');

                            window.location.href = 'mediador.html';
                        } else {
                            alert('O jogador selecionado já está morto ou não pode ser envenenado.');
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
                            alert(`Você agora é um aldeão.`);
                        } else {
                            console.warn(`Jogador "${jogadorAtual.nome}" não encontrado na lista de sorteio.`);
                        }
                        window.location.href = 'mediador.html';
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
                                return statusJogador && statusJogador.status !== 'morto';
                            });

                        if (lobisomensVivos.length > 0) {
                            const lobisomemAleatorio = lobisomensVivos[Math.floor(Math.random() * lobisomensVivos.length)];
                            alert(`Você viu que ${lobisomemAleatorio.jogador} é um lobisomem.`);
                        } else {
                            alert('Não há lobisomens vivos para ver.');
                        }
                    } else if (chance >= 16 && chance <= 30) {
                        atualizarStatusJogador(jogadorAtual.nome, 'condenado');
                        alert('O lobisomem viu você!');
                    } else {
                        alert('Você não conseguiu ver nada desta vez.');
                    }

                    window.location.href = 'mediador.html';
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
                                alert(`${nomeSelecionado} é maçom.`);
                            } else {
                                alert(`${nomeSelecionado} não é maçom.`);
                            }
                        } else {
                            alert('Jogador não encontrado.');
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
                botaoEnvenenar.textContent = 'Envenenar';

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
                                alert(`${nomeSelecionado} é lobisomem.`);
                            } else {
                                alert(`${nomeSelecionado} não é lobisomem.`);
                            }
                        } else {
                            alert('Jogador não encontrado.');
                        }
                        window.location.href = 'mediador.html';
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

                const ataquesBruxa = JSON.parse(localStorage.getItem('ataquesBruxa')) || {};

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

                            atualizarStatusJogador(nomeSelecionado, 'envenenado');
                            window.location.href = 'mediador.html';
                        } else {
                            ataquesBruxa[jogadorAtual.nome] = nomeSelecionado;
                            localStorage.setItem('ataquesBruxa', JSON.stringify(ataquesBruxa));

                            atualizarStatusJogador(nomeSelecionado, 'envenenado');
                            window.location.href = 'mediador.html';
                        }
                    });
                });

                navegacaoDiv.appendChild(botaoAtaque);



                const botaoProtecao = document.createElement('button');
                botaoProtecao.textContent = 'Proteger';

                const protecoesBruxa = JSON.parse(localStorage.getItem('protecoesBruxa')) || {};

                if (protecoesBruxa[jogadorAtual.nome]) {
                    botaoProtecao.disabled = true;
                    botaoProtecao.textContent = 'Sem poção';
                }

                botaoProtecao.addEventListener('click', () => {
                    abrirJanela(jogadorAtual.nome, (nomeSelecionado) => {
                        const jogadorAlvo = jogadoresStatus.find(jogador => jogador.nome === nomeSelecionado);

                        if (jogadorAlvo && (jogadorAlvo.status === 'condenado' || jogadorAlvo.status === 'vivo')) {
                            atualizarStatusJogador(nomeSelecionado, 'protegido');
                        }

                        protecoesBruxa[jogadorAtual.nome] = nomeSelecionado;
                        localStorage.setItem('protecoesBruxa', JSON.stringify(protecoesBruxa));

                        window.location.href = 'mediador.html';
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

                    if (aprendizesDeVidente[jogadorAtual.nome] === 3) {
                        const jogadorIndex = resultadoSorteio.findIndex(jogador => jogador.jogador === jogadorAtual.nome);
                        if (jogadorIndex !== -1) {
                            resultadoSorteio[jogadorIndex].papel = 'vidente';
                            localStorage.setItem('resultadoSorteio', JSON.stringify(resultadoSorteio));
                            console.log(`Jogador "${jogadorAtual.nome}" agora é vidente.`);
                            alert(`Você agora é um vidente!`);
                        } else {
                            console.warn(`Jogador "${jogadorAtual.nome}" não encontrado na lista.`);
                        }

                        window.location.href = 'mediador.html';
                    } else {
                        alert(`Você está aprendendo. Nível atual: ${aprendizesDeVidente[jogadorAtual.nome]}`);
                        window.location.href = 'mediador.html';
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
                                alert(`${jogador1} e ${jogador2} são do mesmo time.`);
                            } else {
                                alert(`${jogador1} e ${jogador2} são de times diferentes.`);
                            }
                        } else {
                            alert('Um ou ambos os jogadores selecionados não foram encontrados.');
                        }

                        localStorage.removeItem('investigacao');

                        window.location.href = 'mediador.html';
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
        let jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];

        const jogadoresCondenados = jogadoresStatus.filter(jogador => jogador.status === 'condenado');
        const jogadoresEnvenenados = jogadoresStatus.filter(jogador => jogador.status === 'envenenado');

        const descricoes = [
            'Essa vila fica mais perigosa a cada noite...',
            'Pelo menos não foi eu.',
            'Cara, ainda bem que eu não sou você.',
            'Quem com ferro fere, com ferro ferido ferro.',
            'Eu sei quem é...',
            'A vida dá dessas'
        ];

        const numero = Math.floor(Math.random() * descricoes.length);

        const divRelatorio = document.getElementById('relatorio');
        divRelatorio.style.display = 'block';

        let jogadorSorteado = null;

        if (jogadoresCondenados.length === 1) {
            jogadorSorteado = jogadoresCondenados[0];
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

        jogadoresStatus = jogadoresStatus.map(jogador => {
            if (jogador.status === 'envenenado') {
                jogador.status = 'morto';
            }
            return jogador;
        });

        localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));

        console.log("Todos os jogadores envenenados e condenados foram atualizados para 'morto'.");

        const jogadoresMortos = jogadoresStatus.filter(jogador => jogador.status === 'morto');

        jogadoresMortos.forEach(jogadorMorto => {
            const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

            const sosia = resultadoSorteio.find(resultado => resultado.papel === 'sósia' && resultado.jogador === jogadorMorto.nome);
            

            if (sosia) {
                let sosias = JSON.parse(localStorage.getItem('sosia')) || {};

                const nomeSosiaNormalizado = sosia.jogador.toLowerCase();
                const nomeJogadorSosia = Object.entries(sosias).find(
                    ([chave, valor]) => chave.toLowerCase() === nomeSosiaNormalizado
                )?.[1];

                if (nomeJogadorSosia) {
                    const jogadorSelecionado = resultadoSorteio.find(jogador => jogador.jogador === nomeJogadorSosia);
                    if (jogadorSelecionado) {
                        jogadorSelecionado.papel = resultadoSorteio.find(jogador => jogador.jogador === jogadorMorto.nome)?.papel || 'Desconhecido';
                        atualizarStatusJogador(nomeJogadorSosia, 'vivo');
                        console.log(`${nomeJogadorSosia} agora tem o papel de ${jogadorSelecionado.papel}`);
                    }
                } else {
                    console.warn(`Nenhum sósia encontrado para: ${sosia.jogador}`);
                }
            }

            const caçador = resultadoSorteio.find(resultado => resultado.papel === 'caçador' && resultado.jogador === jogadorMorto.nome);

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
                            alert('Um ou ambos os jogadores selecionados não foram encontrados.');
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
            trocarPapeis();
            localStorage.setItem('jogadoresStatus', JSON.stringify(jogadoresStatus));
            localStorage.removeItem('troca');
        });

    }

    if (page === 'resultadoVotacao') {
        const resultadoSorteio = JSON.parse(localStorage.getItem('resultadoSorteio')) || [];

        const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
        const votos = JSON.parse(localStorage.getItem('votacao')) || {};
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

            const jogadoresStatus = JSON.parse(localStorage.getItem('jogadoresStatus')) || [];
            const jogadorStatus = resultadoSorteio.find(jogador => jogador.jogador === vencedor);

            if (jogadorStatus && jogadorStatus.papel === 'príncipe bonitão' && !principeJogadores.includes(vencedor)) {
                resultadoP.textContent = `${vencedor} é um Príncipe Bonitão e não morrerá dessa vez.`;
                principeJogadores.push(vencedor);
                localStorage.setItem('principe', JSON.stringify(principeJogadores));
            } else if (jogadorStatus && jogadorStatus.papel === 'idiota' && !idiotaJogadores.includes(vencedor)) {
                resultadoP.textContent = `${vencedor} é um Idiota e não morrerá dessa vez.`;
                idiotaJogadores.push(vencedor);
                localStorage.setItem('idiota', JSON.stringify(idiotaJogadores));
            } else {
                atualizarStatusJogador(vencedor, 'morto');
                resultadoP.textContent = `${vencedor} recebeu ${maxVotos} voto(s) e morreu pela vila.`;
            }
        } else {
            resultadoP.textContent = 'Não houve votação.';
        }


        localStorage.removeItem('votacao');
        localStorage.removeItem('ordemDeVotacao');

    }
});
