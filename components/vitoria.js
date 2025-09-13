import { showAlert } from './main.js';


const vitoria = JSON.parse(localStorage.getItem('vitoria')) || {};

        const topo = document.getElementById('topo');
        const imagemPapel = document.getElementById('imagem-papel');

        if (vitoria.vivos.length === 0) {
            topo.textContent = 'NINGUÉM VENCEU';
            imagemPapel.src = '../img/mestre.png';
            imagemPapel.alt = 'Imagem do Mestre';
        } else {
            topo.textContent = `${vitoria.vencedores} venceu!`;

            if (vitoria.vencedores === 'A alcateia') {
                imagemPapel.src = '../img/lobisomem.png';
                imagemPapel.alt = 'Imagem de Lobisomem';
            } else if (vitoria.vencedores === 'A vila') {
                imagemPapel.src = '../img/aldeao.png';
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