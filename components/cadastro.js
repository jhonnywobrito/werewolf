import { abrirModalCadastro } from "./main.js";
import { carregarJogadores, deletarJogadores } from "./main.js";


document.addEventListener('DOMContentLoaded', () => {
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
});


    