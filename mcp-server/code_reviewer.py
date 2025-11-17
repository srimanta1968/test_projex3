"""
Code Reviewer - API Client
Communicates with ProjexLight API for code review operations
Uses encrypted session token for authentication
"""

import requests
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from logger import MCPLogger


class CodeReviewer:
    """API client for ProjexLight code review endpoints"""

    def __init__(self):
        self.api_url = os.getenv('PROJEXLIGHT_API_URL', 'https://api.projexlight.com')
        self.api_key = os.getenv('PROJEXLIGHT_API_KEY', '')
        self.project_id = os.getenv('PROJEXLIGHT_PROJECT_ID', '')
        self.encrypted_session_token = os.getenv('PROJEXLIGHT_ENCRYPTED_API_KEY', self.api_key)
        self.session_token = self.api_key  # Decrypted session token

        if not self.api_key:
            raise ValueError("PROJEXLIGHT_API_KEY not set in environment")

        if not self.project_id:
            raise ValueError("PROJEXLIGHT_PROJECT_ID not set in environment")

        self.headers = {
            'Content-Type': 'application/json'
        }

    def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make authenticated request to ProjexLight API"""
        url = f"{self.api_url}{endpoint}"

        # Add authentication to request body (MCP uses session token in body)
        if data is None:
            data = {}

        data['sessionToken'] = self.encrypted_session_token  # Use encrypted token for API
        data['projectId'] = self.project_id

        try:
            # Log API call
            MCPLogger.log_api_call(endpoint, method, 'sending')

            if method.upper() == 'GET':
                response = requests.get(url, headers=self.headers, params=data, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=self.headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()

            # Log success
            MCPLogger.log_api_call(endpoint, method, f'success ({response.status_code})')

            return response.json()

        except requests.exceptions.RequestException as e:
            # Log failure
            MCPLogger.log_api_call(endpoint, method, f'failed: {str(e)}')
            print(f"❌ API request failed: {e}")
            return {'success': False, 'error': str(e)}

    def review_file(self, file_path: str, file_content: str, language: str) -> Dict[str, Any]:
        """
        Review a single file against tenant's coding standards

        Returns:
            {
                "success": true,
                "filePath": "src/auth.ts",
                "language": "typescript",
                "complianceScore": 85,
                "violations": [...],
                "totalViolations": 3,
                "autoFixableCount": 2,
                "llmTokensUsed": 1200,
                "llmCostUsd": 0.012,
                "reviewedAt": "2025-11-11T12:34:56Z"
            }
        """
        print(f"🔍 Reviewing file: {file_path}")

        data = {
            'filePath': file_path,
            'fileContent': file_content,
            'language': language
        }

        result = self._make_request('POST', '/api/mcp/code-review/analyze', data)

        if result.get('success'):
            violations = result.get('violations', [])
            compliance = result.get('complianceScore', 0)
            print(f"   Compliance: {compliance}%")
            print(f"   Violations: {len(violations)}")
            print(f"   Auto-fixable: {result.get('autoFixableCount', 0)}")
        else:
            print(f"   ❌ Review failed: {result.get('error', 'Unknown error')}")

        return result

    def review_batch(self, files: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Review multiple files in batch

        Args:
            files: [{"path": "...", "content": "...", "language": "..."}]

        Returns:
            {
                "success": true,
                "totalFiles": 5,
                "averageCompliance": 87.5,
                "totalViolations": 12,
                "fileResults": [...]
            }
        """
        print(f"🔍 Batch reviewing {len(files)} files...")

        data = {
            'files': files
        }

        result = self._make_request('POST', '/api/mcp/code-review/batch', data)

        if result.get('success'):
            print(f"   Average compliance: {result.get('averageCompliance', 0)}%")
            print(f"   Total violations: {result.get('totalViolations', 0)}")
        else:
            print(f"   ❌ Batch review failed: {result.get('error', 'Unknown error')}")

        return result

    def generate_auto_fix(self, violation: Dict[str, Any], file_content: str) -> Dict[str, Any]:
        """
        Generate auto-fix suggestion for a specific violation

        Returns:
            {
                "success": true,
                "fixedCode": "...",
                "explanation": "..."
            }
        """
        data = {
            'violation': violation,
            'fileContent': file_content
        }

        result = self._make_request('POST', '/api/mcp/code-review/auto-fix', data)

        if result.get('success'):
            print(f"   ✅ Auto-fix generated")
        else:
            print(f"   ❌ Auto-fix failed: {result.get('error', 'Unknown error')}")

        return result

    def update_leaderboard(self, metrics: Dict[str, Any], developer_name: str = None, developer_email: str = None) -> Dict[str, Any]:
        """
        Update developer leaderboard with activity metrics

        Args:
            metrics: {
                "filesGenerated": 5,
                "linesOfCode": 250,
                "tasksCompleted": 2,
                "sessionCount": 1,
                "violationsDetected": 10,
                "violationsFixed": 8,
                "violationsAutoFixed": 5,
                "violationsManualFixed": 3,
                "complianceScore": 85.5,
                "autoFixRate": 62.5,
                "reviewSessions": 3,
                "violationsCritical": 1,
                "violationsMajor": 4,
                "violationsMinor": 5,
                "llmTokensUsed": 5000,
                "llmApiCalls": 12,
                "llmCostUsd": 0.05
            }

        Returns:
            {
                "success": true,
                "message": "Leaderboard updated successfully",
                "currentRank": 3,
                "totalDevelopers": 12,
                "complianceScore": 85.5,
                "qualityTrend": "improving"
            }
        """
        print(f"📊 Updating leaderboard...")

        data = {
            'activityDate': datetime.now().strftime('%Y-%m-%d'),
            'metrics': metrics
        }

        # Include sprintId from environment if available
        sprint_id = os.getenv('PROJEXLIGHT_SPRINT_ID', '')
        if sprint_id:
            data['sprintId'] = sprint_id
            print(f"   Sprint ID: {sprint_id[:8]}...")

        if developer_name:
            data['developerName'] = developer_name
        if developer_email:
            data['developerEmail'] = developer_email

        result = self._make_request('POST', '/api/mcp/leaderboard/update', data)

        if result.get('success'):
            print(f"   ✅ Rank: #{result.get('currentRank')}/{result.get('totalDevelopers')}")
            print(f"   Compliance: {result.get('complianceScore', 0)}%")
            print(f"   Trend: {result.get('qualityTrend', 'stable')}")
        else:
            print(f"   ❌ Leaderboard update failed: {result.get('error', 'Unknown error')}")

        return result

    def get_ranking(self, sprint_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get current developer rankings

        Returns:
            {
                "success": true,
                "ranking": [...],
                "totalDevelopers": 12
            }
        """
        data = {}
        if sprint_id:
            data['sprintId'] = sprint_id

        result = self._make_request('GET', '/api/mcp/leaderboard/ranking', data)

        if result.get('success'):
            print(f"   📊 Retrieved rankings for {result.get('totalDevelopers', 0)} developers")
        else:
            print(f"   ❌ Failed to get rankings: {result.get('error', 'Unknown error')}")

        return result

    def query_standards(self, code_snippet: str, language: str, top_k: int = 10) -> Dict[str, Any]:
        """
        Query coding standards using vector similarity search
        (Note: Vector embedding is done server-side)

        Returns:
            {
                "success": true,
                "standards": [
                    {
                        "content": "...",
                        "metadata": {...},
                        "similarity": 0.89
                    }
                ]
            }
        """
        data = {
            'codeSnippet': code_snippet,
            'language': language,
            'topK': top_k
        }

        result = self._make_request('POST', '/api/mcp/standards/query', data)

        if result.get('success'):
            standards = result.get('standards', [])
            print(f"   📚 Found {len(standards)} relevant standards")
        else:
            print(f"   ❌ Standards query failed: {result.get('error', 'Unknown error')}")

        return result

    def validate_session(self) -> bool:
        """
        Validate that the session token is still valid

        Returns:
            True if valid, False otherwise
        """
        data = {}
        result = self._make_request('POST', '/api/mcp/session/validate', data)

        is_valid = result.get('success') and result.get('valid', False)

        if is_valid:
            print("✅ Session token is valid")
        else:
            print("❌ Session token is invalid or expired")

        return is_valid

    def health_check(self) -> bool:
        """
        Check if MCP API is healthy

        Returns:
            True if healthy, False otherwise
        """
        try:
            response = requests.get(f"{self.api_url}/api/mcp/health", timeout=5)
            result = response.json()

            is_healthy = result.get('success') and result.get('status') == 'healthy'

            if is_healthy:
                print(f"✅ MCP API is healthy (version: {result.get('version', 'unknown')})")
            else:
                print(f"❌ MCP API is unhealthy")

            return is_healthy
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False

    def check_existing_api(self, endpoint: str, method: str) -> Optional[Dict[str, Any]]:
        """
        Check if API endpoint already exists in the API library
        Used for preventive duplicate detection during code generation

        Args:
            endpoint: API endpoint path (e.g., "/api/users")
            method: HTTP method (e.g., "POST", "GET")

        Returns:
            Existing API details if duplicate found, None otherwise
            {
                "id": "uuid",
                "endpoint": "/api/users",
                "method": "POST",
                "route_file_path": "server/src/routes/userRoutes.ts",
                "sprint_name": "Sprint 1"
            }
        """
        data = {
            'endpoint': endpoint,
            'method': method.upper()
        }

        result = self._make_request('POST', '/api/mcp/api-library/check-duplicate', data)

        if result.get('success') and result.get('hasDuplicate'):
            existing_api = result.get('existingAPI')
            print(f"⚠️  Duplicate API found: {method} {endpoint}")
            print(f"   Exists in: {existing_api.get('route_file_path', 'unknown')}")
            print(f"   Sprint: {existing_api.get('sprint_name', 'unknown')}")
            return existing_api

        return None

    def find_similar_component(
        self,
        component_name: str,
        props: List[str] = None,
        code_snippet: str = None,
        functionality: str = None
    ) -> Optional[Dict[str, Any]]:
        """
        Find similar components using name-based similarity and optional LLM analysis
        Used for preventive duplicate detection during component creation

        Args:
            component_name: Name of the component (e.g., "UserCard")
            props: List of prop names (optional, for future LLM analysis)
            code_snippet: Component code snippet (optional, for future LLM analysis)
            functionality: Description of component functionality (optional, for future LLM analysis)

        Returns:
            Similar component details if found, None otherwise
            {
                "name": "ProfileCard",
                "filePath": "src/components/ProfileCard.tsx",
                "similarity": 89.5,
                "sprint_name": "Sprint 2",
                "props": ["user", "onEdit"]
            }
        """
        data = {
            'componentName': component_name
        }

        # Add optional fields for future LLM-based similarity
        if props:
            data['props'] = props
        if code_snippet:
            data['codeSnippet'] = code_snippet
        if functionality:
            data['functionality'] = functionality

        result = self._make_request('POST', '/api/mcp/components/find-similar', data)

        if result.get('success') and result.get('hasSimilar'):
            similar_component = result.get('similarComponent')
            similarity = similar_component.get('similarity', 0)
            print(f"⚠️  Similar component found: {similar_component.get('name')}")
            print(f"   File: {similar_component.get('filePath', 'unknown')}")
            print(f"   Similarity: {similarity}%")
            return similar_component

        return None

    def register_api(self, api_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new API endpoint in the api_library table
        Called after verifying no duplicate exists

        Args:
            api_info: {
                "endpoint": "/api/users",
                "method": "POST",
                "filePath": "server/src/routes/userRoutes.ts",
                "fileHash": "abc123...",
                "sprintId": "uuid" (optional),
                "epicId": "uuid" (optional),
                "featureId": "uuid" (optional),
                "scenarioId": "uuid" (optional)
            }

        Returns:
            {
                "success": true,
                "message": "API registered successfully",
                "apiId": "uuid"
            }
        """
        data = {
            'endpoint': api_info.get('endpoint'),
            'method': api_info.get('method'),
            'routeFilePath': api_info.get('filePath'),
            'routeFileHash': api_info.get('fileHash', ''),
            'sprintId': api_info.get('sprintId'),
            'epicId': api_info.get('epicId'),
            'featureId': api_info.get('featureId'),
            'scenarioId': api_info.get('scenarioId'),
            'lastTestStatus': 'not_tested'
        }

        result = self._make_request('POST', '/api/mcp/api-library/update', data)

        if result.get('success'):
            print(f"   ✅ API registered: {api_info.get('method')} {api_info.get('endpoint')}")
        else:
            print(f"   ❌ Failed to register API: {result.get('error', 'Unknown error')}")

        return result

    def register_multiple_apis(self, apis: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Register multiple APIs at once

        Args:
            apis: List of API info dictionaries

        Returns:
            {
                "success": true,
                "registered": 3,
                "failed": 0,
                "results": [...]
            }
        """
        results = []
        registered = 0
        failed = 0

        for api in apis:
            result = self.register_api(api)
            results.append(result)
            if result.get('success'):
                registered += 1
            else:
                failed += 1

        return {
            'success': failed == 0,
            'registered': registered,
            'failed': failed,
            'results': results
        }

    def update_pre_commit_leaderboard(
        self,
        metrics: Dict[str, Any],
        developer_name: str = None,
        developer_email: str = None
    ) -> Dict[str, Any]:
        """
        Update leaderboard with pre-commit scan metrics

        Args:
            metrics: {
                "filesScanned": 10,
                "apisDetected": 5,
                "apisRegistered": 5,
                "duplicatesBlocked": 0,
                "componentsScanned": 8,
                "similarComponentsFound": 1,
                "codingStandardsViolations": 3,
                "complianceScore": 85.5,
                "reviewSessions": 1,
                "llmTokensUsed": 2000,
                "llmApiCalls": 5,
                "llmCostUsd": 0.02
            }

        Returns:
            Leaderboard update result
        """
        return self.update_leaderboard(metrics, developer_name, developer_email)


# Test/Example Usage
if __name__ == "__main__":
    print("🧪 Testing Code Reviewer API Client...\n")

    reviewer = CodeReviewer()

    # Test 1: Health check
    print("1. Health Check:")
    reviewer.health_check()
    print()

    # Test 2: Validate session
    print("2. Session Validation:")
    reviewer.validate_session()
    print()

    # Test 3: Review sample file
    print("3. File Review:")
    sample_code = """
    function Get_User(userId) {
        return pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    }
    """
    result = reviewer.review_file("test.ts", sample_code, "typescript")
    print(json.dumps(result, indent=2))
