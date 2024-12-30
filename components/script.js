document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nomeInput = document.getElementById('nome');
    const tabelaCorpo = document.querySelector('table tbody');

    const deletarJogadores = () => {
        localStorage.removeItem('jogadores');
        carregarJogadores();
    };

    const carregarJogadores = () => {
        const jogadores = JSON.parse(localStorage.getItem('jogadores')) || [];
        tabelaCorpo.innerHTML = '';
        jogadores.forEach((jogador, index) => {
            const novaLinha = document.createElement('tr');
            const idCelula = document.createElement('td');
            idCelula.textContent = index + 1;
            novaLinha.appendChild(idCelula);
            const nomeCelula = document.createElement('td');
            nomeCelula.textContent = jogador;
            novaLinha.appendChild(nomeCelula);
            tabelaCorpo.appendChild(novaLinha);
        });
    };

    document.getElementById('salvar-sessao-ut').addEventListener('click', () => {
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


});
