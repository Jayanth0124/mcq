class MCQApp {
    constructor() {
        this.mcqsData = [];
        this.currentCO = 'CO1';
        this.maxQuestions = 50;
        this.userSelections = {}; // Store selected option index per question
        this.initializeElements();
        this.bindEvents();
        this.loadMCQs();
    }
    
    initializeElements() {
        this.coSelect = document.getElementById('co-select');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.questionsContainer = document.getElementById('questions-container');
        this.questionsTitle = document.getElementById('questions-title');
        this.questionsCount = document.getElementById('questions-count');
        this.questionsList = document.getElementById('questions-list');
        this.totalQuestionsElement = document.getElementById('total-questions');
        this.currentCoElement = document.getElementById('current-co');
    }
    
    bindEvents() {
        this.coSelect.addEventListener('change', (e) => {
            this.currentCO = e.target.value;
            this.currentCoElement.textContent = this.currentCO;
            this.displayQuestions();
        });
    }
    
    async loadMCQs() {
        try {
            this.showLoading();
            
            const response = await fetch('mcqs_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.mcqsData = await response.json();
            this.updateTotalQuestions();
            this.displayQuestions();
            
        } catch (error) {
            console.error('Error loading MCQs:', error);
            this.showError();
        }
    }
    
    updateTotalQuestions() {
        let totalQuestions = 0;
        for (const co in this.mcqsData) {
            if (Array.isArray(this.mcqsData[co])) {
                totalQuestions += this.mcqsData[co].length;
            }
        }
        this.totalQuestionsElement.textContent = totalQuestions;
    }
    
    showLoading() {
        this.loadingElement.classList.remove('hidden');
        this.errorElement.classList.add('hidden');
        this.questionsContainer.classList.add('hidden');
    }
    
    showError() {
        this.loadingElement.classList.add('hidden');
        this.errorElement.classList.remove('hidden');
        this.questionsContainer.classList.add('hidden');
    }
    
    displayQuestions() {
        // Get questions for the current CO
        const questionsArray = this.mcqsData[this.currentCO] || [];
        // Take only first 50 questions
        const questionsToShow = questionsArray.slice(0, this.maxQuestions);

        // Update title and count
        this.questionsTitle.textContent = `${this.currentCO} MCQ Questions`;
        this.questionsCount.textContent = `Displaying ${Math.min(questionsToShow.length, this.maxQuestions)} of ${questionsArray.length} available questions`;

        // Clear previous questions
        this.questionsList.innerHTML = '';

        // Create question cards
        questionsToShow.forEach((question, index) => {
            const questionCard = this.createQuestionCard(question, index);
            this.questionsList.appendChild(questionCard);
        });

        // Show questions container
        this.loadingElement.classList.add('hidden');
        this.errorElement.classList.add('hidden');
        this.questionsContainer.classList.remove('hidden');
    }
    
    createQuestionCard(question, index) {
        const card = document.createElement('div');
        card.className = 'question-card';

        // Find the index of the correct answer
        const correctIndex = question.options.findIndex(opt => opt === question.answer);
        const correctOptionText = question.options[correctIndex];

        card.innerHTML = `
            <div class="question-header">
                <div class="question-number">Q${question.qno}</div>
                <div class="question-text">${question.question}</div>
            </div>
            <ul class="options-list">
                <li class="option-item" data-option-index="0">
                    <span class="option-label">A</span>
                    <span class="option-text">${question.options[0]}</span>
                </li>
                <li class="option-item" data-option-index="1">
                    <span class="option-label">B</span>
                    <span class="option-text">${question.options[1]}</span>
                </li>
                <li class="option-item" data-option-index="2">
                    <span class="option-label">C</span>
                    <span class="option-text">${question.options[2]}</span>
                </li>
                <li class="option-item" data-option-index="3">
                    <span class="option-label">D</span>
                    <span class="option-text">${question.options[3]}</span>
                </li>
            </ul>
            <button class="reveal-btn" data-question-index="${index}">
                Show Correct Answer
            </button>
            <div class="answer-display hidden" id="answer-${index}">
                <div class="answer-label">Correct Answer</div>
                <div class="answer-text">Option ${String.fromCharCode(65 + correctIndex)}: ${correctOptionText}</div>
            </div>
        `;

        // Add event listener for reveal button
        const revealBtn = card.querySelector('.reveal-btn');
        revealBtn.addEventListener('click', () => {
            this.revealAnswer(index);
        });

        // Event delegation for option selection
        const optionsList = card.querySelector('.options-list');
        optionsList.addEventListener('click', (event) => {
            let option = event.target;
            // If the clicked element is not the li, find the closest li
            if (!option.classList.contains('option-item')) {
                option = option.closest('.option-item');
            }
            if (option) {
                // Remove 'selected' from all options
                optionsList.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
                // Add 'selected' to the clicked option
                option.classList.add('selected');
                // Store the selected option index for this question
                const selectedOptionIndex = parseInt(option.getAttribute('data-option-index'));
                this.userSelections[question.qno] = selectedOptionIndex;
            }
        });

        // If user has already selected an option for this question, mark it as selected
        if (this.userSelections[question.qno] !== undefined) {
            const selectedLi = card.querySelector(`.option-item[data-option-index="${this.userSelections[question.qno]}"]`);
            if (selectedLi) selectedLi.classList.add('selected');
        }

        return card;
    }
    
    revealAnswer(questionIndex) {
        const answerDisplay = document.getElementById(`answer-${questionIndex}`);
        const revealBtn = document.querySelector(`[data-question-index="${questionIndex}"]`);
        
        if (answerDisplay && revealBtn) {
            answerDisplay.classList.remove('hidden');
            revealBtn.disabled = true;
            revealBtn.textContent = 'Answer Displayed';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MCQApp();
});