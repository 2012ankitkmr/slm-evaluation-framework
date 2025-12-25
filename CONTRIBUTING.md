# Contributing to SLM Evaluation Framework

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🌟 Ways to Contribute

- **Report Bugs**: Help us identify and fix issues
- **Suggest Features**: Share ideas for new functionality
- **Improve Documentation**: Fix typos, clarify instructions, add examples
- **Submit Code**: Fix bugs, implement features, optimize performance
- **Share Use Cases**: Add new evaluation scenarios and datasets

## 🐛 Reporting Bugs

Before submitting a bug report:
1. Check the [existing issues](https://github.com/yourusername/slm_eval_framework/issues) to avoid duplicates
2. Verify the bug exists in the latest version
3. Collect relevant information (OS, Python version, Ollama version, error messages)

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., macOS 14.0]
- Python: [e.g., 3.13.0]
- Ollama: [e.g., 0.1.20]
- Browser: [e.g., Chrome 120]

**Screenshots/Logs**
If applicable, add screenshots or error logs.
```

## 💡 Suggesting Features

Feature requests are welcome! Please:
1. Check if the feature has already been requested
2. Clearly describe the use case and expected behavior
3. Explain why this feature would benefit the community

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
What other approaches did you consider?
```

## 🔧 Development Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- Ollama (running locally)
- Git

### Setup Instructions

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/slm_eval_framework.git
   cd slm_eval_framework
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install black pytest  # Development tools
   ```

3. **Frontend Setup**
   ```bash
   cd slm-eval-app
   npm install
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

## 📝 Code Style Guidelines

### Python (Backend)

- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use `black` for automatic formatting:
  ```bash
  black backend/
  ```
- Add type hints where possible:
  ```python
  def format_prompt(prompt_config: PromptConfig, sample: dict) -> str:
      ...
  ```
- Write docstrings for functions and classes:
  ```python
  def call_ollama(model: str, prompt: str) -> str:
      """
      Calls Ollama generate API.
      
      Args:
          model: Name of the Ollama model to use
          prompt: Formatted prompt string
          
      Returns:
          Generated response from the model
      """
  ```

### JavaScript/React (Frontend)

- Use ESLint + Prettier with Airbnb config
- Format code before committing:
  ```bash
  npm run lint
  npm run format
  ```
- Use functional components with hooks
- Keep components focused and reusable
- Add PropTypes or TypeScript types

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): add support for custom scoring functions
fix(frontend): resolve CORS error on evaluation start
docs(readme): update installation instructions
refactor(api): simplify job processing logic
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd slm-eval-app
npm run test
```

### Manual Testing
Before submitting a PR:
1. Test the backend API endpoints using `/docs`
2. Run a complete evaluation workflow in the UI
3. Verify all pages render correctly
4. Check browser console for errors

## 📤 Submitting a Pull Request

1. **Update Your Branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run Tests**
   ```bash
   # Backend
   cd backend && pytest tests/
   
   # Frontend
   cd slm-eval-app && npm run test
   ```

3. **Push Changes**
   ```bash
   git push origin feat/your-feature-name
   ```

4. **Create Pull Request**
   - Go to GitHub and create a PR from your branch
   - Fill out the PR template with:
     - Clear description of changes
     - Related issue numbers (if applicable)
     - Screenshots/GIFs for UI changes
     - Testing steps

5. **Code Review**
   - Address reviewer feedback
   - Keep the PR focused on a single feature/fix
   - Be responsive to comments

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated (README, docstrings, comments)
- [ ] All tests pass locally
- [ ] Commit messages follow Conventional Commits
- [ ] No merge conflicts with main branch
- [ ] Screenshots included for UI changes

## 🎯 Adding New Features

### Adding a New Use Case

1. Edit `backend/main.py`:
   ```python
   USE_CASES.append(
       UseCase(
           id="YOUR_ID",
           name="Your Use Case Name",
           description="Description of the use case",
           dataset_count=100,
           dataset_source="hf:dataset_name:subset",
           prompts=[...]
       )
   )
   ```

2. Test the use case:
   - Verify dataset loads correctly
   - Run an evaluation
   - Check results in the visualizer

### Adding a Custom Scoring Function

1. Create a new scoring function in `backend/main.py`:
   ```python
   def custom_score(response: str, expected: str) -> float:
       """Your custom scoring logic"""
       # Implementation
       return score
   ```

2. Integrate into the evaluation pipeline in `process_job()`

3. Add tests for the scoring function

## 📚 Documentation

When adding features:
- Update the README if user-facing
- Add docstrings to new functions/classes
- Update API documentation comments
- Consider adding examples to the comprehensive writeup

## 🤔 Questions?

- **General Questions**: Use [GitHub Discussions](https://github.com/yourusername/slm_eval_framework/discussions)
- **Bug Reports**: Use [GitHub Issues](https://github.com/yourusername/slm_eval_framework/issues)
- **Security Issues**: Email security@example.com (do not create public issues)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept responsibility for mistakes
- Prioritize the community's best interests

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions
- The GitHub contributors page

Thank you for making the SLM Evaluation Framework better! 🚀
