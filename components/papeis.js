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
        localStorage.removeItem('contagemDia');
        localStorage.removeItem('contagemNoite');
        localStorage.removeItem('cacadasCacador');
        localStorage.removeItem('contadorMestre');
        localStorage.removeItem('protecoesMedico');

        document.getElementById('salvar-sessao-ut').addEventListener('click', function (event) {
            const papeisSelecionados = JSON.parse(localStorage.getItem('papeisSessao')) || [];
            const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];

            if (jogadores.length < 4 || papeisSelecionados.length < 2) {
                showAlert('Certifique-se de que há ao menos 4 jogadores e 2 papéis salvos na sessão.');
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
