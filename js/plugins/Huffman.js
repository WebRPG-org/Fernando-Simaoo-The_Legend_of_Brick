class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

class Huffman {
    
    constructor() {
        this.codes = {};
        this.tree = null;
    }

    buildFrequencyMap(text) {
        const freqMap = {};
        for (const char of text) {
            freqMap[char] = (freqMap[char] || 0) + 1;
        }
        return freqMap;
    }

    buildPriorityQueue(freqMap) {
        const priorityQueue = [];
        for (const char in freqMap) {
            priorityQueue.push(new HuffmanNode(char, freqMap[char]));
        }
        priorityQueue.sort((a, b) => a.freq - b.freq);
        return priorityQueue;
    }

    buildTree(priorityQueue) {
        while (priorityQueue.length > 1) {
            const left = priorityQueue.shift();
            const right = priorityQueue.shift();

            const combinedFreq = left.freq + right.freq;
            const parent = new HuffmanNode(null, combinedFreq, left, right);

            let i = 0;
            while (i < priorityQueue.length && priorityQueue[i].freq < combinedFreq) {
                i++;
            }
            priorityQueue.splice(i, 0, parent);
        }
        return priorityQueue[0];
    }

    buildCodes(node, prefix = "") {
        if (node.char !== null) {
            this.codes[node.char] = prefix || "0";
        } else {
            if(node.left) this.buildCodes(node.left, prefix + "0");
            if(node.right) this.buildCodes(node.right, prefix + "1");
        }
    }

    compress(text) {
        this.codes = {};
        this.tree = null;

        if (!text) return { compressedData: "", tree: null, originalSize: 0, compressedSize: 0 };

        const freqMap = this.buildFrequencyMap(text);
        const priorityQueue = this.buildPriorityQueue(freqMap);

        this.tree = this.buildTree([...priorityQueue]); 

        this.buildCodes(this.tree);

        let compressedData = "";
        for (const char of text) {
            compressedData += this.codes[char];
        }

        const originalSize = text.length * 8;
        const compressedSize = compressedData.length;

        return { compressedData, tree: this.tree, originalSize, compressedSize };
    }

    decompress(compressedData, tree) {
        if (!tree || !compressedData) return "";

        let decompressedText = "";
        let currentNode = tree;

        if (currentNode.left === null && currentNode.right === null) {
            return currentNode.char.repeat(compressedData.length);
        }

        for (const bit of compressedData) {
            if (bit === "0") {
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }

            if (currentNode.char !== null) {
                decompressedText += currentNode.char;
                currentNode = tree; 
            }
        }
        return decompressedText;
    }
}

function executarTesteHuffman(variableId) {
    const textoOriginal = "O PACTO COMPACTO E A COMPRESSAO DE HUFFMAN";
    const huffman = new Huffman();
    const resultadoCompressao = huffman.compress(textoOriginal);
    const dadosComprimidos = resultadoCompressao.compressedData;
    const arvore = resultadoCompressao.tree;
    const textoDescomprimido = huffman.decompress(dadosComprimidos, arvore);
    
    let mensagem = "";
    mensagem += "Original: " + textoOriginal + "\n";
    mensagem += "Tamanho Original: " + resultadoCompressao.originalSize + " bits (8 por char)\n";
    mensagem += "Tamanho Comprimido: " + resultadoCompressao.compressedSize + " bits\n";
    const reducao = ((1 - resultadoCompressao.compressedSize / resultadoCompressao.originalSize) * 100).toFixed(2);
    mensagem += "Redução: " + reducao + "%\n";
    mensagem += "--------------------------------------\n";
    mensagem += "Texto Descomprimido: " + textoDescomprimido + "\n";
    const integridade = (textoOriginal === textoDescomprimido);
    mensagem += "Integridade dos Dados: " + (integridade ? "VERIFICADA (OK!)" : "FALHOU!");
    
    $gameVariables.setValue(variableId, mensagem);
}