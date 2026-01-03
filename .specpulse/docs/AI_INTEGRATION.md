# SpecPulse AI Integration Guide

This guide explains how AI assistants integrate with SpecPulse for specification-driven development.

## 🤖 Supported AI Platforms

### Claude Code
- **Location**: `.claude/commands/`
- **Commands**: `/sp-*` slash commands
- **Files**: Markdown format (.md)

### Gemini CLI
- **Location**: `.gemini/commands/`
- **Commands**: `/sp-*` commands
- **Files**: TOML format (.toml)

## 🔄 CLI-AI Collaboration Pattern

### Critical Design Principle: CLI First, AI Enhanced

```
User Request → AI Command → CLI Command → File Creation → AI Enhancement
     ↓              ↓           ↓            ↓           ↓
  /sp-spec     Claude/Gemini  specpulse    Empty spec   Detailed spec
  "OAuth2"    detects intent    create      template    expansion
```

### 1. AI Command Detection
AI platforms detect user intent and route to appropriate SpecPulse CLI commands:

**Claude Code**:
```bash
# User: /sp-spec "OAuth2 authentication with JWT"
# AI detects intent and runs:
specpulse spec create "OAuth2 authentication with JWT"
```

**Gemini CLI**:
```bash
# User: /sp-spec "User authentication system"
# AI detects intent and runs:
specpulse spec create "User authentication system"
```

### 2. CLI Command Execution
CLI commands create the foundation:
- ✅ Directory structure
- ✅ Empty templates with metadata
- ✅ File naming conventions
- ✅ Context updates

### 3. AI Content Enhancement
AI expands the CLI-created templates:
- 📝 Detailed specifications
- 🏗️ Implementation plans
- 📋 Task breakdowns
- 🔍 Technical insights

## 🛡️ Fallback Protection System

When CLI commands fail, AI automatically applies fallback procedures:

### Detection Patterns
```python
def detect_cli_failure(result):
    # Check exit codes
    if result.exit_code != 0:
        return True

    # Check error patterns
    error_patterns = [
        "command not found",
        "Permission denied",
        "No such file",
        "ModuleNotFoundError"
    ]

    for pattern in error_patterns:
        if pattern in result.stderr.lower():
            return True

    return False
```

### Fallback Procedures
1. **Directory Creation**: Manual mkdir commands
2. **Template Usage**: Embedded templates from AI
3. **Metadata Generation**: Automatic ID assignment
4. **File Operations**: Safe file creation with proper encoding

## 📋 Command Reference

### Feature Management
```bash
# Claude Code
/sp-pulse <feature-name>              # Initialize feature
/sp-continue <feature-id>            # Switch to existing feature
/sp-status                           # Show project status

# Gemini CLI
/sp-pulse <feature-name>              # Initialize feature
/sp-continue <feature-id>            # Switch to existing feature
/sp-status                           # Show project status

# CLI Equivalent
specpulse feature init <name>
specpulse feature continue <id>
specpulse feature list
```

### Specification Management
```bash
# Claude Code
/sp-spec create "description"         # Create specification
/sp-spec validate <spec-id>          # Validate specification
/sp-spec expand <spec-id>            # Expand with details

# Gemini CLI
/sp-spec create "description"         # Create specification
/sp-spec validate <spec-id>          # Validate specification
/sp-spec expand <spec-id>            # Expand with details

# CLI Equivalent
specpulse spec create "description"
specpulse spec validate <id>
```

### Planning & Tasks
```bash
# Claude Code
/sp-plan                             # Generate implementation plan
/sp-task <plan-id>                    # Create task breakdown
/sp-execute                          # Execute next task

# Gemini CLI
/sp-plan                             # Generate implementation plan
/sp-task <plan-id>                    # Create task breakdown
/sp-execute                          # Execute next task

# CLI Equivalent
specpulse plan create "description"
specpulse task breakdown <plan-id>
```

## 🔄 Workflow Examples

### Complete Feature Development

1. **Initialize Feature**
   ```bash
   /sp-pulse user-authentication
   # Creates: .specpulse/specs/001-user-authentication/
   ```

2. **Create Specification**
   ```bash
   /sp-spec create "OAuth2 login with JWT tokens"
   # Creates: spec-001.md with AI-enhanced content
   ```

3. **Generate Implementation Plan**
   ```bash
   /sp-plan
   # Creates: plan-001.md with detailed phases
   ```

4. **Break Down Tasks**
   ```bash
   /sp-task plan-001
   # Creates: task-001.md, task-002.md, etc.
   ```

5. **Execute Tasks**
   ```bash
   /sp-execute
   # Implements tasks sequentially
   ```

### Specification Refinement

1. **Initial Spec Creation**
   ```bash
   /sp-spec create "Payment processing system"
   ```

2. **Validation Check**
   ```bash
   /sp-spec validate spec-001
   ```

3. **Content Expansion**
   ```bash
   /sp-spec expand spec-001
   # AI adds detailed requirements, constraints, etc.
   ```

## 🔧 Configuration

### AI Assistant Setup
```yaml
# .specpulse/config.yaml
ai:
  primary: claude  # claude or gemini
  fallback: true   # Enable fallback protection
  logging: true    # Log AI operations

templates:
  spec: .specpulse/templates/spec.md
  plan: .specpulse/templates/plan.md
  task: .specpulse/templates/task.md
```

### Custom Commands
Users can create custom AI commands:

```markdown
# .claude/commands/custom-research.md
# Custom research command

## Usage
/research "topic"

## Implementation
AI should:
1. Research the topic using available tools
2. Create a specification in .specpulse/specs/
3. Generate implementation plan
4. Break down into actionable tasks
```

## 🚨 Error Handling

### CLI Failure Scenarios
1. **Command Not Found**
   - Apply fallback procedures
   - Use embedded templates
   - Log the failure

2. **Permission Denied**
   - Try alternative paths
   - Use temporary directory
   - Notify user

3. **Missing Dependencies**
   - Create manual workarounds
   - Use basic file operations
   - Continue with reduced functionality

### Recovery Procedures
```python
# AI should implement recovery logic
try:
    result = execute_cli_command(command)
except CLIError as e:
    log_error(f"CLI failed: {e}")
    fallback_result = apply_fallback_procedure()
    return fallback_result
```

## 📊 Success Metrics

### AI Integration Success
- ✅ **CLI Success Rate**: >95%
- ✅ **Fallback Success Rate**: >90%
- ✅ **User Satisfaction**: Seamless workflow
- ✅ **Error Recovery**: Zero user intervention required

### Quality Indicators
- ✅ **Specification Quality**: Complete and detailed
- ✅ **Plan Quality**: Realistic timelines and phases
- ✅ **Task Quality**: Actionable and specific
- ✅ **Progress Tracking**: Continuous monitoring

## 🔗 Resources

- **AI Fallback Guide**: `.specpulse/docs/AI_FALLBACK_GUIDE.md`
- **Project Status**: `.specpulse/memory/context.md`
- **Validation Rules**: `.specpulse/validation_rules.yaml`
- **Templates**: `.specpulse/templates/`

## 🤖 AI Best Practices

1. **Always try CLI first** - CLI provides structure and consistency
2. **Use fallbacks gracefully** - Never let user workflows stop
3. **Enhance, don't replace** - AI adds value to CLI foundation
4. **Maintain context** - Track project state and user preferences
5. **Validate continuously** - Ensure quality and completeness

---

*Generated by SpecPulse v2.7.1*
*Created: 2026-01-03T19:04:25.154698*
