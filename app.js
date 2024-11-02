// Inicialização do Supabase
const SUPABASE_URL = "https://rbeujdwjajzrlpnbrbaf.supabase.co"; // substitua pelo valor correto
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXVqZHdqYWp6cmxwbmJyYmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NDA3NzIsImV4cCI6MjA0NjExNjc3Mn0.QqQS6-QjP6QCsMuMeHOj28UbWu6We0vbzYr9g8AMrn8"; // substitua pelo valor correto
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Inicialize o cliente Supabase

// Função para atualizar o gráfico de votos
function atualizarGraficoVotos(votosData) {
    if (!votosData || votosData.length === 0) {
        console.log("Nenhum dado para exibir");
        return;
    }

    const labels = votosData.map(entry => entry.candidato);
    const data = votosData.map(entry => entry.votos);

    const ctx = document.getElementById('chartVotos').getContext('2d');

    // Criação ou atualização do gráfico de votos
    if (window.chartVotos) {
        window.chartVotos.data.labels = labels;
        window.chartVotos.data.datasets[0].data = data;
        window.chartVotos.update(); // Atualiza o gráfico existente
    } else {
        window.chartVotos = new Chart(ctx, {
            type: 'pie', // Gráfico circular
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

// Função para atualizar o gráfico de mandatos (semicircular)
function atualizarGraficoMandatos(mandatos) {
    const labels = Object.keys(mandatos);
    const data = Object.values(mandatos);

    const ctx = document.getElementById('chartMandatos').getContext('2d');

    // Criação ou atualização do gráfico de mandatos
    if (window.chartMandatos) {
        window.chartMandatos.data.labels = labels;
        window.chartMandatos.data.datasets[0].data = data;
        window.chartMandatos.update(); // Atualiza o gráfico existente
    } else {
        window.chartMandatos = new Chart(ctx, {
            type: 'doughnut', // Gráfico de rosca
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mandatos',
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
                cutout: '50%', // Corte para criar um semicirculo
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw + ' mandatos';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Função para obter os dados do Supabase
async function getVotosData() {
    const { data, error } = await supabaseClient
        .from('votos')
        .select('candidato, votos');

    if (error) {
        console.error(error);
        return;
    }

    atualizarGraficoVotos(data);
}

async function getMandatosData() {
    const { data, error } = await supabaseClient
        .from('mandatos')
        .select('partido, mandatos');

    if (error) {
        console.error(error);
        return;
    }

    const mandatos = data.reduce((acc, current) => {
        acc[current.partido] = current.mandatos;
        return acc;
    }, {});

    atualizarGraficoMandatos(mandatos);
}

// Chamada inicial para obter os dados
getVotosData();
getMandatosData();