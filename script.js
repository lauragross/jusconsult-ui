const API_BASE = 'http://localhost:5000';
let currentPage = 0;
let pageSize = 20;
let currentSearchParams = {};
let updatesChart = null;
let currentUpdatesData = null;

// Event listeners
document.getElementById('searchForm').addEventListener('submit', handleSearch);
document.getElementById('updatesFilterForm').addEventListener('submit', handleUpdatesFilter);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadTribunais();
    loadCategorias();
    setupDragAndDrop();
});

async function loadTribunais() {
    try {
        const response = await fetch(`${API_BASE}/tribunais`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (response.ok) {
            const tribunais = await response.json();
            const select = document.getElementById('tribunal');
            const updatesSelect = document.getElementById('updatesTribunal');
            
            // LIMPAR opções antigas (exceto a primeira "Todos os tribunais")
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            while (updatesSelect.children.length > 1) {
                updatesSelect.removeChild(updatesSelect.lastChild);
            }
            
            // Adicionar novos tribunais
            tribunais.forEach(tribunal => {
                const option = document.createElement('option');
                option.value = tribunal;
                option.textContent = tribunal;
                select.appendChild(option);
                
                const updatesOption = document.createElement('option');
                updatesOption.value = tribunal;
                updatesOption.textContent = tribunal;
                updatesSelect.appendChild(updatesOption);
            });
            
            console.log('✅ Tribunais carregados:', tribunais);
        }
    } catch (error) {
        console.error('Erro ao carregar tribunais:', error);
    }
}

async function loadCategorias() {
    try {
        const response = await fetch(`${API_BASE}/categorias`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (response.ok) {
            const categorias = await response.json();
            const select = document.getElementById('categoria');
            const updatesSelect = document.getElementById('updatesCategoria');
            
            // LIMPAR opções antigas (exceto a primeira "Todas as categorias")
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            while (updatesSelect.children.length > 1) {
                updatesSelect.removeChild(updatesSelect.lastChild);
            }
            
            // Adicionar novas categorias
            categorias.forEach((categoria, index) => {
                console.log(`🔍 Adicionando categoria ${index + 1}: "${categoria}"`);
                
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                select.appendChild(option);
                
                const updatesOption = document.createElement('option');
                updatesOption.value = categoria;
                updatesOption.textContent = categoria;
                updatesSelect.appendChild(updatesOption);
            });
            
            console.log('✅ Categorias carregadas:', categorias);
            console.log('✅ Total de categorias:', categorias.length);
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function showMainMenu() {
    document.getElementById('menuContainer').style.display = 'block';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('updatesContainer').style.display = 'none';
    document.getElementById('updateContainer').style.display = 'none';
    document.getElementById('renewContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('processDetail').style.display = 'none';
}

function showSearchPage() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'block';
    document.getElementById('updatesContainer').style.display = 'none';
    document.getElementById('updateContainer').style.display = 'none';
    document.getElementById('renewContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('processDetail').style.display = 'none';
}

async function showUpdatesPage() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('updatesContainer').style.display = 'block';
    document.getElementById('updateContainer').style.display = 'none';
    document.getElementById('renewContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('processDetail').style.display = 'none';
    
    // Verificar se o servidor está funcionando primeiro
    await checkServerHealth();
}

function showUpdateDatabasePage() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('updatesContainer').style.display = 'none';
    document.getElementById('updateContainer').style.display = 'block';
    document.getElementById('renewContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('processDetail').style.display = 'none';
    
    // Reset da página
    resetUpdate();
}

function showRenewPage() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('updatesContainer').style.display = 'none';
    document.getElementById('updateContainer').style.display = 'none';
    document.getElementById('renewContainer').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('processDetail').style.display = 'none';
    
    // Debug: verificar se os elementos existem
    console.log('Elementos da página de renovação:');
    console.log('confirmationArea:', document.getElementById('confirmationArea'));
    console.log('fileInfo:', document.getElementById('fileInfo'));
}

async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            console.log('Servidor está funcionando');
            loadUpdates();
        } else {
            throw new Error(`Servidor retornou status ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao verificar saúde do servidor:', error);
        const content = document.getElementById('updatesContent');
        content.innerHTML = `
            <div class="error">
                <h4>Servidor não está respondendo</h4>
                <p><strong>Erro:</strong> ${error.message}</p>
                <p><strong>Para corrigir:</strong></p>
                <ol>
                    <li>Abra um terminal/prompt de comando</li>
                    <li>Navegue até a pasta do projeto: <code>cd datajud-api</code></li>
                    <li>Execute o servidor: <code>python app.py</code></li>
                    <li>Recarregue esta página</li>
                </ol>
                <p>O servidor deve estar rodando em: <code>http://localhost:5000</code></p>
            </div>
        `;
    }
}

async function loadUpdates(filters = {}) {
    const updatesContainer = document.getElementById('updatesContainer');
    const loading = document.getElementById('updatesLoading');
    const content = document.getElementById('updatesContent');

    loading.style.display = 'block';
    content.innerHTML = '';

    try {
        // Construir query string com filtros
        const params = new URLSearchParams();
        if (filters.tribunal) params.append('tribunal', filters.tribunal);
        if (filters.categoria) params.append('categoria', filters.categoria);
        
        const queryString = params.toString();
        const url = `${API_BASE}/atualizacoes-dataframe${queryString ? '?' + queryString : ''}`;
        
        console.log('Fazendo requisição para:', url);
        const response = await fetch(url);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ${response.status}: ${response.statusText}. Detalhes: ${errorText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        loading.style.display = 'none';
        currentUpdatesData = data;
        displayUpdates(data);
        createUpdatesChart(data);
    } catch (error) {
        console.error('Erro completo:', error);
        loading.style.display = 'none';
        content.innerHTML = `
            <div class="error">
                <h4>Erro ao carregar atualizações</h4>
                <p><strong>Mensagem:</strong> ${error.message}</p>
                <p><strong>Possíveis causas:</strong></p>
                <ul>
                    <li>O servidor backend não está rodando (execute: cd datajud-api && python app.py)</li>
                    <li>Problema de conexão com o banco de dados</li>
                    <li>Erro interno no servidor</li>
                </ul>
                <p><strong>Verifique o console do navegador para mais detalhes.</strong></p>
            </div>
        `;
    }
}

async function handleUpdatesFilter(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const filters = {
        tribunal: formData.get('tribunal'),
        categoria: formData.get('categoria')
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });

    await loadUpdates(filters);
}

function displayUpdates(data) {
    const content = document.getElementById('updatesContent');
    
    // Calcular total de processos
    const totalProcessos = Object.values(data).reduce((total, processos) => total + (processos ? processos.length : 0), 0);
    
    // Mostrar apenas um resumo simples
    let html = `
        <div class="updates-section">
            <h3>📊 Resumo Geral</h3>
            <div class="empty-state">
                <p><strong>Total de processos:</strong> ${totalProcessos}</p>
                <p>Clique nas barras do gráfico acima para ver os processos de cada período.</p>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

function createUpdatesChart(data) {
    const ctx = document.getElementById('updatesChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (updatesChart) {
        updatesChart.destroy();
    }

    // Preparar dados para o gráfico
    const categorias = {
        'ultimas_24h': 'Últimas 24h',
        'ultimos_7_dias': 'Últimos 7 dias',
        'ultimo_mes': 'Último mês',
        'ultimo_ano': 'Último ano',
        'mais_de_um_ano': 'Mais de 1 ano'
    };

    const labels = [];
    const values = [];
    const colors = [
        '#667eea', // Azul
        '#764ba2', // Roxo
        '#f093fb', // Rosa
        '#f5576c', // Vermelho
        '#4facfe'  // Azul claro
    ];

    Object.keys(categorias).forEach((key, index) => {
        labels.push(categorias[key]);
        values.push(data[key] ? data[key].length : 0);
    });

    // Criar o gráfico
    updatesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade de Processos',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color + '80'),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} processo${context.parsed.y !== 1 ? 's' : ''}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const categoryKey = Object.keys(categorias)[index];
                    showProcessesForCategory(categoryKey, categorias[categoryKey], data[categoryKey] || []);
                }
            },
            onHover: (event, elements) => {
                event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
        }
    });

    // Criar legenda personalizada
    createChartLegend(labels, colors);
}

function createChartLegend(labels, colors) {
    const legendContainer = document.getElementById('chartLegend');
    legendContainer.innerHTML = '';

    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${colors[index]}"></div>
            <span>${label}</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

function showProcessesForCategory(categoryKey, categoryName, processes) {
    const modal = document.getElementById('processesModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.textContent = `Processos - ${categoryName} (${processes.length} processo${processes.length !== 1 ? 's' : ''})`;

    if (processes.length === 0) {
        modalContent.innerHTML = '<div class="empty-state">Nenhum processo encontrado neste período.</div>';
    } else {
        let tableHTML = `
            <table class="processes-table">
                <thead>
                    <tr>
                        <th>Número do Processo</th>
                        <th>Tribunal</th>
                        <th>Categoria</th>
                        <th>Sistema</th>
                        <th>Última Atualização</th>
                        <th>Último Movimento</th>
                    </tr>
                </thead>
                <tbody>
        `;

        processes.forEach(processo => {
            tableHTML += `
                <tr>
                    <td>
                        <a href="#" class="process-link" onclick="showProcessDetail('${processo.numeroProcesso}'); closeProcessesModal();">
                            ${processo.numeroProcesso || 'N/A'}
                        </a>
                    </td>
                    <td>${processo.tribunal || 'N/A'}</td>
                    <td>${processo.categoria || 'N/A'}</td>
                    <td>${processo.sistema_nome || 'N/A'}</td>
                    <td>${formatDate(processo.dataHoraUltimaAtualizacao)}</td>
                    <td>${processo.ultimoMovimento || 'N/A'}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        modalContent.innerHTML = tableHTML;
    }

    modal.style.display = 'block';
}

function closeProcessesModal() {
    document.getElementById('processesModal').style.display = 'none';
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('processesModal');
    if (event.target === modal) {
        closeProcessesModal();
    }
}

async function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = {
        numero: formData.get('numero'),
        tribunal: formData.get('tribunal'),
        categoria: formData.get('categoria'),
        limit: pageSize,
        offset: 0
    };

    // Remove empty parameters
    Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
    });

    currentSearchParams = params;
    currentPage = 0;
    
    await searchProcesses(params);
}

async function searchProcesses(params) {
    const resultsContainer = document.getElementById('resultsContainer');
    const loading = document.getElementById('loading');
    const resultsContent = document.getElementById('resultsContent');

    resultsContainer.style.display = 'block';
    loading.style.display = 'block';
    resultsContent.innerHTML = '';

    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/processos?${queryString}`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        loading.style.display = 'none';
        displayResults(data);
    } catch (error) {
        loading.style.display = 'none';
        resultsContent.innerHTML = `<div class="error">Erro ao buscar processos: ${error.message}</div>`;
    }
}

function displayResults(data) {
    const resultsCount = document.getElementById('resultsCount');
    const resultsContent = document.getElementById('resultsContent');

    resultsCount.textContent = `${data.pagination.total} processo(s) encontrado(s)`;

    if (data.data.length === 0) {
        resultsContent.innerHTML = '<div class="error">Nenhum processo encontrado com os filtros aplicados.</div>';
        return;
    }

    let tableHTML = `
        <table class="processes-table">
            <thead>
                <tr>
                    <th>Número do Processo</th>
                    <th>Tribunal</th>
                    <th>Categoria</th>
                    <th>Sistema</th>
                    <th>Última Atualização</th>
                    <th>Último Movimento</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.data.forEach(processo => {
        tableHTML += `
            <tr>
                <td>
                    <a href="#" class="process-link" onclick="showProcessDetail('${processo.numeroProcesso}')">
                        ${processo.numeroProcesso || 'N/A'}
                    </a>
                </td>
                <td>${processo.tribunal || 'N/A'}</td>
                <td>${processo.categoria || 'N/A'}</td>
                <td>${processo.sistema_nome || 'N/A'}</td>
                <td>${formatDate(processo.dataHoraUltimaAtualizacao)}</td>
                <td>${processo.ultimoMovimento || 'N/A'}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    
    if (data.pagination.total > pageSize) {
        tableHTML += generatePagination(data.pagination);
    }

    resultsContent.innerHTML = tableHTML;
}

function generatePagination(pagination) {
    const totalPages = Math.ceil(pagination.total / pageSize);
    const currentPageNum = Math.floor(pagination.offset / pageSize) + 1;

    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>
            Anterior
        </button>
    `;

    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" ${i === currentPage ? 'disabled' : ''}>
                ${i + 1}
            </button>
        `;
    }

    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>
            Próxima
        </button>
    `;

    paginationHTML += '</div>';
    return paginationHTML;
}

async function changePage(page) {
    if (page < 0) return;
    
    currentPage = page;
    const params = {
        ...currentSearchParams,
        offset: page * pageSize
    };
    
    await searchProcesses(params);
}

async function showProcessDetail(numero) {
    const detailContainer = document.getElementById('processDetail');
    const detailContent = document.getElementById('detailContent');
    const detailTitle = document.getElementById('detailTitle');

    detailTitle.textContent = `Processo: ${numero}`;
    detailContent.innerHTML = '<div class="loading">Carregando detalhes...</div>';
    detailContainer.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}/processo/${numero}`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        displayProcessDetail(data);
    } catch (error) {
        detailContent.innerHTML = `<div class="error">Erro ao carregar detalhes: ${error.message}</div>`;
    }
}

function displayProcessDetail(data) {
    const detailContent = document.getElementById('detailContent');
    
    let html = '';

    // Processo principal
    if (data.processo) {
        html += `
            <div class="detail-section">
                <h3>Informações do Processo</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Número do Processo</div>
                        <div class="detail-value">${data.processo.numeroProcesso || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Tribunal</div>
                        <div class="detail-value">${data.processo.tribunal || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Grau</div>
                        <div class="detail-value">${data.processo.grau || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Classe Judicial</div>
                        <div class="detail-value">${data.processo.classeJudicial || data.processo.classe || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Assunto</div>
                        <div class="detail-value">${data.processo.assunto || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Data Última Atualização</div>
                        <div class="detail-value">${formatDate(data.processo.dataHoraUltimaAtualizacao)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Movimentações (últimas 100)
    if (data.movimentos && data.movimentos.length > 0) {
        const totalMovimentos = data.total_movimentos || data.movimentos.length;
        const showingCount = data.movimentos.length;
        
        html += `
            <div class="detail-section">
                <h3>Movimentações ${showingCount < totalMovimentos ? `(Últimas ${showingCount} de ${totalMovimentos})` : `(${totalMovimentos})`}</h3>
                <table class="movements-table">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Órgão</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.movimentos.forEach(movimento => {
            html += `
                <tr>
                    <td>${formatDate(movimento.mov_dataHora || movimento.dataHora)}</td>
                    <td>${movimento.mov_codigo || 'N/A'}</td>
                    <td>${movimento.mov_nome || 'N/A'}</td>
                    <td>${movimento.mov_orgao_nome || 'N/A'}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
    }


    detailContent.innerHTML = html;
}

function hideDetail() {
    document.getElementById('processDetail').style.display = 'none';
}

function clearSearch() {
    document.getElementById('searchForm').reset();
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('processDetail').style.display = 'none';
    currentSearchParams = {};
    currentPage = 0;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    } catch (e) {
        return dateString;
    }
}

// Funções para a página de renovação

function downloadTemplate() {
    // Criar um link para download do arquivo processos.xlsx
    const link = document.createElement('a');
    link.href = `${API_BASE}/template-excel`;
    link.download = 'processos.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

let uploadedFile = null;

function setupDragAndDrop() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('excelFile');

    // Prevenir comportamento padrão do drag
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Destacar área de drop
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, unhighlight, false);
    });

    // Lidar com o drop
    fileUploadArea.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        fileUploadArea.classList.add('dragover');
    }

    function unhighlight(e) {
        fileUploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            // Simular o evento de mudança do input
            const event = {
                target: {
                    files: [file]
                }
            };
            handleFileUpload(event);
        }
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
        alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
        return;
    }

    console.log('Arquivo selecionado:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    const loading = document.getElementById('renewLoading');
    const content = document.getElementById('renewContent');
    const confirmationArea = document.getElementById('confirmationArea');

    loading.style.display = 'block';
    content.innerHTML = '';
    confirmationArea.classList.remove('show');

    try {
        console.log('Fazendo upload para:', `${API_BASE}/upload-processos`);
        const response = await fetch(`${API_BASE}/upload-processos`, {
            method: 'POST',
            body: formData
        });

        console.log('Resposta recebida:', response.status);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Resultado:', result);
        
        loading.style.display = 'none';
        
        // Armazenar informações do arquivo
        uploadedFile = {
            name: file.name,
            size: file.size,
            total: result.total || 0
        };

        // Mostrar área de confirmação
        const fileInfoElement = document.getElementById('fileInfo');
        if (fileInfoElement) {
            fileInfoElement.textContent = `Arquivo: ${file.name} (${result.total || 0} registros)`;
        }
        
        console.log('Mostrando área de confirmação');
        confirmationArea.classList.add('show');
        
    } catch (error) {
        console.error('Erro no upload:', error);
        loading.style.display = 'none';
        content.innerHTML = `
            <div class="error">
                <h4>Erro ao fazer upload do arquivo</h4>
                <p><strong>Mensagem:</strong> ${error.message}</p>
            </div>
        `;
    }
}

async function confirmReplace() {
    console.log('Confirmando substituição...');
    
    const loading = document.getElementById('renewLoading');
    const confirmationArea = document.getElementById('confirmationArea');
    const content = document.getElementById('renewContent');

    loading.style.display = 'block';
    confirmationArea.classList.remove('show');

    try {
        const response = await fetch(`${API_BASE}/confirm-replace`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Confirmação realizada:', result);
        
        loading.style.display = 'none';
        
        // Mostrar mensagem de sucesso
        content.innerHTML = `
            <div class="success" style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
                <h4>✅ Lista de Processos Substituída com Sucesso!</h4>
                <p>O arquivo <strong>processos.xlsx</strong> foi atualizado com sucesso.</p>
                <p>Agora você pode usar a opção de atualizar o banco de dados na página inicial.</p>
                <button class="btn btn-primary" onclick="resetUpload()" style="margin-top: 10px;">Fazer Nova Substituição</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro na confirmação:', error);
        loading.style.display = 'none';
        confirmationArea.classList.add('show');
        alert(`Erro ao confirmar substituição: ${error.message}`);
    }
}


function cancelUpload() {
    document.getElementById('confirmationArea').classList.remove('show');
    document.getElementById('excelFile').value = '';
    uploadedFile = null;
}

function resetUpload() {
    document.getElementById('confirmationArea').classList.remove('show');
    document.getElementById('excelFile').value = '';
    document.getElementById('renewContent').innerHTML = '';
    uploadedFile = null;
}

// Funções para a página de atualização de dados
let updateInProgress = false;
let updateInterval = null;

function resetUpdate() {
    document.getElementById('updateLoading').style.display = 'none';
    document.getElementById('updateProgress').style.display = 'none';
    document.getElementById('updateResults').style.display = 'none';
    document.getElementById('updateBtn').style.display = 'inline-block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('progressLogs').innerHTML = '';
    document.getElementById('notFoundProcesses').style.display = 'none';
    updateInProgress = false;
}

async function startDatabaseUpdate() {
    if (updateInProgress) return;
    
    updateInProgress = true;
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'inline-block';
    document.getElementById('updateLoading').style.display = 'block';
    document.getElementById('updateProgress').style.display = 'none';
    document.getElementById('updateResults').style.display = 'none';
    
    // Inicializar estatísticas
    const notFoundProcesses = [];
    const foundProcesses = [];
    
    try {
        console.log('🔄 Iniciando requisição para update-database-stream...');
        addLogEntry('🔄 Conectando ao servidor...', 'info');
        
        const response = await fetch(`${API_BASE}/update-database-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Resposta recebida:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${response.statusText}. Detalhes: ${errorText}`);
        }

        document.getElementById('updateLoading').style.display = 'none';
        document.getElementById('updateProgress').style.display = 'block';

        console.log('📡 Iniciando leitura do stream...');
        addLogEntry('📡 Conectado! Iniciando processamento...', 'info');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('📡 Stream finalizado');
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the incomplete line in buffer

            for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.substring(6); // Remove 'data: '
                        const data = JSON.parse(jsonStr);
                        console.log('📊 Dados recebidos:', data);
                        updateProgress(data, notFoundProcesses, foundProcesses);
                    } catch (e) {
                        console.log('⚠️ Erro ao parsear JSON:', line, e);
                        addLogEntry(`⚠️ Erro ao processar linha: ${line}`, 'warning');
                    }
                }
            }
        }

        // Finalizar
        updateInProgress = false;
        document.getElementById('stopBtn').style.display = 'none';
        showFinalResults(notFoundProcesses, foundProcesses);

    } catch (error) {
        console.error('❌ Erro na atualização:', error);
        addLogEntry(`❌ Erro: ${error.message}`, 'error');
        updateInProgress = false;
        document.getElementById('stopBtn').style.display = 'none';
        document.getElementById('updateBtn').style.display = 'inline-block';
        
        // ATUALIZAR listas de categorias e tribunais mesmo com erro
        console.log('🔄 Atualizando listas de filtros após erro...');
        
        setTimeout(() => {
            console.log('📞 Forçando atualização após erro...');
            forceUpdateFilters();
        }, 500); // 0.5 segundo de delay
    }
}

function updateProgress(data, notFoundProcesses, foundProcesses) {
    if (data.type === 'log') {
        addLogEntry(data.message, data.level || 'info');
        
        // Parse success messages to extract found processes
        if (data.level === 'success' && data.message.includes('[OK]')) {
            const match = data.message.match(/\[OK\]\s*([^\s]+)\s+encontrado/);
            if (match) {
                const processo = match[1];
                if (!foundProcesses.includes(processo)) {
                    foundProcesses.push(processo);
                    console.log('✅ Processo encontrado adicionado:', processo);
                }
            }
        }
        
        // Parse not found messages - melhorar regex para capturar melhor
        if (data.level === 'error' && data.message.includes('[ERRO]')) {
            // Tentar múltiplos padrões para capturar o número do processo
            let match = data.message.match(/\[ERRO\]\s*([^\s]+)\s+não encontrado/);
            if (!match) {
                match = data.message.match(/\[ERRO\]\s*([0-9\-\.]+)\s+não encontrado/);
            }
            if (!match) {
                match = data.message.match(/não encontrado[:\s]*([0-9\-\.]+)/);
            }
            // Tentar com "nao" sem acento (formato do backend)
            if (!match) {
                match = data.message.match(/\[ERRO\]\s*([^\s]+)\s+nao encontrado/);
            }
            if (!match) {
                match = data.message.match(/\[ERRO\]\s*([0-9\-\.]+)\s+nao encontrado/);
            }
            if (!match) {
                match = data.message.match(/nao encontrado[:\s]*([0-9\-\.]+)/);
            }
            
            if (match) {
                const processo = match[1].trim();
                if (!notFoundProcesses.includes(processo)) {
                    notFoundProcesses.push(processo);
                    console.log('❌ Processo não encontrado adicionado:', processo);
                } else {
                    console.log('⚠️ Processo não encontrado já existe (ignorando):', processo);
                }
            } else {
                console.log('⚠️ Não foi possível extrair número do processo da mensagem:', data.message);
            }
        }
    } else if (data.type === 'progress') {
        document.getElementById('progressStats').textContent = 
            `Processando ${data.current}/${data.total} processos...`;
    } else if (data.type === 'found') {
        if (!foundProcesses.includes(data.processo)) {
            foundProcesses.push(data.processo);
            console.log('✅ Processo encontrado (tipo found):', data.processo);
        }
    } else if (data.type === 'notFound') {
        if (!notFoundProcesses.includes(data.processo)) {
            notFoundProcesses.push(data.processo);
            console.log('❌ Processo não encontrado (tipo notFound):', data.processo);
        } else {
            console.log('⚠️ Processo não encontrado já existe (ignorando):', data.processo);
        }
    }
}

function addLogEntry(message, level = 'info') {
    const logsContainer = document.getElementById('progressLogs');
    const entry = document.createElement('div');
    entry.className = `log-entry ${level}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logsContainer.appendChild(entry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}


function showFinalResults(notFoundProcesses, foundProcesses) {
    document.getElementById('updateProgress').style.display = 'none';
    document.getElementById('updateResults').style.display = 'block';
    
    // Remover duplicatas como medida de segurança
    const uniqueFoundProcesses = [...new Set(foundProcesses)];
    const uniqueNotFoundProcesses = [...new Set(notFoundProcesses)];
    
    console.log('📊 Estatísticas finais:');
    console.log('Processos encontrados únicos:', uniqueFoundProcesses.length);
    console.log('Processos não encontrados únicos:', uniqueNotFoundProcesses.length);
    console.log('Lista de não encontrados:', uniqueNotFoundProcesses);
    
    // Calcular totais
    const totalFound = uniqueFoundProcesses.length;
    const totalNotFound = uniqueNotFoundProcesses.length;
    
    document.getElementById('totalFound').textContent = totalFound;
    document.getElementById('totalNotFound').textContent = totalNotFound;
    
    // Mostrar processos não encontrados se houver
    if (totalNotFound > 0) {
        const notFoundContainer = document.getElementById('notFoundProcesses');
        const notFoundList = document.getElementById('notFoundList');
        
        notFoundList.innerHTML = '';
        uniqueNotFoundProcesses.forEach(processo => {
            const item = document.createElement('div');
            item.className = 'not-found-item';
            item.textContent = processo;
            notFoundList.appendChild(item);
        });
        
        notFoundContainer.style.display = 'block';
    }
    
    // ATUALIZAR listas de categorias e tribunais após atualização dos dados
    console.log('🔄 Atualizando listas de filtros após atualização dos dados...');
    
    // Aguardar um pouco para garantir que o backend terminou de processar
    setTimeout(() => {
        console.log('📞 Forçando atualização das listas via endpoint...');
        forceUpdateFilters();
    }, 1000); // 1 segundo de delay
}

async function forceUpdateFilters() {
    try {
        console.log('🔄 Chamando endpoint force-update-filters...');
        const response = await fetch(`${API_BASE}/force-update-filters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Resposta do force-update-filters:', data);
            
            if (data.success) {
                // Atualizar categorias
                const select = document.getElementById('categoria');
                const updatesSelect = document.getElementById('updatesCategoria');
                
                // Limpar opções antigas
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                while (updatesSelect.children.length > 1) {
                    updatesSelect.removeChild(updatesSelect.lastChild);
                }
                
                // Adicionar novas categorias
                data.categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria;
                    option.textContent = categoria;
                    select.appendChild(option);
                    
                    const updatesOption = document.createElement('option');
                    updatesOption.value = categoria;
                    updatesOption.textContent = categoria;
                    updatesSelect.appendChild(updatesOption);
                });
                
                // Atualizar tribunais
                const tribunalSelect = document.getElementById('tribunal');
                const updatesTribunalSelect = document.getElementById('updatesTribunal');
                
                // Limpar opções antigas
                while (tribunalSelect.children.length > 1) {
                    tribunalSelect.removeChild(tribunalSelect.lastChild);
                }
                while (updatesTribunalSelect.children.length > 1) {
                    updatesTribunalSelect.removeChild(updatesTribunalSelect.lastChild);
                }
                
                // Adicionar novos tribunais
                data.tribunais.forEach(tribunal => {
                    const option = document.createElement('option');
                    option.value = tribunal;
                    option.textContent = tribunal;
                    tribunalSelect.appendChild(option);
                    
                    const updatesOption = document.createElement('option');
                    updatesOption.value = tribunal;
                    updatesOption.textContent = tribunal;
                    updatesTribunalSelect.appendChild(updatesOption);
                });
                
                console.log('✅ Listas de filtros atualizadas com sucesso!');
            }
        } else {
            console.error('❌ Erro ao forçar atualização:', response.status);
        }
    } catch (error) {
        console.error('❌ Erro na função forceUpdateFilters:', error);
    }
}

function stopDatabaseUpdate() {
    updateInProgress = false;
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('updateBtn').style.display = 'inline-block';
    addLogEntry('⏹️ Atualização interrompida pelo usuário', 'info');
    
    // ATUALIZAR listas de categorias e tribunais mesmo se interrompido
    console.log('🔄 Atualizando listas de filtros após interrupção...');
    
    setTimeout(() => {
        console.log('📞 Forçando atualização após interrupção...');
        forceUpdateFilters();
    }, 500); // 0.5 segundo de delay
}
