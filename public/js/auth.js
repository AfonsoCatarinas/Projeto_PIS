document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                if (data.user.is_admin) {
                    window.location.href = '../views/backoffice/dashboard.html';
                } else {
                    window.location.href = '../views/frontoffice/movies.html';
                }
            }, 1000);
        } else {
            showMessage(`Erro: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão com o servidor', 'error');
        console.error('Erro no login:', error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registo realizado com sucesso! Pode fazer login.', 'success');
            
            // Limpar formulário
            event.target.reset();
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = '../views/frontoffice/login.html';
            }, 2000);
        } else {
            showMessage(`Erro: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão com o servidor', 'error');
        console.error('Erro no registo:', error);
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `
            <div style="padding: 1rem; background: ${type === 'success' ? '#d4edda' : '#f8d7da'}; 
                        color: ${type === 'success' ? '#155724' : '#721c24'}; 
                        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
                        border-radius: 5px;">
                ${message}
            </div>
        `;
    }
}