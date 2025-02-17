import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

interface TestConfiguration {
    name: string;
    type: string;
    request: string;
    module?: string;
    program?: string;
    args: string[];
    django: boolean;
    justMyCode: boolean;
    pythonPath: string;
    cwd: string;
}

async function findManagePyPath(rootPath: string, maxDepth: number = 3): Promise<string | null> {
    const searchDirectory = async (currentPath: string, currentDepth: number): Promise<string | null> => {
        if (currentDepth > maxDepth) return null;

        try {
            const entries = await readdir(currentPath, { withFileTypes: true });

            const managePy = entries.find(entry => !entry.isDirectory() && entry.name === 'manage.py');
            if (managePy) {
                return path.join(currentPath, 'manage.py');
            }

            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.') && !['node_modules', 'venv', 'env', '.venv'].includes(entry.name)) {
                    const subPath = path.join(currentPath, entry.name);
                    const result = await searchDirectory(subPath, currentDepth + 1);
                    if (result) return result;
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la lecture du dossier ${currentPath}:`, error);
        }

        return null;
    };

    return searchDirectory(rootPath, 0);
}

async function getDjangoProjectRoot(workspaceFolder: vscode.WorkspaceFolder): Promise<string> {
    const managePyPath = await findManagePyPath(workspaceFolder.uri.fsPath);
    if (!managePyPath) {
        throw new Error('manage.py non trouvé dans le projet');
    }
    return path.dirname(managePyPath);
}

async function getClassNameAboveLine(document: vscode.TextDocument, line: number): Promise<string | null> {
    for (let i = line - 1; i >= 0; i--) {
        const lineText = document.lineAt(i);
        const classMatch = lineText.text.match(/^\s*class\s+(\w+)[\s\(]*/);
        if (classMatch) {
            return classMatch[1];
        }
    }
    return null;
}

async function updateLaunchJson(testPath: string, workspaceFolder: vscode.WorkspaceFolder, testFramework: string): Promise<void> {
    const launchConfig = vscode.workspace.getConfiguration('launch', workspaceFolder.uri);
    const configurations = launchConfig.get<TestConfiguration[]>('configurations') || [];

    const djangoRoot = await getDjangoProjectRoot(workspaceFolder);

    const newConfig: TestConfiguration = {
        name: "run single test",
        type: "python",
        request: "launch",
        module: testFramework === "pytest" ? "pytest" : undefined,
        program: testFramework !== "pytest" ? "${workspaceFolder}/manage.py" : undefined,
        args: testFramework === "pytest" ? [testPath] : ["test", testPath, "--keepdb"],
        django: true,
        justMyCode: false,
        pythonPath: "${command:python.interpreterPath}",
        cwd: djangoRoot
    };

    const index = configurations.findIndex(config => config.name === "run single test");
    if (index >= 0) {
        configurations[index] = newConfig;
    } else {
        configurations.push(newConfig);
    }

    await launchConfig.update('configurations', configurations, vscode.ConfigurationTarget.Workspace);
}

class TestCodeLensProvider implements vscode.CodeLensProvider {
    private regex: RegExp;
    private command: string;
    private title: string;

    constructor(regex: RegExp, command: string, title: string) {
        this.regex = regex;
        this.command = command;
        this.title = title;
    }

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const match = line.text.match(this.regex);

            if (match) {
                const functionName = match[1];
                const range = new vscode.Range(
                    new vscode.Position(i, line.firstNonWhitespaceCharacterIndex),
                    new vscode.Position(i, line.text.length)
                );

                const command = {
                    title: this.title,
                    command: this.command,
                    arguments: [document.uri, functionName, i]
                };

                codeLenses.push(new vscode.CodeLens(range, command));
            }
        }
        return codeLenses;
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            {
                scheme: 'file',
                language: 'python',
                pattern: '**/*test*.py'
            },
            new TestCodeLensProvider(/^\s*def\s+(test_\w+)\s*\(/, 'extension.runPytestTest', '▶ Run with pytest')
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            {
                scheme: 'file',
                language: 'python',
                pattern: '**/*test*.py'
            },
            new TestCodeLensProvider(/^\s*def\s+(test_\w+)\s*\(/, 'extension.runUnittestTest', '▶ Run with unittest')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.runPytestTest', async (uri: vscode.Uri, functionName: string, line: number) => {
            await runTest(uri, functionName, line, 'pytest');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.runUnittestTest', async (uri: vscode.Uri, functionName: string, line: number) => {
            await runTest(uri, functionName, line, 'unittest');
        })
    );
}

async function runTest(uri: vscode.Uri, functionName: string, line: number, testFramework: string) {
    try {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (!workspaceFolder) {
            throw new Error('Workspace non trouvé');
        }

        const djangoRoot = await getDjangoProjectRoot(workspaceFolder);
        const document = await vscode.workspace.openTextDocument(uri);
        const className = await getClassNameAboveLine(document, line);

        // Construire le chemin du module Python
        const relativePath = path.relative(djangoRoot, uri.fsPath);
        const modulePath = relativePath
            .replace(/\\/g, '/')
            .replace(/\.py$/, '')
            .split('/')
            .join('.');

        let testPath: string;
        if (testFramework === 'pytest') {
            testPath = `${relativePath}::${className}::${functionName}`;
        } else {
            testPath = `${modulePath}.${className}.${functionName}`;
        }

        await updateLaunchJson(testPath, workspaceFolder, testFramework);
        const success = await vscode.debug.startDebugging(workspaceFolder, "run single test");

        if (!success) {
            throw new Error('Échec du lancement du débogage');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
}

export function deactivate() {}