// Universal Quiz Engine and CSV Parser for GitHub Pages Silo structure

let questions = [];
let quizQueue = [];
let currentQuestionIndex = 0;
let quizMode = 'practice'; // 'practice' or 'mock'
let stats = {
    total: 0,
    correct: 0
};

// 1. CSV Parser (Standard RFC 4180 Compliant)
function parseCSV(text) {
    let lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        let next = text[i+1];
        if (c === '"') {
            if (inQuotes && next === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push("");
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') { i++; }
            lines.push(row);
            row = [""];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== "") {
        lines.push(row);
    }
    
    let headers = lines[0].map(h => h.trim());
    let data = [];
    for (let i = 1; i < lines.length; i++) {
        let values = lines[i];
        if (values.length < headers.length) continue;
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[j] ? values[j].trim() : "";
        }
        data.push(obj);
    }
    return data;
}

// 2. Fetch Questions on Load
fetch('questions.csv')
    .then(response => response.text())
    .then(csvText => {
        questions = parseCSV(csvText);
        setMode('practice'); // default to practice mode
    })
    .catch(err => {
        console.error("Failed to load questions database: ", err);
        document.getElementById('question-box').innerText = "Error loading question bank. Please verify that questions.csv exists.";
    });

// 3. Quiz State Management
window.setMode = function(mode) {
    quizMode = mode;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'practice') {
        document.getElementById('mode-practice').classList.add('active');
        stats.total = 0;
        stats.correct = 0;
        updateStatsDisplay();
        loadNextPracticeQuestion();
    } else if (mode === 'mock') {
        document.getElementById('mode-mock').classList.add('active');
        // Setup 10 random questions queue
        let shuffled = [...questions].sort(() => 0.5 - Math.random());
        quizQueue = shuffled.slice(0, 10);
        currentQuestionIndex = 0;
        stats.total = 0;
        stats.correct = 0;
        updateStatsDisplay();
        loadMockQuestion();
    }
};

function loadNextPracticeQuestion() {
    if (questions.length === 0) return;
    let randomIndex = Math.floor(Math.random() * questions.length);
    renderQuestion(questions[randomIndex]);
}

function loadMockQuestion() {
    if (currentQuestionIndex < quizQueue.length) {
        renderQuestion(quizQueue[currentQuestionIndex]);
    } else {
        // Mock test completed, show score summary card
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        document.getElementById('question-category').innerText = "Mock Test Completed";
        document.getElementById('question-box').innerHTML = `
            <div class="score-summary">
                <div class="score-badge">${stats.correct}/${stats.total}</div>
                <div class="score-msg">Accuracy: ${accuracy}%</div>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">You completed the 10-Question Mock Test.</p>
                <button class="btn-primary" style="margin: 0 auto;" onclick="setMode('mock')">Retake Test</button>
            </div>
        `;
        document.getElementById('options-container').innerHTML = '';
        document.getElementById('explanation-wrapper').style.display = 'none';
        document.getElementById('next-btn-container').style.display = 'none';
    }
}

let activeQuestion = null;

function renderQuestion(q) {
    activeQuestion = q;
    
    // Set Header Info
    document.getElementById('question-category').innerText = q.Category;
    if (quizMode === 'practice') {
        document.getElementById('progress-count').innerText = `Infinite Practice`;
    } else {
        document.getElementById('progress-count').innerText = `Question ${currentQuestionIndex + 1} of 10`;
    }
    
    // Set Question Content
    document.getElementById('question-box').innerText = q.Question;
    
    // Map options
    let rawOptions = [
        { label: q.OptionA, id: 'OptionA' },
        { label: q.OptionB, id: 'OptionB' },
        { label: q.OptionC, id: 'OptionC' },
        { label: q.OptionD, id: 'OptionD' }
    ];
    
    // Render Option Buttons
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = rawOptions.map((opt, index) => `
        <button class="option-btn" onclick="checkAnswer('${opt.id}', ${index})" data-index="${index}">
            <span>${opt.label}</span>
            <span class="option-marker">${String.fromCharCode(65 + index)}</span>
        </button>
    `).join('');
    
    // Reset view
    document.getElementById('explanation-wrapper').style.display = 'none';
    document.getElementById('next-btn-container').style.display = 'none';
}

window.checkAnswer = function(selectedId, index) {
    const buttons = document.querySelectorAll('.option-btn');
    const correctId = activeQuestion.CorrectOption;
    
    // Map of options to indices
    const optionsMap = { 'OptionA': 0, 'OptionB': 1, 'OptionC': 2, 'OptionD': 3 };
    const correctIndex = optionsMap[correctId];
    
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) {
            btn.classList.add('correct');
        } else if (idx === index) {
            btn.classList.add('incorrect');
        }
    });
    
    // Update Score
    stats.total++;
    if (selectedId === correctId) {
        stats.correct++;
    }
    updateStatsDisplay();
    
    // Show Solution
    document.getElementById('explanation-text').innerHTML = activeQuestion.Explanation;
    document.getElementById('explanation-wrapper').style.display = 'block';
    document.getElementById('next-btn-container').style.display = 'flex';
};

window.nextQuestion = function() {
    if (quizMode === 'practice') {
        loadNextPracticeQuestion();
    } else {
        currentQuestionIndex++;
        loadMockQuestion();
    }
};

window.resetStats = function() {
    stats.total = 0;
    stats.correct = 0;
    updateStatsDisplay();
    nextQuestion();
};

function updateStatsDisplay() {
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-correct').innerText = stats.correct;
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    document.getElementById('stat-accuracy').innerText = `${pct}%`;
}

// 4. Calculator Logic
let calcState = {
    currOperand: '0',
    prevOperand: '',
    operation: undefined
};

const prevEl = document.querySelector('.calc-prev-operand');
const currEl = document.querySelector('.calc-curr-operand');

function updateCalcDisplay() {
    currEl.innerText = calcState.currOperand;
    if (calcState.operation != null) {
        prevEl.innerText = `${calcState.prevOperand} ${calcState.operation}`;
    } else {
        prevEl.innerText = '';
    }
}

window.calcNum = function(num) {
    if (num === '.' && calcState.currOperand.includes('.')) return;
    if (calcState.currOperand === '0' && num !== '.') {
        calcState.currOperand = num.toString();
    } else {
        calcState.currOperand = calcState.currOperand.toString() + num.toString();
    }
    updateCalcDisplay();
};

window.calcOp = function(op) {
    if (calcState.currOperand === '') return;
    if (calcState.prevOperand !== '') {
        calcCompute();
    }
    calcState.operation = op;
    calcState.prevOperand = calcState.currOperand;
    calcState.currOperand = '';
    updateCalcDisplay();
};

function calcCompute() {
    let computation;
    const prev = parseFloat(calcState.prevOperand);
    const current = parseFloat(calcState.currOperand);
    if (isNaN(prev) || isNaN(current)) return;

    switch (calcState.operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '×':
            computation = prev * current;
            break;
        case '÷':
            computation = current === 0 ? 'Error' : prev / current;
            break;
        default:
            return;
    }
    calcState.currOperand = computation.toString();
    calcState.operation = undefined;
    calcState.prevOperand = '';
}

window.calcAction = function(action) {
    if (action === 'clear') {
        calcState.currOperand = '0';
        calcState.prevOperand = '';
        calcState.operation = undefined;
    } else if (action === 'delete') {
        if (calcState.currOperand !== '0') {
            calcState.currOperand = calcState.currOperand.slice(0, -1);
            if (calcState.currOperand === '') calcState.currOperand = '0';
        }
    } else if (action === 'equals') {
        calcCompute();
    }
    updateCalcDisplay();
};
