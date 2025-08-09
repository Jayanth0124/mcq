class QuizApp {
    constructor() {
        this.mcqsData = {};
        this.questionsArray = [];
        this.userSelections = {};
        this.timeLimit = 300; // 5 minutes
        this.timerInterval = null;
        this.init();
    }

    async init() {
        await this.loadMCQs();
        this.startTimer();
        document.getElementById("submit-quiz").addEventListener("click", () => this.submitQuiz());
    }

    async loadMCQs() {
        try {
            const response = await fetch('mcq_data.json');
            if (!response.ok) throw new Error("Data load error");
            const data = await response.json();

            let allQuestions = [];
            Object.keys(data).forEach(setKey => {
                allQuestions = allQuestions.concat(data[setKey]);
            });

            this.questionsArray = allQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, 20);

            this.displayQuestions();
        } catch (err) {
            document.getElementById("loading").classList.add("hidden");
            document.getElementById("error").classList.remove("hidden");
        }
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        const timerDisplay = document.getElementById("quiz-timer");
        this.timerInterval = setInterval(() => {
            let min = Math.floor(timeLeft / 60);
            let sec = timeLeft % 60;
            timerDisplay.textContent = `Time Left: ${min}:${sec < 10 ? "0" : ""}${sec}`;
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.submitQuiz();
            }
            timeLeft--;
        }, 1000);
    }

    displayQuestions() {
        const container = document.getElementById("questions-list");
        container.innerHTML = '';

        this.questionsArray.forEach((q, index) => {
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card';

            questionCard.innerHTML = `
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-text">${q.question}</div>
                </div>
            `;

            const ul = document.createElement('ul');
            ul.className = 'options-list';

            q.options.forEach((opt, i) => {
                const li = document.createElement('li');
                li.className = 'option-item';
                li.dataset.qIndex = index;
                li.dataset.optionIndex = i;
                li.innerHTML = `
                    <span class="option-label">${String.fromCharCode(65 + i)}</span>
                    <span class="option-text">${opt}</span>
                `;

                li.addEventListener('click', () => {
                    this.userSelections[index] = i;
                    ul.querySelectorAll('.option-item').forEach(sib => sib.classList.remove('selected'));
                    li.classList.add('selected');
                });

                ul.appendChild(li);
            });

            questionCard.appendChild(ul);
            container.appendChild(questionCard);
        });

        // Fix for large screens
        const styleFix = document.createElement("style");
        styleFix.innerHTML = `.option-item {cursor: pointer;} .option-item * {pointer-events: none;}`;
        document.head.appendChild(styleFix);

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("questions-container").classList.remove("hidden");
    }

    submitQuiz() {
        clearInterval(this.timerInterval);
        let score = 0;
        let reportHTML = '<h2>Your Quiz Report</h2><div class="quiz-report"><ul>';

        this.questionsArray.forEach((q, index) => {
            let correctIndex = ['a', 'b', 'c', 'd'].indexOf(q.answer.toLowerCase());
            let userChoice = this.userSelections[index];
            if (userChoice === correctIndex) {
                score++;
            } else {
                reportHTML += `<li><strong>${q.question}</strong><br>
                               Your Answer: ${userChoice !== undefined ? q.options[userChoice] : 'Not answered'}<br>
                               Correct Answer: ${q.options[correctIndex]}</li>`;
            }
        });

        reportHTML += '</ul></div>';
        reportHTML += `
            <div style="text-align:center; margin-top:20px;">
                <a href="index.html" class="back-btn">Back to Practice Mode</a>
            </div>
        `;

        document.getElementById("questions-container").innerHTML =
            `<h3>Score: ${score} / ${this.questionsArray.length}</h3>${reportHTML}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new QuizApp();
});
