"""
MCP Agent - File Watchdog
Monitors workspace for file changes and triggers code reviews
Uses Watchdog library for efficient file system monitoring
"""

import time
import os
import re
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent
from typing import Set, Dict, Any, List, Optional, Tuple
from pathlib import Path
from datetime import datetime
import threading

from code_reviewer import CodeReviewer
from feedback_generator import FeedbackGenerator
from logger import MCPLogger


class CodeFileHandler(FileSystemEventHandler):
    """Handles file system events and triggers code reviews"""

    # Supported file extensions for review
    SUPPORTED_EXTENSIONS = {
        '.ts', '.tsx', '.js', '.jsx',  # JavaScript/TypeScript
        '.py',  # Python
        '.java',  # Java
        '.go',  # Go
        '.rs',  # Rust
        '.cpp', '.cc', '.cxx', '.hpp', '.h',  # C++
        '.cs',  # C#
        '.rb',  # Ruby
        '.php',  # PHP
        '.swift',  # Swift
        '.kt', '.kts'  # Kotlin
    }

    # Directories to ignore
    IGNORE_DIRS = {
        'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
        '__pycache__', '.pytest_cache', 'venv', 'env', '.env',
        'coverage', '.next', '.nuxt', 'target', 'bin', 'obj'
    }

    # Language mapping
    LANGUAGE_MAP = {
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.py': 'python',
        '.java': 'java',
        '.go': 'go',
        '.rs': 'rust',
        '.cpp': 'cpp',
        '.cc': 'cpp',
        '.cxx': 'cpp',
        '.hpp': 'cpp',
        '.h': 'cpp',
        '.cs': 'csharp',
        '.rb': 'ruby',
        '.php': 'php',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.kts': 'kotlin'
    }

    def __init__(self, workspace_path: str, reviewer: CodeReviewer, feedback_gen: FeedbackGenerator):
        super().__init__()
        self.workspace_path = workspace_path
        self.reviewer = reviewer
        self.feedback_gen = feedback_gen

        # Debounce mechanism (prevent multiple triggers for same file)
        self.pending_files: Set[str] = set()
        self.last_modified: Dict[str, float] = {}
        self.debounce_seconds = 2.0  # Wait 2 seconds after last change

        # Session metrics
        self.session_metrics = {
            'filesReviewed': 0,
            'violationsDetected': 0,
            'violationsFixed': 0,
            'complianceScoreSum': 0.0,
            'llmTokensUsed': 0,
            'llmCostUsd': 0.0,
            'reviewSessions': 0
        }

        # Start debounce processor
        self.running = True
        self.processor_thread = threading.Thread(target=self._process_pending_files, daemon=True)
        self.processor_thread.start()

    def on_modified(self, event: FileModifiedEvent):
        """Handle file modification events"""
        if not event.is_directory:
            self._handle_file_change(event.src_path, 'modified')

    def on_created(self, event: FileCreatedEvent):
        """Handle file creation events"""
        if not event.is_directory:
            self._handle_file_change(event.src_path, 'created')

    def _handle_file_change(self, file_path: str, change_type: str):
        """Process file change with debouncing"""
        # Normalize path
        file_path = os.path.abspath(file_path)

        # Check if file should be ignored
        if self._should_ignore(file_path):
            return

        # Check if file type is supported
        ext = Path(file_path).suffix.lower()
        if ext not in self.SUPPORTED_EXTENSIONS:
            return

        # Update last modified time
        current_time = time.time()
        self.last_modified[file_path] = current_time

        # Add to pending set
        if file_path not in self.pending_files:
            self.pending_files.add(file_path)
            rel_path = self._get_relative_path(file_path)
            print(f"📝 File {change_type}: {rel_path}")
            MCPLogger.log_file_detected(rel_path, change_type)

    def _should_ignore(self, file_path: str) -> bool:
        """Check if file should be ignored"""
        path_parts = Path(file_path).parts

        # Check if any part of path is in ignore list
        for ignore_dir in self.IGNORE_DIRS:
            if ignore_dir in path_parts:
                return True

        # Ignore hidden files (starting with .)
        if Path(file_path).name.startswith('.'):
            return True

        # Ignore feedback directory
        if 'feedback' in path_parts or '.projexlight' in path_parts:
            return True

        return False

    def _get_relative_path(self, file_path: str) -> str:
        """Get path relative to workspace"""
        try:
            return os.path.relpath(file_path, self.workspace_path)
        except ValueError:
            return file_path

    def _process_pending_files(self):
        """Background thread that processes pending files after debounce period"""
        while self.running:
            time.sleep(0.5)  # Check every 500ms

            current_time = time.time()
            files_to_process = []

            # Find files that haven't been modified for debounce_seconds
            for file_path in list(self.pending_files):
                last_mod = self.last_modified.get(file_path, 0)
                if current_time - last_mod >= self.debounce_seconds:
                    files_to_process.append(file_path)
                    self.pending_files.remove(file_path)

            # Process each file
            for file_path in files_to_process:
                self._review_file(file_path)

    def _is_route_file(self, file_path: str) -> bool:
        """Check if file is a route/controller file"""
        route_indicators = [
            'route', 'routes', 'router', 'controller', 'api', 'endpoint'
        ]
        file_name_lower = Path(file_path).name.lower()
        return any(indicator in file_name_lower for indicator in route_indicators)

    def _is_component_file(self, file_path: str) -> bool:
        """Check if file is a frontend component file"""
        component_indicators = [
            'component', 'components', 'widget', 'view', 'page'
        ]
        ext = Path(file_path).suffix.lower()
        file_name_lower = Path(file_path).name.lower()

        # Check for React/Vue/Angular component extensions
        if ext in ['.tsx', '.jsx', '.vue']:
            return True

        # Check for component-like naming
        return any(indicator in file_name_lower for indicator in component_indicators)

    def _parse_route_file(self, content: str, file_path: str) -> List[Dict[str, str]]:
        """
        Parse route file to extract API endpoints
        Supports Express.js, FastAPI, Django, and other common patterns

        Returns:
            List of {"endpoint": "/api/users", "method": "POST"}
        """
        apis = []

        # Express.js patterns: router.post('/api/users', ...)
        express_pattern = r'router\.(get|post|put|patch|delete|head|options)\s*\(\s*["\']([^"\']+)["\']'
        for match in re.finditer(express_pattern, content, re.IGNORECASE):
            method = match.group(1).upper()
            endpoint = match.group(2)
            apis.append({"endpoint": endpoint, "method": method, "filePath": file_path})

        # app.post patterns: app.post('/api/users', ...)
        app_pattern = r'app\.(get|post|put|patch|delete|head|options)\s*\(\s*["\']([^"\']+)["\']'
        for match in re.finditer(app_pattern, content, re.IGNORECASE):
            method = match.group(1).upper()
            endpoint = match.group(2)
            apis.append({"endpoint": endpoint, "method": method, "filePath": file_path})

        # FastAPI patterns: @app.post("/api/users")
        fastapi_pattern = r'@app\.(get|post|put|patch|delete|head|options)\s*\(\s*["\']([^"\']+)["\']'
        for match in re.finditer(fastapi_pattern, content, re.IGNORECASE):
            method = match.group(1).upper()
            endpoint = match.group(2)
            apis.append({"endpoint": endpoint, "method": method, "filePath": file_path})

        # Django patterns: path('api/users/', ...)
        django_pattern = r'path\s*\(\s*["\']([^"\']+)["\']'
        for match in re.finditer(django_pattern, content):
            endpoint = "/" + match.group(1).strip('/')
            # Django doesn't specify method in path, assume it's handled in view
            apis.append({"endpoint": endpoint, "method": "UNKNOWN", "filePath": file_path})

        return apis

    def _parse_component(self, content: str, file_path: str) -> Optional[Dict[str, Any]]:
        """
        Parse component file to extract component information
        Supports React, Vue, Angular components

        Returns:
            {"name": "UserCard", "props": ["user", "onEdit"], "filePath": "..."}
        """
        component_name = Path(file_path).stem

        # Extract props from React/TypeScript components
        props = []

        # React TypeScript: interface Props { user: User; onEdit: () => void; }
        props_interface_pattern = r'interface\s+(?:Props|ComponentProps)\s*\{([^}]+)\}'
        match = re.search(props_interface_pattern, content)
        if match:
            props_content = match.group(1)
            # Extract property names
            prop_names = re.findall(r'(\w+)\s*[?:]', props_content)
            props.extend(prop_names)

        # React function component: function UserCard({ user, onEdit }: Props)
        func_params_pattern = r'function\s+\w+\s*\(\s*\{\s*([^}]+)\}'
        match = re.search(func_params_pattern, content)
        if match:
            params = match.group(1)
            prop_names = [p.strip() for p in params.split(',')]
            props.extend(prop_names)

        # Arrow function component: const UserCard = ({ user, onEdit }: Props) =>
        arrow_params_pattern = r'const\s+\w+\s*=\s*\(\s*\{\s*([^}]+)\}'
        match = re.search(arrow_params_pattern, content)
        if match:
            params = match.group(1)
            prop_names = [p.strip().split(':')[0].strip() for p in params.split(',') if p.strip()]
            props.extend(prop_names)

        return {
            "name": component_name,
            "props": list(set(props)),  # Remove duplicates
            "filePath": file_path
        }

    def _check_api_duplicates(self, apis: List[Dict[str, str]], file_path: str) -> List[Dict[str, Any]]:
        """
        Check if any extracted APIs are duplicates

        Returns:
            List of duplicate information
        """
        duplicates = []

        for api in apis:
            endpoint = api.get('endpoint')
            method = api.get('method')

            if method == 'UNKNOWN':
                continue  # Skip Django paths without explicit methods

            # Check with platform API
            existing_api = self.reviewer.check_existing_api(endpoint, method)

            if existing_api:
                # Skip if the existing API is from the same file (not a real duplicate)
                existing_file_path = existing_api.get('filePath', '')
                if existing_file_path == file_path or existing_file_path.endswith(file_path) or file_path.endswith(existing_file_path):
                    # Same file - this is an update, not a duplicate
                    continue

                duplicates.append({
                    "newAPI": api,
                    "existingAPI": existing_api,
                    "severity": "critical",
                    "message": f"Duplicate API: {method} {endpoint}"
                })

        return duplicates

    def _check_component_duplicates(self, component: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Check if component is similar to existing components

        Returns:
            Similarity information if similar component found
        """
        component_name = component.get('name')
        props = component.get('props', [])

        # Check with platform API
        similar_component = self.reviewer.find_similar_component(
            component_name,
            props=props
        )

        if similar_component:
            return {
                "newComponent": component,
                "existingComponent": similar_component,
                "severity": "warning",
                "similarity": similar_component.get('similarity', 0),
                "message": f"Similar component found: {similar_component.get('name')} ({similar_component.get('similarity')}% similar)"
            }

        return None

    def _review_file(self, file_path: str):
        """Review a single file"""
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Get language
            ext = Path(file_path).suffix.lower()
            language = self.LANGUAGE_MAP.get(ext, 'text')

            # Get relative path for display
            relative_path = self._get_relative_path(file_path)

            print(f"\n🔍 Reviewing: {relative_path}")
            print(f"   Language: {language}")
            print(f"   Size: {len(content)} bytes")

            # ============================================================
            # PHASE 1: PREVENTIVE DUPLICATE DETECTION (Real-time)
            # ============================================================

            blocking_duplicates = []
            warnings = []

            # Check if this is a route file
            if self._is_route_file(file_path):
                print(f"   🔍 Scanning for API endpoints...")
                apis = self._parse_route_file(content, relative_path)

                if apis:
                    print(f"   Found {len(apis)} API endpoint(s)")
                    # Check for duplicates
                    api_duplicates = self._check_api_duplicates(apis, relative_path)

                    if api_duplicates:
                        blocking_duplicates.extend(api_duplicates)
                        print(f"   🚨 {len(api_duplicates)} duplicate API(s) detected!")

            # Check if this is a component file
            elif self._is_component_file(file_path):
                print(f"   🔍 Scanning for component similarities...")
                component = self._parse_component(content, relative_path)

                if component:
                    # Check for similar components
                    similar_component = self._check_component_duplicates(component)

                    if similar_component:
                        warnings.append(similar_component)
                        similarity = similar_component.get('similarity', 0)
                        print(f"   ⚠️  Similar component detected ({similarity}% match)")

            # If blocking duplicates found, write blocking feedback and HALT
            if blocking_duplicates:
                print(f"\n🚨 BLOCKING: {len(blocking_duplicates)} duplicate API(s) detected!")
                print(f"   File: {relative_path}")
                print(f"   Action: Code review halted - duplicates must be resolved")

                # Write blocking feedback
                self.feedback_gen.write_blocking_feedback({
                    "filePath": relative_path,
                    "duplicates": blocking_duplicates,
                    "warnings": warnings,
                    "timestamp": datetime.utcnow().isoformat() + 'Z',
                    "blocking": True
                })

                # Log blocking issue
                MCPLogger.log_review_error(relative_path, "Duplicate APIs detected")

                # DO NOT proceed with normal code review
                return

            # If only warnings, continue with review but include warnings
            if warnings:
                print(f"   ⚠️  {len(warnings)} warning(s) detected (non-blocking)")

            # ============================================================
            # PHASE 2: NORMAL CODE REVIEW (No Duplicates)
            # ============================================================

            # Log review start
            MCPLogger.log_review_start(relative_path, language, len(content))

            # Review file
            result = self.reviewer.review_file(relative_path, content, language)

            if result.get('success'):
                # Add duplicate warnings to result
                if warnings:
                    result['duplicateWarnings'] = warnings

                # Update metrics
                self._update_metrics(result)

                # Log review complete
                MCPLogger.log_review_complete(relative_path, result)

                # Generate feedback
                self.feedback_gen.write_latest_feedback(result)
                self.feedback_gen.write_historical_feedback(result, relative_path)

                # ============================================================
                # PHASE 3: Register non-duplicate APIs in api_library
                # ============================================================
                if self._is_route_file(file_path):
                    apis = self._parse_route_file(content, relative_path)
                    if apis:
                        non_duplicate_apis = [
                            api for api in apis
                            if api.get('method') != 'UNKNOWN'
                            and not any(
                                d.get('newAPI', {}).get('endpoint') == api.get('endpoint')
                                and d.get('newAPI', {}).get('method') == api.get('method')
                                for d in blocking_duplicates
                            )
                        ]

                        if non_duplicate_apis:
                            print(f"   📝 Registering {len(non_duplicate_apis)} new API(s)...")
                            MCPLogger.log_info(f"Registering {len(non_duplicate_apis)} APIs from {relative_path}")

                            for api in non_duplicate_apis:
                                # Calculate file hash
                                import hashlib
                                file_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()[:64]
                                api['fileHash'] = file_hash

                                reg_result = self.reviewer.register_api(api)
                                if reg_result.get('success'):
                                    MCPLogger.log_info(f"Registered API: {api.get('method')} {api.get('endpoint')}")
                                else:
                                    MCPLogger.log_warning(f"Failed to register API: {api.get('method')} {api.get('endpoint')}")

                # Update leaderboard
                self._update_leaderboard()

                # Print summary
                compliance = result.get('complianceScore', 0)
                violations = result.get('totalViolations', 0)

                if compliance >= 90:
                    print(f"   ✅ Excellent quality: {compliance}%")
                elif compliance >= 80:
                    print(f"   ✓ Good quality: {compliance}% ({violations} minor issues)")
                else:
                    print(f"   ⚠️  Needs improvement: {compliance}% ({violations} violations)")

            else:
                error_msg = result.get('error', 'Unknown error')
                print(f"   ❌ Review failed: {error_msg}")
                MCPLogger.log_review_error(relative_path, error_msg)

        except Exception as e:
            error_msg = str(e)
            print(f"   ❌ Error reviewing file: {error_msg}")
            MCPLogger.log_review_error(relative_path, error_msg)

    def _update_metrics(self, review_result: Dict[str, Any]):
        """Update session metrics"""
        self.session_metrics['filesReviewed'] += 1
        self.session_metrics['violationsDetected'] += review_result.get('totalViolations', 0)
        self.session_metrics['complianceScoreSum'] += review_result.get('complianceScore', 0)
        self.session_metrics['llmTokensUsed'] += review_result.get('llmTokensUsed', 0)
        self.session_metrics['llmCostUsd'] += review_result.get('llmCostUsd', 0.0)
        self.session_metrics['reviewSessions'] += 1

    def _update_leaderboard(self):
        """Update leaderboard with current session metrics"""
        try:
            files_reviewed = self.session_metrics['filesReviewed']
            avg_compliance = (
                self.session_metrics['complianceScoreSum'] / files_reviewed
                if files_reviewed > 0 else 0
            )

            metrics = {
                'filesGenerated': files_reviewed,
                'violationsDetected': self.session_metrics['violationsDetected'],
                'complianceScore': avg_compliance,
                'reviewSessions': self.session_metrics['reviewSessions'],
                'llmTokensUsed': self.session_metrics['llmTokensUsed'],
                'llmApiCalls': self.session_metrics['reviewSessions'],
                'llmCostUsd': self.session_metrics['llmCostUsd']
            }

            # Get developer info from environment
            developer_name = os.getenv('DEVELOPER_NAME', None)
            developer_email = os.getenv('DEVELOPER_EMAIL', None)

            result = self.reviewer.update_leaderboard(metrics, developer_name, developer_email)
            MCPLogger.log_leaderboard_update(result)

        except Exception as e:
            print(f"⚠️  Failed to update leaderboard: {e}")
            MCPLogger.log_leaderboard_update({'success': False, 'error': str(e)})

    def get_session_summary(self) -> Dict[str, Any]:
        """Get summary of current session"""
        files_reviewed = self.session_metrics['filesReviewed']
        avg_compliance = (
            self.session_metrics['complianceScoreSum'] / files_reviewed
            if files_reviewed > 0 else 0
        )

        return {
            'filesReviewed': files_reviewed,
            'avgCompliance': round(avg_compliance, 2),
            'totalViolations': self.session_metrics['violationsDetected'],
            'totalCost': round(self.session_metrics['llmCostUsd'], 4),
            'tokensUsed': self.session_metrics['llmTokensUsed']
        }

    def stop(self):
        """Stop the processor thread"""
        self.running = False
        if self.processor_thread.is_alive():
            self.processor_thread.join(timeout=5)


class MCPAgent:
    """Main MCP agent that monitors workspace"""

    def __init__(self, workspace_path: str = "/workspace"):
        self.workspace_path = workspace_path
        self.observer = None
        self.handler = None
        self.reviewer = None
        self.feedback_gen = None

    def start(self):
        """Start monitoring workspace"""
        print(f"\n🚀 Starting MCP Agent...")
        print(f"📂 Workspace: {self.workspace_path}")

        # Verify workspace exists
        if not os.path.exists(self.workspace_path):
            print(f"❌ Workspace directory not found: {self.workspace_path}")
            return False

        # Initialize components
        print("🔧 Initializing components...")
        self.reviewer = CodeReviewer()
        self.feedback_gen = FeedbackGenerator()

        # Validate session
        print("🔐 Validating session...")
        if not self.reviewer.validate_session():
            print("❌ Session validation failed - check your credentials")
            return False

        # Check API health
        print("📡 Checking API health...")
        if not self.reviewer.health_check():
            print("⚠️  API health check failed - continuing anyway")

        # Start file watcher
        print("👁️  Starting file watcher...")
        self.handler = CodeFileHandler(self.workspace_path, self.reviewer, self.feedback_gen)
        self.observer = Observer()
        self.observer.schedule(self.handler, self.workspace_path, recursive=True)
        self.observer.start()

        print(f"✅ MCP Agent is monitoring: {self.workspace_path}")
        print(f"   Supported file types: {', '.join(sorted(CodeFileHandler.SUPPORTED_EXTENSIONS))}")
        print(f"   Ignored directories: {', '.join(sorted(CodeFileHandler.IGNORE_DIRS))}")
        print("\n⏳ Waiting for file changes... (Press Ctrl+C to stop)\n")

        return True

    def stop(self):
        """Stop monitoring"""
        print("\n🛑 Stopping MCP Agent...")

        if self.handler:
            self.handler.stop()

        if self.observer:
            self.observer.stop()
            self.observer.join()

        # Print session summary
        if self.handler:
            summary = self.handler.get_session_summary()
            print("\n📊 Session Summary:")
            print(f"   Files reviewed: {summary['filesReviewed']}")
            print(f"   Avg compliance: {summary['avgCompliance']}%")
            print(f"   Total violations: {summary['totalViolations']}")
            print(f"   Total cost: ${summary['totalCost']}")
            print(f"   Tokens used: {summary['tokensUsed']}")

        print("\n✅ MCP Agent stopped")

    def run(self):
        """Run agent (blocking)"""
        if not self.start():
            return

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()


# Main entry point
if __name__ == "__main__":
    workspace = os.getenv('WORKSPACE_PATH', '/workspace')
    agent = MCPAgent(workspace_path=workspace)
    agent.run()
