// Configurações globais
const API_BASE = '/api';
let currentUser = null;

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Carregar conteúdo específico da página
    const path = window.location.pathname;
    
    if (path.includes('../views/frontoffice')) {
        if (path.includes('movie-details')) {
            loadMovieDetails();
        } else if (path.includes('movies')) {
            loadMovies();
        } else if (path.includes('profile')) {
            loadProfile();
        } else if (path.includes('search')) {
            // Configurar pesquisa
            document.getElementById('search-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        } else {
            // Página inicial
            loadFeaturedMovies();
            loadLatestReviews();
        }
    }
});

// Funções de autenticação
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = {
                id: payload.id,
                email: payload.email,
                is_admin: payload.is_admin
            };
            updateAuthUI();
        } catch (error) {
            localStorage.removeItem('token');
        }
    }
}

function updateAuthUI() {
    const authLinks = document.getElementById('auth-links');
    const profileLink = document.getElementById('profile-link');
    const adminLink = document.getElementById('admin-link');
    
    if (currentUser) {
        if (authLinks) {
            authLinks.innerHTML = `
                <a href="/frontoffice/profile">${currentUser.email}</a>
                <a href="#" onclick="logout()">Logout</a>
            `;
        }
        if (profileLink) {
            profileLink.style.display = 'block';
        }
        if (adminLink && currentUser.is_admin) {
            adminLink.style.display = 'block';
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    window.location.href = '../frontoffice/index.html';
}

// Pesquisa
// Função para realizar pesquisa
async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) {
        showEmptyState('Digite algo para pesquisar');
        return;
    }
    
    try {
        // Mostra estado de carregamento
        document.getElementById('search-results-container').innerHTML = `
            <div class="loading">A pesquisar filmes...</div>
        `;
        document.getElementById('results-count').textContent = `Pesquisando por "${query}"...`;
        
        // Faz a pesquisa na API
        const response = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Erro na pesquisa');
        }
        
        const movies = await response.json();
        const container = document.getElementById('search-results-container');
        
        // Mostra resultados
        showSearchResults(movies, query);
        
    } catch (error) {
        console.error('Erro na pesquisa:', error);
        showEmptyState('Erro ao pesquisar. Tente novamente.');
    }
}

// Função para mostrar resultados da pesquisa
function showSearchResults(movies, query) {
    const container = document.getElementById('search-results-container');
    const resultsCount = document.getElementById('results-count');
    
    if (!movies || movies.length === 0) {
        showEmptyState(`Nenhum resultado encontrado para "${query}"`);
        return;
    }
    
    // Atualiza contador de resultados
    resultsCount.textContent = `${movies.length} resultado(s) encontrado(s) para "${query}"`;
    
    // Cria o HTML dos resultados
    let html = '';
    movies.forEach(movie => {
        // Formata dados do filme
        const year = movie.release_year || 'N/A';
        const director = movie.director_name || 'Realizador desconhecido';
        const synopsis = movie.synopsis ? 
            (movie.synopsis.length > 150 ? movie.synopsis.substring(0, 150) + '...' : movie.synopsis) : 
            'Sem descrição disponível';
        
        // URL da imagem (usa placeholder se não tiver)
        const imageUrl = movie.poster_url || 
            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600';
        
        // Cria o card do filme
        html += `
            <div class="movie-card" onclick="openMovieDetail(${movie.id})" style="cursor: pointer;">
                <div class="movie-poster-container">
                    <img src="${imageUrl}" 
                         alt="${movie.title}" 
                         class="movie-poster"
                         onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600'">
                </div>
                
                <div class="movie-content">
                    <h3 class="movie-title">${movie.title}</h3>
                    
                    <div class="movie-meta">
                        <span class="movie-year">${year}</span>
                        <span class="movie-director">${director}</span>
                    </div>
                    
                    <div class="movie-description">
                        ${synopsis}
                    </div>
                    
                    <div class="movie-actions">
                        <button class="view-btn" onclick="event.stopPropagation(); openMovieDetail(${movie.id})">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Mostra/esconde paginação conforme necessidade
    const pagination = document.getElementById('pagination');
    if (movies.length > 12) {
        pagination.style.display = 'flex';
        setupPagination(movies);
    } else {
        pagination.style.display = 'none';
    }
}

// Função para abrir detalhes do filme
function openMovieDetail(movieId) {
    // Abre na mesma aba
    window.location.href = `/frontoffice/movie/${movieId}`;
    
    // OU para abrir em nova aba (descomentar se preferir):
    // window.open(`/frontoffice/movie/${movieId}`, '_blank');
}

// Função para mostrar estado vazio
function showEmptyState(message) {
    const container = document.getElementById('search-results-container');
    const resultsCount = document.getElementById('results-count');
    
    resultsCount.textContent = message;
    container.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h3>${message}</h3>
            <p>Tente pesquisar com outros termos ou palavras-chave.</p>
        </div>
    `;
    
    document.getElementById('pagination').style.display = 'none';
}

// Configuração de paginação (opcional)
let currentPage = 1;
const moviesPerPage = 12;
let allMovies = [];

function setupPagination(movies) {
    allMovies = movies;
    currentPage = 1;
    updatePagination();
}

function updatePagination() {
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const pageMovies = allMovies.slice(startIndex, endIndex);
    
    // Mostra filmes da página atual
    showSearchResults(pageMovies, document.getElementById('search-input').value);
    
    // Atualiza controles de paginação
    const totalPages = Math.ceil(allMovies.length / moviesPerPage);
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    // Atualiza botões
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    
    // Atualiza números das páginas
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';
    
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            updatePagination();
        };
        pageNumbers.appendChild(pageBtn);
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(allMovies.length / moviesPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updatePagination();
        
        // Scroll suave para o topo dos resultados
        document.querySelector('.search-results').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Adiciona também estes eventos extras para melhorar a experiência
document.addEventListener('DOMContentLoaded', function() {
    // Carrega pesquisa da URL se existir
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery) {
        document.getElementById('search-input').value = searchQuery;
        setTimeout(() => performSearch(), 100);
    }
    
    // Adiciona evento para pesquisa em tempo real (debounced)
    let searchTimeout;
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        if (this.value.trim().length > 2) {
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500);
        } else if (this.value.trim().length === 0) {
            showEmptyState('Digite para pesquisar');
        }
    });
});

async function loadLatestReviews() {
    try {
        const response = await fetch(`${API_BASE}/reviews`);
        const reviews = await response.json();
        
        const container = document.getElementById('latest-reviews');
        if (container && reviews.length > 0) {
            const latest = reviews.slice(0, 3);
            container.innerHTML = latest.map(review => `
                <div class="review-card">
                    <p><strong>${review.user_name}</strong> avaliou <em>${review.movie_title}</em></p>
                    <p>⭐ ${review.rating}/5 - "${review.comment.substring(0, 100)}..."</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar reviews:', error);
    }
}