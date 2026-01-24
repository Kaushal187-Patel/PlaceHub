const OpenAI = require('openai');

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Store conversation history in memory (use Redis in production)
const conversations = new Map();

// Fallback career advice responses
const getCareerAdviceResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
    return "Here are some resume tips:\n\n• **Keep it concise**: 1-2 pages maximum\n• **Use action verbs**: Started, managed, developed, etc.\n• **Quantify achievements**: Include numbers and percentages\n• **Tailor for each job**: Match keywords from job descriptions\n• **Professional format**: Clean, readable layout\n\nWould you like specific advice for any section of your resume?";
  }
  
  if (lowerMessage.includes('interview')) {
    return "Interview preparation tips:\n\n• **Research the company**: Know their mission, values, recent news\n• **Practice common questions**: Tell me about yourself, strengths/weaknesses\n• **Prepare STAR examples**: Situation, Task, Action, Result\n• **Ask thoughtful questions**: About role, team, company culture\n• **Professional appearance**: Dress appropriately for company culture\n\nWhat specific aspect of interviewing would you like to discuss?";
  }
  
  if (lowerMessage.includes('career change') || lowerMessage.includes('transition')) {
    return "Career transition strategies:\n\n• **Assess transferable skills**: What applies to your new field?\n• **Network actively**: Connect with professionals in target industry\n• **Gain relevant experience**: Volunteer, freelance, or take courses\n• **Update your brand**: LinkedIn, resume, portfolio\n• **Consider gradual transition**: Part-time or consulting first\n\nWhat field are you looking to transition into?";
  }
  
  if (lowerMessage.includes('salary') || lowerMessage.includes('negotiate')) {
    return "Salary negotiation tips:\n\n• **Research market rates**: Use Glassdoor, PayScale, industry reports\n• **Know your value**: List achievements and contributions\n• **Consider total package**: Benefits, PTO, flexibility\n• **Practice your pitch**: Be confident but respectful\n• **Get it in writing**: Confirm agreed terms\n\nWhat's your current situation with salary discussions?";
  }
  
  if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
    return "Skill development recommendations:\n\n• **Identify gaps**: What skills does your target role require?\n• **Online learning**: Coursera, Udemy, LinkedIn Learning\n• **Certifications**: Industry-recognized credentials\n• **Practice projects**: Build portfolio pieces\n• **Mentorship**: Find experienced professionals to guide you\n\nWhat specific skills are you looking to develop?";
  }
  
  return "I'm here to help with your career questions! I can assist with:\n\n• **Resume & CV writing**\n• **Interview preparation**\n• **Career transitions**\n• **Skill development**\n• **Salary negotiations**\n• **Job search strategies**\n• **Professional networking**\n\nWhat specific career topic would you like to explore?";
};

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    // Get or create conversation history
    let conversation = conversations.get(userId) || [];
    
    // Add user message to conversation
    conversation.push({ role: 'user', content: message });
    
    // Create system prompt for career assistant
    const systemPrompt = {
      role: 'system',
      content: `You are Aspira, an AI career assistant for a career platform. You help users with:
      - Career advice and guidance
      - Job search strategies
      - Resume and interview tips
      - Skill development recommendations
      - Industry insights
      - Career transitions
      - Professional networking advice
      
      Be helpful, professional, and provide detailed, actionable advice. Keep responses conversational but informative.`
    };

    // Prepare messages for OpenAI
    const messages = [systemPrompt, ...conversation.slice(-10)]; // Keep last 10 messages for context

    let aiResponse;
    
    if (openai) {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });
      aiResponse = completion.choices[0].message.content;
    } else {
      // Fallback responses when OpenAI is not configured
      aiResponse = getCareerAdviceResponse(message);
    }
    
    // Add AI response to conversation
    conversation.push({ role: 'assistant', content: aiResponse });
    
    // Store updated conversation
    conversations.set(userId, conversation);

    res.status(200).json({
      status: 'success',
      message: aiResponse
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponses = [
      "I'm here to help with your career questions! Could you tell me more about what you're looking for?",
      "That's a great question! I'd be happy to help you with career advice. What specific area would you like to explore?",
      "I'm experiencing some technical difficulties, but I'm still here to help! What career topic can I assist you with?",
      "Let me help you with that! What aspect of your career development are you most interested in discussing?"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.status(200).json({
      status: 'success',
      message: randomResponse
    });
  }
};

const clearSession = async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous';
    conversations.delete(userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Session cleared successfully'
    });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear session'
    });
  }
};

module.exports = {
  sendMessage,
  clearSession,
  getCareerAdviceResponse
};