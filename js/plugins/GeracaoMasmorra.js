/*:
 * @plugindesc Sistema de Masmorra Dinâmica Completo (Geração + Coloração + Navegação)
 * @author Fernando Simão
 */

var DungeonSystem = DungeonSystem || {};

(function() { 
    "use strict";

    DungeonSystem.Config = {
        DefaultFallback: {x:8, y:6},

        Switches: {
            Norte: 10, Sul: 11, Leste: 12, Oeste: 13, TemBau: 15
        },

        // --- CORES/TIPOS DE SALA ---
        TiposDeSala: ["Pedra", "Floresta", "Gelo", "Fogo"].sort(() => Math.random() - 0.5),

        // --- MAPAS DISPONÍVEIS POR TIPO ---
        MapasDisponiveis: {
            // Entrada/Saída (Fixos)
            "Especial": [
                { id: 9, nome: "Entrada Floresta", spawns: {Norte:{x:10,y:1},Sul:{x:10,y:19},Leste:{x:19,y:10},Oeste:{x:1,y:10}} }
            ],
            
            // Mapas para o Welch-Powell colorir
            "MapasPedra": [
                { id: 10, nome: "Sala Pedra 1", spawns: {Norte:{x:8,y:1},Sul:{x:8,y:15},Leste:{x:15,y:8},Oeste:{x:1,y:8}} },
                { id: 11, nome: "Sala Pedra 2", spawns: {Norte:{x:19,y:1},Sul:{x:19,y:11},Leste:{x:38,y:5},Oeste:{x:2,y:6}} },
                { id: 12, nome: "Sala Comprida V", spawns: {Norte:{x:6,y:1},Sul:{x:6,y:38},Leste:{x:11,y:20},Oeste:{x:1,y:20}} },
                { id: 13, nome: "Sala Pedra 3", spawns: {Norte:{x:14,y:1},Sul:{x:14,y:27},Leste:{x:27,y:14},Oeste:{x:1,y:14}} }
            ],

            "MapasFloresta": [
                { id: 17, nome: "Sala Mato 1", spawns: {Norte:{x:6,y:6},Sul:{x:6,y:27},Leste:{x:21,y:18},Oeste:{x:2,y:13}} },
                { id: 23, nome: "Sala Mato 2", spawns: {Norte:{x:14,y:1},Sul:{x:14,y:27},Leste:{x:27,y:14},Oeste:{x:1,y:14}}}
            ],

            "MapasGelo": [
                { id: 21, nome: "Sala Gelo 1", spawns: {Norte:{x:13,y:2},Sul:{x:9,y:28},Leste:{x:28,y:15},Oeste:{x:2,y:9}} },
                { id: 24, nome: "Sala Gelo 2", spawns: {Norte:{x:6,y:1},Sul:{x:12,y:25},Leste:{x:24,y:16},Oeste:{x:2,y:9}} }
            ],

            "MapasFogo": [
                { id: 22, nome:"Sala Fogo 1", spawns: {Norte:{x:8,y:2},Sul:{x:13,y:28},Leste:{x:27,y:18},Oeste:{x:1,y:17}} },
                { id: 25, nome:"Sala Fogo 2", spawns: {Norte:{x:13,y:3},Sul:{x:13,y:20},Leste:{x:21,y:13},Oeste:{x:5,y:13}} }
            ]
        }
    };



    // ========================================================
    // MODELO DO GRAFO
    // ========================================================
    class MasmorraGrafo {
        constructor() {
            this.conexoes = {};    
            this.dadosDasSalas = {};
            this.salaAtual = null; 
        }

        criarPassagem(origem, destino, direcao) {
            if (!this.conexoes[origem]) this.conexoes[origem] = {};
            if (!this.conexoes[destino]) this.conexoes[destino] = {};

            this.conexoes[origem][direcao] = destino;
            
            let dirInversa = "";
            if (direcao === "Norte") dirInversa = "Sul";
            if (direcao === "Sul") dirInversa = "Norte";
            if (direcao === "Leste") dirInversa = "Oeste";
            if (direcao === "Oeste") dirInversa = "Leste";

            this.conexoes[destino][dirInversa] = origem;
        }
        
        obterConexoesDetalhadas(sala) {
            return this.conexoes[sala] || {};
        }
    }

    DungeonSystem.instanciaAtual = new MasmorraGrafo();

    // ========================================================
    // GERENCIADOR DE LOOT
    // ========================================================
    DungeonSystem.LootManager = {
        tentarCriarBau: function(nomeDaSala) {
            let chance = Math.random(); 
            if(chance > 0.3) return false;

            let tituloWarehouse = "Bau_" + nomeDaSala;

            if( typeof PHPlugins !== 'undefined' && PHPlugins.PHWarehouse){
                let comandoCriar = "<" + tituloWarehouse + ":5>";
                PHPlugins.PHWarehouse.createWarehouse(comandoCriar);
                let comandoItem = "<" + tituloWarehouse + ":5:1>";
                PHPlugins.PHWarehouse.addItems(comandoItem, "item");
                return true; 
            }
            return false;
        },

        abrirBauDaSalaAtual: function() {
            let sala = DungeonSystem.instanciaAtual.salaAtual;
            let tituloWarehouse = "Bau_" + sala;
            if( typeof PHPlugins !== 'undefined' && PHPlugins.PHWarehouse){
                let comandoAbrir = "<" + tituloWarehouse + ">";
                PHPlugins.PHWarehouse.openWarehouse(comandoAbrir);
                SceneManager.push(Scene_Warehouse);
            }
        }
    };


  // ============================================================
    // GERADOR DA MASMORRA (UTILIZANDO ALGORITMO DE PRIM)
    // ============================================================
    DungeonSystem.Gerador = {
        
        gerarNovaMasmorra: function(largura, altura, forcar = false) {
            // Nota: Agora 'tamanho' foi quebrado em largura x altura para facilitar o Prim
            if(arguments.length === 1) { altura = Math.floor(arguments[0]/3); largura = 3; } // Fallback simples

            let grafo = DungeonSystem.instanciaAtual;

            if (!forcar && grafo.conexoes && Object.keys(grafo.conexoes).length > 0) {
                console.warn("⚠️ Masmorra já existe. Ignorando.");
                return;
            }

            console.log("--- 🌲 Gerando MST com Algoritmo de Prim ---");
            grafo.conexoes = {};
            grafo.dadosDasSalas = {};
            
            if(typeof PHPlugins !== 'undefined' && PHPlugins.PHWarehouse){
                let todosOsBaus = PHPlugins.PHWarehouse._warehouses;
                for (let nomeDoBau in todosOsBaus) {
                    if (nomeDoBau.startsWith("Bau_")) delete todosOsBaus[nomeDoBau];
                }
            }

            // --- ESTRUTURAS DO PRIM ---
            let visitados = new Set();
            let listaDeArestas = []; // Nossa "Priority Queue" simplificada
            
            // Função auxiliar para nomes: "0-0", "1-2" (X-Y)
            const nomeSala = (x, y) => `${x}-${y}`;
            const coordsValidas = (x, y) => x >= 0 && x < largura && y >= 0 && y < altura;

            // 1. Escolhe Sala Inicial (Entrada)
            let startX = 0; 
            let startY = 0;
            let nomeEntrada = nomeSala(startX, startY);
            
            // Registra Entrada
            visitados.add(nomeEntrada);
            this._inicializarSala(nomeEntrada, "Especial", false);
            let mapEntrada = DungeonSystem.Config.MapasDisponiveis["Especial"][0];
            grafo.dadosDasSalas[nomeEntrada].mapId = mapEntrada.id;

            // Adiciona arestas iniciais (vizinhos da entrada)
            this._adicionarArestasDoVizinho(startX, startY, largura, altura, listaDeArestas, visitados);

            let ultimoNomeCriado = nomeEntrada;

            // 2. Loop do Algoritmo de Prim
            while (listaDeArestas.length > 0) {
                // ORDENA PELA ARESTA DE MENOR PESO (Simulando Min-Priority Queue)
                // Isso é o coração do Prim: sempre pega o caminho mais "barato"
                listaDeArestas.sort((a, b) => a.peso - b.peso);

                // Remove a aresta mais barata
                let aresta = listaDeArestas.shift(); 
                let proximaSala = aresta.destino;
                let [px, py] = proximaSala.split('-').map(Number);

                if (!visitados.has(proximaSala)) {
                    // CONECTA: Confirma a parede quebrada
                    visitados.add(proximaSala);
                    
                    // Cria conexão no Grafo
                    grafo.criarPassagem(aresta.origem, proximaSala, aresta.direcao);
                    console.log(`Prim escolheu peso ${aresta.peso}: ${aresta.origem} -> ${proximaSala}`);

                    // Gera dados da sala (Loot, etc)
                    let temBau = DungeonSystem.LootManager.tentarCriarBau(proximaSala);
                    this._inicializarSala(proximaSala, "Indefinido", temBau);

                    // Adiciona novos vizinhos na lista de prioridade
                    this._adicionarArestasDoVizinho(px, py, largura, altura, listaDeArestas, visitados);
                    
                    ultimoNomeCriado = proximaSala;
                }
            }

            // 3. Aplica Coloração (Seu código original)
            if (DungeonSystem.Extras && DungeonSystem.Extras.rodarWelchPowell) {
                // O WelchPowell deve funcionar se ignorar pelo Tipo "Especial"
                DungeonSystem.Extras.rodarWelchPowell();
            }

            // 4. Configura Saída (A última sala visitada pelo Prim - geralmente a mais longe)
            grafo.salaAtual = nomeEntrada;
            grafo.salaSaida = ultimoNomeCriado;
            
            // Configura visual da saída
            grafo.dadosDasSalas[ultimoNomeCriado].mapId = mapEntrada.id; 
            grafo.dadosDasSalas[ultimoNomeCriado].tipo = "Saída Final";
            grafo.dadosDasSalas[ultimoNomeCriado].temBau = false;

            console.log("🏁 MASMORRA PRIM GERADA. Saída: " + grafo.salaSaida);
        },

        // Auxiliar: Adiciona vizinhos potenciais na lista
        _adicionarArestasDoVizinho: function(x, y, w, h, lista, visitados) {
            const dirs = [
                { nome: "Norte", dx: 0, dy: -1 },
                { nome: "Sul",   dx: 0, dy: 1 },
                { nome: "Leste", dx: 1, dy: 0 },
                { nome: "Oeste", dx: -1, dy: 0 }
            ];

            const nomeOrigem = `${x}-${y}`;

            dirs.forEach(d => {
                let nx = x + d.dx;
                let ny = y + d.dy;
                let nomeDestino = `${nx}-${ny}`;

                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    if (!visitados.has(nomeDestino)) {
                        // O peso aleatório é o segredo do Prim para gerar labirintos variados
                        let pesoAleatorio = Math.floor(Math.random() * 100);
                        lista.push({
                            origem: nomeOrigem,
                            destino: nomeDestino,
                            direcao: d.nome,
                            peso: pesoAleatorio
                        });
                    }
                }
            });
        },

        // Auxiliar: Inicializa dados básicos
        _inicializarSala: function(nome, tipo, temBau) {
             DungeonSystem.instanciaAtual.dadosDasSalas[nome] = { 
                mapId: 0, 
                tipo: tipo, 
                temBau: temBau,
                perigo: 0 
            };
        }
    };

    // ============================================================
    // EXTRAS: ALGORITMO WELCH-POWELL (Integração)
    // ============================================================
    DungeonSystem.Extras = {
        
        rodarWelchPowell: function() {
            let grafo = DungeonSystem.instanciaAtual;
            
            // 1. Listar salas para colorir (Exceto Entrada)
            let salasParaColorir = Object.keys(grafo.dadosDasSalas).filter(s => {
                return grafo.dadosDasSalas[s].tipo !== "Especial";
            });
            let coresDisponiveis = DungeonSystem.Config.TiposDeSala; // ["Pedra", "Floresta", "Gelo", "Fogo"]

            console.log("--- 🎨 INICIANDO WELCH-POWELL ---");

            // 2. Calcular Grau
            let listaGraus = [];
            for (let sala of salasParaColorir) {
                let vizinhos = Object.keys(grafo.obterConexoesDetalhadas(sala));
                listaGraus.push({ id: sala, grau: vizinhos.length });
            }

            // 3. Ordenar por Grau (Decrescente)
            listaGraus.sort((a, b) => b.grau - a.grau);

            let coresAtribuidas = {}; 

            // 4. Atribuir Cores (Guloso)
            for (let obj of listaGraus) {
                let salaAtual = obj.id;
                let vizinhosReais = Object.values(grafo.obterConexoesDetalhadas(salaAtual));
                let coresProibidas = new Set();
                
                for (let vizinho of vizinhosReais) {
                    if (coresAtribuidas[vizinho]) {
                        coresProibidas.add(coresAtribuidas[vizinho]);
                    }
                    if (vizinho === "Entrada") {
                         coresProibidas.add("Floresta"); // Evita repetição na entrada
                    }
                }

                let corEscolhida = null;
                for (let cor of coresDisponiveis) {
                    if (!coresProibidas.has(cor)) {
                        corEscolhida = cor;
                        break;
                    }
                }
                if (!corEscolhida) corEscolhida = coresDisponiveis[0]; // Fallback

                coresAtribuidas[salaAtual] = corEscolhida;
            }

            // 5. Aplicar ao Grafo (Sortear MapID)
            for (let sala in coresAtribuidas) {
                let tipoSorteado = coresAtribuidas[sala];
                let chaveConfig = "Mapas" + tipoSorteado;
                let listaDeMapas = DungeonSystem.Config.MapasDisponiveis[chaveConfig];

                //Randomizar salas do mesmo tipo
                listaDeMapas = listaDeMapas.sort(() => Math.random() - 0.5);

                if (listaDeMapas && listaDeMapas.length > 0) {
                    let mapaFinal = listaDeMapas[Math.floor(Math.random() * listaDeMapas.length)];
                    
                    // Definir perigo por tema
                    let perigoBase = 1;
                    if(tipoSorteado === "Fogo") perigoBase = 8;
                    if(tipoSorteado === "Gelo") perigoBase = 5;
                    if(tipoSorteado === "Pedra") perigoBase = 3;
                    if(tipoSorteado === "Floresta") perigoBase = 2;

                    grafo.dadosDasSalas[sala].tipo = tipoSorteado;
                    grafo.dadosDasSalas[sala].mapId = mapaFinal.id;
                    grafo.dadosDasSalas[sala].perigo = perigoBase + Math.floor(Math.random() * 3);
                    
                    console.log(`🖌️ ${sala} -> ${tipoSorteado} (MapID: ${mapaFinal.id})`);
                } else {
                    console.error(`Erro: Config vazia para ${chaveConfig}`);
                    grafo.dadosDasSalas[sala].tipo = "Pedra"; // Fallback de emergência
                    grafo.dadosDasSalas[sala].mapId = 10;
                }
            }
            console.log("✅ Coloração Concluída!");
        }
    };

    // ============================================================
    // ENGINE (Sistema de Movimentação)
    // ============================================================
    DungeonSystem.Engine = {
        
        tentarMover: function(direcaoSaida) {
            let grafo = DungeonSystem.instanciaAtual;
            let salaAtual = grafo.salaAtual;
            let conexoes = grafo.obterConexoesDetalhadas(salaAtual);

            if (!conexoes[direcaoSaida]) {
                console.log(`❌ Bloqueado: Sem conexão para ${direcaoSaida}`);
                return;
            }

            let proximaSalaNome = conexoes[direcaoSaida];
            let proximaSalaDados = grafo.dadosDasSalas[proximaSalaNome];
            
            if (!proximaSalaDados) {
                console.error("Erro: Dados da sala sumiram!");
                return;
            }

            let mapIdDestino = proximaSalaDados.mapId;
            let configMap = null;
            let grupos = DungeonSystem.Config.MapasDisponiveis;

            // Busca o mapa em todos os grupos
            for (let chaveGrupo in grupos) {
                let encontrado = grupos[chaveGrupo].find(m => m.id === mapIdDestino);
                if (encontrado) {
                    configMap = encontrado;
                    break;
                }
            }
            
            if (!configMap) {
                console.error("ERRO CRÍTICO: Mapa ID " + mapIdDestino + " não está na Config!");
                return;
            }
            
            let dirEntrada = "";
            if (direcaoSaida === "Norte") dirEntrada = "Sul";
            if (direcaoSaida === "Sul") dirEntrada = "Norte";
            if (direcaoSaida === "Leste") dirEntrada = "Oeste";
            if (direcaoSaida === "Oeste") dirEntrada = "Leste";
            
            let coords = configMap.spawns[dirEntrada];
            if(!coords) {
                console.warn("Spawn não encontrado, usando padrão");
                coords = DungeonSystem.Config.DefaultFallback;
            }

            console.log(`Teleportando para ${proximaSalaNome} (Map ${mapIdDestino})`);
            
            grafo.salaAtual = proximaSalaNome;
            $gamePlayer.reserveTransfer(mapIdDestino, coords.x, coords.y, 0, 0);
        },

        configurarPortasVisualmente: function() {
            let grafo = DungeonSystem.instanciaAtual;
            if (!grafo.salaAtual || !grafo.dadosDasSalas[grafo.salaAtual]) return;

            let conexoes = grafo.obterConexoesDetalhadas(grafo.salaAtual);
            let dadosSala = grafo.dadosDasSalas[grafo.salaAtual];
            let s = DungeonSystem.Config.Switches;
            
            console.log("Atualizando Visual:", grafo.salaAtual);

            $gameSwitches.setValue(s.Norte, conexoes["Norte"]);
            $gameSwitches.setValue(s.Sul,   conexoes["Sul"]);
            $gameSwitches.setValue(s.Leste, conexoes["Leste"]);
            $gameSwitches.setValue(s.Oeste, conexoes["Oeste"]);

            if(dadosSala && dadosSala.temBau){
                $gameSwitches.setValue(s.TemBau, true);
            } else {
                $gameSwitches.setValue(s.TemBau, false);
            }
        }
    };

    // ============================================================
    // GERENCIADOR DE QUESTS
    // ============================================================
    DungeonSystem.QuestManager = {
        
    };
    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (DungeonSystem.Engine && DungeonSystem.Engine.configurarPortasVisualmente) {
            DungeonSystem.Engine.configurarPortasVisualmente();
        }
    };

})();