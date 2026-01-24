import re
import numpy as np
from collections import Counter

class CareerRecommender:
    def __init__(self):
        self.career_database = self._initialize_career_database()
        self.skill_keywords = self._initialize_skill_keywords()
    
    def _initialize_career_database(self):
        return {
            'Software Engineer': {
                'required_skills': ['python', 'javascript', 'java', 'react', 'node.js', 'sql', 'git', 'html', 'css'],
                'preferred_skills': ['docker', 'kubernetes', 'aws', 'mongodb', 'typescript', 'angular', 'vue'],
                'industries': ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
                'experience_levels': ['Entry', 'Mid', 'Senior'],
                'salary_range': {'min': 65000, 'max': 150000},
                'growth_potential': 'High',
                'remote_friendly': True,
                'interests': ['problem solving', 'technology', 'coding', 'innovation']
            },
            'Data Scientist': {
                'required_skills': ['python', 'r', 'sql', 'machine learning', 'statistics', 'pandas', 'numpy'],
                'preferred_skills': ['tensorflow', 'pytorch', 'tableau', 'power bi', 'spark', 'hadoop'],
                'industries': ['Technology', 'Finance', 'Healthcare', 'Retail', 'Consulting'],
                'experience_levels': ['Mid', 'Senior'],
                'salary_range': {'min': 75000, 'max': 160000},
                'growth_potential': 'Very High',
                'remote_friendly': True,
                'interests': ['data analysis', 'research', 'statistics', 'problem solving']
            },
            'Frontend Developer': {
                'required_skills': ['javascript', 'html', 'css', 'react', 'vue', 'angular'],
                'preferred_skills': ['typescript', 'sass', 'webpack', 'figma', 'responsive design'],
                'industries': ['Technology', 'Media', 'E-commerce', 'Startups'],
                'experience_levels': ['Entry', 'Mid', 'Senior'],
                'salary_range': {'min': 55000, 'max': 130000},
                'growth_potential': 'High',
                'remote_friendly': True,
                'interests': ['user experience', 'design', 'web development', 'creativity']
            },
            'Backend Developer': {
                'required_skills': ['python', 'java', 'node.js', 'sql', 'api', 'microservices'],
                'preferred_skills': ['docker', 'kubernetes', 'aws', 'mongodb', 'redis', 'graphql'],
                'industries': ['Technology', 'Finance', 'Healthcare', 'E-commerce'],
                'experience_levels': ['Entry', 'Mid', 'Senior'],
                'salary_range': {'min': 60000, 'max': 140000},
                'growth_potential': 'High',
                'remote_friendly': True,
                'interests': ['system architecture', 'databases', 'scalability', 'performance']
            },
            'Product Manager': {
                'required_skills': ['product strategy', 'user research', 'analytics', 'agile', 'roadmapping'],
                'preferred_skills': ['sql', 'figma', 'jira', 'a/b testing', 'market research'],
                'industries': ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting'],
                'experience_levels': ['Mid', 'Senior'],
                'salary_range': {'min': 80000, 'max': 170000},
                'growth_potential': 'Very High',
                'remote_friendly': True,
                'interests': ['strategy', 'user experience', 'business', 'leadership']
            },
            'UX/UI Designer': {
                'required_skills': ['figma', 'sketch', 'adobe creative suite', 'user research', 'prototyping'],
                'preferred_skills': ['html', 'css', 'javascript', 'user testing', 'wireframing'],
                'industries': ['Technology', 'Media', 'E-commerce', 'Advertising'],
                'experience_levels': ['Entry', 'Mid', 'Senior'],
                'salary_range': {'min': 50000, 'max': 120000},
                'growth_potential': 'High',
                'remote_friendly': True,
                'interests': ['design', 'user experience', 'creativity', 'psychology']
            },
            'DevOps Engineer': {
                'required_skills': ['docker', 'kubernetes', 'aws', 'jenkins', 'terraform', 'linux'],
                'preferred_skills': ['ansible', 'prometheus', 'grafana', 'helm', 'git', 'python'],
                'industries': ['Technology', 'Finance', 'Healthcare', 'Cloud Services'],
                'experience_levels': ['Mid', 'Senior'],
                'salary_range': {'min': 70000, 'max': 155000},
                'growth_potential': 'Very High',
                'remote_friendly': True,
                'interests': ['automation', 'infrastructure', 'scalability', 'efficiency']
            },
            'Business Analyst': {
                'required_skills': ['sql', 'excel', 'business analysis', 'requirements gathering', 'documentation'],
                'preferred_skills': ['tableau', 'power bi', 'jira', 'agile', 'process improvement'],
                'industries': ['Finance', 'Healthcare', 'Consulting', 'Technology', 'Government'],
                'experience_levels': ['Entry', 'Mid', 'Senior'],
                'salary_range': {'min': 55000, 'max': 110000},
                'growth_potential': 'Medium',
                'remote_friendly': True,
                'interests': ['business', 'analysis', 'problem solving', 'communication']
            },
            'Cybersecurity Specialist': {
                'required_skills': ['network security', 'penetration testing', 'risk assessment', 'compliance'],
                'preferred_skills': ['python', 'linux', 'wireshark', 'metasploit', 'nmap', 'cissp'],
                'industries': ['Technology', 'Finance', 'Government', 'Healthcare', 'Defense'],
                'experience_levels': ['Mid', 'Senior'],
                'salary_range': {'min': 75000, 'max': 165000},
                'growth_potential': 'Very High',
                'remote_friendly': True,
                'interests': ['security', 'ethical hacking', 'risk management', 'technology']
            },
            'Mobile Developer': {
                'required_skills': ['swift', 'kotlin', 'react native', 'flutter', 'mobile ui/ux'],
                'preferred_skills': ['firebase', 'app store optimization', 'push notifications', 'api integration'],
                'industries': ['Technology', 'Gaming', 'E-commerce', 'Social Media'],
                'experience_levels': ['Entry', 'Mid', 'Senior'],
                'salary_range': {'min': 60000, 'max': 135000},
                'growth_potential': 'High',
                'remote_friendly': True,
                'interests': ['mobile technology', 'user experience', 'app development', 'innovation']
            }
        }
    
    def _initialize_skill_keywords(self):
        return {
            'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
            'data': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'tableau', 'power bi', 'spark'],
            'design': ['figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'ui/ux'],
            'mobile': ['ios', 'android', 'react native', 'flutter', 'xamarin'],
            'devops': ['jenkins', 'gitlab', 'ansible', 'prometheus', 'grafana', 'linux']
        }
    
    def _parse_skills(self, skills_text):
        if not skills_text:
            return []
        skills = [skill.strip().lower() for skill in skills_text.split(',')]
        return [skill for skill in skills if skill]
    
    def _parse_experience(self, experience_text):
        if not experience_text:
            return 0
        # Extract years from text like "3 years" or "5 years experience"
        match = re.search(r'(\d+)', str(experience_text))
        return int(match.group(1)) if match else 0
    
    def _calculate_skill_match(self, user_skills, career_skills):
        if not user_skills or not career_skills:
            return 0
        
        user_skills_lower = [skill.lower() for skill in user_skills]
        career_skills_lower = [skill.lower() for skill in career_skills]
        
        matched_skills = []
        for user_skill in user_skills_lower:
            for career_skill in career_skills_lower:
                if user_skill in career_skill or career_skill in user_skill:
                    matched_skills.append(career_skill)
                    break
        
        return len(matched_skills) / len(career_skills_lower) * 100
    
    def _calculate_interest_match(self, user_interests, career_interests):
        if not user_interests or not career_interests:
            return 50  # Default neutral score
        
        user_interests_lower = [interest.strip().lower() for interest in user_interests]
        career_interests_lower = [interest.lower() for interest in career_interests]
        
        matches = 0
        for user_interest in user_interests_lower:
            for career_interest in career_interests_lower:
                if user_interest in career_interest or career_interest in user_interest:
                    matches += 1
                    break
        
        return min(matches / len(career_interests_lower) * 100, 100)
    
    def _calculate_salary_range(self, base_salary, experience_years, skill_match_score):
        experience_multiplier = 1 + (experience_years * 0.08)  # 8% per year
        skill_multiplier = 1 + (skill_match_score / 100 * 0.3)  # Up to 30% for perfect skill match
        
        adjusted_min = int(base_salary['min'] * experience_multiplier * skill_multiplier)
        adjusted_max = int(base_salary['max'] * experience_multiplier * skill_multiplier)
        
        return {
            'min': adjusted_min,
            'max': adjusted_max,
            'currency': 'USD'
        }
    
    def predict(self, user_data):
        # Parse user input
        user_skills = self._parse_skills(user_data.get('skills', ''))
        user_interests = self._parse_skills(user_data.get('interests', ''))
        user_goals = self._parse_skills(user_data.get('goals', ''))
        experience_years = self._parse_experience(user_data.get('experience', '0'))
        education = user_data.get('education', '').lower()
        
        recommendations = []
        
        # Calculate matches for each career
        for career_name, career_info in self.career_database.items():
            # Calculate skill match
            required_skill_match = self._calculate_skill_match(user_skills, career_info['required_skills'])
            preferred_skill_match = self._calculate_skill_match(user_skills, career_info['preferred_skills'])
            overall_skill_match = (required_skill_match * 0.7) + (preferred_skill_match * 0.3)
            
            # Calculate interest match
            interest_match = self._calculate_interest_match(user_interests + user_goals, career_info['interests'])
            
            # Calculate experience match
            experience_match = 100
            if experience_years == 0 and 'Entry' not in career_info['experience_levels']:
                experience_match = 60
            elif experience_years >= 5 and 'Senior' not in career_info['experience_levels']:
                experience_match = 80
            
            # Calculate education bonus
            education_bonus = 0
            if 'master' in education or 'mba' in education:
                education_bonus = 10
            elif 'phd' in education or 'doctorate' in education:
                education_bonus = 15
            
            # Calculate overall match percentage
            overall_match = (
                overall_skill_match * 0.4 +
                interest_match * 0.3 +
                experience_match * 0.2 +
                education_bonus * 0.1
            )
            
            # Calculate confidence based on data quality
            confidence = min(overall_match / 100, 0.95)
            
            # Get matched and missing skills
            matched_required = []
            missing_required = []
            
            for skill in career_info['required_skills']:
                found = False
                for user_skill in user_skills:
                    if user_skill.lower() in skill.lower() or skill.lower() in user_skill.lower():
                        matched_required.append(skill)
                        found = True
                        break
                if not found:
                    missing_required.append(skill)
            
            # Calculate salary range
            salary_range = self._calculate_salary_range(
                career_info['salary_range'], 
                experience_years, 
                overall_skill_match
            )
            
            recommendation = {
                'career': career_name,
                'match_percentage': round(overall_match, 1),
                'skill_match': round(overall_skill_match, 1),
                'confidence': round(confidence, 3),
                'salary_range': salary_range,
                'industries': career_info['industries'][:3],  # Top 3 industries
                'experience_level': self._get_experience_level(experience_years),
                'growth_potential': career_info['growth_potential'],
                'remote_friendly': career_info['remote_friendly'],
                'matched_required_skills': matched_required[:5],  # Top 5 matches
                'missing_required_skills': missing_required[:5]   # Top 5 missing
            }
            
            recommendations.append(recommendation)
        
        # Sort by match percentage and return top 5
        recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)
        top_recommendations = recommendations[:5]
        
        # Add insights
        insights = self._generate_insights(user_skills, user_interests, experience_years, top_recommendations)
        
        return {
            'recommendations': top_recommendations,
            'insights': insights
        }
    
    def _get_experience_level(self, years):
        if years == 0:
            return 'Entry Level'
        elif years <= 3:
            return 'Junior Level'
        elif years <= 7:
            return 'Mid Level'
        else:
            return 'Senior Level'
    
    def _generate_insights(self, user_skills, user_interests, experience_years, recommendations):
        insights = []
        
        if not user_skills:
            insights.append("Consider adding more specific technical skills to improve your matches.")
        
        if experience_years == 0:
            insights.append("Entry-level positions are great starting points. Focus on building a strong portfolio.")
        elif experience_years >= 5:
            insights.append("Your experience level qualifies you for senior positions with higher salaries.")
        
        if recommendations:
            top_career = recommendations[0]
            if top_career['match_percentage'] >= 80:
                insights.append(f"You're an excellent match for {top_career['career']} roles!")
            elif top_career['match_percentage'] >= 60:
                insights.append(f"You have good potential for {top_career['career']} with some skill development.")
            
            if top_career['missing_required_skills']:
                missing_skills = ', '.join(top_career['missing_required_skills'][:3])
                insights.append(f"Consider learning {missing_skills} to strengthen your profile.")
        
        # Skill category analysis
        skill_categories = Counter()
        for skill in user_skills:
            for category, keywords in self.skill_keywords.items():
                if any(keyword in skill.lower() for keyword in keywords):
                    skill_categories[category] += 1
        
        if skill_categories:
            top_category = skill_categories.most_common(1)[0][0]
            insights.append(f"Your strongest skill area is {top_category}. Consider roles that leverage this expertise.")
        
        return insights[:4]  # Return top 4 insights