# 🏰 Algorithmic Dungeon: Applied Data Structures

![Linguagem](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Engine](https://img.shields.io/badge/RPG_Maker_MV-Engine-red)
![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)

> Uma simulação gamificada de algoritmos avançados de Grafos, Busca e Compressão, desenvolvida como projeto de Estruturas de Dados II (Sistemas de Informação - UFU).

## 🚀 Visão Geral
Em vez de implementar algoritmos de estrutura de dados em interfaces web isoladas para testes acadêmicos, este projeto integra a teoria da computação diretamente na mecânica de um RPG. 

Escrito em JavaScript e executado na engine do RPG Maker MV, o jogo utiliza grafos não-direcionados, grafos direcionados acíclicos (DAG) e árvores binárias para governar desde a geração procedural do mundo até a resolução de missões.

## 🧠 Arquitetura e Algoritmos Implementados

### 1. Geração Procedural com Algoritmo de Prim (MST)
A masmorra do jogo não é pré-renderizada. O mapa é modelado como um grafo de conexões de salas. O **Algoritmo de Prim** foi implementado para processar uma *Minimum Spanning Tree* (Árvore Geradora Mínima), quebrando "paredes" virtuais de forma a criar um labirinto conexo perfeito, garantindo que todas as salas geradas sejam acessíveis a partir da entrada, sem ciclos isolados.

### 2. Coloração de Grafos com Welch-Powell
Para a distribuição visual e temática do labirinto (Biomas de Pedra, Floresta, Gelo e Fogo), foi aplicado o algoritmo de coloração **Welch-Powell**. O script mapeia as adjacências de cada sala, calcula o grau de conexão, ordena os vértices decrescentemente e atribui o bioma (cor) de forma gulosa, evitando que salas de temas idênticos fiquem lado a lado na dungeon.

### 3. Ordenação Topológica via Algoritmo de Kahn
O sistema de missões e construções (ex: *Fundação* -> *Paredes* -> *Telhado*) foi modelado matematicamente usando Grafos Direcionados Acíclicos. A liberação de cada etapa é controlada pelo **Algoritmo de Kahn**, que rastreia dinamicamente o *In-Degree* (grau de entrada) dos nós, liberando novas opções de construção para o jogador apenas quando seus pré-requisitos atingem valor zero.

### 4. Compressão Lossless com Árvore de Huffman
Implementação completa da **Codificação de Huffman** como uma mecânica de "compactação de pergaminhos mágicos". O script analisa strings brutas, constrói o mapa de frequência, gera uma fila de prioridade e compila a árvore binária. É possível visualizar em tempo real o cálculo do ganho em *bits* (compressão e taxa de redução) e validar a integridade da descompressão.

### 5. String Matching e Benchmark de Busca
*   **Rabin-Karp:** Utilizado para *pattern matching* (com janela de *hash* móvel) em textos extensos dentro do jogo, encontrando itens escondidos na lore evitando falsos positivos via dupla verificação.
*   **Busca Binária vs Sequencial:** Implementação de um módulo de *benchmark* empírico atrelado à variável `performance.now()` do motor Chromium, comparando a eficiência temporal entre varreduras lineares e buscas binárias em arrays de 100.000 índices.

## 🛠 Integrações e Dependências
Para a interface de recompensa procedural das salas geradas com o Algoritmo de Prim, o sistema foi integrado ao plugin gerenciador de instâncias de itens *PH - Warehouse* de PrimeHover.

## ⚙️ Como Executar Localmente
1. Clone este repositório.
2. Certifique-se de que o arquivo principal de configuração `.rmproject` esteja na raiz do repositório (junto das pastas estruturais `js/`, `data/` e `img/`).
3. Abra o arquivo pelo RPG Maker MV ou execute diretamente a *build* pelo arquivo binário correspondente do NW.js.