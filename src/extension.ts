// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { commands, env, ExtensionContext, window } from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const appRoot = env.appRoot;
  const productJsonPath = join(appRoot, "product.json");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = commands.registerCommand(
    "checksum-fixer.fixChecksums",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      window.showInformationMessage("Fixing checksum conflicts started...");
      const productJson = JSON.parse(readFileSync(productJsonPath, "utf-8"));
      const checksums = productJson.checksums;
      for (const [key, _] of Object.entries(checksums)) {
        const parts = key.split("/");
        const filePath = join(appRoot, "out", ...parts);
        const contentHash = recalculateHash(readFileSync(filePath, "utf-8"));
        checksums[key] = contentHash;
      }

      // Write the updated checksums back to product.json
      const updatedProductJson = JSON.stringify(
        { ...productJson, checksums },
        null,
        2,
      );
      writeFileSync(productJsonPath, updatedProductJson, "utf-8");
      window.showInformationMessage("Checksum conflicts fixed successfully!");
    },
  );

  context.subscriptions.push(disposable);
}

function recalculateHash(string: string): string {
  return createHash("sha256")
    .update(string)
    .digest("base64")
    .replace(/=+$/, "");
}

// This method is called when your extension is deactivated
export function deactivate() {}
