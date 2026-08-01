// Core Application Logic for California Real Estate Exam Math Practice Tool

// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// Calculator Logic
class Calculator {
    constructor() {
        this.prevOperandEl = document.querySelector('.calc-prev-operand');
        this.currOperandEl = document.querySelector('.calc-curr-operand');
        this.clear();
    }

    clear() {
        this.currOperand = '0';
        this.prevOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currOperand === '0') return;
        this.currOperand = this.currOperand.toString().slice(0, -1);
        if (this.currOperand === '') this.currOperand = '0';
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currOperand.includes('.')) return;
        if (this.currOperand === '0' && number !== '.') {
            this.currOperand = number.toString();
        } else {
            this.currOperand = this.currOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currOperand === '') return;
        if (this.prevOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.prevOperand = this.currOperand;
        this.currOperand = '';
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.prevOperand);
        const current = parseFloat(this.currOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
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
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }

        this.currOperand = computation.toString();
        this.operation = undefined;
        this.prevOperand = '';
        this.updateDisplay();
    }

    updateDisplay() {
        this.currOperandEl.innerText = this.currOperand;
        if (this.operation != null) {
            this.prevOperandEl.innerText = `${this.prevOperand} ${this.operation}`;
        } else {
            this.prevOperandEl.innerText = '';
        }
    }
}

const calculator = new Calculator();

document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const num = btn.getAttribute('data-num');
        const op = btn.getAttribute('data-op');

        if (num !== null) calculator.appendNumber(num);
        if (op !== null) calculator.chooseOperation(op);
        if (action === 'clear') calculator.clear();
        if (action === 'delete') calculator.delete();
        if (action === 'equals') calculator.compute();
    });
});

// Quiz Engine State
let currentQuestion = null;
let selectedCategory = 'all';
let stats = {
    total: 0,
    correct: 0
};

// Math Formulas & Cheat Sheet Data
const formulasData = [
    {
        title: "Commission Formula",
        equation: "Commission = Sales Price × Rate",
        desc: "Calculates the total commission earned from a sale. Remember, commissions are typically split between listing and selling brokers, and then with their sales agents.",
        example: "A home sells for <strong>$400,000</strong> with a <strong>6%</strong> commission. Commission = $400,000 × 0.06 = <strong>$24,000</strong>.",
        icon: "💰"
    },
    {
        title: "Loan-to-Value (LTV) Ratio",
        equation: "LTV = Loan Amount ÷ Property Value",
        desc: "Determines the percentage of a property's value that is financed by a mortgage loan. Lenders use this to measure risk.",
        example: "A buyer borrows <strong>$320,000</strong> to buy a <strong>$400,000</strong> home. LTV = $320,000 ÷ $400,000 = 0.80 or <strong>80%</strong>.",
        icon: "📈"
    },
    {
        title: "Capitalization Rate (Cap Rate)",
        equation: "Cap Rate = Net Operating Income ÷ Value",
        desc: "Used to estimate an investor's return on investment. Debt services (mortgage payments) are NOT subtracted to get Net Operating Income (NOI).",
        example: "A commercial building has an NOI of <strong>$50,000</strong> and is worth <strong>$625,000</strong>. Cap Rate = $50,000 ÷ $625,000 = 0.08 or <strong>8%</strong>.",
        icon: "🏢"
    },
    {
        title: "Gross Rent Multiplier (GRM)",
        equation: "GRM = Property Price ÷ Gross Monthly Rent",
        desc: "An index used to estimate the value of residential income properties. Value = Gross Rent × GRM.",
        example: "A duplex sells for <strong>$300,000</strong> and rents for <strong>$2,500/mo</strong>. Monthly GRM = $300,000 ÷ $2,500 = <strong>120</strong>.",
        icon: "🏠"
    },
    {
        title: "Land Measurement (Acreage)",
        equation: "1 Acre = 43,560 Square Feet",
        desc: "A fundamental conversion rate. Memorize the number 43,560 ('Four old ladies driving down Interstate 80 at 55 mph' is a popular mnemonic: 4, 3, 5, 6, 0).",
        example: "A lot measures <strong>150 ft by 290 ft</strong>. Total area = 43,500 sq ft. Acreage = 43,500 ÷ 43,560 = <strong>0.999 Acres</strong>.",
        icon: "📐"
    },
    {
        title: "Property Tax (California Prop 13)",
        equation: "Annual Tax = Assessed Value × Tax Rate",
        desc: "In California, Proposition 13 limits base property tax to 1% of the assessed value, plus additional local bonds/assessments.",
        example: "A house has an assessed value of <strong>$500,000</strong>. At a base rate of <strong>1%</strong>, the tax is $500,000 × 0.01 = <strong>$5,000</strong>.",
        icon: "🏛️"
    }
];

// Populate Formula Cards
const formulasGrid = document.querySelector('.formulas-grid');
if (formulasGrid) {
    formulasGrid.innerHTML = formulasData.map(f => `
        <div class="formula-card">
            <div class="formula-header">
                <span class="formula-title">${f.title}</span>
                <span class="formula-icon">${f.icon}</span>
            </div>
            <div class="formula-body">
                <div class="formula-equation">${f.equation}</div>
                <p class="formula-desc">${f.desc}</p>
                <div class="formula-example">${f.example}</div>
            </div>
        </div>
    `).join('');
}

// Random Number Helpers
function getRandom(min, max, step = 1) {
    const range = (max - min) / step;
    return min + Math.floor(Math.random() * range) * step;
}

// Question Generators for Infinite Practice
const generators = {
    commissions: [
        function() {
            const price = getRandom(200000, 800000, 10000);
            const rate = getRandom(4, 7, 0.5);
            const ans = price * (rate / 100);
            return {
                category: "Commissions",
                question: `A broker lists and sells a home for $${price.toLocaleString()}. If the listing agreement specifies a ${rate}% commission rate, how much commission does the broker earn?`,
                options: [ans, ans * 0.9, ans * 1.1, price * ((rate - 1) / 100)].map(v => `$${Math.round(v).toLocaleString()}`),
                correctIndex: 0,
                explanation: `Apply the commission formula:<br>
                <strong>Commission = Sales Price &times; Commission Rate</strong><br>
                Convert the percentage to a decimal: ${rate}% = ${rate / 100}<br>
                $${price.toLocaleString()} &times; ${rate / 100} = <strong>$${Math.round(ans).toLocaleString()}</strong>.`
            };
        },
        function() {
            const price = getRandom(300000, 900000, 50000);
            const totalRate = getRandom(5, 6, 1);
            const splitRatio = 50; // 50/50 split
            const agentSplit = getRandom(60, 80, 10);
            const totalCommission = price * (totalRate / 100);
            const coOpCommission = totalCommission * (splitRatio / 100);
            const ans = coOpCommission * (agentSplit / 100);

            return {
                category: "Commissions",
                question: `A house sells for $${price.toLocaleString()}. The commission is ${totalRate}%, split evenly (50/50) between the listing broker and the cooperating selling broker. If the selling broker's salesperson receives ${agentSplit}% of their broker's share, how much does the salesperson earn?`,
                options: [ans, coOpCommission, totalCommission, totalCommission * (agentSplit / 100)].map(v => `$${Math.round(v).toLocaleString()}`),
                correctIndex: 0,
                explanation: `Let's break this down step-by-step:<br>
                1. Calculate total commission: $${price.toLocaleString()} &times; ${totalRate / 100} = $${Math.round(totalCommission).toLocaleString()}<br>
                2. Calculate the selling broker's co-op share (50%): $${Math.round(totalCommission).toLocaleString()} &times; 0.50 = $${Math.round(coOpCommission).toLocaleString()}<br>
                3. Calculate the salesperson's portion (${agentSplit}%): $${Math.round(coOpCommission).toLocaleString()} &times; ${agentSplit / 100} = <strong>$${Math.round(ans).toLocaleString()}</strong>.`
            };
        }
    ],
    ltv: [
        function() {
            const value = getRandom(250000, 600000, 10000);
            const ltv = getRandom(70, 90, 5);
            const loan = value * (ltv / 100);
            const downpayment = value - loan;
            return {
                category: "LTV & Loan Interest",
                question: `A lender approves a loan with a ${ltv}% Loan-to-Value (LTV) ratio on a property valued at $${value.toLocaleString()}. How much down payment will the buyer need to make at closing?`,
                options: [downpayment, loan, value * 0.1, value * 0.2].map(v => `$${Math.round(v).toLocaleString()}`),
                correctIndex: 0,
                explanation: `The Loan-to-Value ratio determines the loan amount:<br>
                <strong>Loan Amount = Property Value &times; LTV Ratio</strong><br>
                $${value.toLocaleString()} &times; ${ltv / 100} = $${Math.round(loan).toLocaleString()}<br><br>
                The down payment is the remaining value not financed:<br>
                <strong>Down Payment = Property Value - Loan Amount</strong><br>
                $${value.toLocaleString()} - $${Math.round(loan).toLocaleString()} = <strong>$${Math.round(downpayment).toLocaleString()}</strong>.`
            };
        },
        function() {
            const loan = getRandom(150000, 450000, 10000);
            const rate = getRandom(5, 8, 0.25);
            const yearlyInterest = loan * (rate / 100);
            const monthlyInterest = yearlyInterest / 12;
            return {
                category: "LTV & Loan Interest",
                question: `An investor takes out an interest-only mortgage loan of $${loan.toLocaleString()} at an annual interest rate of ${rate}%. What will be their monthly interest payment?`,
                options: [monthlyInterest, yearlyInterest, monthlyInterest * 1.1, yearlyInterest / 10].map(v => `$${Math.round(v).toLocaleString()}`),
                correctIndex: 0,
                explanation: `First, calculate the annual interest payment:<br>
                <strong>Annual Interest = Loan Amount &times; Annual Interest Rate</strong><br>
                $${loan.toLocaleString()} &times; ${rate / 100} = $${Math.round(yearlyInterest).toLocaleString()}<br><br>
                Next, divide by 12 to find the monthly interest payment:<br>
                <strong>Monthly Interest = Annual Interest &divide; 12</strong><br>
                $${Math.round(yearlyInterest).toLocaleString()} &divide; 12 = <strong>$${Math.round(monthlyInterest).toLocaleString()}</strong>.`
            };
        }
    ],
    caprate: [
        function() {
            const grossIncome = getRandom(80000, 150000, 5000);
            const expenses = getRandom(25000, 45000, 1000);
            const value = getRandom(500000, 1000000, 50000);
            const noi = grossIncome - expenses;
            const capRate = (noi / value) * 100;
            const formattedCap = Math.round(capRate * 100) / 100;

            // Generate options with variations of correct/incorrect math
            const incorrect1 = Math.round(((grossIncome) / value) * 100 * 100) / 100; // forgetting to subtract expenses
            const incorrect2 = Math.round(((grossIncome + expenses) / value) * 100 * 100) / 100;

            return {
                category: "Cap Rate & Valuation",
                question: `An office building generates a gross annual income of $${grossIncome.toLocaleString()}. The annual operating expenses (excluding debt service) total $${expenses.toLocaleString()}. If the property is valued at $${value.toLocaleString()}, what is the capitalization rate (Cap Rate)?`,
                options: [`${formattedCap}%`, `${incorrect1}%`, `${incorrect2}%`, `${Math.round(formattedCap * 0.8 * 100)/100}%`],
                correctIndex: 0,
                explanation: `First, determine Net Operating Income (NOI). Note that debt services/mortgage payments are NEVER subtracted from operating expenses:<br>
                <strong>NOI = Gross Income - Operating Expenses</strong><br>
                $${grossIncome.toLocaleString()} - $${expenses.toLocaleString()} = $${noi.toLocaleString()}<br><br>
                Next, calculate Cap Rate:<br>
                <strong>Cap Rate = NOI &divide; Property Value</strong><br>
                $${noi.toLocaleString()} &divide; $${value.toLocaleString()} = ${noi / value} = <strong>${formattedCap}%</strong>.`
            };
        },
        function() {
            const noi = getRandom(40000, 90000, 5000);
            const capRatePercent = getRandom(6, 9, 0.5);
            const value = noi / (capRatePercent / 100);

            return {
                category: "Cap Rate & Valuation",
                question: `An apartment complex has a Net Operating Income (NOI) of $${noi.toLocaleString()} per year. If capitalization rates in this market are ${capRatePercent}%, what is the estimated market value of the property?`,
                options: [value, value * 0.9, value * 1.1, noi * capRatePercent].map(v => `$${Math.round(v).toLocaleString()}`),
                correctIndex: 0,
                explanation: `To find the value using Cap Rate, use the formula:<br>
                <strong>Property Value = Net Operating Income (NOI) &divide; Cap Rate</strong><br>
                Convert the percentage to a decimal: ${capRatePercent}% = ${capRatePercent / 100}<br>
                $${noi.toLocaleString()} &divide; ${capRatePercent / 100} = <strong>$${Math.round(value).toLocaleString()}</strong>.`
            };
        }
    ],
    grm: [
        function() {
            const price = getRandom(240000, 480000, 10000);
            const monthlyRent = getRandom(2000, 4000, 100);
            const grm = Math.round((price / monthlyRent) * 10) / 10;
            return {
                category: "GRM & Valuation",
                question: `A residential duplex sold for $${price.toLocaleString()}. If the total monthly gross rental income for both units combined is $${monthlyRent.toLocaleString()}, what is the monthly Gross Rent Multiplier (GRM)?`,
                options: [grm, Math.round(grm * 12 * 10) / 10, Math.round(grm * 0.8 * 10) / 10, Math.round((price / (monthlyRent / 2)) * 10) / 10].map(v => v.toString()),
                correctIndex: 0,
                explanation: `The monthly Gross Rent Multiplier (GRM) is calculated as:<br>
                <strong>GRM = Purchase Price &divide; Gross Monthly Rent</strong><br>
                $${price.toLocaleString()} &divide; $${monthlyRent.toLocaleString()} = <strong>${grm}</strong>.`
            };
        },
        function() {
            const monthlyRent = getRandom(1500, 3500, 100);
            const grm = getRandom(110, 140, 5);
            const val = monthlyRent * grm;
            return {
                category: "GRM & Valuation",
                question: `A property generates a gross monthly rent of $${monthlyRent.toLocaleString()}. If the Gross Rent Multiplier (GRM) for similar properties in the area is ${grm}, what is the estimated value of the property?`,
                options: [val, val * 12, val * 0.8, monthlyRent * 12 * grm].map(v => `$${Math.round(v).toLocaleString()}`),
                correctIndex: 0,
                explanation: `To estimate property value using a monthly GRM:<br>
                <strong>Estimated Value = Gross Monthly Rent &times; GRM</strong><br>
                $${monthlyRent.toLocaleString()} &times; ${grm} = <strong>$${Math.round(val).toLocaleString()}</strong>.`
            };
        }
    ],
    landarea: [
        function() {
            const acres = getRandom(2, 8, 0.5);
            const sqft = acres * 43560;
            return {
                category: "Land Area & Measurements",
                question: `A developer buys a parcel of land containing ${acres} acres. How many square feet does the developer own?`,
                options: [sqft, acres * 40000, acres * 48000, sqft - 5000].map(v => `${Math.round(v).toLocaleString()} sq ft`),
                correctIndex: 0,
                explanation: `A standard conversion key is:<br>
                <strong>1 Acre = 43,560 square feet</strong><br>
                Multiply the number of acres by 43,560:<br>
                ${acres} acres &times; 43,560 sq ft = <strong>${Math.round(sqft).toLocaleString()} square feet</strong>.`
            };
        },
        function() {
            const width = getRandom(150, 400, 10);
            const depth = getRandom(250, 600, 10);
            const area = width * depth;
            const acres = Math.round((area / 43560) * 100) / 100;
            return {
                category: "Land Area & Measurements",
                question: `A rectangular commercial lot measures ${width} feet wide by ${depth} feet deep. Approximately how many acres are in this lot?`,
                options: [`${acres} Acres`, `${Math.round(acres * 1.2 * 100)/100} Acres`, `${Math.round(acres * 0.8 * 100)/100} Acres`, `${Math.round((area / 40000) * 100)/100} Acres`],
                correctIndex: 0,
                explanation: `First, calculate the total square footage of the rectangular lot:<br>
                <strong>Area = Width &times; Depth</strong><br>
                ${width} ft &times; ${depth} ft = ${area.toLocaleString()} sq ft<br><br>
                Next, divide by 43,560 to convert square feet to acres:<br>
                <strong>Acres = Total Sq Ft &divide; 43,560</strong><br>
                ${area.toLocaleString()} &divide; 43,560 = <strong>${acres} Acres</strong>.`
            };
        }
    ]
};

// Start Quiz Session
function generateQuestion() {
    let activeCategories = [];
    if (selectedCategory === 'all') {
        activeCategories = Object.keys(generators);
    } else {
        activeCategories = [selectedCategory];
    }
    
    // Pick random category from active selection
    const randomCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
    const categoryGenerators = generators[randomCategory];
    
    // Pick random generator from selected category
    const generator = categoryGenerators[Math.floor(Math.random() * categoryGenerators.length)];
    
    // Create the question state
    const rawQuestion = generator();
    
    // Format options: round numbers, randomize option placement
    const correctVal = rawQuestion.options[0];
    let randomizedOptions = [...rawQuestion.options];
    
    // Fisher-Yates Shuffle
    for (let i = randomizedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomizedOptions[i], randomizedOptions[j]] = [randomizedOptions[j], randomizedOptions[i]];
    }
    
    // Locate the new index of correct option
    const newCorrectIndex = randomizedOptions.indexOf(correctVal);
    
    currentQuestion = {
        category: rawQuestion.category,
        question: rawQuestion.question,
        options: randomizedOptions,
        correctIndex: newCorrectIndex,
        explanation: rawQuestion.explanation
    };
    
    renderQuestion();
}

function renderQuestion() {
    // Render Category Header and Progress
    document.getElementById('question-category').innerText = currentQuestion.category;
    document.getElementById('progress-count').innerText = `Completed: ${stats.total}`;
    
    // Render Question Text
    document.getElementById('question-box').innerText = currentQuestion.question;
    
    // Render Options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = currentQuestion.options.map((opt, index) => `
        <button class="option-btn" onclick="checkAnswer(${index})" data-index="${index}">
            <span>${opt}</span>
            <span class="option-marker">${String.fromCharCode(65 + index)}</span>
        </button>
    `).join('');
    
    // Hide Explanation and Next Button initially
    document.getElementById('explanation-wrapper').style.display = 'none';
    document.getElementById('next-btn-container').style.display = 'none';
}

window.checkAnswer = function(selectedIndex) {
    const buttons = document.querySelectorAll('.option-btn');
    const correctIdx = currentQuestion.correctIndex;
    
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIdx) {
            btn.classList.add('correct');
        } else if (idx === selectedIndex) {
            btn.classList.add('incorrect');
        }
    });
    
    // Update Score Stats
    stats.total++;
    if (selectedIndex === correctIdx) {
        stats.correct++;
    }
    
    updateStatsDisplay();
    
    // Render Explanation
    const explanationText = document.getElementById('explanation-text');
    explanationText.innerHTML = currentQuestion.explanation;
    document.getElementById('explanation-wrapper').style.display = 'block';
    
    // Show Next Button
    document.getElementById('next-btn-container').style.display = 'flex';
};

function updateStatsDisplay() {
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-correct').innerText = stats.correct;
    
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    document.getElementById('stat-accuracy').innerText = `${percentage}%`;
}

// Next Button Click
document.getElementById('next-btn').addEventListener('click', () => {
    generateQuestion();
});

// Category Filter Clicks
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.getAttribute('data-category');
        generateQuestion();
    });
});

// Reset Score Click
document.getElementById('reset-stats-btn').addEventListener('click', () => {
    stats.total = 0;
    stats.correct = 0;
    updateStatsDisplay();
    generateQuestion();
});

// Initialize on load
generateQuestion();
updateStatsDisplay();
