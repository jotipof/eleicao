import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/dist/umd/supabase.js';

// Inicialização do Supabase
const SUPABASE_URL = "https://rbeujdwjajzrlpnbrbaf.supabase.co"; // substitua pelo valor correto
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXVqZHdqYWp6cmxwbmJyYmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NDA3NzIsImV4cCI6MjA0NjExNjc3Mn0.QqQS6-QjP6QCsMuMeHOj28UbWu6We0vbzYr9g8AMrn8"; // substitua pelo valor correto
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Renomeado para evitar conflito

// Função para atualizar o gráfico
function atualizarGrafico(votosData) {
    if (!votosData || votosData.length === 0) {
        console.log("Nenhum dado para exibir");
        return;
    }

    const labels = votosData.map(entry => entry.candidato);
    const data = votosData.map(entry => entry.votos);

    const ctx = document.getElementById('chartVotos').getContext('2d');

    // Criação ou atualização do gráfico
    if (window.chart) {
        window.chart.data.labels = labels;
        window.chart.data.datasets[0].data = data;
        window.chart.update(); // Atualiza o gráfico existente
    } else {
        window.chart = new Chart(ctx, {
            type: 'pie', // Alterado para 'pie' para gráfico circular
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votos',
                    data: data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        // Adicione mais cores conforme necessário
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        // Adicione mais cores conforme necessário
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw + ' votos';
                            }
                        }
                    }
                }
            }
        });
    }
}

function calcularMandatos(votosData, totalMandatos) {
    const quocientes = [];
    
    // Cria uma lista de quocientes para cada candidato
    votosData.forEach(entry => {
        for (let i = 1; i <= totalMandatos; i++) {
            quocientes.push({ candidato: entry.candidato, quociente: entry.votos / i });
        }
    });

    // Ordena os quocientes em ordem decrescente
    quocientes.sort((a, b) => b.quociente - a.quociente);

    // Seleciona os mandatos
    const mandatos = {};
    for (let i = 0; i < totalMandatos; i++) {
        const candidato = quocientes[i].candidato;
        if (!mandatos[candidato]) {
            mandatos[candidato] = 0;
        }
        mandatos[candidato]++;
    }

    return mandatos;
}

function preencherMandatos(mandatos) {
    const container = document.getElementById('mandatosContainer');
    container.innerHTML = ''; // Limpa o conteúdo anterior

    // Itera sobre os mandatos e cria elementos para cada um
    for (const candidato in mandatos) {
        const quantidade = mandatos[candidato];

        for (let i = 0; i < quantidade; i++) {
            const mandatoDiv = document.createElement('div');
            mandatoDiv.className = 'mandato';
            mandatoDiv.style.backgroundColor = candidato === 'Candidato A' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'; // Altere as cores conforme necessário
            container.appendChild(mandatoDiv);
        }
    }
}

// Função para buscar os dados inicialmente
async function buscarVotos() {
    console.log("Buscando dados da tabela 'votos'");
    const { data, error } = await supabaseClient
        .from('votos')
        .select('*');

    if (error) {
        console.error("Erro ao buscar dados:", error);
        return;
    }

    console.log("Dados recebidos do Supabase:", data);
    atualizarGrafico(data);

    // Calcular mandatos
    const totalMandatos = 10; // Substitua pelo número total de mandatos
    const mandatos = calcularMandatos(data, totalMandatos);

    // Preencher os mandatos no HTML
    preencherMandatos(mandatos);
}

// Assinatura para escutar mudanças na tabela
const votosSubscription = supabaseClient
    .from('votos')
    .on('*', payload => {
        console.log('Alteração detectada:', payload);
        buscarVotos(); // Rebusca os dados após qualquer alteração
    })
    .subscribe();

// Aguardando o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    buscarVotos(); // Chama a função para buscar os dados inicialmente
});
