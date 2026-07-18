export function analyzeJavaScript(code) {
  const findings = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (/\bvar\s+/.test(trimmed)) {
      findings.push({
        severity: "Error",
        issue: "Unexpected var",
        explanation: "Use let or const instead of var for modern JavaScript.",
        suggestedFix: "Replace var with let or const.",
        lineNumber,
        category: "Code Style"
      });
    }

    if (trimmed.includes("console.log")) {
      findings.push({
        severity: "Warning",
        issue: "Unexpected console statement",
        explanation: "Debug statements should usually be removed from production code.",
        suggestedFix: "Remove console.log or use a proper logging system.",
        lineNumber,
        category: "Best Practice"
      });
    }

    if (/password\s*=\s*["'][^"']+["']/.test(trimmed)) {
      findings.push({
        severity: "Error",
        issue: "Hardcoded secret detected",
        explanation: "Sensitive credentials should not be stored directly in source code.",
        suggestedFix: "Use environment variables.",
        lineNumber,
        category: "Security"
      });
    }

    if (trimmed.length > 120) {
      findings.push({
        severity: "Warning",
        issue: "Long line detected",
        explanation: "Long lines reduce readability and maintainability.",
        suggestedFix: "Break the statement into multiple lines.",
        lineNumber,
        category: "Maintainability"
      });
    }

    if (trimmed && !trimmed.endsWith(";") &&
        !trimmed.endsWith("{") &&
        !trimmed.endsWith("}") &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("if") &&
        !trimmed.startsWith("for") &&
        !trimmed.startsWith("function")) {
      findings.push({
        severity: "Suggestion",
        issue: "Missing semicolon",
        explanation: "Consistent semicolon usage improves code style.",
        suggestedFix: "Add a semicolon.",
        lineNumber,
        category: "Formatting"
      });
    }
  });

  return findings;
}