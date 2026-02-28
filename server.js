const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON bodies

// API Route for Claim Analysis
app.post('/api/analyze-claim', (req, res) => {
    try {
        const { amount, diagCode, providerId } = req.body;

        // Input Validation
        if (amount === undefined || !diagCode || !providerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate Prediction (Mock ML Logic moved from frontend)
        const prediction = generatePrediction(parseFloat(amount), diagCode, providerId);

        // Simulate a slight network/processing delay (e.g. 1.5 seconds)
        setTimeout(() => {
            res.json(prediction);
        }, 1500);

    } catch (error) {
        console.error('Error processing claim:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mock ML Model Function
function generatePrediction(amount, code, provider) {
    let score = 15; // Base legit score
    let factors = [];

    // Fictional risk logic based on amount
    if (amount > 10000) {
        score += 40;
        factors.push(`Unusually high claim amount (₹${amount}) for typical percentile`);
    } else if (amount > 5000) {
        score += 20;
        factors.push("Claim amount exceeds standard threshold");
    }

    // Fictional risk logic based on diagnosis code
    if (code.toUpperCase().startsWith('X') || code.toUpperCase().includes('99')) {
        score += 35;
        factors.push(`Suspicious/Rare diagnosis code format (${code.toUpperCase()})`);
    }

    // Fictional risk logic based on provider ID
    if (provider.length < 5) {
        score += 10;
        factors.push("Unrecognized or new provider ID structure");
    }

    // Add some randomness
    score += Math.floor(Math.random() * 10);

    // Cap score between 5 and 98
    score = Math.min(Math.max(score, 5), 98);

    // Determine classification class
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
