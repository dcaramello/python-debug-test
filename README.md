# Python Debug Test

A Visual Studio Code extension that simplifies debugging Python tests by adding convenient debug buttons directly in your code.

## Features

🔍 **One-Click Debugging**
- Debug pytest tests instantly
- Debug unittest tests with a single click
- Full debugging capabilities (breakpoints, variable inspection, step-by-step execution)
- No configuration needed - works out of the box!

⚙️ **Smart Configuration**
- Automatic launch.json setup
- Django projects support
- Intelligent test path handling for both pytest and unittest
- Seamless integration with VS Code's debugging features

🎯 **Framework Support**
- pytest: Supports modern pytest features
- unittest: Full unittest framework support
- Django test support included

## Getting Started

1. Install the extension from VS Code Marketplace
2. Open a Python test file
3. Look for the debug buttons above your test methods:
   - "▶ Run with pytest"
   - "▶ Run with unittest"
4. Click and start debugging!

## Examples

### Pytest Test File
```python
# test_example.py
class TestCalculator:
    def test_addition(self):
        result = 2 + 2
        assert result == 4
```
Debug button will use: `test_example.py::TestCalculator::test_addition`

### Unittest Test File
```python
# test_feature.py
from unittest import TestCase

class TestFeature(TestCase):
    def test_something(self):
        self.assertTrue(True)
```
Debug button will use: `test_feature.TestFeature.test_something`

### Django Test File
```python
# tests/test_views.py
from django.test import TestCase

class TestViews(TestCase):
    def test_home_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
```

## Requirements

- Visual Studio Code 1.97.0 or higher
- Python extension for VS Code
- Python 3.7 or higher
- pytest and/or unittest installed in your environment

## Extension Settings

This extension contributes the following commands to the Command palette:

* `extension.runPytestTest`: Debug the current test using pytest
* `extension.runUnittestTest`: Debug the current test using unittest

## Installation

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Python Debug Test"
4. Click Install
5. Reload VS Code if prompted

Alternatively, you can install it directly from the command palette:
1. Press `Ctrl+P` / `Cmd+P`
2. Type `ext install dcaramello.python-debug-test`

## Features in Detail

### Automatic Test Discovery
- Automatically detects test methods in your Python files
- Supports both pytest and unittest style tests
- Works with class-based and function-based tests

### Smart Path Handling
- Automatically determines the correct test path format
- Handles both pytest and unittest path conventions
- Supports Django test discovery

### Debug Configuration
- Automatically creates/updates launch.json
- Configures the appropriate test framework
- Sets up the correct working directory
- Handles Django settings automatically

### Visual Feedback
- Clear indication of test locations
- Easy-to-use debug buttons
- Intuitive interface

## Troubleshooting

### Common Issues

1. **Debug buttons not showing**
   - Make sure you're in a Python test file
   - Check that the file name starts or ends with "test"
   - Verify that your test functions/methods start with "test"

2. **Tests not running**
   - Verify pytest/unittest is installed in your environment
   - Check your Python interpreter settings
   - Make sure your project structure is correct

3. **Django tests not working**
   - Verify Django is installed
   - Check that manage.py is in your project root
   - Ensure DJANGO_SETTINGS_MODULE is correctly set

### Getting Help

If you encounter any issues:

1. Check the [Known Issues](#known-issues) section
2. Visit our [GitHub Issues](https://github.com/dcaramello/python-debug-test/issues) page
3. Submit a new issue with:
   - VS Code version
   - Python version
   - Extension version
   - Error message (if any)
   - Steps to reproduce

## Known Issues

- None currently reported

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## Privacy and Security

This extension:
- Does not collect any user data
- Does not send any information to external servers
- Only reads your Python test files locally
- Requires minimal permissions

## Release Notes

### 0.0.1 (2024-02-17)

Initial release of Python Debug Test:
- Support for pytest and unittest
- Django integration
- Automatic launch.json configuration
- Debug buttons above test methods

## Support

Need help? Have a feature request? Found a bug?
- [GitHub Issues](https://github.com/dcaramello/python-debug-test/issues)
- [Documentation](https://github.com/dcaramello/python-debug-test/wiki)

## License

This extension is licensed under the [MIT License](LICENSE).

## Credits

Created by Dimitri Caramello

Last updated: 2024-02-17 14:27:50# python-debug-test
# python-debug-test
