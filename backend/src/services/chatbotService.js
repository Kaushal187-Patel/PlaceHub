const axios = require('axios');
const User = require('../models/User');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

class ChatbotService {
  constructor() {
    this.sessionMemory = new Map(); // Store conversation context
  }

  async processMessage(userId, message, userRole) {
    try {
      // Get or create session context
      const sessionId = userId || 'anonymous';
      let context = this.sessionMemory.get(sessionId) || {
        messages: [],
        userProfile: null,
        lastRecommendations: null
      };

      // Add user message to context
      context.messages.push({ role: 'user', content: message, timestamp: new Date() });

      // Determine intent and generate response
      const intent = this.classifyIntent(message);
      let response;

      try {
        switch (intent) {
          case 'career_advice':
            response = await this.handleCareerAdvice(message, context, userRole);
            break;
          case 'job_search':
            response = this.handleJobSearch(message, context, userRole);
            break;
          case 'resume_help':
            response = this.handleResumeHelp(message, context, userRole);
            break;
          case 'skill_development':
            response = this.handleSkillDevelopment(message, context, userRole);
            break;
          case 'platform_navigation':
            response = this.handlePlatformNavigation(message, userRole);
            break;
          default:
            response = this.handleGeneralQuery(message, context, userRole);
        }
      } catch (intentError) {
        console.error('Intent handling error:', intentError);
        response = this.getFallbackResponse(message, userRole);
      }

      // Add bot response to context
      context.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
      
      // Update session memory
      this.sessionMemory.set(sessionId, context);

      return response;
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return this.getFallbackResponse(message, userRole);
    }
  }

  classifyIntent(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('career') || msg.includes('job role') || msg.includes('what should i') || msg.includes('career path')) {
      return 'career_advice';
    }
    if (msg.includes('job') || msg.includes('position') || msg.includes('hiring') || msg.includes('apply')) {
      return 'job_search';
    }
    if (msg.includes('resume') || msg.includes('cv') || msg.includes('application')) {
      return 'resume_help';
    }
    if (msg.includes('skill') || msg.includes('learn') || msg.includes('course') || msg.includes('training')) {
      return 'skill_development';
    }
    if (msg.includes('how to') || msg.includes('navigate') || msg.includes('find') || msg.includes('where')) {
      return 'platform_navigation';
    }
    
    return 'general';
  }

  async handleCareerAdvice(message, context, userRole) {
    if (userRole === 'student') {
      return `Here's some career advice for you:

🎯 **Popular Career Paths**:
• **Software Engineer** - High demand, $65k-$150k salary
• **Data Scientist** - Growing field, $75k-$160k salary
• **Product Manager** - Leadership role, $80k-$170k salary

💡 **Career Tips**:
• Build a strong portfolio with projects
• Network with professionals in your field
• Keep learning new skills and technologies
• Consider internships for experience

📚 **Next Steps**:
• Identify your interests and strengths
• Research job requirements in your target field
• Start building relevant skills

What specific career area interests you most?`;
    } else {
      return `Recruiting insights for you:

📈 **Market Trends**:
• Remote work is now standard
• Skills-based hiring is increasing
• Candidate experience is crucial

🎯 **Top In-Demand Roles**:
• Software Engineers
• Data Scientists
• DevOps Engineers
• Product Managers

💡 **Hiring Best Practices**:
• Write clear job descriptions
• Respond quickly to applications
• Focus on cultural fit
• Offer competitive packages

What type of role are you looking to fill?`;
    }
  }

  handleJobSearch(message, context, userRole) {
    if (userRole === 'student') {
      const skills = this.extractSkillsFromProfile(context.userProfile);
      return `Here are some job search strategies based on your skills (${skills.slice(0, 3).join(', ')}):

🔍 **Search Tips**:
• Use keywords: ${skills.slice(0, 5).join(', ')}
• Target companies in: Technology, Finance, Healthcare
• Apply to 5-10 jobs per week for best results

📝 **Application Strategy**:
• Customize your resume for each application
• Write compelling cover letters
• Follow up after 1 week

Would you like me to help you find specific job opportunities or review your application materials?`;
    } else {
      return `Here are effective recruiting strategies:

🎯 **Candidate Sourcing**:
• Use skills-based search filters
• Look for candidates with 2-5 years experience for mid-level roles
• Consider remote candidates to expand your talent pool

📊 **Market Insights**:
• Average time-to-hire: 23 days
• Top candidate priorities: Remote work, career growth, competitive salary

What type of role are you looking to fill? I can suggest specific candidate profiles.`;
    }
  }

  handleResumeHelp(message, context, userRole) {
    if (userRole === 'student') {
      return `Here are key resume tips for your profile:

✅ **Essential Sections**:
• Professional summary highlighting your key skills
• Skills section with: ${this.extractSkillsFromProfile(context.userProfile).slice(0, 5).join(', ')}
• Projects showcasing practical experience
• Education and relevant coursework

🎯 **Optimization Tips**:
• Use action verbs (Developed, Implemented, Managed)
• Quantify achievements (Increased efficiency by 30%)
• Keep it to 1-2 pages
• Use ATS-friendly formatting

Would you like me to analyze your current resume or help with a specific section?`;
    } else {
      return `Resume screening best practices for recruiters:

🔍 **What to Look For**:
• Relevant skills matching job requirements
• Quantified achievements and impact
• Career progression and growth
• Cultural fit indicators

⚡ **Quick Screening Tips**:
• Spend 6-10 seconds on initial scan
• Look for keywords in first third of resume
• Check for employment gaps and explanations

Need help evaluating a specific candidate profile?`;
    }
  }

  handleSkillDevelopment(message, context, userRole) {
    if (userRole === 'student') {
      const currentSkills = this.extractSkillsFromProfile(context.userProfile);
      const recommendations = context.lastRecommendations;
      
      let skillSuggestions = ['JavaScript', 'Python', 'SQL', 'Communication', 'Problem Solving'];
      
      if (recommendations && recommendations[0]?.missing_required_skills) {
        skillSuggestions = recommendations[0].missing_required_skills.slice(0, 5);
      }

      return `Based on your career goals, here are priority skills to develop:

🎯 **High-Priority Skills**:
${skillSuggestions.map((skill, i) => `${i + 1}. **${skill}**`).join('\n')}

📚 **Learning Resources**:
• Online courses: Coursera, Udemy, edX
• Practice platforms: LeetCode, HackerRank
• Free resources: freeCodeCamp, Khan Academy

⏱️ **Learning Plan**:
• Dedicate 1-2 hours daily
• Focus on one skill at a time
• Build projects to practice

Which skill would you like to start with? I can provide specific learning resources.`;
    } else {
      return `Skills development insights for your hiring needs:

📈 **In-Demand Skills by Role**:
• **Software Engineers**: React, Node.js, AWS, Docker
• **Data Scientists**: Python, SQL, Machine Learning, Tableau
• **Product Managers**: Analytics, User Research, Agile

💡 **Upskilling Your Team**:
• Provide learning budgets ($1000-2000/year per employee)
• Encourage internal knowledge sharing
• Support conference attendance

What roles are you looking to strengthen in your organization?`;
    }
  }

  handlePlatformNavigation(message, userRole) {
    if (userRole === 'student') {
      return `Here's how to navigate PlacementHub effectively:

🏠 **Dashboard**: View your career recommendations and progress
📊 **Career Recommendations**: Get AI-powered career suggestions
📄 **Resume Analyzer**: Upload and get detailed resume feedback
💼 **Jobs**: Browse and apply to relevant positions
👤 **Profile**: Update your skills, experience, and preferences

🎯 **Quick Tips**:
• Complete your profile for better recommendations
• Upload your resume for personalized analysis
• Check job matches daily for new opportunities

What specific feature would you like help with?`;
    } else {
      return `Recruiter platform navigation guide:

🏠 **Recruiter Dashboard**: Manage job postings and candidates
📝 **Post Jobs**: Create detailed job listings
👥 **Candidate Search**: Find qualified candidates
📊 **Analytics**: Track hiring metrics and performance
💬 **Messages**: Communicate with potential hires

🎯 **Best Practices**:
• Keep job postings updated and detailed
• Use filters to find the right candidates
• Respond to applications within 48 hours

Which recruiting feature can I help you with?`;
    }
  }

  handleGeneralQuery(message, context, userRole) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
    const msg = message.toLowerCase();
    
    if (greetings.some(greeting => msg.includes(greeting))) {
      const userName = context.userProfile?.name || 'there';
      if (userRole === 'student') {
        return `Hello ${userName}! 👋 I'm your AI career assistant. I can help you with:

🎯 Career guidance and recommendations
💼 Job search strategies
📄 Resume optimization
📚 Skill development advice
🧭 Platform navigation

What would you like to explore today?`;
      } else {
        return `Hello ${userName}! 👋 I'm here to assist with your recruiting needs:

👥 Candidate recommendations
📝 Job posting optimization
📊 Market insights and trends
🎯 Hiring best practices
🧭 Platform features

How can I help you find the right talent today?`;
      }
    }

    return `I'm here to help! I can assist with:
• Career advice and recommendations
• Job search guidance
• Resume tips and analysis
• Skill development suggestions
• Platform navigation

What specific question do you have?`;
  }

  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  extractSkillsFromProfile(profile) {
    if (!profile) return [];
    
    // Extract skills from various profile fields
    const skills = [];
    
    if (profile.skills) {
      skills.push(...profile.skills);
    }
    
    // Add some default skills based on common patterns
    const defaultSkills = ['Communication', 'Problem Solving', 'Teamwork', 'Time Management'];
    skills.push(...defaultSkills);
    
    return [...new Set(skills)]; // Remove duplicates
  }

  getFallbackResponse(message, userRole) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi')) {
      return userRole === 'student' 
        ? "Hello! I'm here to help with your career journey. Ask me about career advice, job search tips, or skill development!"
        : "Hello! I can help you with recruiting insights, candidate recommendations, and hiring best practices.";
    }
    
    if (msg.includes('help')) {
      return userRole === 'student'
        ? "I can help you with:\n• Career recommendations\n• Job search strategies\n• Resume tips\n• Skill development\n• Platform navigation\n\nWhat would you like to know?"
        : "I can assist with:\n• Candidate sourcing\n• Market insights\n• Hiring best practices\n• Job posting tips\n\nHow can I help you today?";
    }
    
    return userRole === 'student'
      ? "I'm here to help with your career development! Try asking about career advice, job search tips, resume help, or skill development."
      : "I'm here to support your recruiting efforts! Ask me about candidate sourcing, market trends, or hiring strategies.";
  }

  clearSession(userId) {
    this.sessionMemory.delete(userId);
  }
}

module.exports = new ChatbotService();