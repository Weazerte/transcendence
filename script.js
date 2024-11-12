document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('nav ul li a');

    const pages = {
        home: `
            <section id="home">
                <h2>Bienvenue au Pong Game</h2>
                <p></p>
                <div class="gif-border">
                    <img src="Utils/Homer.gif" alt="Pong Game GIF">
                </div>
            </section>
        `,
        register: `
            <section id="register">
                <h2>Inscription</h2>
                <form id="registration-form">
                    <label for="alias">Alias :</label>
                    <input type="text" id="alias" name="alias" required>
                    <button class="button-54" role="button">S'inscrire</button>
                </form>
            </section>
        `,
        tournament: `
            <section id="tournament">
                <h2>Tournoi</h2>
                <div id="tournament-info">
                    <p>Aucun tournoi en cours.</p>
                </div>
            </section>
        `,
        game: `
            <section id="game">
                <h2>Jeu Pong</h2>
                <canvas id="pongCanvas" width="800" height="600"></canvas>
            </section>
        `
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = link.getAttribute('data-page');
            mainContent.innerHTML = pages[page];
            history.pushState({}, '', `#${page}`);
            setupPageEvents();
        });
    });

    window.addEventListener('popstate', () => {
        const page = location.hash.substring(1);
        mainContent.innerHTML = pages[page] || pages.home;
        setupPageEvents();
    });

    // Charger la page initiale
    const initialPage = location.hash.substring(1) || 'home';
    mainContent.innerHTML = pages[initialPage];
    setupPageEvents();

    // Fonction pour gérer les événements spécifiques à chaque page
    function setupPageEvents() {
        // Gestion de l'inscription
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const alias = document.getElementById('alias').value;
                if (alias) {
                    alert(`Inscription réussie avec l'alias : ${alias}`);
                }
            });
        }

        // Gestion du jeu Pong
        const pongCanvas = document.getElementById('pongCanvas');
        if (pongCanvas) {
            const ctx = pongCanvas.getContext('2d');
            //jeu pong
        }

        // Générer les étoiles aléatoires
        generateStars(50); // générer 50 étoiles
    }

    // Fonction pour générer des étoiles à des positions aléatoires
    function generateStars(numberOfStars) {
        let starsContainer = document.getElementById('stars-container');
        if (!starsContainer) {
            starsContainer = document.createElement('div');
            starsContainer.id = 'stars-container';
            document.body.appendChild(starsContainer);
        }

        // Générer les étoiles à l'intérieur du conteneur
        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.classList.add('star');

            const posX = Math.random() * window.innerWidth;
            const posY = Math.random() * window.innerHeight;

            star.style.left = `${posX}px`;
            star.style.top = `${posY}px`;

            starsContainer.appendChild(star);
        }
    }
});
