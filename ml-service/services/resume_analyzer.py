import PyPDF2
import docx
import re
import io
from collections import Counter

class ResumeAnalyzer:
    def __init__(self):
        self.job_requirements = self._initialize_job_requirements()
        self.skill_patterns = self._initialize_skill_patterns()
    
    def _initialize_job_requirements(self):
        return {
            'Software Developer': {
                'required_skills': ['python', 'javascript', 'java', 'html', 'css', 'sql', 'git'],
                'preferred_skills': ['react', 'node.js', 'docker', 'aws', 'mongodb', 'typescript'],
                'experience_keywords': ['development', 'programming', 'coding', 'software', 'application'],
                'education_keywords': ['computer science', 'software engineering', 'information technology']
            },
            'Data Scientist': {
                'required_skills': ['python', 'r', 'sql', 'machine learning', 'statistics', 'pandas', 'numpy'],
                'preferred_skills': ['tensorflow', 'pytorch', 'tableau', 'power bi', 'spark', 'hadoop'],
                'experience_keywords': ['data analysis', 'machine learning', 'statistics', 'modeling', 'research'],
                'education_keywords': ['data science', 'statistics', 'mathematics', 'computer science']
            },
            'Frontend Developer': {
                'required_skills': ['javascript', 'html', 'css', 'react', 'vue', 'angular'],
                'preferred_skills': ['typescript', 'sass', 'webpack', 'figma', 'responsive design'],
                'experience_keywords': ['frontend', 'ui', 'user interface', 'web development', 'responsive'],
                'education_keywords': ['computer science', 'web development', 'design']
            },
            'Backend Developer': {
                'required_skills': ['python', 'java', 'node.js', 'sql', 'api', 'microservices'],
                'preferred_skills': ['docker', 'kubernetes', 'aws', 'mongodb', 'redis', 'graphql'],
                'experience_keywords': ['backend', 'server', 'api', 'database', 'microservices'],
                'education_keywords': ['computer science', 'software engineering']
            },
            'UX Designer': {
                'required_skills': ['figma', 'sketch', 'adobe creative suite', 'user research', 'prototyping'],
                'preferred_skills': ['html', 'css', 'javascript', 'user testing', 'wireframing'],
                'experience_keywords': ['ux', 'user experience', 'design', 'prototyping', 'research'],
                'education_keywords': ['design', 'human computer interaction', 'psychology']
            },
            'DevOps Engineer': {
                'required_skills': ['docker', 'kubernetes', 'aws', 'jenkins', 'terraform', 'linux'],
                'preferred_skills': ['ansible', 'prometheus', 'grafana', 'helm', 'git'],
                'experience_keywords': ['devops', 'infrastructure', 'deployment', 'automation', 'ci/cd'],
                'education_keywords': ['computer science', 'information technology', 'engineering']
            },
            'Product Manager': {
                'required_skills': ['product strategy', 'user research', 'analytics', 'agile', 'roadmapping'],
                'preferred_skills': ['sql', 'figma', 'jira', 'a/b testing', 'market research'],
                'experience_keywords': ['product management', 'strategy', 'roadmap', 'stakeholder', 'agile'],
                'education_keywords': ['business', 'mba', 'engineering', 'computer science']
            }
        }
    
    def _initialize_skill_patterns(self):
        return {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
            'data': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'tableau', 'power bi', 'spark'],
            'design': ['figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'ui/ux'],
            'mobile': ['ios', 'android', 'react native', 'flutter', 'xamarin'],
            'devops': ['jenkins', 'gitlab', 'ansible', 'prometheus', 'grafana', 'linux']
        }
    
    def extract_text_from_pdf(self, file_stream):
        text = ""
        try:
            pdf_reader = PyPDF2.PdfReader(file_stream)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
        return text
    
    def extract_text_from_docx(self, file_stream):
        text = ""
        try:
            doc = docx.Document(file_stream)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
        return text
    
    def extract_text(self, file):
        filename = file.filename.lower()
        
        # Handle text files for testing
        if filename.endswith('.txt'):
            return file.read().decode('utf-8')
        
        file_stream = io.BytesIO(file.read())
        
        if filename.endswith('.pdf'):
            return self.extract_text_from_pdf(file_stream)
        elif filename.endswith('.docx'):
            return self.extract_text_from_docx(file_stream)
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX files.")
    
    def extract_skills(self, text):
        text_lower = text.lower()
        found_skills = []
        skill_categories = {}
        
        # Extract skills by category
        for category, skills in self.skill_patterns.items():
            category_skills = []
            for skill in skills:
                # Use word boundaries for better matching
                pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.append(skill)
                    category_skills.append(skill)
            
            if category_skills:
                skill_categories[category.title()] = category_skills
        
        return list(set(found_skills)), skill_categories
    
    def extract_experience(self, text):
        # Extract years of experience using multiple methods
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*in',
            r'experience\s*:\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*(?:working|developing)',
            r'(\d+)\+?\s*years?\s*(?:as|in)\s*(?:a|an)?\s*\w+'
        ]
        
        years = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text.lower())
            years.extend([int(match) for match in matches])
        
        # Extract date ranges and calculate experience
        date_ranges = self._extract_date_ranges(text)
        if date_ranges:
            calculated_years = self._calculate_total_experience(date_ranges)
            if calculated_years > 0:
                years.append(calculated_years)
        
        # Extract employment periods
        employment_years = self._extract_employment_periods(text)
        if employment_years:
            years.extend(employment_years)
        
        return max(years) if years else 0
    
    def _extract_date_ranges(self, text):
        # Extract date ranges like "2020-2024", "Jan 2020 - Present", etc.
        date_patterns = [
            r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',
            r'(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)',
            r'(\d{1,2}/\d{4})\s*[-–—]\s*(\d{1,2}/\d{4}|present|current)'
        ]
        
        ranges = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches:
                start_date, end_date = match
                ranges.append((start_date, end_date))
        
        return ranges
    
    def _calculate_total_experience(self, date_ranges):
        total_years = 0
        current_year = 2024
        
        for start_date, end_date in date_ranges:
            try:
                # Extract start year
                start_year_match = re.search(r'\d{4}', start_date)
                if start_year_match:
                    start_year = int(start_year_match.group())
                else:
                    continue
                
                # Extract end year
                if 'present' in end_date or 'current' in end_date:
                    end_year = current_year
                else:
                    end_year_match = re.search(r'\d{4}', end_date)
                    if end_year_match:
                        end_year = int(end_year_match.group())
                    else:
                        end_year = current_year
                
                # Calculate years for this position
                position_years = max(0, end_year - start_year)
                total_years += position_years
                
            except (ValueError, AttributeError):
                continue
        
        return min(total_years, 25)  # Cap at 25 years
    
    def _extract_employment_periods(self, text):
        # Look for employment duration patterns
        employment_patterns = [
            r'(?:worked|employed|served)\s+(?:for\s+)?(\d+)\s+years?',
            r'(\d+)\s+years?\s+(?:at|with|in)\s+\w+',
            r'total\s+(?:of\s+)?(\d+)\s+years?\s+experience',
            r'over\s+(\d+)\s+years?\s+(?:of\s+)?experience'
        ]
        
        years = []
        for pattern in employment_patterns:
            matches = re.findall(pattern, text.lower())
            years.extend([int(match) for match in matches if int(match) <= 25])
        
        return years
    
    def extract_education(self, text):
        education_patterns = [
            r'\b(?:bachelor|b\.?s\.?|b\.?a\.?)\s*(?:of|in|degree)?\s*([a-zA-Z\s]+)',
            r'\b(?:master|m\.?s\.?|m\.?a\.?|mba)\s*(?:of|in|degree)?\s*([a-zA-Z\s]+)',
            r'\b(?:phd|ph\.?d\.?|doctorate)\s*(?:of|in|degree)?\s*([a-zA-Z\s]+)'
        ]
        
        education = []
        for pattern in education_patterns:
            matches = re.findall(pattern, text.lower())
            education.extend([match.strip() for match in matches if match.strip()])
        
        return list(set(education))
    
    def extract_organizations(self, text):
        # Extract company names (basic pattern)
        org_patterns = [
            r'\b(?:at|@)\s+([A-Z][a-zA-Z\s&]+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Systems|Solutions))\b',
            r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Systems|Solutions)\b'
        ]
        
        organizations = []
        for pattern in org_patterns:
            matches = re.findall(pattern, text)
            organizations.extend(matches)
        
        return list(set(organizations[:5]))  # Return top 5
    
    def calculate_job_match(self, resume_text, job_role, extracted_skills, experience_years, education):
        if job_role not in self.job_requirements:
            return self._default_analysis(extracted_skills, experience_years)
        
        job_req = self.job_requirements[job_role]
        
        # Calculate skill matches
        required_matches = []
        missing_required = []
        for skill in job_req['required_skills']:
            if any(skill.lower() in s.lower() or s.lower() in skill.lower() for s in extracted_skills):
                required_matches.append(skill)
            else:
                missing_required.append(skill)
        
        preferred_matches = []
        missing_preferred = []
        for skill in job_req['preferred_skills']:
            if any(skill.lower() in s.lower() or s.lower() in skill.lower() for s in extracted_skills):
                preferred_matches.append(skill)
            else:
                missing_preferred.append(skill)
        
        # Calculate scores
        required_score = len(required_matches) / len(job_req['required_skills']) * 100
        preferred_score = len(preferred_matches) / len(job_req['preferred_skills']) * 100
        overall_skill_score = (required_score * 0.7) + (preferred_score * 0.3)
        
        # Experience score
        experience_score = min(experience_years * 20, 100)  # 20 points per year, max 100
        
        # Education score
        education_score = 0
        for edu in education:
            for keyword in job_req['education_keywords']:
                if keyword in edu.lower():
                    education_score = 100
                    break
            if education_score > 0:
                break
        
        if not education_score and education:
            education_score = 50  # Some education but not directly relevant
        
        # Experience keywords score
        keyword_score = 0
        resume_lower = resume_text.lower()
        for keyword in job_req['experience_keywords']:
            if keyword in resume_lower:
                keyword_score += 20
        keyword_score = min(keyword_score, 100)
        
        # Overall match calculation
        overall_match = (
            overall_skill_score * 0.4 +
            experience_score * 0.25 +
            education_score * 0.2 +
            keyword_score * 0.15
        )
        
        return {
            'match_percentage': round(overall_match, 1),
            'skill_match': round(overall_skill_score, 1),
            'required_skill_matches': required_matches,
            'missing_required_skills': missing_required[:5],
            'preferred_skill_matches': preferred_matches,
            'missing_preferred_skills': missing_preferred[:5],
            'experience_score': round(experience_score, 1),
            'education_score': round(education_score, 1),
            'keyword_score': round(keyword_score, 1)
        }
    
    def _default_analysis(self, extracted_skills, experience_years):
        # Default analysis for unknown job roles
        skill_score = min(len(extracted_skills) * 10, 100)
        experience_score = min(experience_years * 20, 100)
        overall_match = (skill_score * 0.6) + (experience_score * 0.4)
        
        return {
            'match_percentage': round(overall_match, 1),
            'skill_match': round(skill_score, 1),
            'required_skill_matches': extracted_skills[:5],
            'missing_required_skills': [],
            'preferred_skill_matches': [],
            'missing_preferred_skills': [],
            'experience_score': round(experience_score, 1),
            'education_score': 50,
            'keyword_score': 50
        }
    
    def generate_recommendations(self, match_data, extracted_skills, experience_years, education):
        recommendations = []
        
        # Skill-based recommendations
        if match_data['skill_match'] < 50:
            recommendations.append("Focus on developing the key technical skills required for this role")
        
        if len(match_data['missing_required_skills']) > 0:
            missing_skills = ', '.join(match_data['missing_required_skills'][:3])
            recommendations.append(f"Consider learning these essential skills: {missing_skills}")
        
        # Experience-based recommendations
        if experience_years == 0:
            recommendations.append("Highlight any projects, internships, or volunteer work to demonstrate practical experience")
        elif experience_years < 2:
            recommendations.append("Emphasize your learning ability and any relevant projects or coursework")
        
        # Education recommendations
        if match_data['education_score'] < 50:
            recommendations.append("Consider pursuing relevant certifications or courses in your target field")
        
        # Overall match recommendations
        if match_data['match_percentage'] >= 80:
            recommendations.append("Excellent match! Your profile aligns very well with the job requirements")
        elif match_data['match_percentage'] >= 60:
            recommendations.append("Good match! Focus on the missing skills to strengthen your application")
        else:
            recommendations.append("Consider gaining more relevant experience and skills before applying")
        
        # Skill diversity
        if len(extracted_skills) < 5:
            recommendations.append("Expand your skill set to include both technical and soft skills")
        
        return recommendations
    
    def generate_improvement_suggestions(self, match_data, job_role):
        suggestions = {
            'dos': [],
            'donts': [],
            'improvements': []
        }
        
        # Do's
        suggestions['dos'] = [
            "Quantify your achievements with specific numbers and metrics",
            "Use action verbs to describe your responsibilities and accomplishments",
            "Tailor your resume to match the job description keywords",
            "Include relevant projects that demonstrate your skills",
            "Keep your resume format clean and professional"
        ]
        
        # Don'ts
        suggestions['donts'] = [
            "Don't include irrelevant personal information",
            "Don't use generic job descriptions without specific achievements",
            "Don't exceed 2 pages unless you have extensive experience",
            "Don't use unprofessional email addresses",
            "Don't include outdated or irrelevant skills"
        ]
        
        # Improvements based on analysis
        if match_data['skill_match'] < 70:
            suggestions['improvements'].append("Add more relevant technical skills to your skills section")
        
        if len(match_data['missing_required_skills']) > 0:
            suggestions['improvements'].append("Gain experience in the missing required skills through projects or courses")
        
        if match_data['experience_score'] < 50:
            suggestions['improvements'].append("Include more detailed descriptions of your work experience and achievements")
        
        if match_data['keyword_score'] < 50:
            suggestions['improvements'].append("Use more industry-specific keywords and terminology")
        
        return suggestions
    
    def analyze(self, file, job_role="Software Developer"):
        try:
            # Extract text from resume
            resume_text = self.extract_text(file)
            
            if not resume_text.strip():
                raise Exception("Could not extract text from the resume. Please ensure the file is not corrupted.")
            
            # Extract information
            extracted_skills, skill_categories = self.extract_skills(resume_text)
            experience_years = self.extract_experience(resume_text)
            education = self.extract_education(resume_text)
            organizations = self.extract_organizations(resume_text)
            
            # Calculate job match
            match_data = self.calculate_job_match(resume_text, job_role, extracted_skills, experience_years, education)
            
            # Generate recommendations
            recommendations = self.generate_recommendations(match_data, extracted_skills, experience_years, education)
            
            # Generate improvement suggestions
            suggestions = self.generate_improvement_suggestions(match_data, job_role)
            
            # Determine overall rating
            overall_rating = self._get_overall_rating(match_data['match_percentage'])
            
            return {
                'match_percentage': match_data['match_percentage'],
                'skill_match': match_data['skill_match'],
                'similarity_score': match_data['match_percentage'] / 100,
                'extracted_skills': extracted_skills[:10],
                'skill_categories': skill_categories,
                'organizations': organizations,
                'education': education,
                'experience_years': experience_years,
                'required_skill_matches': match_data['required_skill_matches'],
                'missing_required_skills': match_data['missing_required_skills'],
                'preferred_skill_matches': match_data['preferred_skill_matches'],
                'missing_preferred_skills': match_data['missing_preferred_skills'],
                'recommendations': recommendations,
                'suggestions': suggestions,
                'overall_rating': overall_rating,
                'analysis_summary': {
                    'skill_match': f"{match_data['skill_match']:.1f}%",
                    'experience_level': self._format_experience_level(experience_years),
                    'overall_rating': overall_rating,
                    'recommendation': "Apply with confidence" if match_data['match_percentage'] >= 70 else "Improve skills before applying"
                }
            }
            
        except Exception as e:
            raise Exception(f"Resume analysis failed: {str(e)}")
    
    def _get_overall_rating(self, match_percentage):
        if match_percentage >= 80:
            return "Excellent"
        elif match_percentage >= 60:
            return "Good"
        elif match_percentage >= 40:
            return "Fair"
        else:
            return "Needs Improvement"
    
    def _format_experience_level(self, years):
        if years == 0:
            return "Entry Level (0 years)"
        elif years == 1:
            return "1 year"
        elif years <= 3:
            return f"{years} years (Junior Level)"
        elif years <= 7:
            return f"{years} years (Mid Level)"
        elif years <= 12:
            return f"{years} years (Senior Level)"
        else:
            return f"{years} years (Expert Level)"