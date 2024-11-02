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
            type: 'bar', // ou 'line', dependendo do tipo de gráfico que deseja
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votos',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
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
