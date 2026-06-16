//const { performance } = require('perf_hooks');

var texto1 = "lksjdfklsajfklasnvjinseaijfnjkawndfjsddbfjasdkjfnskdjfnsajdnfaknfkdnfkwnfkjsdnkfnsdkflkjlasjdflsdlkfsafasfa" +
             "lksfjas assdjflasjf   Sua sorte é:  slkdfjs   jsldfjlsf  sdnfl jsi  laldsjf o  ldfj   lsjfklasjflkasj osjdfiuwaheufih  asknlkzsdnfiah  jjsnfkf" +
             "jlsdkfj lsddjf alskdf    assdf ç jlskjflsdjdf  jeoroawe  sslkdf çaskldf çls vlckmvlçawejfçlakdsjfçlak je f   llskdjf aweçlf s    " +
             "lsjdflkasdf    laskdfls  ajsdlfjslkdjf   adlkfj   sldfj   slkdfj   slkdfj lkjoiriossofnsklfniawheflksdfkljfsdff8979f8232899i";

          
var texto2 = "wertyujknbcxsertyhnvcdrtyhjn cdrtyhn cftyujnbvftyMá sortejnbvftyujnvftyujnbvftujbft6ujnbftyujnvftyujnbt67ikmnbvftyujnbvftyujnbvftyujnbvftyu" +
             "dfghjklpoiuytrewqazxcvbnmwertyujknbcxsertyhnvcdrtyhn cdrtyhn cftyujnbvftyujnbvftyujnvftyujnbvftujbft6ujnbftyujnvftyujnbt67ikmnbvftyujnbvftyujnbvftyujnbvftyu" +
             "mnbvcxzlkjhgfdsapoiuytrewqwertyujknbcxsertyhnvcdrtyhn cdrtyhn cftyujnbvftyujnbvftyujnvftyujnbvftujbft6ujnbftyujnvftyujnbt67ikmnbvftyujnbvftyujnbvftyujnbvftyu" +
             "zxcvbnmasdfghjklpoiuytrewqazxcvbnmwertyujknbcxsertyhnv";

var texto3 = "asdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnm" +
              "qwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjkl" +
              "zxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzx" +
              "poiuytrewqasdfghjklqwertyuiopzxcvbnmasdfg Vá para a floresta hjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnm";


var padrao1 = "Sua sorte é";
var padrao2 = "Má sorte";
var padrao3 = "Vá para a floresta";



function rodarBuscaSequencial() {

  let listaDePergaminhos = [];

  for(let i = 0; i < 99999; i++) {
    listaDePergaminhos.push(Math.floor(Math.random() * 100000) + 1);
  }

  let idParaAchar = $gameVariables.value(4);

  let comparacoes = 0;
  let achou = false;
  let indiceEncontrado = -1;
  let startTime = performance.now();

  for(let i = 0; i < listaDePergaminhos.length; i++) {
    comparacoes++;
    if(listaDePergaminhos[i] === idParaAchar) {
      achou = true;
      indiceEncontrado = i;
      break;
    }
  }
  let endTime = performance.now();
  let tempoTotal = endTime - startTime;

  $gameVariables.setValue(1, comparacoes);
  $gameVariables.setValue(2, tempoTotal.toFixed(4));
  $gameVariables.setValue(3, indiceEncontrado);

  //console.log('Busca Sequencial: Comparações = ' + comparacoes + ', Tempo = ' + tempoTotal.toFixed(4) + ' ms, Índice Encontrado = ' + indiceEncontrado);
}

function rodarBuscaBinaria() {





  function buscaBinariaHelper(lista, id){
    let comparacoes = 0;
    let achou = false;
    let indiceEncontrado = -1;
    let inicio = 0;
    let fim = lista.length - 1;

    while (inicio <= fim) {
      comparacoes++;
      let meio = Math.floor((inicio + fim) / 2);
      if (lista[meio] === id) {
        achou = true;
        indiceEncontrado = meio;
        break;
      } else if (lista[meio] < id) {
        inicio = meio + 1;
      } else {
        fim = meio - 1;
      }
    }

    return {
      encontrado: achou,
      indice: indiceEncontrado,
      comparacoes: comparacoes
    };
  }

  let listaOrdenada1 = [];
  let listaOrdenada2 = [];
  let listaOrdenada3 = [];

  for(let i = 0; i < 99999; i++) {
    listaOrdenada1.push(i + 1);
    listaOrdenada2.push(i + 1);
    listaOrdenada3.push(i + 1);
  }

  let idParaAchar1 = $gameVariables.value(4);
  let idParaAchar2 = $gameVariables.value(5);
  let idParaAchar3 = $gameVariables.value(6);

  let totalComparacoes = 0;
  let totalEncontrados = 0;

  let startTime = performance.now();

  let resultado1 = buscaBinariaHelper(listaOrdenada1, idParaAchar1);
  let resultado2 = buscaBinariaHelper(listaOrdenada2, idParaAchar2);
  let resultado3 = buscaBinariaHelper(listaOrdenada3, idParaAchar3);

  let endTime = performance.now();
  let tempoTotal = endTime - startTime;

  totalComparacoes = resultado1.comparacoes + resultado2.comparacoes + resultado3.comparacoes;
  if(resultado1.encontrado) totalEncontrados++;
  if(resultado2.encontrado) totalEncontrados++;
  if(resultado3.encontrado) totalEncontrados++;


  $gameVariables.setValue(1, totalComparacoes);
  $gameVariables.setValue(2, tempoTotal.toFixed(4));
  $gameVariables.setValue(3, totalEncontrados);

  //console.log('Busca Binária: Comparações = ' + comparacoes + ', Tempo = ' + tempoTotal.toFixed(4) + ' ms, Índice Encontrado = ' + indiceEncontrado);
}
  
/*
rodarBuscaSequencial();
rodarBuscaBinaria();
*/

function rabinKarpSearch(padrao, texto, q) {
    const D = 256;
    const M = padrao.length;
    const N = texto.length;
    let i, j;
    let hash_padrao = 0;
    let hash_texto = 0;
    let h = 1;

    let indicesEncontrados = [];

    for (i = 0; i < M - 1; i++) {
        h = (h * D) % q;
    }

    for (i = 0; i < M; i++) {
        hash_padrao = (D * hash_padrao + padrao.charCodeAt(i)) % q;
        hash_texto = (D * hash_texto + texto.charCodeAt(i)) % q;
    }

    console.log("Iniciando a busca...");
    console.log(`Hash do Padrão ('${padrao}'): ${hash_padrao}`);
    console.log(`Hash da 1ª Janela ('${texto.substring(0, M)}'): ${hash_texto}`);
    console.log("----------------------------------------");

    for (i = 0; i <= N - M; i++) {
        
        if (hash_padrao === hash_texto) {
            console.log(`>>> Possível correspondência no índice ${i} (Hashes: ${hash_padrao})`);

            for (j = 0; j < M; j++) {
                if (texto[i + j] !== padrao[j]) {
                    console.log("    -> Falso positivo (colisão).");
                    break;
                }
            }
            
            if (j === M) {
                console.log(`    *** Padrão encontrado no índice ${i} ***`);
                indicesEncontrados.push(i);
            }
        }

        if (i < N - M) {
            hash_texto = (D * (hash_texto - texto.charCodeAt(i) * h) + texto.charCodeAt(i + M)) % q;

            if (hash_texto < 0) {
                hash_texto = (hash_texto + q);
            }
        }
    }
    console.log("----------------------------------------");
    console.log("Busca concluída.");
    return indicesEncontrados;
}

function executarRabinKarp() {
    const q = 101;


    $gameVariables.setValue(1, padrao1);
    $gameVariables.setValue(2, padrao2);
    $gameVariables.setValue(3, padrao3);

    console.log("=== Busca no Texto 1 ===");
    let indices1 = rabinKarpSearch(padrao1, texto1, q);
    console.log("\n=== Busca no Texto 2 ===");
    let indices2 = rabinKarpSearch(padrao2, texto2, q);
    console.log("\n=== Busca no Texto 3 ===");
    let indices3 = rabinKarpSearch(padrao3, texto3, q);

    $gameVariables.setValue(4, indices1.length > 0 ? indices1[0] : -1);
    $gameVariables.setValue(5, indices2.length > 0 ? indices2[0] : -1);
    $gameVariables.setValue(6, indices3.length > 0 ? indices3[0] : -1);
}

//executarRabinKarp();