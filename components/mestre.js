import { chancesPapeisConfig } from '../components/main.js';
import { showAlert } from './main.js';

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