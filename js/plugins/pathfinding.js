/*:
 * @plugindesc Algoritmos de Busca (Chest Finder & Safe Exit)
 * @author Fernando Simão
 */

var DungeonSystem = DungeonSystem || {};

(function() {
    "use strict";

    DungeonSystem.Algoritmos = {

        // ========================================================
        // 1. BFS (Breadth-First Search) - O CAÇADOR DE TESOUROS
        // Objetivo: Achar o baú mais próximo e dar as direções
        // ========================================================
        rodarBFS: function() {
            let grafo = DungeonSystem.instanciaAtual;
            let inicio = grafo.salaAtual;
            
            console.log(`--- 🌊 BFS: Procurando Baú a partir de ${inicio} ---`);

            let fila = [inicio];
            let visitados = new Set();
            let predecessores = {}; // Mapa para voltar o caminho
            visitados.add(inicio);

            let salaDoBau = null;

            // O LOOP DA ONDA
            while (fila.length > 0) {
                let u = fila.shift(); // Tira o primeiro da fila

                // Verifica se tem baú (ignorando a sala onde já estamos)
                if (u !== inicio && grafo.dadosDasSalas[u].temBau) {
                    salaDoBau = u;
                    break; // ACHAMOS!
                }

                let vizinhos = Object.values(grafo.obterConexoesDetalhadas(u));
                for (let v of vizinhos) {
                    if (!visitados.has(v)) {
                        visitados.add(v);
                        predecessores[v] = u;
                        fila.push(v);
                    }
                }
            }

            // RESULTADO PRO JOGADOR
            if (salaDoBau) {
                let caminhoSalas = this._reconstruirCaminho(predecessores, inicio, salaDoBau);
                
                // --- TRADUZIR SALAS EM DIREÇÕES (A novidade) ---
                let instrucoes = [];
                for (let i = 0; i < caminhoSalas.length - 1; i++) {
                    let salaA = caminhoSalas[i];
                    let salaB = caminhoSalas[i+1];
                    let conexoesA = grafo.obterConexoesDetalhadas(salaA);
                    
                    for (let dir in conexoesA) {
                        if (conexoesA[dir] === salaB) {
                            instrucoes.push(dir);
                            break;
                        }
                    }
                }
                
                let textoPassos = instrucoes.join(" -> ");
                
                $gameMessage.add("\\c[6][BFS - Detector de Tesouro]\\c[0]");
                $gameMessage.add("Ouro detectado! Siga este rastro:");
                $gameMessage.add(textoPassos); // "Norte -> Leste -> Norte"
                
                console.log("💰 Rota do Baú (Salas):", caminhoSalas);
                console.log("🧭 Rota do Baú (Direções):", textoPassos);
            } else {
                $gameMessage.add("O feitiço BFS não encontrou nenhum baú restante...");
            }
        },

        // ========================================================
        // 2. DIJKSTRA - O GUIA DE SEGURANÇA
        // Objetivo: Achar a SAÍDA evitando salas perigosas (GPS)
        // ========================================================
        rodarDijkstra: function() {
            let grafo = DungeonSystem.instanciaAtual;
            let inicio = grafo.salaAtual;
            let destino = grafo.salaSaida;

            console.log(`--- 🛡️ DIJKSTRA: Rota Segura para ${destino} ---`);

            let distancias = {};
            let anteriores = {};
            let naoVisitados = new Set();

            for (let sala in grafo.dadosDasSalas) {
                distancias[sala] = Infinity;
                naoVisitados.add(sala);
            }
            distancias[inicio] = 0;

            while (naoVisitados.size > 0) {
                let u = null;
                for (let sala of naoVisitados) {
                    if (u === null || distancias[sala] < distancias[u]) {
                        u = sala;
                    }
                }

                if (u === destino) break;
                if (distancias[u] === Infinity) break;

                naoVisitados.delete(u);

                let vizinhos = Object.values(grafo.obterConexoesDetalhadas(u));
                for (let v of vizinhos) {
                    if (naoVisitados.has(v)) {
                        let perigoSala = grafo.dadosDasSalas[v].perigo || 1; 
                        let novoCusto = distancias[u] + perigoSala;

                        if (novoCusto < distancias[v]) {
                            distancias[v] = novoCusto;
                            anteriores[v] = u;
                        }
                    }
                }
            }

            // RESULTADO
            let caminhoSalas = this._reconstruirCaminho(anteriores, inicio, destino);
            
            if (caminhoSalas.length > 0) {
                let perigoTotal = distancias[destino];
                let instrucoes = [];

                // Traduz para direções
                for (let i = 0; i < caminhoSalas.length - 1; i++) {
                    let salaA = caminhoSalas[i];
                    let salaB = caminhoSalas[i+1];
                    let conexoesA = grafo.obterConexoesDetalhadas(salaA);
                    
                    for (let dir in conexoesA) {
                        if (conexoesA[dir] === salaB) {
                            instrucoes.push(dir);
                            break;
                        }
                    }
                }

                let textoPassos = instrucoes.join(" -> ");

                $gameMessage.add("\\c[4][Dijkstra - GPS Seguro]\\c[0]");
                $gameMessage.add("Rota para a Saída (Ameaça: " + perigoTotal + "):");
                $gameMessage.add(textoPassos);
                
                console.log("🛡️ Rota Saída (Salas):", caminhoSalas);
                console.log("🧭 Rota Saída (Direções):", textoPassos);
            } else {
                $gameMessage.add("Não consigo traçar uma rota segura para a saída.");
            }
        },

        // ========================================================
        // 3. DFS (Depth-First Search) - O MAPEADOR
        // Objetivo: Contar salas (mantivemos igual)
        // ========================================================
        rodarDFS: function() {
            let grafo = DungeonSystem.instanciaAtual;
            let inicio = grafo.salaAtual;
            
            let pilha = [inicio];
            let visitados = new Set();
            let logCaminho = [];

            while (pilha.length > 0) {
                let u = pilha.pop();
                if (!visitados.has(u)) {
                    visitados.add(u);
                    logCaminho.push(u);

                    let vizinhos = Object.values(grafo.obterConexoesDetalhadas(u));
                    for (let v of vizinhos) {
                        pilha.push(v);
                    }
                }
            }

            $gameMessage.add("\\c[2][DFS - Scan Completo]\\c[0]");
            $gameMessage.add("Eu sinto a presença de " + visitados.size + " salas.");
            $gameMessage.add("Mapeamento mental concluído.");
            console.log("🔍 DFS Mapeamento:", logCaminho.join(" -> "));
        },

        // Função Ajudante
        _reconstruirCaminho: function(predecessores, inicio, fim) {
            let caminho = [fim];
            let atual = fim;
            while (atual !== inicio) {
                atual = predecessores[atual];
                if (!atual) return []; 
                caminho.unshift(atual);
            }
            return caminho;
        }
    };

})();