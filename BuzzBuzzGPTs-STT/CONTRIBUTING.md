# Contributing to BuzzBuzzGPTs-STT

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/BuzzBuzzGPTs-STT.git
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install pytest black flake8 mypy
   ```

5. Copy `.env.example` to `.env` and configure

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Test improvements
- `refactor/` - Code refactoring

### 2. Make Changes

Follow the coding standards:

- Use type hints
- Add docstrings to all functions/classes
- Keep functions small and focused
- Use meaningful variable names

### 3. Write Tests

All new code should have tests:

```python
# tests/test_your_feature.py
import unittest

class TestYourFeature(unittest.TestCase):
    def test_something(self):
        # Test code here
        pass
```

Run tests:
```bash
pytest tests/ -v
```

### 4. Format Code

```bash
# Format with black
black .

# Sort imports
isort .

# Lint with flake8
flake8 .
```

### 5. Commit Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new transcription feature"
git commit -m "fix: resolve audio capture issue"
git commit -m "docs: update README with examples"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `chore`: Maintenance

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat: add speaker diarization support
fix: resolve memory leak in transcriber
docs: improve installation instructions
```

### PR Description

Include:
1. **What**: What does this PR do?
2. **Why**: Why is this change needed?
3. **How**: How does it work?
4. **Testing**: How was it tested?

Example:
```markdown
## What
Adds retry logic to model loading

## Why
Model loading sometimes fails due to network issues

## How
Implements exponential backoff retry mechanism with configurable max attempts

## Testing
- Added unit tests for retry logic
- Manually tested with network interruptions
- All existing tests pass
```

### Checklist

Before submitting:

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented if unavoidable)
- [ ] Commits are signed
- [ ] Branch is up to date with main

## Coding Standards

### Python Style

Follow PEP 8 with these specifics:

- Line length: 100 characters (not 79)
- Use type hints
- Use f-strings for formatting
- Prefer explicit over implicit

### Docstrings

Use Google style:

```python
def function_name(param1: str, param2: int) -> bool:
    """Brief description.
    
    Longer description if needed.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        
    Returns:
        Description of return value
        
    Raises:
        ValueError: When value is invalid
    """
    pass
```

### Type Hints

Always use type hints:

```python
from typing import Optional, List, Dict

def process_audio(
    audio_data: np.ndarray,
    sample_rate: int = 16000
) -> Optional[str]:
    """Process audio data."""
    pass
```

### Error Handling

Use specific exceptions:

```python
try:
    result = risky_operation()
except SpecificError as e:
    logger.error(f"Operation failed: {e}")
    raise CustomException(f"Failed to process: {e}") from e
```

### Logging

Use structured logging:

```python
from logger_config import get_logger

logger = get_logger(__name__)

logger.info("Processing started", extra={
    "file": filename,
    "size": file_size
})
```

## Testing Guidelines

### Test Structure

```python
class TestFeature(unittest.TestCase):
    def setUp(self):
        """Setup test fixtures."""
        pass
    
    def tearDown(self):
        """Cleanup after tests."""
        pass
    
    def test_specific_behavior(self):
        """Test one specific thing."""
        # Arrange
        input_data = create_test_data()
        
        # Act
        result = function_under_test(input_data)
        
        # Assert
        self.assertEqual(result, expected_output)
```

### Mocking

Use mocks for external dependencies:

```python
from unittest.mock import Mock, patch

@patch('module.external_dependency')
def test_with_mock(self, mock_dep):
    mock_dep.return_value = test_value
    # Test code
```

### Test Coverage

Aim for >80% code coverage:

```bash
pytest --cov=. --cov-report=html
```

## Documentation

### Code Comments

- Explain **why**, not **what**
- Keep comments up to date
- Remove obsolete comments

### README Updates

Update README.md when:
- Adding new features
- Changing configuration
- Updating requirements

### API Documentation

Document all public APIs with docstrings.

## Review Process

### As a Contributor

- Be patient during review
- Be open to feedback
- Make requested changes promptly
- Ask questions if unclear

### As a Reviewer

- Be constructive and kind
- Explain reasoning for changes
- Approve when ready
- Test the changes locally

## Release Process

Maintainers will:

1. Review and merge PRs
2. Update version numbers
3. Create release notes
4. Tag releases
5. Deploy to production

## Questions?

- Open an issue for questions
- Join discussions
- Check existing issues/PRs

## Thank You!

Your contributions make this project better! 🎉
