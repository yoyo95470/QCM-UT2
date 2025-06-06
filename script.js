document.addEventListener('DOMContentLoaded', function() {
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
    let timeLeft = 90 * 60; // 90 minutes en secondes

    // Charger les questions depuis le fichier JSON
    fetch('data/questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data.questions;
            generateQCM();
        })
        .catch(error => console.error('Erreur de chargement des questions:', error));

    // Générer un QCM aléatoire
    function generateQCM() {
        // Réinitialiser
        clearInterval(timerInterval);
        userAnswers = {};
        resultsDiv.classList.add('hidden');
        qcmContainer.innerHTML = '';
        
        // Sélectionner 60 questions aléatoires
        selectedQuestions = [...questions]
            .sort(() => 0.5 - Math.random())
            .slice(0, 60);
        
        // Afficher les questions
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

        // Démarrer le timer
        startTimer();
    }

    // Démarrer le compte à rebours
    function startTimer() {
        timeLeft = 90 * 60;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitAnswers();
            }
        }, 1000);
    }

    // Mettre à jour l'affichage du timer
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDiv.textContent = `Temps restant: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Soumettre les réponses
    function submitAnswers() {
        clearInterval(timerInterval);
        
        // Récupérer les réponses de l'utilisateur
        selectedQuestions.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
            userAnswers[index] = selectedOption ? selectedOption.value : null;
        });

        // Calculer le score
        const correctAnswers = selectedQuestions.filter((question, index) => 
            userAnswers[index] === question.reponse
        ).length;

        const scorePercentage = Math.round((correctAnswers / selectedQuestions.length) * 100);
        
        // Afficher les résultats
        scorePara.textContent = `Vous avez obtenu ${correctAnswers}/${selectedQuestions.length} (${scorePercentage}%)`;
        
        // Afficher les corrections
        correctionsDiv.innerHTML = '';
        selectedQuestions.forEach((question, index) => {
            const correctionDiv = document.createElement('div');
            correctionDiv.className = 'correction';
            
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.reponse;
            
            correctionDiv.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                <p class="${isCorrect ? 'correct' : 'incorrect'}">
                    Votre réponse: ${userAnswer || 'Aucune réponse'} 
                    ${userAnswer ? `(${question.options[userAnswer]})` : ''}
                    ${isCorrect ? '✓' : '✗'}
                </p>
                ${!isCorrect ? `
                    <p><strong>Réponse correcte:</strong> ${question.reponse} (${question.options[question.reponse]})</p>
                ` : ''}
            `;
            
            correctionsDiv.appendChild(correctionDiv);
        });
        
        resultsDiv.classList.remove('hidden');
    }

    // Événements
    generateBtn.addEventListener('click', generateQCM);
    submitBtn.addEventListener('click', submitAnswers);
});