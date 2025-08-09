class MCQApp {
    constructor() {
        this.mcqsData = {};
        this.currentSet = null;
        this.maxQuestions = 50;
        this.userSelections = {};
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
            this.currentSet = e.target.value;
            this.currentCoElement.textContent = this.currentSet;
            this.displayQuestions();
        });
    }

    async loadMCQs() {
        try {
            this.showLoading();
            const response = await fetch('mcq_data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            this.mcqsData = await response.json();

            this.coSelect.innerHTML = '';
            Object.keys(this.mcqsData).forEach(setName => {
                const option = document.createElement('option');
                option.value = setName;
                option.textContent = setName;
                this.coSelect.appendChild(option);
            });

            this.currentSet = Object.keys(this.mcqsData)[0];
            this.currentCoElement.textContent = this.currentSet;

            this.updateTotalQuestions();
            this.displayQuestions();

        } catch (error) {
            console.error('Error loading MCQs:', error);
            this.showError();
        }
    }

    updateTotalQuestions() {
        let totalQuestions = 0;
        for (const setName in this.mcqsData) {
            if (Array.isArray(this.mcqsData[setName])) {
                totalQuestions += this.mcqsData[setName].length;
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
        const questionsArray = this.mcqsData[this.currentSet] || [];
        const questionsToShow = questionsArray.slice(0, this.maxQuestions);

        this.questionsTitle.textContent = `${this.currentSet} MCQ Questions`;
        this.questionsCount.textContent = `Displaying ${Math.min(questionsToShow.length, this.maxQuestions)} of ${questionsArray.length} available questions`;

        this.questionsList.innerHTML = '';
        questionsToShow.forEach((question, index) => {
            const questionCard = this.createQuestionCard(question, index);
            this.questionsList.appendChild(questionCard);
        });

        // Ensure clicks always work
        const styleFix = document.createElement("style");
        styleFix.innerHTML = `.option-item {cursor: pointer;} .option-item * {pointer-events: none;}`;
        document.head.appendChild(styleFix);

        this.loadingElement.classList.add('hidden');
        this.errorElement.classList.add('hidden');
        this.questionsContainer.classList.remove('hidden');
    }

    createQuestionCard(question, index) {
        const card = document.createElement('div');
        card.className = 'question-card';

        const letter = question.answer.toLowerCase();
        const correctIndex = ['a','b','c','d'].indexOf(letter);
        const correctOptionText = question.options[correctIndex];

        card.innerHTML = `
            <div class="question-header">
                <div class="question-number">${question.question_no}</div>
                <div class="question-text">${question.question}</div>
            </div>
            <ul class="options-list">
                ${question.options.map((opt, i) => `
                    <li class="option-item" data-q="${question.question_no}" data-option-index="${i}">
                        <span class="option-label">${String.fromCharCode(65+i)}</span>
                        <span class="option-text">${opt}</span>
                    </li>
                `).join('')}
            </ul>
            <button class="reveal-btn" data-question-index="${index}">Show Correct Answer</button>
            <div class="answer-display hidden" id="answer-${index}">
                <div class="answer-label">Correct Answer</div>
                <div class="answer-text">Option ${String.fromCharCode(65 + correctIndex)}: ${correctOptionText}</div>
            </div>
        `;

        card.querySelectorAll('.option-item').forEach(opt => {
            opt.addEventListener('click', () => {
                const qNo = opt.getAttribute('data-q');
                const idx = parseInt(opt.getAttribute('data-option-index'));
                this.userSelections[qNo] = idx;
                opt.parentElement.querySelectorAll('.option-item').forEach(s => s.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        card.querySelector('.reveal-btn').addEventListener('click', () => {
            this.revealAnswer(index);
        });

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

document.addEventListener('DOMContentLoaded', () => {
    new MCQApp();
});
