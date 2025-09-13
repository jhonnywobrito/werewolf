import { showAlert } from './main.js';


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
                    window.location.href = 'resultadoVotacao.html';
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