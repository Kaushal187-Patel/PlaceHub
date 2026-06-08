import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.career_recommender import CareerRecommender


def test_predict_returns_recommendations_and_insights():
    rec = CareerRecommender()
    result = rec.predict({
        'skills': 'python, sql, machine learning',
        'interests': 'data, analytics',
        'education': 'Bachelor of Computer Science',
        'experience': '2 years',
        'goals': 'become a data scientist'
    })
    assert 'recommendations' in result
    assert isinstance(result['recommendations'], list)
    assert len(result['recommendations']) > 0
    top = result['recommendations'][0]
    # Contract fields the frontend relies on
    assert 'career' in top
    assert 'match_percentage' in top


def test_predict_handles_empty_input_gracefully():
    rec = CareerRecommender()
    result = rec.predict({})
    assert 'recommendations' in result
    assert isinstance(result['recommendations'], list)
