const axios = require('axios');
const User = require('../models/User');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const getCareerSuggestions = async (req, res) => {
  try {
    const { skills, interests, education, experience, goals } = req.body;
    
    // Prepare data for ML service - pass user input directly
    const mlData = {
      skills: skills || '',
      interests: interests || '',
      education: education || '',
      experience: experience || '',
      goals: goals || ''
    };
    
    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/career/recommend`, mlData);
    
    // Save to user history if user exists
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          careerHistory: {
            input: mlData,
            recommendations: response.data.recommendations,
            insights: response.data.insights,
            timestamp: new Date()
          }
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: response.data.recommendations,
      insights: response.data.insights
    });
  } catch (error) {
    console.error('Career suggestions error:', error.message);
    
    // Extract user input for salary calculation
    const userInput = req.body;
    const experienceYears = parseInt(userInput.experience?.match(/\d+/)?.[0] || '0');
    const skillsCount = userInput.skills?.split(',').length || 3;
    const educationLevel = userInput.education?.toLowerCase().includes('master') ? 1.2 : 
                          userInput.education?.toLowerCase().includes('phd') ? 1.4 : 1.0;
    
    const calculateSalary = (baseMin, baseMax, multiplier = 1) => {
      const expBonus = experienceYears * 8000;
      const skillBonus = skillsCount * 2000;
      const eduBonus = (educationLevel - 1) * 15000;
      
      return {
        min: Math.round((baseMin + expBonus + skillBonus + eduBonus) * multiplier),
        max: Math.round((baseMax + expBonus * 1.5 + skillBonus * 2 + eduBonus * 1.5) * multiplier),
        currency: 'USD'
      };
    };
    
    const fallbackRecommendations = [
      { 
        career: 'Software Engineer', 
        confidence: 0.85, 
        match_percentage: 85,
        skill_match: 80,
        salary_range: calculateSalary(65000, 120000),
        industries: ['Technology', 'Finance', 'Healthcare'],
        experience_level: experienceYears === 0 ? 'Entry Level' : experienceYears <= 3 ? 'Junior Level' : 'Mid Level',
        growth_potential: 'High',
        remote_friendly: true,
        matched_required_skills: ['javascript', 'html', 'css'],
        missing_required_skills: ['python', 'react', 'sql']
      },
      { 
        career: 'Data Analyst', 
        confidence: 0.75, 
        match_percentage: 75,
        skill_match: 70,
        salary_range: calculateSalary(55000, 95000),
        industries: ['Finance', 'Healthcare', 'Technology'],
        experience_level: experienceYears === 0 ? 'Entry Level' : experienceYears <= 3 ? 'Junior Level' : 'Mid Level',
        growth_potential: 'Medium',
        remote_friendly: true,
        matched_required_skills: ['sql', 'excel'],
        missing_required_skills: ['python', 'tableau', 'statistics']
      },
      { 
        career: 'Product Manager', 
        confidence: 0.70, 
        match_percentage: 70,
        skill_match: 65,
        salary_range: calculateSalary(75000, 140000),
        industries: ['Technology', 'E-commerce', 'Finance'],
        experience_level: experienceYears === 0 ? 'Entry Level' : experienceYears <= 3 ? 'Junior Level' : 'Mid Level',
        growth_potential: 'Very High',
        remote_friendly: true,
        matched_required_skills: ['analytics', 'communication'],
        missing_required_skills: ['product strategy', 'user research', 'agile']
      }
    ];
    
    // Save fallback to user history if user is authenticated
    if (req.user) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            careerHistory: {
              input: req.body,
              recommendations: fallbackRecommendations,
              timestamp: new Date(),
              fallback: true
            }
          }
        });
      } catch (dbError) {
        console.error('Failed to save fallback history:', dbError.message);
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: fallbackRecommendations,
      message: 'Using fallback recommendations (ML service unavailable)'
    });
  }
};

const generateCareerReport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const latestRecommendation = user.careerHistory?.[user.careerHistory.length - 1];
    
    if (!latestRecommendation) {
      return res.status(400).json({
        status: 'error',
        message: 'No career recommendations found. Please get suggestions first.'
      });
    }
    
    const report = {
      user: {
        name: user.name,
        email: user.email
      },
      recommendations: latestRecommendation.recommendations,
      analysis: {
        topCareer: latestRecommendation.recommendations[0],
        strengthAreas: ['Technical Skills', 'Problem Solving'],
        improvementAreas: ['Leadership', 'Communication'],
        nextSteps: [
          'Develop skills in recommended career areas',
          'Gain relevant experience through projects',
          'Network with professionals in target field'
        ]
      },
      generatedAt: new Date()
    };
    
    res.status(200).json({
      status: 'success',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate career report',
      error: error.message
    });
  }
};

const getCareerHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('careerHistory');
    
    res.status(200).json({
      status: 'success',
      data: user.careerHistory || []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get career history',
      error: error.message
    });
  }
};

const deleteCareerHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { careerHistory: 1 }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Career history deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete career history',
      error: error.message
    });
  }
};

module.exports = {
  getCareerSuggestions,
  generateCareerReport,
  getCareerHistory,
  deleteCareerHistory
};
