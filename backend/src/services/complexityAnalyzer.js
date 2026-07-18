export function analyzeComplexity(code) {
  const lines = code.split("\n");
  const functions = (code.match(/\b(function|const|let|var)\s+\w+\s*=?\s*\(/g) || []).length;
  const classes = (code.match(/\bclass\s+\w+/g) || []).length;
  const decisions = (code.match(/\b(if|else if|for|while|case|catch|\?\?|&&|\|\|)\b/g) || []).length;
  const complexity = 1 + decisions;

  return {
    linesOfCode: lines.filter(line => line.trim()).length,
    functions,
    classes,
    cyclomaticComplexity: complexity,
    level: complexity <= 5 ? "Low" : complexity <= 10 ? "Medium" : "High"
  };
}