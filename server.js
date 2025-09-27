const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Initialize Google GenAI client
const ai = new GoogleGenAI({});

// Load your experience text from PDF
let experienceText = '';
try {
  const textPath = path.join(__dirname, 'backend', 'experience-text.txt');
  experienceText = fs.readFileSync(textPath, 'utf8');
  console.log('Experience text loaded successfully!');
} catch (error) {
  console.error('Error loading experience text:', error);
  // Fallback to case studies if PDF text not available
  experienceText = `E-commerce Platform Redesign: Led the complete redesign of a major e-commerce platform, resulting in a 40% increase in conversion rates and improved user engagement. Implemented modern design patterns and optimized the checkout flow for better user experience.

Mobile Banking App: Designed and developed a mobile banking application from concept to launch. The app serves over 100,000 users and features secure authentication, real-time transactions, and intuitive financial management tools.

Data Visualization Dashboard: Created an interactive dashboard for analyzing complex datasets. The tool enables users to explore data through custom visualizations and export insights for business decision-making processes.

AI-Powered Content Platform: Developed a content management system with integrated AI capabilities for automated content generation and optimization. The platform serves media companies and content creators with intelligent workflow automation.`;
}

// Function to call Gemini API using Google GenAI SDK
async function callGeminiAPI(query) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  
  const prompt = `You are Aaron Ries, a digital product developer. Based on this experience and background:

${experienceText}

User question: ${query}

IMPORTANT: Provide a helpful, professional response about Aaron's experience and projects. Keep it conversational and informative. Your response must be EXACTLY 150 words or fewer. Count your words carefully and stop at 150 words maximum.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    
    let responseText = response.text;
    
    // Enforce 150 word limit
    const words = responseText.split(' ');
    if (words.length > 150) {
      responseText = words.slice(0, 150).join(' ') + '...';
    }
    
    return responseText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// Search endpoint
app.post('/search', async (req, res) => {
  const { query } = req.body;
  
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const answer = await callGeminiAPI(query);
    res.json({ answer });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error processing your request. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
