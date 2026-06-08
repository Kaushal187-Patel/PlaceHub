import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import app as flask_app


@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as c:
        yield c


def test_health_ok(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == 'healthy'


def test_career_recommend_rejects_non_json(client):
    res = client.post('/api/career/recommend', data='not json',
                      content_type='text/plain')
    assert res.status_code == 400


def test_career_recommend_happy_path(client):
    res = client.post('/api/career/recommend', json={
        'skills': 'python, sql',
        'interests': 'data',
        'education': 'BSc',
        'experience': '1 year',
        'goals': 'analyst'
    })
    assert res.status_code == 200
    body = res.get_json()
    assert 'recommendations' in body


def test_resume_analyze_requires_file(client):
    res = client.post('/api/resume/analyze', data={})
    assert res.status_code == 400
