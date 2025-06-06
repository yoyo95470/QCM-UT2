document.addEventListener('DOMContentLoaded', async function() {
    // Éléments DOM
    const qcmContainer = document.getElementById('qcm-container');
    const generateBtn = document.getElementById('generate-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resultsDiv = document.getElementById('results');
    const scorePara = document.getElementById('score');
    const correctionsDiv = document.getElementById('corrections');
    const timerDiv = document.getElementById('timer');

    let questions = [];
    let selectedQuestions = [];
    let userAnswers = {};
    let timerInterval;
    let timeLeft = 90 * 60;

    // 1. Chargement des questions optimisé pour GitHub
    async function loadQuestions() {
        try {
            // Solution robuste pour GitHub Pages
            const baseUrl = window.location.href.replace(/\/$/, '');
            const response = await fetch(`${baseUrl}/questions.json`);
            
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            
            // Validation de la structure
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error("Format de fichier invalide");
            }
            
            return data.questions;
        } catch (error) {
            console.error("Erreur de chargement:", error);
            
            // Fallback pour démo
            return [{
                id: 0,
                question: "Exemple de question (chargement échoué)",
                options: {A: "Option A", B: "Option B", C: "Option C", D: "Option D"},
                reponse: "A"
            }];
        }
    }

    // 2. Génération du QCM
    function generateQCM() {
        // Réinitialisation
        clearInterval(timerInterval);
        userAnswers = {};
        resultsDiv.classList.add('hidden');
        qcmContainer.innerHTML = '';
        
        // Sélection aléatoire
        selectedQuestions = [...questions]
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.min(60, questions.length));
        
        // Affichage
        if (selectedQuestions.length === 0) {
            qcmContainer.innerHTML = '<p class="error">Aucune question disponible</p>';
            return;
        }

        selectedQuestions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.innerHTML = `
                <div class="question-number">Question ${index + 1}: ${question.question}</div>
                <div class="options">
                    ${Object.entries(question.options).map(([key, value]) => `
                        <div class="option">
                            <input type="radio" id="q${index}_${key}" name="q${index}" value="${key}">
                            <label for="q${index}_${key}">${key}. ${value}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            qcmContainer.appendChild(questionDiv);
        });

        startTimer();
    }

    // 3. Gestion du timer
    function startTimer() {
        timeLeft = 90 * 60;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            if (--timeLeft <= 0) {
                clearInterval(timerInterval);
                submitAnswers();
            }
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDiv.textContent = `Temps restant: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 4. Soumission des réponses
    function submitAnswers() {
        clearInterval(timerInterval);
        
        // Calcul des réponses
        selectedQuestions.forEach((_, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            userAnswers[index] = selected ? selected.value : null;
        });

        const correct = selectedQuestions.filter((q, i) => userAnswers[i] === q.reponse).length;
        const score = Math.round((correct / selectedQuestions.length) * 100);
        
        // Affichage des résultats
        scorePara.innerHTML = `Score: <strong>${correct}/${selectedQuestions.length}</strong> (${score}%)`;
        
        correctionsDiv.innerHTML = selectedQuestions.map((q, i) => {
            const isCorrect = userAnswers[i] === q.reponse;
            return `
                <div class="correction ${isCorrect ? 'correct' : 'incorrect'}">
                    <p><strong>Question ${i + 1}:</strong> ${q.question}</p>
                    <p>Votre réponse: ${userAnswers[i] || 'Aucune'} ${isCorrect ? '✓' : '✗'}</p>
                    ${!isCorrect ? `<p>Réponse correcte: ${q.reponse} (${q.options[q.reponse]})</p>` : ''}
                </div>
            `;
        }).join('');
        
        resultsDiv.classList.remove('hidden');
    }

    // Initialisation
    try {
        questions = await loadQuestions();
        generateBtn.addEventListener('click', generateQCM);
        submitBtn.addEventListener('click', submitAnswers);
        generateQCM(); // Lancement automatique
    } catch (error) {
        console.error("Erreur:", error);
        qcmContainer.innerHTML = `<p class="error">Erreur: ${error.message}</p>`;
    }
});