# JusConsult UI - Interface Web

## Descrição do Projeto

A **JusConsult UI** é a interface web frontend do sistema JusConsult, desenvolvida em HTML, CSS e JavaScript vanilla. Esta interface fornece uma experiência de usuário intuitiva para interagir com a API backend, permitindo consultar processos judiciais, visualizar atualizações e gerenciar dados através de uma interface moderna e responsiva.

## Funcionalidades

### Consulta de Processos
- Busca por número de processo específico
- Filtros por tribunal e categoria
- Visualização detalhada de processos
- Histórico de movimentações processuais
- Paginação de resultados

### Visualização de Atualizações
- Gráfico interativo de processos por período de atualização
- Filtros por tribunal e categoria
- Visualização de processos agrupados por:
  - Últimas 24 horas
  - Últimos 7 dias
  - Último mês
  - Último ano
  - Mais de 1 ano

### Atualização de Dados
- Atualização automática do banco de dados
- Consulta em tempo real aos tribunais
- Feedback visual do progresso
- Logs detalhados da operação
- Estatísticas de processos encontrados/não encontrados

### Gerenciamento de Lista de Processos
- Download do template Excel atual
- Upload de nova lista de processos
- Drag & drop para facilitar upload
- Validação de arquivos Excel
- Confirmação antes de substituir dados

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com Flexbox e Grid
- **JavaScript ES6+**: Lógica de interação e comunicação com API
- **Chart.js**: Gráficos interativos para visualização de dados
- **Fetch API**: Comunicação assíncrona com o backend

## Estrutura de Arquivos

```
datajud-ui/
├── index.html          # Página principal da aplicação
├── script.js           # Lógica JavaScript da aplicação
├── styles.css          # Estilos CSS da interface
└── README.md           # Este arquivo
```

## Instalação e Configuração

### Pré-requisitos

- Servidor web (Apache, Nginx, ou servidor de desenvolvimento)
- Backend JusConsult API rodando em `http://localhost:5000`
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### 1. Configuração do Backend

Certifique-se de que a API backend está rodando:

```bash
cd ../datajud-api
python app.py
```

A API deve estar disponível em `http://localhost:5000`.

### 2. Configuração do Frontend

#### Opção A: Servidor Local Simples

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (se tiver instalado)
npx http-server -p 8000
```

#### Opção B: Servidor de Desenvolvimento

Para desenvolvimento, você pode usar qualquer servidor web local. A aplicação funcionará em qualquer porta, desde que a API esteja rodando na porta 5000.

### 3. Acesso à Aplicação

Abra seu navegador e acesse:
- **Frontend**: `http://localhost:8000` (ou a porta configurada)
- **Backend**: `http://localhost:5000` (deve estar rodando)

## Uso da Interface

### Menu Principal

A interface apresenta um menu principal com 4 opções:

1. **Consultar Atualizações**: Visualiza processos agrupados por período
2. **Consultar Processos**: Busca processos específicos
3. **Atualizar Dados**: Atualiza o banco consultando os tribunais
4. **Renovar Lista de Processos**: Gerencia o arquivo Excel de processos

### Consulta de Processos

1. Clique em "Consultar Processos"
2. Preencha os filtros desejados:
   - Número do processo (opcional)
   - Tribunal (opcional)
   - Categoria (opcional)
3. Clique em "Buscar"
4. Visualize os resultados na tabela
5. Clique em um número de processo para ver detalhes

### Visualização de Atualizações

1. Clique em "Consultar Atualizações"
2. Aplique filtros se necessário
3. Visualize o gráfico de barras interativo
4. Clique nas barras para ver processos específicos de cada período

### Atualização de Dados

1. Clique em "Atualizar Dados"
2. Clique em "Iniciar Atualização"
3. Acompanhe o progresso em tempo real
4. Visualize logs detalhados da operação
5. Consulte estatísticas finais

### Gerenciamento de Lista

1. Clique em "Renovar Lista de Processos"
2. Baixe o template atual clicando em "Baixar processos.xlsx"
3. Edite o arquivo Excel conforme necessário
4. Faça upload do arquivo editado (drag & drop ou clique)
5. Confirme a substituição

## Recursos da Interface

### Design Responsivo

- Layout adaptável para desktop, tablet e mobile
- Grid system flexível
- Componentes otimizados para diferentes tamanhos de tela

### Interatividade

- Gráficos clicáveis para navegação
- Modais para visualização detalhada
- Feedback visual em tempo real
- Animações suaves e transições

### Acessibilidade

- Estrutura semântica HTML5
- Contraste adequado de cores
- Navegação por teclado
- Textos alternativos para elementos visuais

### Performance

- Carregamento assíncrono de dados
- Cache de requisições quando apropriado
- Paginação para grandes volumes de dados
- Otimização de imagens e recursos

## Configuração da API

A interface se conecta automaticamente com a API backend. Para alterar a URL da API, edite a constante no arquivo `script.js`:

```javascript
const API_BASE = 'http://localhost:5000';
```

### Endpoints Utilizados

A interface consome os seguintes endpoints da API:

- `GET /health` - Verificação de saúde do servidor
- `GET /tribunais` - Lista de tribunais disponíveis
- `GET /categorias` - Lista de categorias disponíveis
- `GET /processos` - Busca de processos com filtros
- `GET /processo/<numero>` - Detalhes de um processo específico
- `GET /atualizacoes-dataframe` - Dados para o gráfico de atualizações
- `GET /template-excel` - Download do template Excel
- `POST /upload-processos` - Upload de arquivo Excel
- `POST /confirm-replace` - Confirmação de substituição
- `POST /update-database-stream` - Atualização com streaming
- `POST /force-update-filters` - Atualização forçada de filtros

## Personalização

### Cores e Tema

As cores principais podem ser alteradas no arquivo `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
}
```

### Layout

O layout é baseado em CSS Grid e Flexbox, permitindo fácil customização:

```css
.menu-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}
```

## Solução de Problemas

### Erro de Conexão com API

Se a interface não conseguir conectar com a API:

1. Verifique se o backend está rodando em `http://localhost:5000`
2. Confirme se não há bloqueios de firewall
3. Verifique o console do navegador para erros de CORS

### Problemas de Upload

Para problemas com upload de arquivos:

1. Verifique se o arquivo é um Excel válido (.xlsx ou .xls)
2. Confirme se o arquivo não está corrompido
3. Verifique o tamanho do arquivo (limite do servidor)

### Performance Lenta

Para melhorar a performance:

1. Use filtros para reduzir a quantidade de dados
2. Evite consultas muito amplas
3. Verifique a conexão de internet
4. Monitore o uso de memória do navegador

## Desenvolvimento

### Estrutura do Código

O código JavaScript está organizado em funções modulares:

- **Inicialização**: `loadTribunais()`, `loadCategorias()`
- **Navegação**: `showMainMenu()`, `showSearchPage()`, etc.
- **API**: `searchProcesses()`, `loadUpdates()`, etc.
- **UI**: `displayResults()`, `createUpdatesChart()`, etc.

### Adicionando Novas Funcionalidades

Para adicionar novas funcionalidades:

1. Adicione o HTML necessário em `index.html`
2. Crie os estilos CSS em `styles.css`
3. Implemente a lógica JavaScript em `script.js`
4. Adicione os endpoints necessários na API

### Debugging

Use o console do navegador para debugging:

```javascript
// Ativar logs detalhados
console.log('Debug info:', data);

// Verificar requisições
console.log('API Response:', response);
```

---

**JusConsult UI** - Interface web moderna para consulta de processos judiciais
