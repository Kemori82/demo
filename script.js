// Global variables
const DEMONS_KEY = 'demonList_demons';
const USERS_KEY = 'demonList_users';

// Initialize data storage if empty
function initializeStorage() {
    if (!localStorage.getItem(DEMONS_KEY)) {
        const defaultDemons = [
            {
                id: 1,
                name: "Bloodbath",
                creator: "Riot",
                difficulty: 4,
                image: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
                description: "One of the most iconic demon levels in Geometry Dash history.",
                verifiedPlayers: 1234,
                publishedDate: "2014-01-15"
            },
            {
                id: 2,
                name: "Cataclysm",
                creator: "Ggb0y",
                difficulty: 5,
                image: "https://images.pexels.com/photos/235621/pexels-photo-235621.jpeg",
                description: "Extreme demon with tight wave sections and difficult ship sequences.",
                verifiedPlayers: 987,
                publishedDate: "2014-08-22"
            }
        ];
        localStorage.setItem(DEMONS_KEY, JSON.stringify(defaultDemons));
    }

    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
}

// Get all demons from storage
function getDemons() {
    return JSON.parse(localStorage.getItem(DEMONS_KEY)) || [];
}

// Get a specific demon by ID
function getDemonById(id) {
    const demons = getDemons();
    return demons.find(demon => demon.id === id);
}

// Add a new demon to storage
function addDemon(demon) {
    const demons = getDemons();
    // Generate new ID
    const newId = demons.length > 0 ? Math.max(...demons.map(d => d.id)) + 1 : 1;
    demon.id = newId;
    demon.publishedDate = new Date().toISOString().split('T')[0];
    demon.verifiedPlayers = 0;
    demons.push(demon);
    localStorage.setItem(DEMONS_KEY, JSON.stringify(demons));
    return demon;
}

// Update an existing demon
function updateDemon(updatedDemon) {
    const demons = getDemons();
    const index = demons.findIndex(d => d.id === updatedDemon.id);
    if (index !== -1) {
        demons[index] = updatedDemon;
        localStorage.setItem(DEMONS_KEY, JSON.stringify(demons));
        return true;
    }
    return false;
}

// Delete a demon by ID
function deleteDemon(id) {
    const demons = getDemons().filter(d => d.id !== id);
    localStorage.setItem(DEMONS_KEY, JSON.stringify(demons));
}

// User authentication functions
function registerUser(username, email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        return { success: false, message: "Email already registered" };
    }
    
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password, // In a real app, this would be hashed
        isAdmin: false,
        joinedDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, user: newUser };
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        return { success: true, user };
    }
    return { success: false, message: "Invalid email or password" };
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// DOM manipulation helpers
function renderDemonList(demons, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = demons.map(demon => `
        <div class="demon-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300">
            <div class="h-48 bg-gray-300" style="background-image: url('${demon.image}'); background-size: cover; background-position: center;">
                ${!demon.image ? '<i class="fas fa-mountain text-4xl text-gray-500"></i>' : ''}
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-semibold">${demon.name}</h3>
                    <div class="flex">
                        ${Array(5).fill().map((_, i) => 
                            `<span class="${i < demon.difficulty ? 'text-yellow-400' : 'text-gray-300'}"><i class="fas fa-star"></i></span>`
                        ).join('')}
                    </div>
                </div>
                <p class="text-gray-600 mt-1">By ${demon.creator}</p>
                <a href="demon-details.html?id=${demon.id}" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">View Details</a>
            </div>
        </div>
    `).join('');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    
    // Page-specific initializations
    if (document.getElementById('loginForm')) {
        // Login form handling
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.elements.email.value;
            const password = this.elements.password.value;
            
            const result = loginUser(email, password);
            if (result.success) {
                // In a real app, you would set a session/token here
                alert('Login successful! Redirecting to home page...');
                window.location.href = 'index.html';
            } else {
                alert(result.message);
            }
        });
    }
    
    if (document.getElementById('signupForm')) {
        // Signup form handling
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.elements.username.value;
            const email = this.elements.email.value;
            const password = this.elements.password.value;
            const confirmPassword = this.elements.confirmPassword.value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!validateEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            if (!validatePassword(password)) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            const result = registerUser(username, email, password);
            if (result.success) {
                alert('Registration successful! You can now login.');
                window.location.href = 'login.html';
            } else {
                alert(result.message);
            }
        });
    }
    
    if (document.getElementById('demonForm')) {
        // Admin demon form handling
        document.getElementById('demonForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const demon = {
                name: this.elements.name.value,
                creator: this.elements.creator.value,
                difficulty: parseInt(this.elements.difficulty.value),
                image: this.elements.image.value,
                description: this.elements.description.value
            };
            
            addDemon(demon);
            alert('Demon added successfully!');
            this.reset();
        });
    }
    
    // Render demon list on home page
    if (document.getElementById('demonListContainer')) {
        const demons = getDemons();
        renderDemonList(demons, 'demonListContainer');
    }
    
    // Render demon details if on details page
    if (document.getElementById('demonDetails')) {
        const urlParams = new URLSearchParams(window.location.search);
        const demonId = parseInt(urlParams.get('id'));
        
        if (demonId) {
            const demon = getDemonById(demonId);
            if (demon) {
                // Render demon details
                document.getElementById('demonName').textContent = demon.name;
                document.getElementById('demonImage').style.backgroundImage = `url('${demon.image}')`;
                document.getElementById('demonCreator').textContent = demon.creator;
                document.getElementById('demonPublished').textContent = demon.publishedDate;
                document.getElementById('demonPlayers').textContent = demon.verifiedPlayers;
                document.getElementById('demonDescription').textContent = demon.description;
                
                // Render stars
                const starsContainer = document.getElementById('demonStars');
                starsContainer.innerHTML = Array(5).fill().map((_, i) => 
                    `<span class="${i < demon.difficulty ? 'text-yellow-400' : 'text-gray-300'}"><i class="fas fa-star"></i></span>`
                ).join('');
            } else {
                // Demon not found
                document.getElementById('demonDetails').innerHTML = `
                    <div class="text-center py-12">
                        <h2 class="text-2xl font-bold mb-4">Demon not found</h2>
                        <a href="index.html" class="text-blue-600 hover:text-blue-800">Back to list</a>
                    </div>
                `;
            }
        }
    }
});