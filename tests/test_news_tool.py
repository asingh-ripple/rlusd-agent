"""Tests for the disaster analysis tools."""

import unittest
from unittest.mock import patch, MagicMock
from tools.disaster_analysis_tools import get_news, estimate_aid_requirements
from config.tools_config import SEARCH_CONFIG

class TestNewsTool(unittest.TestCase):
    """Test cases for the news search tool."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_query = "typhoon japan"
        self.mock_results = [
            {
                'title': 'Typhoon Maria hits Japan',
                'link': 'https://example.com/typhoon1',
                'desc': 'A powerful typhoon has made landfall in Japan...',
                'media': 'CNN',
                'date': '2024-03-15'
            },
            {
                'title': 'Japan prepares for Typhoon Maria',
                'link': 'https://example.com/typhoon2',
                'desc': 'Japanese authorities are preparing for the arrival of Typhoon Maria...',
                'media': 'BBC',
                'date': '2024-03-14'
            }
        ]
    
    @patch('tools.disaster_analysis_tools.GoogleNews')
    def test_successful_news_search(self, mock_googlenews):
        """Test successful news search."""
        # Setup mock
        mock_instance = MagicMock()
        mock_instance.page_at.return_value = self.mock_results
        mock_googlenews.return_value = mock_instance
        
        # Call the function
        result = get_news(self.test_query)
        
        # Verify the result structure
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['count'], len(self.mock_results) * SEARCH_CONFIG["max_pages"])
        self.assertEqual(len(result['results']), len(self.mock_results) * SEARCH_CONFIG["max_pages"])
        self.assertEqual(result['query'], self.test_query)
        self.assertIsNotNone(result['timestamp'])
        self.assertEqual(result['link'], 'https://example.com/typhoon1')
        
        # Verify the first result
        first_result = result['results'][0]
        self.assertEqual(first_result['title'], 'Typhoon Maria hits Japan')
        self.assertEqual(first_result['link'], 'https://example.com/typhoon1')
        self.assertEqual(first_result['source'], 'CNN')
        self.assertEqual(first_result['date'], '2024-03-15')
        
        # Verify GoogleNews was called correctly
        mock_googlenews.assert_called_once()
        mock_instance.set_time_range.assert_called_once()
        mock_instance.set_encode.assert_called_once_with('utf-8')
        mock_instance.search.assert_called_once_with(self.test_query)
        
        # Verify page_at was called the correct number of times
        self.assertEqual(mock_instance.page_at.call_count, SEARCH_CONFIG["max_pages"])
        for page in range(1, SEARCH_CONFIG["max_pages"] + 1):
            mock_instance.page_at.assert_any_call(page)
    
    @patch('tools.disaster_analysis_tools.GoogleNews')
    def test_empty_news_search(self, mock_googlenews):
        """Test news search with no results."""
        # Setup mock
        mock_instance = MagicMock()
        mock_instance.page_at.return_value = []
        mock_googlenews.return_value = mock_instance
        
        # Call the function
        result = get_news(self.test_query)
        
        # Verify the result structure
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['count'], 0)
        self.assertEqual(len(result['results']), 0)
        self.assertEqual(result['query'], self.test_query)
        self.assertIsNotNone(result['timestamp'])
        self.assertIsNone(result['link'])
    
    @patch('tools.disaster_analysis_tools.GoogleNews')
    def test_news_search_error(self, mock_googlenews):
        """Test news search with error."""
        # Setup mock to raise an exception
        mock_instance = MagicMock()
        mock_instance.search.side_effect = Exception("API Error")
        mock_googlenews.return_value = mock_instance
        
        # Call the function
        result = get_news(self.test_query)
        
        # Verify the error result structure
        self.assertEqual(result['status'], 'error')
        self.assertEqual(result['error'], 'API Error')
        self.assertEqual(result['query'], self.test_query)
        self.assertIsNotNone(result['timestamp'])

class TestAidEstimationTool(unittest.TestCase):
    """Test cases for the aid estimation tool."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_disaster_info = "A powerful earthquake has struck the region, causing widespread damage to infrastructure and homes."
        self.test_population = 100000
    
    def test_successful_aid_estimation(self):
        """Test successful aid estimation."""
        result = estimate_aid_requirements(self.test_disaster_info, self.test_population)
        
        # Verify the result structure
        self.assertEqual(result['status'], 'success')
        self.assertIsInstance(result['estimated_aid'], float)
        self.assertEqual(result['currency'], 'USD')
        self.assertIsNotNone(result['timestamp'])
    
    def test_aid_estimation_with_invalid_population(self):
        """Test aid estimation with invalid population."""
        result = estimate_aid_requirements(self.test_disaster_info, -100)
        
        # Verify the error result structure
        self.assertEqual(result['status'], 'error')
        self.assertEqual(result['error'], 'Invalid population value')
        self.assertIsNotNone(result['timestamp'])
    
    def test_aid_estimation_with_empty_disaster_info(self):
        """Test aid estimation with empty disaster info."""
        result = estimate_aid_requirements("", self.test_population)
        
        # Verify the error result structure
        self.assertEqual(result['status'], 'error')
        self.assertEqual(result['error'], 'Invalid disaster information')
        self.assertIsNotNone(result['timestamp'])

if __name__ == '__main__':
    unittest.main() 