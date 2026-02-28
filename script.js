// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // Handle Form Submission and Mock ML Analysis
    const form = document.getElementById('claimForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const loader = analyzeBtn.querySelector('.loader');

    const resultStateDef = document.getElementById('resultState');
    const predictionContent = document.getElementById('predictionResult');

    // UI Elements for prediction
    const riskCircle = document.getElementById('riskCircle');
    const riskScoreEl = document.getElementById('riskScore');
    const predictionDecisionEl = document.getElementById('predictionDecision');
    const confidenceLevelEl = document.getElementById('confidenceLevel');
    const factorsListEl = document.getElementById('factorsList');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Get input values
        const amount = parseFloat(document.getElementById('claimAmount').value);
        const diagCode = document.getElementById('diagnosisCode').value;
        const providerId = document.getElementById('providerId').value;

        // 2. Loading State
        analyzeBtn.disabled = true;
        btnText.textContent = 'Processing...';
        loader.style.display = 'block';

        // Hide previous results if any
        predictionContent.style.opacity = '0';
        setTimeout(() => {
            resultStateDef.style.display = 'none';
            predictionContent.style.display = 'flex';
        }, 300);

        // 3. Simulate Network/Model Delay (2 seconds)
        setTimeout(() => {
            // Restore button
            analyzeBtn.disabled = false;
            btnText.textContent = 'Analyze Claim';
            loader.style.display = 'none';

            // 4. Generate Mock Prediction based on inputs
            const prediction = generateMockPrediction(amount, diagCode, providerId);

            // 5. Update UI
            updatePredictionUI(prediction);
            predictionContent.style.opacity = '1';

            // Scroll to results on mobile
            if (window.innerWidth < 992) {
                document.querySelector('.results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        }, 2000);
    });

    function generateMockPrediction(amount, code, provider) {
        // Simple mock logic to make output feel dynamic based on input
        let score = 15; // Base legit score
        let factors = [];

        // Fictional risk logic
        if (amount > 10000) {
            score += 40;
            factors.push(`Unusually high claim amount (₹${amount}) for typical percentile`);
        } else if (amount > 5000) {
            score += 20;
            factors.push("Claim amount exceeds standard threshold");
        }

        if (code.toUpperCase().startsWith('X') || code.toUpperCase().includes('99')) {
            score += 35;
            factors.push(`Suspicious/Rare diagnosis code format (${code.toUpperCase()})`);
        }

        if (provider.length < 5) {
            score += 10;
            factors.push("Unrecognized or new provider ID structure");
        }

        // Add some randomness
        score += Math.floor(Math.random() * 10);

        // Cap score
        score = Math.min(Math.max(score, 5), 98);

        // Determine class
        let decision = 'Legitimate';
        let decisionClass = 'legit';
        let confidence = (100 - score).toFixed(1);

        if (score > 75) {
            decision = 'Fraud Detected';
            decisionClass = 'fraud';
            confidence = score.toFixed(1);
            if (factors.length === 0) factors.push("Unusual billing pattern detected by neural net");
        } else if (score > 45) {
            decision = 'Manual Review Needed';
            decisionClass = 'review';
            confidence = 88.5; // Fixed reasonable confidence for ambiguity
            if (factors.length === 0) factors.push("Minor anomaly in historical context");
        } else {
            if (factors.length === 0) factors.push("Matches standard historical claim profiles");
            factors.push("Provider has high trust score");
        }

        return {
            score,
            decision,
            decisionClass,
            confidence,
            factors
        };
    }

    function updatePredictionUI(data) {
        // Animate counter
        animateValue(riskScoreEl, 0, data.score, 1000);

        // Update styling
        riskCircle.style.borderColor =
            data.decisionClass === 'fraud' ? '#ff4757' :
                data.decisionClass === 'legit' ? '#2ed573' : '#ffa502';

        riskCircle.style.boxShadow =
            data.decisionClass === 'fraud' ? '0 0 30px rgba(255, 71, 87, 0.4)' :
                data.decisionClass === 'legit' ? '0 0 30px rgba(46, 213, 115, 0.4)' : '0 0 30px rgba(255, 165, 2, 0.4)';

        // Update Text
        predictionDecisionEl.textContent = data.decision;
        predictionDecisionEl.className = `decision ${data.decisionClass}`;

        confidenceLevelEl.textContent = data.confidence;

        // Update Factors
        factorsListEl.innerHTML = '';
        data.factors.forEach(factor => {
            const li = document.createElement('li');
            li.textContent = factor;
            factorsListEl.appendChild(li);
        });
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing out function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentVal = Math.floor(easeOutQuart * (end - start) + start);
            obj.innerHTML = currentVal;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }
});
