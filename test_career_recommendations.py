#!/usr/bin/env python3
"""
Test script for the career recommendation system
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml-service'))

from services.career_recommender import CareerRecommender
import json

def test_career_recommendations():
    print("Testing Career Recommendation System...")
    print("=" * 50)
    
    # Initialize the recommender
    cr = CareerRecommender()
    
    # Test cases
    test_cases = [
        {
            'name': 'Frontend Developer Profile',
            'data': {
                'skills': 'javascript, html, css, react, vue',
                'interests': 'web development, user experience, design',
                'experience': '2 years',
                'education': 'Bachelor of Computer Science',
                'goals': 'remote work, creativity, high salary'
            }
        },
        {
            'name': 'Data Science Profile',
            'data': {
                'skills': 'python, sql, machine learning, pandas, numpy',
                'interests': 'data analysis, research, statistics',
                'experience': '4 years',
                'education': 'Master of Data Science',
                'goals': 'research, high salary, career growth'
            }
        },
        {
            'name': 'Entry Level Profile',
            'data': {
                'skills': 'java, basic programming',
                'interests': 'technology, problem solving',
                'experience': '0 years',
                'education': 'Bachelor of Engineering',
                'goals': 'learning, career growth'
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['name']}")
        print("-" * 30)
        
        try:
            result = cr.predict(test_case['data'])
            
            print(f"✅ Generated {len(result['recommendations'])} recommendations")
            print(f"✅ Generated {len(result['insights'])} insights")
            
            # Show top recommendation
            if result['recommendations']:
                top_rec = result['recommendations'][0]
                print(f"🎯 Top Match: {top_rec['career']} ({top_rec['match_percentage']:.1f}% match)")
                print(f"💰 Salary Range: ${top_rec['salary_range']['min']:,} - ${top_rec['salary_range']['max']:,}")
                print(f"🏢 Industries: {', '.join(top_rec['industries'])}")
                
            # Show insights
            if result['insights']:
                print("💡 Key Insights:")
                for insight in result['insights'][:2]:
                    print(f"   • {insight}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Career Recommendation System Test Complete!")

if __name__ == "__main__":
    test_career_recommendations()