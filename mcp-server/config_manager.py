"""
MCP Config Manager
Handles decryption of MCP configuration on startup
Uses project_id to decrypt API keys and settings
"""

import json
import base64
import hashlib
from typing import Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import os
from logger import MCPLogger

class ConfigManager:
    """Manages MCP configuration decryption and loading"""

    def __init__(self, config_file_path: str = "mcp-config.json"):
        self.config_file_path = config_file_path
        self.config: Dict[str, Any] = {}
        self.platform_api_key: str = ""
        self.encrypted_platform_api_key: str = ""
        self.llm_config: Dict[str, Any] = {}

    def load_config(self) -> bool:
        """Load encrypted config from JSON file"""
        try:
            if not os.path.exists(self.config_file_path):
                print(f"❌ Config file not found: {self.config_file_path}")
                return False

            with open(self.config_file_path, 'r') as f:
                self.config = json.load(f)

            print(f"✅ Loaded config file: {self.config_file_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to load config: {e}")
            return False

    def decrypt_config(self) -> bool:
        """Decrypt both platform API key and LLM config using project_id"""
        try:
            project_id = self.config.get('projectId')
            if not project_id:
                print("❌ Missing project_id in config")
                return False

            print(f"🔐 Decrypting configuration for project: {project_id[:8]}...")

            # Decrypt platform API key
            encrypted_platform_key = self.config.get('encryptedPlatformApiKey')
            if encrypted_platform_key:
                self.encrypted_platform_api_key = encrypted_platform_key
                self.platform_api_key = self._decrypt_token(encrypted_platform_key, project_id)
                print(f"✅ Decrypted ProjexLight API key")
            else:
                print("❌ Missing encryptedPlatformApiKey")
                return False

            # Decrypt LLM config
            encrypted_llm_config = self.config.get('encryptedLLMConfig')
            if encrypted_llm_config:
                llm_config_json = self._decrypt_token(encrypted_llm_config, project_id)
                self.llm_config = json.loads(llm_config_json)
                print(f"✅ Decrypted LLM configuration (provider: {self.llm_config.get('provider')})")
            else:
                print("❌ Missing encryptedLLMConfig")
                return False

            MCPLogger.log_config_decrypt(True)
            return True
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Failed to decrypt config: {error_msg}")
            MCPLogger.log_config_decrypt(False, error_msg)
            return False

    def set_environment_variables(self) -> bool:
        """Set environment variables from decrypted configuration"""
        try:
            # Platform API Configuration
            os.environ['PROJEXLIGHT_ENCRYPTED_API_KEY'] = self.encrypted_platform_api_key
            os.environ['PROJEXLIGHT_API_KEY'] = self.platform_api_key
            os.environ['PROJEXLIGHT_PROJECT_ID'] = self.config.get('projectId', '')
            os.environ['PROJEXLIGHT_SPRINT_ID'] = self.config.get('sprintId', '')

            # LLM Configuration
            os.environ['LLM_PROVIDER'] = self.llm_config.get('provider', 'openai')
            os.environ['LLM_API_KEY'] = self.llm_config.get('apiKey', '')
            os.environ['LLM_MODEL_REVIEW'] = self.llm_config.get('models', {}).get('review', 'gpt-4-turbo')
            os.environ['LLM_MODEL_EMBEDDING'] = self.llm_config.get('models', {}).get('embedding', 'text-embedding-ada-002')
            os.environ['LLM_MODEL_AUTOFIX'] = self.llm_config.get('models', {}).get('autoFix', 'gpt-4-turbo')
            os.environ['LLM_MAX_TOKENS'] = str(self.llm_config.get('maxTokens', 4000))
            os.environ['LLM_TEMPERATURE'] = str(self.llm_config.get('temperature', 0.1))

            print(f"✅ Environment variables set from decrypted config")
            if self.config.get('sprintId'):
                print(f"   Sprint ID: {self.config.get('sprintId')[:8]}...")
            return True
        except Exception as e:
            print(f"❌ Failed to set environment variables: {e}")
            return False

    def _decrypt_token(self, encrypted_token: str, project_id: str) -> str:
        """
        Decrypt token using AES-256-GCM with project_id as key source
        Matches MCPEncryptionService.ts decryption logic
        Format: Base64-encoded concatenated buffer: salt(64) + iv(16) + tag(16) + encrypted
        """
        try:
            # Decode base64 to get combined buffer
            combined = base64.b64decode(encrypted_token)

            # Extract parts by byte positions (matching Node.js)
            salt_length = 64
            iv_length = 16
            tag_length = 16

            salt = combined[:salt_length]
            iv = combined[salt_length:salt_length + iv_length]
            tag = combined[salt_length + iv_length:salt_length + iv_length + tag_length]
            encrypted_data = combined[salt_length + iv_length + tag_length:]

            # Derive key from project_id using PBKDF2 (matches Node.js crypto.pbkdf2Sync)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,  # 256 bits for AES-256
                salt=salt,
                iterations=100000,  # Same as Node.js implementation
                backend=default_backend()
            )
            key = kdf.derive(project_id.encode('utf-8'))

            # Decrypt using AES-256-GCM
            aesgcm = AESGCM(key)
            decrypted = aesgcm.decrypt(iv, encrypted_data + tag, None)

            return decrypted.decode('utf-8')
        except Exception as e:
            raise Exception(f"Decryption failed: {e}")

    def generate_env_file(self, output_path: str = ".env") -> bool:
        """Generate .env file with decrypted configuration"""
        try:
            env_content = f"""# ProjexLight MCP Server Configuration
# Auto-generated - Do not edit manually

# Platform API Configuration
PROJEXLIGHT_API_URL={os.getenv('PROJEXLIGHT_API_URL', 'https://api.projexlight.com')}
PROJEXLIGHT_API_KEY={self.platform_api_key}
PROJEXLIGHT_ENCRYPTED_API_KEY={self.encrypted_platform_api_key}
PROJEXLIGHT_PROJECT_ID={self.config.get('projectId')}
PROJEXLIGHT_SPRINT_ID={self.config.get('sprintId', '')}

# LLM Provider Configuration (Tenant Defaults)
LLM_PROVIDER={self.llm_config.get('provider', 'openai')}
LLM_API_KEY={self.llm_config.get('apiKey', '')}
LLM_MODEL_REVIEW={self.llm_config.get('models', {}).get('review', 'gpt-4-turbo')}
LLM_MODEL_EMBEDDING={self.llm_config.get('models', {}).get('embedding', 'text-embedding-ada-002')}
LLM_MODEL_AUTOFIX={self.llm_config.get('models', {}).get('autoFix', 'gpt-4-turbo')}
LLM_MAX_TOKENS={self.llm_config.get('maxTokens', 4000)}
LLM_TEMPERATURE={self.llm_config.get('temperature', 0.1)}

# MCP Server Configuration
MCP_SERVER_PORT=8766
MCP_LOG_LEVEL=INFO
MCP_AUTO_FIX_ENABLED=true
MCP_COMPLIANCE_THRESHOLD=80

# Workspace Configuration
WORKSPACE_PATH=/workspace
FEEDBACK_PATH=/feedback
"""

            with open(output_path, 'w') as f:
                f.write(env_content)

            print(f"✅ Generated .env file: {output_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to generate .env file: {e}")
            return False

    def get_config_summary(self) -> Dict[str, Any]:
        """Get configuration summary (without sensitive data)"""
        sprint_id = self.config.get('sprintId', '')
        return {
            "projectId": self.config.get('projectId', 'unknown')[:8] + "...",
            "sprintId": (sprint_id[:8] + "...") if sprint_id else "not set",
            "configVersion": self.config.get('configVersion', 'unknown'),
            "expiresAt": self.config.get('expiresAt', 'unknown'),
            "llmProvider": self.llm_config.get('provider', 'unknown'),
            "reviewModel": self.llm_config.get('models', {}).get('review', 'unknown'),
            "hasApiKey": bool(self.platform_api_key),
            "hasLLMKey": bool(self.llm_config.get('apiKey'))
        }


def main():
    """Standalone config initialization script"""
    print("🚀 Starting MCP Configuration Manager...")

    config_manager = ConfigManager()

    # Step 1: Load config
    if not config_manager.load_config():
        print("❌ Failed to load configuration file")
        exit(1)

    # Step 2: Decrypt
    if not config_manager.decrypt_config():
        print("❌ Failed to decrypt configuration")
        exit(1)

    # Step 3: Generate .env
    if not config_manager.generate_env_file():
        print("❌ Failed to generate .env file")
        exit(1)

    # Step 4: Summary
    summary = config_manager.get_config_summary()
    print("\n📊 Configuration Summary:")
    for key, value in summary.items():
        print(f"   {key}: {value}")

    print("\n✅ MCP Server configuration ready!")


if __name__ == "__main__":
    main()
