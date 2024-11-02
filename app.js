// Configuração do Supabase
const SUPABASE_URL = "https://rbeujdwjajzrlpnbrbaf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXVqZHdqYWp6cmxwbmJyYmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NDA3NzIsImV4cCI6MjA0NjExNjc3Mn0.QqQS6-QjP6QCsMuMeHOj28UbWu6We0vbzYr9g8AMrn8";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Buscar e atualizar os dados
async function buscarVotos() {
    const { data, error } = await supabase
        .from('votos')
        .select('*');
    
    if (error) {
        console.error("Erro ao buscar dados:", error);
        return;
    }
    
    // Atualizar gráfico com os dados recebidos
    atualizarGrafico(data);
}

// Configurar o gráfico com Chart.js
const ctx = document.getElementById('chartVotos').getContext('2d');
let chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Votos',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        }
    }
});

function atualizarGrafico(votosData) {
    const labels = votosData.map(entry => entry.candidato);
    const data = votosData.map(entry => entry.votos);
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Configurar o canal de atualizações em tempo real
supabase
  .from('votos')
  .on('UPDATE', payload => {
      console.log("Atualização recebida:", payload.new);
      buscarVotos(); // Recarrega os dados e atualiza o gráfico
  })
  .subscribe();

// Buscar os dados iniciais ao carregar a página
buscarVotos();
