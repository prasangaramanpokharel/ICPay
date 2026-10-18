# Google Antigravity (AGY): The Definitive Architecture & Power Manual

> Comprehensive technical reference, configuration formats, customization architecture, subagent orchestration, and developer integration manual for Google Antigravity.

---

## Table of Contents

1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [The Operating Surfaces](#2-the-operating-surfaces)
   - [Antigravity 2.0 Desktop](#antigravity-20-desktop-application)
   - [Antigravity IDE](#antigravity-ide)
   - [Antigravity CLI (`agy`) & Python SDK](#antigravity-cli-agy--python-sdk)
3. [Maximum Power Capabilities](#3-maximum-power-capabilities)
   - [Full System Agency & Tooling](#a-full-system-agency--tooling)
   - [Subagent Swarm Orchestration](#b-subagent-swarm-orchestration)
   - [Scheduled Automations & Sidecars](#c-scheduled-automations--sidecars)
   - [Progressive Disclosure & Token Budgeting](#d-progressive-disclosure--token-budgeting)
   - [Generative UI & Interactive Artifacts](#e-generative-ui--interactive-artifacts)
4. [Customization Formats & Specifications](#4-customization-formats--specifications)
   - [1. Workspace & Directory Rules (`GEMINI.md` / `AGENTS.md`)](#1-workspace--directory-rules-geminimd--agentsmd)
   - [2. Skills Architecture (`SKILL.md`)](#2-skills-architecture-skillmd)
   - [3. Plugins Manifest (`plugin.json`)](#3-plugins-manifest-pluginjson)
   - [4. Lifecycle Hooks (`hooks.json`)](#4-lifecycle-hooks-hooksjson)
   - [5. Model Context Protocol (`mcp_config.json`)](#5-model-context-protocol-mcp_configjson)
   - [6. Scheduled Automations (`sidecar.json`)](#6-scheduled-automations-sidecarjson)
   - [7. Explicit Declarations (`skills.json` / `plugins.json`)](#7-explicit-declarations-skillsjson--pluginsjson)
5. [Discovery Mechanics & Precedence Engine](#5-discovery-mechanics--precedence-engine)
6. [Security, Permissions & Sandboxing](#6-security-permissions--sandboxing)
7. [Developer Recipes & Real-World Use Cases](#7-developer-recipes--real-world-use-cases)
   - [Recipe A: Automated Pre-Commit Lint Hook](#recipe-a-automated-pre-commit-lint-hook)
   - [Recipe B: Database Inspection via MCP](#recipe-b-database-inspection-via-mcp)
   - [Recipe C: Headless Morning PR & CI Triage Sidecar](#recipe-c-headless-morning-pr--ci-triage-sidecar)
   - [Recipe D: Multi-Agent Parallel Monorepo Refactor](#recipe-d-multi-agent-parallel-monorepo-refactor)
8. [Quick Reference & Command Cheat Sheet](#8-quick-reference--command-cheat-sheet)

---

## 1. Executive Architecture Overview

Google Antigravity is an AI-first development and execution platform powered by Google DeepMind's Gemini models. Unlike traditional code-completion engines that merely provide autocomplete suggestions, Antigravity functions as an **autonomous software engineering system**.

```mermaid
flowchart TD
    User([User / Developer]) --> Surfaces[Surfaces: Desktop 2.0 / IDE / CLI / SDK]
    Surfaces --> CoreAgent[Antigravity Core Agent Loop]
    
    subgraph AgentEngine [Agent Core & Memory]
        CoreAgent --> ContextEngine[Progressive Disclosure & Context Budgeter]
        CoreAgent --> ToolDispatcher[Tool Dispatcher & Permission Engine]
        CoreAgent --> SubagentMgr[Subagent Orchestration Manager]
    end

    subgraph Customizations [Customization System]
        ContextEngine --> Rules[Rules: GEMINI.md / AGENTS.md]
        ContextEngine --> Skills[Skills: SKILL.md]
        ContextEngine --> Plugins[Plugins: plugin.json]
    end

    subgraph ToolExec [Execution Layer]
        ToolDispatcher --> Hooks[Lifecycle Hooks: hooks.json]
        Hooks --> Terminal[Sandboxed Terminal / Shell]
        Hooks --> FS[File System Engine]
        Hooks --> MCP[Model Context Protocol Servers]
        Hooks --> Browser[Headless Browser Engine]
    end

    subgraph BackgroundDaemons [Asynchronous Runtime]
        SubagentMgr --> Subagents[Worker Agents / Swarm]
        CoreAgent --> Sidecars[Sidecars & Cron Automations]
    end
```

### Core Philosophies
- **System Agency**: The agent inspects codebases, modifies files, executes test suites, diagnoses build failures, and triggers remote APIs with minimal intervention.
- **Asynchronous Independence**: Background workers, long-running servers, and recurring schedules execute without halting interactive chat sessions.
- **Progressive Disclosure**: Keeps context windows lean and performant by loading detailed guides only when relevant.

---

## 2. The Operating Surfaces

Antigravity operates across three primary environments:

### Antigravity 2.0 Desktop Application
A standalone Electron-powered workstation designed for autonomous workflows:
- **Left-hand Navigation**: Switch projects, inspect background sidecars, monitor scheduled automations, and manage installed plugins.
- **Chat Canvas**: The main interactive interface supporting slash commands (`/`), `@` mentions, file drops, and multimodal media.
- **Auxiliary Pane**: Split view displaying active subagents, running background tasks, interactive artifacts, file diffs, and persistent terminal tabs.

### Antigravity IDE
A standalone integrated development environment built on top of VS Code:
1. **Antigravity Tab (Autocomplete / Supercomplete)**: Single-keystroke next-intent predictions, multi-line diff completions, jump-to-location, and automated import injections.
2. **Inline Command (`Cmd+I` / `Ctrl+I`)**: Localized code refactoring, inline generation, and docstring creation directly in the editor buffer.
3. **Sidebar Collaborative Agent**: Full-capability pair programming assistant capable of multi-step plans, terminal executions, and diagnostic auto-fixing from compiler warnings.

### Antigravity CLI (`agy`) & Python SDK
- **CLI (`agy`)**: Terminal tool to spin up headless agents, run slash commands, evaluate PRs, and install plugins directly from shell scripts.
- **Python SDK (`antigravity-sdk-python`)**: Programmatic API to lease agent instances, stream thoughts, register custom in-process tools, and orchestrate complex agent pipelines.

---

## 3. Maximum Power Capabilities

### A. Full System Agency & Tooling
Antigravity is equipped with system-level tools:
- **File System Operations**: Read, write, and patch files using contiguous block replacement tools (`replace_file_content`) to minimize token consumption and avoid file truncation.
- **Terminal Management**: Run foreground and persistent background processes (`run_command`), interact with running processes via stdin (`send_input`), and monitor process health.
- **Network & Browsing**: Extract text from remote documentation (`read_url_content`), perform web searches (`search_web`), and automate browser sessions.

### B. Subagent Swarm Orchestration
Antigravity can spawn subagents to handle complex or wide-ranging tasks:
- **Delegation**: Launch built-in subagents (`research`, `self`, `image-generator`) or define custom subagents on the fly (`define_subagent`).
- **Workspace Isolation**:
  - `inherit`: Shares the current working directory.
  - `branch`: Clones an isolated sandbox branch for destructive experiments.
  - `share`: Uses shared repository storage (git worktree style) for independent branch manipulation without duplicating disk storage.
- **Reactive Wakeup**: The parent agent yields execution while subagents run, automatically waking up when a subagent finishes or sends a message (`send_message`).

### C. Scheduled Automations & Sidecars
- **Unattended Cron Tasks**: Built-in sidecars run on exact cron schedules (e.g., `CRON_TZ=America/New_York 0 9 * * 1-5`) to execute routines independently.
- **Fresh Context per Run**: Each scheduled execution starts a fresh conversation (`agentapi new-conversation`) with explicitly granted tool permissions.

### D. Progressive Disclosure & Token Budgeting
- **Skill Inlining**: Only skill metadata (name and description) is loaded initially. The full `SKILL.md` body is fetched only when relevant.
- **Rules Budget**: Always-on and directory rules operate under an aggregate **20,000-token budget**. Rules exceeding the limit are automatically demoted to file-path pointers for on-demand inspection.
- **Per-File Rule Limit**: Individual rule files are capped at **24 KB (24,000 bytes)** to protect context window limits.

### E. Generative UI & Interactive Artifacts
- **Rich Visual Artifacts**: Creates and updates persistent markdown documents with KaTeX mathematical formulas, mermaid diagrams, and carousels.
- **Generative UI**: Injects live interactive HTML/JavaScript widgets directly into the chat session for dashboards, interactive controls, and visual data comparisons.

---

## 4. Customization Formats & Specifications

Antigravity uses standardized configuration files to control behavior and add custom capabilities.

### 1. Workspace & Directory Rules (`GEMINI.md` / `AGENTS.md`)
Placed in any directory to enforce guidelines for that folder and all its subdirectories.

- **File Names**: `GEMINI.md`, `AGENTS.md`, or `.agents/rules/*.md`
- **Format**: Plain Markdown (YAML frontmatter is ignored for directory rules).
- **Scope**: Hierarchical. The agent walks up from the active file's directory to the repository root, merging all found rules.

```markdown
# Repository Coding Standards

- All database queries must use prepared statements.
- Never commit unencrypted secrets or `.env` files.
- TypeScript functions must declare explicit return types.
- Follow test naming convention: `<module>.test.ts`.
```

---

### 2. Skills Architecture (`SKILL.md`)
Skills are modular runbooks that teach the agent specific, multi-step workflows.

- **Location**: `.agents/skills/<skill-name>/` or `~/.gemini/antigravity/builtin/skills/<skill-name>/`
- **File Structure**:
  ```text
  skills/<skill-name>/
  ├── SKILL.md          # Required: Instructions with YAML frontmatter
  ├── scripts/          # Optional: Executable shell/node scripts
  ├── examples/         # Optional: Code snippets & sample inputs
  ├── resources/        # Optional: Templates & data fixtures
  └── references/       # Optional: In-depth reference manuals
  ```

#### `SKILL.md` Specification
```markdown
---
name: service-deployer
description: "Use this skill whenever deploying services to staging or production environments."
metadata:
  icon: cloud_upload
---

# Service Deployment Runbook

Follow these steps precisely:

1. Validate local branch status:
   Ensure there are no uncommitted changes via `git status`.

2. Run pre-flight integration tests:
   ```bash
   npm run test:e2e
   ```

3. Execute deployment script:
   Run [deploy.sh](./scripts/deploy.sh) with the target environment flag:
   ```bash
   ./scripts/deploy.sh --env=staging
   ```

4. Verify health check:
   Check the endpoint at `https://staging.internal/healthz`.
```

---

### 3. Plugins Manifest (`plugin.json`)
Plugins package skills, rules, hooks, and MCP servers into a single, shareable bundle.

- **Location**: `.agents/plugins/<plugin-name>/` or `~/.gemini/config/plugins/<plugin-name>/`
- **Directory Layout**:
  ```text
  plugins/<plugin-name>/
  ├── plugin.json       # Required: Manifest
  ├── mcp_config.json   # Optional: Bundled MCP tools
  ├── hooks.json        # Optional: Lifecycle hooks
  ├── rules/            # Optional: Bundled AGENTS.md rules
  │   └── AGENTS.md
  └── skills/           # Optional: Bundled skills
      └── <skill-name>/
          └── SKILL.md
  ```

#### `plugin.json` Specification
```json
{
  "name": "enterprise-tooling-pack",
  "version": "1.2.0",
  "description": "Enterprise linting hooks, internal database MCP connectors, and deployment skills.",
  "disabled": false
}
```

---

### 4. Lifecycle Hooks (`hooks.json`)
Hooks execute shell scripts during the agent's internal tool-execution lifecycle.

- **Location**: `.agents/hooks.json` or `<plugin-dir>/hooks.json`
- **Available Events**:
  - `PreInvocation`: Runs before the agent starts processing a prompt.
  - `PreToolUse`: Runs immediately before a specific tool executes (can block/veto tool execution).
  - `PostToolUse`: Runs immediately after a tool finishes execution (used for linters, formatters, and diagnostics).

#### `hooks.json` Specification
```json
{
  "auto-formatter": {
    "PostToolUse": [
      {
        "matcher": "replace_file_content",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/lint-and-format.sh",
            "timeout": 15
          }
        ]
      }
    ]
  },
  "security-guard": {
    "enabled": true,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/safety-gate.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 5. Model Context Protocol (`mcp_config.json`)
Antigravity supports the open Model Context Protocol (MCP) to connect external tool providers.

- **Location**: `~/.gemini/config/mcp_config.json` (global) or `<plugin-dir>/mcp_config.json` (plugin-scoped).
- **Supported Transports**:
  1. **Stdio**: Spawns a local executable communicating over standard I/O.
  2. **Streamable HTTP**: Connects to a remote server endpoint via HTTP (e.g. `/mcp`).

#### `mcp_config.json` Specification
```json
{
  "mcpServers": {
    "database-inspector": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/main"],
      "env": {
        "PGTIMEOUT": "30000"
      }
    },
    "enterprise-cloud-api": {
      "url": "https://mcp.company.internal/mcp"
    }
  }
}
```

---

### 6. Scheduled Automations (`sidecar.json`)
Defines recurring or continuous background sidecars.

- **Location**: `~/.gemini/config/sidecars/<sidecar-id>/sidecar.json`
- **Schedule Syntax**: Standard 5-field cron expression, prefixed with `CRON_TZ=<IANA_Timezone>`.

#### `sidecar.json` Specification
```json
{
  "builtin": "schedule",
  "args": [
    "CRON_TZ=America/New_York 0 9 * * 1-5",
    "agentapi",
    "new-conversation",
    "--",
    "Review open pull requests in the repository and flag any with failing CI checks or broken dependencies."
  ],
  "restart_policy": "always",
  "display_name": "Daily PR Health Audit",
  "description": "Runs weekdays at 9:00 AM NY time to audit open pull requests.",
  "agent_permissions": {
    "workspace_uris": [
      "file:///Users/developer/projects/backend-service"
    ],
    "access_grants": [
      "command(gh pr list)",
      "command(gh pr view)",
      "read_url(github.com)"
    ]
  }
}
```

---

### 7. Explicit Declarations (`skills.json` / `plugins.json`)
Used to register skills or plugins stored in non-standard locations, or to share common configurations across repositories.

#### `skills.json`
```json
{
  "skills": [
    {
      "path": "/shared/team-skills/git-advanced",
      "enabled": true
    }
  ]
}
```

#### `plugins.json`
```json
{
  "plugins": [
    {
      "path": "/shared/plugins/cloud-infra",
      "enabled": true
    }
  ]
}
```

---

## 5. Discovery Mechanics & Precedence Engine

When Antigravity initializes, it discovers and resolves configurations according to a strict precedence hierarchy (highest to lowest priority):

```mermaid
flowchart TD
    P1[1. Workspace Project: Hierarchical walk from CWD to repo root] --> P2[2. Declared Workspace Configs: skills.json / plugins.json]
    P2 --> P3[3. Global Discovery: ~/.gemini/config/]
    P3 --> P4[4. Built-in Customizations: Bundled by application]
    P4 --> P5[5. Global Declared Configurations: Global JSON files]
```

### Conflict Resolution & Deduplication
- **Name Conflicts**: If two skills share identical `name` fields, the configuration higher in the precedence tree overrides the lower one.
- **Rule Deduplication**: Rule files are deduplicated by their canonical file paths. A rule is never injected into the context window more than once per conversation turn.
- **Toggling via Config**: Discovered plugins are enabled by default, but settings in `~/.gemini/config/config.json` override plugin defaults without modifying the plugin files.

---

## 6. Security, Permissions & Sandboxing

Antigravity operates with configurable security controls to match your environment:

### Tool Execution Policies
- `CASCADE_COMMANDS_AUTO_EXECUTION_EAGER` / `always-proceed`: Executes tools automatically without prompt confirmation.
- `request-review`: Prompts for developer confirmation before executing shell commands.
- `strict`: Prompts for confirmation on all command and file modification tools.
- `proceed-in-sandbox`: Executes terminal commands within an isolated filesystem sandbox.

### Scoped Access Grants
Permissions can be granted globally or per-project using granular grant syntax:
- `command(<prefix>)`: e.g. `command(git status)`, `command(npm test)`
- `read_file(<path>)`: Grants read access to a specific directory or file.
- `write_file(<path>)`: Grants write access to a specific file target.
- `read_url(<domain>)`: Restricts web fetching to approved domains (e.g. `read_url(github.com)`).
- `mcp(<server>/<tool>)`: Scopes execution to specific MCP tools.

---

## 7. Developer Recipes & Real-World Use Cases

### Recipe A: Automated Pre-Commit Lint Hook
Automatically format files using Prettier/ESLint whenever Antigravity edits a file.

Create `.agents/hooks.json`:
```json
{
  "auto-prettier": {
    "PostToolUse": [
      {
        "matcher": "replace_file_content",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

---

### Recipe B: Database Inspection via MCP
Connect your local SQLite or PostgreSQL database directly to the agent.

Create `.agents/plugins/db-tools/mcp_config.json`:
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./data/development.sqlite3"]
    }
  }
}
```
Now ask the agent:
> *"Query the users table and tell me which accounts were created in the last 24 hours."*

---

### Recipe C: Headless Morning PR & CI Triage Sidecar
Configure a background automation to check open pull requests every weekday morning.

Write `~/.gemini/config/sidecars/morning-pr-triage/sidecar.json`:
```json
{
  "builtin": "schedule",
  "args": [
    "CRON_TZ=America/New_York 0 8 * * 1-5",
    "agentapi",
    "new-conversation",
    "--",
    "Run 'gh pr list --state open', inspect each PR for failing CI runs, and post a summary of blockers."
  ],
  "restart_policy": "always",
  "display_name": "Morning PR Triage",
  "agent_permissions": {
    "access_grants": [
      "command(gh pr list)",
      "command(gh pr checks)"
    ]
  }
}
```

---

### Recipe D: Multi-Agent Parallel Monorepo Refactor
Refactor multiple subpackages simultaneously without cross-contaminating workspaces.

When refactoring:
1. Primary agent breaks down the tasks into 3 package targets: `core`, `client`, `server`.
2. Primary agent invokes 3 subagents:
   ```json
   {
     "Subagents": [
       {
         "Role": "Core Refactor Specialist",
         "TypeName": "self",
         "Workspace": "branch",
         "Prompt": "Migrate packages/core to TypeScript strict mode and verify tests pass."
       },
       {
         "Role": "Client Refactor Specialist",
         "TypeName": "self",
         "Workspace": "branch",
         "Prompt": "Update packages/client to consume the new core interfaces."
       }
     ]
   }
   ```
3. Each subagent runs independently in an isolated branch.
4. When finished, each subagent sends a completion message to the parent agent, which reviews the diffs and merges the changes.

---

## 8. Quick Reference & Command Cheat Sheet

### Slash Commands
| Command | Primary Use Case |
| :--- | :--- |
| `/goal` | Runs long-running autonomous workflows that iterate until a defined goal is reached. |
| `/plan` | Requests a structured step-by-step implementation plan before modifying any code. |
| `/automation` | Launches the interactive wizard to design scheduled background sidecars. |
| `/plugin` | Enables, disables, installs, or packages plugins. |
| `/compact` | Compacts and summarizes conversation history to reclaim context window space. |
| `/browser` | Engages browser automation to browse, test, or extract data from web applications. |
| `/grill-me` | Initiates an interactive interview where the agent tests your plan and surfaces edge cases. |

### Context Mentions (`@`)
- `@file / @folder`: Attaches file content or directory trees directly to the conversation prompt.
- `@conversation`: References context and findings from previous chat sessions.
- `@terminal`: Pipes active terminal session buffers into the agent's context.
- `@mcp`: Directly targets specific tools provided by active MCP servers.
- `@rule`: Forces the inclusion of a specific rule file.

### Key Shortcuts (IDE Mode)
- `Tab`: Accept autocomplete suggestion / Tab-to-Jump / Tab-to-Import.
- `Cmd + Right Arrow` (`Ctrl + Right Arrow`): Accept code suggestion word-by-word.
- `Cmd + I` (`Ctrl + I`): Open inline editing prompt for highlighted code block.
- `Esc`: Dismiss current code suggestion.
