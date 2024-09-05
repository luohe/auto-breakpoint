# Auto Breakpoint

Auto Breakpoint is a Visual Studio Code extension that allows users to automatically set and remove breakpoints in files based on specific code patterns. This extension helps developers quickly manage breakpoints in their projects for easier debugging.

## Features

- **Set Breakpoints in Files**: Automatically set breakpoints in files that contain a specific code pattern within a defined directory.
- **Remove All Breakpoints**: Quickly remove all breakpoints from the current workspace.
- **Remove Breakpoints by Keyword**: Remove breakpoints based on a specific code pattern.

## Requirements

- Visual Studio Code version 1.92.0 or higher.

## Extension Settings

This extension contributes the following settings for customizing file search:

- `breakpointSetter.filesToInclude`: A glob pattern specifying the files to include in the search, similar to the "files to include" option in the search panel. Defaults to `packages/**/*.js`.
- `breakpointSetter.filesToExclude`: A glob pattern specifying the files to exclude from the search, similar to the "files to exclude" option in the search panel. Defaults to `packages/**/ReactDOMLegacy.js,packages/**/__tests__,./packages/**/*.new.js,./packages/react-art/**,./packages/react-noop-renderer/**,./packages/react-native-renderer/**,./packages/react-test-renderer/**,.history,node_modules,react-server`.

You can configure these settings in your workspace or user `settings.json`:

```json
{
  "breakpointSetter.filesToInclude": "src/**/*.ts",
  "breakpointSetter.filesToExclude": "node_modules/**"
}
```

## Commands

The extension provides the following commands that can be accessed through the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS):

- **Breakpoint Setter: Set Breakpoints in Files** (`extension.setBreakpointsInFiles`): Set breakpoints in files based on a specific code pattern.
- **Breakpoint Setter: Remove All Breakpoints** (`extension.removeAllBreakpoints`): Remove all breakpoints from the current workspace.
- **Breakpoint Setter: Remove Breakpoints by Keyword** (`extension.removeBreakpointsByKeyword`): Remove breakpoints that match a specific code pattern.

## Usage

1. **Set Breakpoints in Files**:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
   - Run the command `Breakpoint Setter: Set Breakpoints in Files`.
   - Enter the specific code pattern you want to search for.
   - The extension will search all files matching the `filesToInclude` pattern and set breakpoints on lines containing the specified code pattern.

2. **Remove All Breakpoints**:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
   - Run the command `Breakpoint Setter: Remove All Breakpoints`.
   - All breakpoints in the current workspace will be removed.

3. **Remove Breakpoints by Keyword**:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
   - Run the command `Breakpoint Setter: Remove Breakpoints by Keyword`.
   - Enter the specific code pattern you want to search for.
   - The extension will search for breakpoints that match the pattern and remove them.

## Development

To develop and test this extension locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-repository>/auto-breakpoint.git
   cd auto-breakpoint
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile the extension**:
   ```bash
   npm run compile
   ```

4. **Open the extension in VS Code**:
   ```bash
   code .
   ```

5. **Run the extension**:
   - Press `F5` to open a new VS Code window with the extension loaded.

6. **Watch for changes**:
   - Run `npm run watch` to automatically compile TypeScript files when they are changed.

## Publishing

To publish the extension to the Visual Studio Code Marketplace:

1. **Create a Personal Access Token (PAT)** on [Azure DevOps](https://dev.azure.com/) with `Marketplace` publish scope.
   
2. **Login to `vsce`**:
   ```bash
   vsce login <your-publisher-id>
   ```

3. **Publish the extension**:
   ```bash
   vsce publish
   ```

## Known Issues

- The extension currently sets breakpoints only on lines that exactly match the specified code pattern. It does not support more advanced search criteria (e.g., partial matches, complex expressions).

## Release Notes

### 0.0.1

- Initial release of Auto Breakpoint with support for setting and removing breakpoints based on specific code patterns.

## License

MIT