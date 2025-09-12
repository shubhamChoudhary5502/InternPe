class AdvancedCalculator {
            constructor() {
                this.display = document.getElementById('mainDisplay');
                this.secondaryDisplay = document.getElementById('secondaryDisplay');
                this.memoryDisplay = document.getElementById('memoryDisplay');
                this.historyPanel = document.getElementById('historyPanel');
                this.statusText = document.getElementById('statusText');
                this.angleMode = document.getElementById('angleMode');
                
                this.currentValue = '0';
                this.previousValue = '';
                this.operator = null;
                this.waitingForOperand = false;
                this.memory = 0;
                this.isDegreeMode = true;
                this.history = [];
                this.expression = '';
                this.parenthesesCount = 0;
                
                this.initializeEventListeners();
                this.updateDisplay();
                this.updateMemoryDisplay();
            }

            initializeEventListeners() {
                // Button clicks
                document.addEventListener('click', (e) => {
                    if (e.target.matches('button[data-value]')) {
                        this.inputDigit(e.target.dataset.value);
                    } else if (e.target.matches('button[data-action]')) {
                        this.performAction(e.target.dataset.action);
                    }
                });

                // Keyboard support
                document.addEventListener('keydown', (e) => {
                    this.handleKeyboardInput(e);
                });

                // Mode selector
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.querySelector('.mode-btn.active').classList.remove('active');
                        btn.classList.add('active');
                        this.switchMode(btn.dataset.mode);
                    });
                });

                // Advanced panel toggle
                document.getElementById('advancedToggle').addEventListener('click', (e) => {
                    const panel = e.target.parentElement.parentElement;
                    const content = panel.querySelector('.button-grid');
                    const history = panel.querySelector('.history-panel');
                    
                    if (content.style.display === 'none') {
                        content.style.display = 'grid';
                        history.style.display = 'block';
                        e.target.textContent = '▲';
                    } else {
                        content.style.display = 'none';
                        history.style.display = 'none';
                        e.target.textContent = '▼';
                    }
                });
            }

            inputDigit(digit) {
                if (this.waitingForOperand) {
                    this.currentValue = digit;
                    this.waitingForOperand = false;
                } else {
                    this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
                }
                
                this.updateDisplay();
                this.updateStatus('Input: ' + digit);
            }

            performAction(action) {
                const current = parseFloat(this.currentValue);
                
                switch (action) {
                    case 'clear':
                        this.clear();
                        break;
                    case 'clearEntry':
                        this.currentValue = '0';
                        this.updateDisplay();
                        break;
                    case 'backspace':
                        this.backspace();
                        break;
                    case 'equals':
                        this.calculate();
                        break;
                    case 'add':
                    case 'subtract':
                    case 'multiply':
                    case 'divide':
                    case 'power':
                        this.setOperator(action);
                        break;
                    case 'percentage':
                        this.currentValue = String(current / 100);
                        this.updateDisplay();
                        break;
                    case 'negate':
                        this.currentValue = String(-current);
                        this.updateDisplay();
                        break;
                    case 'sqrt':
                        this.currentValue = String(Math.sqrt(current));
                        this.updateDisplay();
                        this.addToHistory(`√${current} = ${this.currentValue}`);
                        break;
                    case 'sin':
                        this.trigFunction(Math.sin, 'sin');
                        break;
                    case 'cos':
                        this.trigFunction(Math.cos, 'cos');
                        break;
                    case 'tan':
                        this.trigFunction(Math.tan, 'tan');
                        break;
                    case 'log':
                        this.currentValue = String(Math.log10(current));
                        this.updateDisplay();
                        this.addToHistory(`log(${current}) = ${this.currentValue}`);
                        break;
                    case 'ln':
                        this.currentValue = String(Math.log(current));
                        this.updateDisplay();
                        this.addToHistory(`ln(${current}) = ${this.currentValue}`);
                        break;
                    case 'exp':
                        this.currentValue = String(Math.exp(current));
                        this.updateDisplay();
                        this.addToHistory(`e^${current} = ${this.currentValue}`);
                        break;
                    case 'pi':
                        this.currentValue = String(Math.PI);
                        this.updateDisplay();
                        break;
                    case 'e':
                        this.currentValue = String(Math.E);
                        this.updateDisplay();
                        break;
                    case 'factorial':
                        this.factorial();
                        break;
                    case 'reciprocal':
                        this.currentValue = String(1 / current);
                        this.updateDisplay();
                        this.addToHistory(`1/${current} = ${this.currentValue}`);
                        break;
                    case 'abs':
                        this.currentValue = String(Math.abs(current));
                        this.updateDisplay();
                        break;
                    case 'openParen':
                        this.handleParenthesis('(');
                        break;
                    case 'closeParen':
                        this.handleParenthesis(')');
                        break;
                    case 'memoryStore':
                        this.memory = current;
                        this.updateMemoryDisplay();
                        this.updateStatus('Stored to memory');
                        break;
                    case 'memoryRecall':
                        this.currentValue = String(this.memory);
                        this.updateDisplay();
                        this.updateStatus('Recalled from memory');
                        break;
                    case 'memoryAdd':
                        this.memory += current;
                        this.updateMemoryDisplay();
                        this.updateStatus('Added to memory');
                        break;
                    case 'memorySubtract':
                        this.memory -= current;
                        this.updateMemoryDisplay();
                        this.updateStatus('Subtracted from memory');
                        break;
                    case 'memoryClear':
                        this.memory = 0;
                        this.updateMemoryDisplay();
                        this.updateStatus('Memory cleared');
                        break;
                    case 'toggleAngle':
                        this.toggleAngleMode();
                        break;
                }
            }

            setOperator(nextOperator) {
                const inputValue = parseFloat(this.currentValue);

                if (this.previousValue === '') {
                    this.previousValue = inputValue;
                } else if (this.operator) {
                    const result = this.performCalculation();
                    this.currentValue = String(result);
                    this.previousValue = result;
                    this.updateDisplay();
                }

                this.waitingForOperand = true;
                this.operator = nextOperator;
                this.updateSecondaryDisplay();
            }

            performCalculation() {
                const prev = parseFloat(this.previousValue);
                const current = parseFloat(this.currentValue);

                switch (this.operator) {
                    case 'add':
                        return prev + current;
                    case 'subtract':
                        return prev - current;
                    case 'multiply':
                        return prev * current;
                    case 'divide':
                        return current !== 0 ? prev / current : 0;
                    case 'power':
                        return Math.pow(prev, current);
                    default:
                        return current;
                }
            }

            calculate() {
                if (this.operator && !this.waitingForOperand) {
                    const result = this.performCalculation();
                    const expression = `${this.previousValue} ${this.getOperatorSymbol(this.operator)} ${this.currentValue} = ${result}`;
                    
                    this.addToHistory(expression);
                    this.currentValue = String(result);
                    this.previousValue = '';
                    this.operator = null;
                    this.waitingForOperand = true;
                    this.updateDisplay();
                    this.updateSecondaryDisplay();
                    this.updateStatus('Calculation complete');
                    
                    // Add animation effect
                    this.display.classList.add('calculating');
                    setTimeout(() => {
                        this.display.classList.remove('calculating');
                    }, 1000);
                }
            }

            trigFunction(func, name) {
                const current = parseFloat(this.currentValue);
                let angle = current;
                
                if (this.isDegreeMode) {
                    angle = current * (Math.PI / 180);
                }
                
                this.currentValue = String(func(angle));
                this.updateDisplay();
                this.addToHistory(`${name}(${current}°) = ${this.currentValue}`);
            }

            factorial() {
                const n = parseInt(this.currentValue);
                if (n < 0 || !Number.isInteger(n)) {
                    this.showError('Invalid input for factorial');
                    return;
                }
                
                let result = 1;
                for (let i = 2; i <= n; i++) {
                    result *= i;
                }
                
                this.currentValue = String(result);
                this.updateDisplay();
                this.addToHistory(`${n}! = ${result}`);
            }

            handleParenthesis(paren) {
                if (paren === '(') {
                    this.parenthesesCount++;
                    this.expression += '(';
                } else if (paren === ')' && this.parenthesesCount > 0) {
                    this.parenthesesCount--;
                    this.expression += ')';
                }
                this.updateSecondaryDisplay();
            }

            toggleAngleMode() {
                this.isDegreeMode = !this.isDegreeMode;
                this.angleMode.textContent = this.isDegreeMode ? 'DEG' : 'RAD';
                const btn = document.querySelector('[data-action="toggleAngle"]');
                btn.textContent = this.isDegreeMode ? 'DEG' : 'RAD';
                this.updateStatus(`Angle mode: ${this.isDegreeMode ? 'Degrees' : 'Radians'}`);
            }

            clear() {
                this.currentValue = '0';
                this.previousValue = '';
                this.operator = null;
                this.waitingForOperand = false;
                this.expression = '';
                this.parenthesesCount = 0;
                this.updateDisplay();
                this.updateSecondaryDisplay();
                this.updateStatus('Calculator cleared');
            }

            backspace() {
                if (this.currentValue.length > 1) {
                    this.currentValue = this.currentValue.slice(0, -1);
                } else {
                    this.currentValue = '0';
                }
                this.updateDisplay();
            }

            switchMode(mode) {
                this.updateStatus(`Switched to ${mode} mode`);
                // Mode switching logic can be expanded here
            }

            handleKeyboardInput(e) {
                e.preventDefault();
                
                if (e.key >= '0' && e.key <= '9' || e.key === '.') {
                    this.inputDigit(e.key);
                } else if (e.key === '+') {
                    this.performAction('add');
                } else if (e.key === '-') {
                    this.performAction('subtract');
                } else if (e.key === '*') {
                    this.performAction('multiply');
                } else if (e.key === '/') {
                    this.performAction('divide');
                } else if (e.key === 'Enter' || e.key === '=') {
                    this.performAction('equals');
                } else if (e.key === 'Escape') {
                    this.performAction('clear');
                } else if (e.key === 'Backspace') {
                    this.performAction('backspace');
                } else if (e.key === '%') {
                    this.performAction('percentage');
                } else if (e.key === '(') {
                    this.performAction('openParen');
                } else if (e.key === ')') {
                    this.performAction('closeParen');
                }
            }

            getOperatorSymbol(operator) {
                switch (operator) {
                    case 'add': return '+';
                    case 'subtract': return '−';
                    case 'multiply': return '×';
                    case 'divide': return '÷';
                    case 'power': return '^';
                    default: return '';
                }
            }

            updateDisplay() {
                let displayValue = this.currentValue;
                
                // Format large numbers in scientific notation
                const num = parseFloat(displayValue);
                if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
                    displayValue = num.toExponential(6);
                } else if (displayValue.length > 12) {
                    displayValue = parseFloat(displayValue).toPrecision(10);
                }
                
                this.display.textContent = displayValue;
                
                // Add animation effect
                this.display.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    this.display.style.transform = 'scale(1)';
                }, 100);
            }

            updateSecondaryDisplay() {
                let text = '';
                if (this.previousValue && this.operator) {
                    text = `${this.previousValue} ${this.getOperatorSymbol(this.operator)}`;
                }
                if (this.expression) {
                    text += ` ${this.expression}`;
                }
                this.secondaryDisplay.textContent = text;
            }

            updateMemoryDisplay() {
                this.memoryDisplay.textContent = `Memory: ${this.memory}`;
                if (this.memory !== 0) {
                    this.memoryDisplay.style.borderLeftColor = 'var(--accent-orange)';
                } else {
                    this.memoryDisplay.style.borderLeftColor = 'var(--accent-cyan)';
                }
            }

            updateStatus(message) {
                this.statusText.textContent = message;
                setTimeout(() => {
                    this.statusText.textContent = 'Ready';
                }, 2000);
            }

            addToHistory(calculation) {
                this.history.unshift(calculation);
                if (this.history.length > 50) {
                    this.history.pop();
                }
                this.updateHistoryDisplay();
            }

            updateHistoryDisplay() {
                const historyContainer = this.historyPanel.querySelector('.panel-title').nextElementSibling || 
                                       document.createElement('div');
                
                if (!historyContainer.parentElement) {
                    this.historyPanel.appendChild(historyContainer);
                }
                
                historyContainer.innerHTML = this.history.map(item => 
                    `<div class="history-item" onclick="calculator.loadFromHistory('${item.split(' = ')[1] || item}')">${item}</div>`
                ).join('');
            }

            loadFromHistory(value) {
                this.currentValue = value;
                this.updateDisplay();
                this.updateStatus('Loaded from history');
            }

            showError(message) {
                this.display.textContent = 'Error';
                this.display.classList.add('error');
                this.updateStatus(message);
                
                setTimeout(() => {
                    this.display.classList.remove('error');
                    this.currentValue = '0';
                    this.updateDisplay();
                }, 2000);
            }

            // Advanced mathematical functions
            calculateStatistics(numbers) {
                const n = numbers.length;
                const sum = numbers.reduce((a, b) => a + b, 0);
                const mean = sum / n;
                
                const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
                const stdDev = Math.sqrt(variance);
                
                const sorted = [...numbers].sort((a, b) => a - b);
                const median = n % 2 === 0 ? 
                    (sorted[n/2 - 1] + sorted[n/2]) / 2 : 
                    sorted[Math.floor(n/2)];
                
                return { mean, median, stdDev, sum, count: n };
            }

            // Unit conversion functions
            convertUnits(value, fromUnit, toUnit, category) {
                const conversions = {
                    length: {
                        meter: 1,
                        kilometer: 0.001,
                        centimeter: 100,
                        millimeter: 1000,
                        inch: 39.3701,
                        foot: 3.28084,
                        yard: 1.09361,
                        mile: 0.000621371
                    },
                    weight: {
                        kilogram: 1,
                        gram: 1000,
                        pound: 2.20462,
                        ounce: 35.274
                    },
                    temperature: {
                        celsius: (c) => ({ fahrenheit: c * 9/5 + 32, kelvin: c + 273.15 }),
                        fahrenheit: (f) => ({ celsius: (f - 32) * 5/9, kelvin: (f - 32) * 5/9 + 273.15 }),
                        kelvin: (k) => ({ celsius: k - 273.15, fahrenheit: (k - 273.15) * 9/5 + 32 })
                    }
                };
                
                if (category === 'temperature') {
                    return conversions.temperature[fromUnit](value)[toUnit];
                } else {
                    const baseValue = value / conversions[category][fromUnit];
                    return baseValue * conversions[category][toUnit];
                }
            }

            // Matrix operations
            multiplyMatrices(a, b) {
                const result = [];
                for (let i = 0; i < a.length; i++) {
                    result[i] = [];
                    for (let j = 0; j < b[0].length; j++) {
                        let sum = 0;
                        for (let k = 0; k < b.length; k++) {
                            sum += a[i][k] * b[k][j];
                        }
                        result[i][j] = sum;
                    }
                }
                return result;
            }

            determinant2x2(matrix) {
                return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
            }

            // Equation solver for quadratic equations
            solveQuadratic(a, b, c) {
                const discriminant = b * b - 4 * a * c;
                
                if (discriminant < 0) {
                    return { type: 'no_real_solutions', discriminant };
                } else if (discriminant === 0) {
                    const x = -b / (2 * a);
                    return { type: 'one_solution', x1: x, discriminant };
                } else {
                    const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                    const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                    return { type: 'two_solutions', x1, x2, discriminant };
                }
            }

            // Function plotting (basic)
            plotFunction(expression, xMin = -10, xMax = 10, steps = 100) {
                const points = [];
                const stepSize = (xMax - xMin) / steps;
                
                for (let i = 0; i <= steps; i++) {
                    const x = xMin + i * stepSize;
                    try {
                        // Simple expression evaluator (would need enhancement for complex functions)
                        const y = this.evaluateExpression(expression.replace(/x/g, x));
                        points.push({ x, y });
                    } catch (e) {
                        // Skip invalid points
                    }
                }
                
                return points;
            }

            evaluateExpression(expr) {
                // Basic expression evaluator (simplified)
                try {
                    // Remove any potentially dangerous characters
                    const sanitized = expr.replace(/[^0-9+\-*/().sincostan\s]/g, '');
                    // This is a simplified evaluator - in production, use a proper math parser
                    return Function('"use strict"; return (' + sanitized + ')')();
                } catch (e) {
                    throw new Error('Invalid expression');
                }
            }

            // Binary/Hex/Octal conversions for programmer mode
            convertBase(number, fromBase, toBase) {
                const decimal = parseInt(number, fromBase);
                return decimal.toString(toBase).toUpperCase();
            }

            // Export functionality
            exportCalculations() {
                const data = {
                    history: this.history,
                    memory: this.memory,
                    timestamp: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'calculator_data.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }

        // Initialize calculator
        const calculator = new AdvancedCalculator();

        // Add some advanced UI interactions
        document.addEventListener('DOMContentLoaded', () => {
            // Add particle effects for special operations
            const createParticle = (x, y, color) => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: ${color};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    left: ${x}px;
                    top: ${y}px;
                `;
                document.body.appendChild(particle);
                
                const angle = Math.random() * Math.PI * 2;
                const velocity = 50 + Math.random() * 50;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let posX = x, posY = y;
                let opacity = 1;
                
                const animate = () => {
                    posX += vx * 0.016;
                    posY += vy * 0.016 + 100 * 0.016; // gravity
                    opacity -= 0.02;
                    
                    particle.style.left = posX + 'px';
                    particle.style.top = posY + 'px';
                    particle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        document.body.removeChild(particle);
                    }
                };
                
                requestAnimationFrame(animate);
            };

            // Add particle effects on equals button
            document.querySelector('[data-action="equals"]').addEventListener('click', (e) => {
                const rect = e.target.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        createParticle(x, y, 'var(--accent-cyan)');
                    }, i * 50);
                }
            });

            // Add ripple effect to all buttons
            document.querySelectorAll('.calc-btn').forEach(btn => {
                btn.addEventListener('mousedown', function(e) {
                    const ripple = document.createElement('div');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                    `;
                    
                    this.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                });
            });

            // Add CSS for ripple animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                .calc-btn {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);

            // Add context menu for additional functions
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.calculator-container')) {
                    e.preventDefault();
                    // Could add context menu here
                }
            });

            // Add swipe gestures for mobile
            let touchStartX = 0;
            let touchStartY = 0;

            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });

            document.addEventListener('touchend', (e) => {
                if (!touchStartX || !touchStartY) return;

                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = touchStartX - touchEndX;
                const deltaY = touchStartY - touchEndY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (Math.abs(deltaX) > 50) {
                        if (deltaX > 0) {
                            // Swipe left - could switch to previous mode
                        } else {
                            // Swipe right - could switch to next mode
                        }
                    }
                }

                touchStartX = 0;
                touchStartY = 0;
            });

            // Voice input simulation (would require Web Speech API in real implementation)
            let isListening = false;
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === ' ') {
                    e.preventDefault();
                    isListening = !isListening;
                    calculator.updateStatus(isListening ? 'Voice input active' : 'Voice input disabled');
                }
            });
        });