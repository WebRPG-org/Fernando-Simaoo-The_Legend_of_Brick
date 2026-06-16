/*:
 * @plugindesc Sistema de Quests de Construção usando Algoritmo de Kahn (Ordenação Topológica).
 * @author Fernando Simão
 *
 * @help
 * Use os seguintes comandos de script:
 * * 1. Inicializar e Registrar Quests:
 * QuestSystem.register('fundacao', []); // Sem requisitos
 * QuestSystem.register('paredes', ['fundacao']); // Requer fundacao
 * QuestSystem.register('telhado', ['paredes']); // Requer paredes
 * QuestSystem.init(); // Calcula Graus de Entrada iniciais
 * * 2. Verificar o que pode ser construído:
 * var disponiveis = QuestSystem.getAvailable();
 * * 3. Completar uma etapa:
 * QuestSystem.complete('fundacao');
 */

var QuestSystem = QuestSystem || {};

(function($) {
    "use strict";

    // --- CLASSE DO NÓ (QUEST) ---
    class QuestNode {
        constructor(id) {
            this.id = id;
            this.neighbors = []; // Para quem eu aponto (quem eu desbloqueio)
            this.inDegree = 0;   // Quantos requisitos eu tenho
            this.completed = false;
        }
    }

    // --- GERENCIADOR (ALGORITMO DE KAHN) ---
    class KahnManager {
        constructor() {
            this.nodes = {}; // Mapa de todos os nós
            this.availableQueue = []; // A "Fila" do Kahn (In-Degree 0)
        }

        // Adiciona um vértice ao grafo
        registerQuest(id, dependencies) {
            if (!this.nodes[id]) {
                this.nodes[id] = new QuestNode(id);
            }

            dependencies.forEach(depId => {
                if (!this.nodes[depId]) {
                    this.nodes[depId] = new QuestNode(depId);
                }
                // Adiciona aresta: Dependencia -> Atual
                this.nodes[depId].neighbors.push(this.nodes[id]);
            });
        }

        // Passo 1 do Kahn: Calcular graus de entrada iniciais
        initializeGraph() {
            // Resetar graus para recalculo (caso recarregue o jogo)
            for (let id in this.nodes) {
                this.nodes[id].inDegree = 0;
            }

            // Calcular In-Degree baseados nos vizinhos
            for (let id in this.nodes) {
                let node = this.nodes[id];
                node.neighbors.forEach(neighbor => {
                    neighbor.inDegree++;
                });
            }

            // Encher a fila inicial com quem tem grau 0
            this.updateAvailableQueue();
            console.log("Sistema de Construção Inicializado. Disponíveis:", this.availableQueue);
        }

        updateAvailableQueue() {
            this.availableQueue = [];
            for (let id in this.nodes) {
                let node = this.nodes[id];
                // Se inDegree é 0 E ainda não foi feito, está disponível
                if (node.inDegree === 0 && !node.completed) {
                    this.availableQueue.push(id);
                }
            }
        }

        // Ação do Jogador: Completar uma quest
        // Isso simula o passo de "retirar do grafo" no algoritmo de Kahn
        completeQuest(id) {
            let node = this.nodes[id];
            
            if (!node) return console.error("Quest não existe:", id);
            if (node.completed) return console.log("Quest já completada:", id);
            if (node.inDegree > 0) return console.log("Requisitos não atendidos para:", id);

            // Marca como completa (remove logicamente do grafo)
            node.completed = true;
            console.log("Construção Concluída:", id);

            // Reduz o grau de entrada dos vizinhos
            node.neighbors.forEach(neighbor => {
                neighbor.inDegree--;
                if (neighbor.inDegree === 0) {
                    console.log("Nova construção desbloqueada:", neighbor.id);
                }
            });

            // Atualiza a lista de disponíveis
            this.updateAvailableQueue();
        }

        getAvailable() {
            return this.availableQueue;
        }
        
        isCompleted(id) {
            return this.nodes[id] && this.nodes[id].completed;
        }
    }

    // Instância Global do Gerenciador
    $.Manager = new KahnManager();

    // --- MONITOR GLOBAL (Interface com RPG Maker) ---
    // Verifica periodicamente ou sob demanda
    $.Monitor = {
        // Exemplo: Verifica se o jogador tem itens para as quests disponíveis
        checkBuildConditions: function() {
            let available = $.Manager.getAvailable();
            let canBuild = [];

            available.forEach(questId => {
                // Lógica customizada: Mapear ID da quest para ID do item no Database
                // Exemplo: Quest 'fundacao' requer 10 Madeiras (Item ID 1)
                let requirements = this.getRequirements(questId);
                
                if ($gameParty.numItems($dataItems[requirements.itemId]) >= requirements.amount) {
                    canBuild.push(questId);
                }
            });
            
            return canBuild;
        },

        getRequirements: function(questId) {
            // Isso poderia vir de um JSON externo ou configuração
            const reqs = {
                'fundacao': { itemId: 8, amount: 1 },
                'estrutura': { itemId: 9, amount: 1 },
                'paredes':  { itemId: 10, amount: 1 },
                'eletrica': { itemId: 11, amount: 1},
                'telhado':  { itemId: 12, amount: 1},
                'mobilia': { itemId: 13, amount: 1}
            };
            return reqs[questId] || { itemId: 0, amount: 0 };
        }
    };

    // Exportar funções facilitadoras para usar no "Chamar Script"
    $.register = $.Manager.registerQuest.bind($.Manager);
    $.init = $.Manager.initializeGraph.bind($.Manager);
    $.complete = $.Manager.completeQuest.bind($.Manager);
    $.getAvailable = $.Manager.getAvailable.bind($.Manager);

})(QuestSystem);