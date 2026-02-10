/**
 * Code Review Prompt Template
 * Used for AI-powered code reviews via Gemini API
 * 
 * Output format follows CodeRabbit-style reviews with:
 * - Walkthrough
 * - Sequence Diagram
 * - Summary
 * - Strengths
 * - Issues
 * - Suggestions
 * - Poem
 */

export interface ReviewContext {
  owner: string;
  repo: string;
  prNumber: number;
  prTitle: string;
  prDescription: string;
  baseBranch: string;
  headBranch: string;
  author: string;
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }[];
  relevantContext?: string; // RAG context from codebase
}

export const CODE_REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices, security, performance, and clean code principles.

Your task is to review pull requests and provide comprehensive, actionable feedback in a structured format.

Guidelines:
- Be thorough but concise
- Focus on important issues that could cause bugs, security vulnerabilities, or maintenance problems
- Acknowledge good practices when you see them
- Provide specific suggestions with code examples when relevant
- Consider the context of the entire codebase when provided
- Be constructive and professional in your feedback
- Prioritize issues by severity: critical > warning > info

For the Sequence Diagram:
- Use valid Mermaid JS syntax
- Keep it simple and focused on the main flow
- Do NOT use special characters like quotes, braces, or parentheses in Note text or labels
- Use simple alphanumeric text for labels`;

export function generateCodeReviewPrompt(context: ReviewContext): string {
  const filesOverview = context.files
    .map(
      (f) =>
        `- ${f.filename} (${f.status}): +${f.additions}/-${f.deletions} lines`
    )
    .join("\n");

  const patches = context.files
    .filter((f) => f.patch)
    .map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join("\n\n");

  return `# Pull Request Review Request

## PR Information
- **Repository**: ${context.owner}/${context.repo}
- **PR Number**: #${context.prNumber}
- **Title**: ${context.prTitle}
- **Author**: ${context.author}
- **Base Branch**: ${context.baseBranch} ← **Head Branch**: ${context.headBranch}

## PR Description
${context.prDescription || "_No description provided_"}

## Changed Files Overview
${filesOverview}

## Code Changes (Diffs)
${patches}

${
  context.relevantContext
    ? `## Relevant Codebase Context
The following code snippets from the repository may be relevant to this review:

${context.relevantContext}
`
    : ""
}

---

Please provide:
1. **Walkthrough**: A file-by-file explanation of the changes.
2. **Sequence Diagram**: A Mermaid JS sequence diagram visualizing the flow of the changes (if applicable). Use \`\`\`mermaid ... \`\`\` block. **IMPORTANT**: Ensure the Mermaid syntax is valid. Do not use special characters like quotes, braces, parentheses inside Note text or labels as it breaks rendering. Keep the diagram simple.
3. **Summary**: Brief overview.
4. **Strengths**: What's done well.
5. **Issues**: Bugs, security concerns, code smells.
6. **Suggestions**: Specific code improvements.
7. **Poem**: A short, creative poem summarizing the changes at the very end.

Format your response in markdown.`;
}

export interface InlineComment {
  path: string;
  line: number;
  body: string;
  severity: "info" | "warning" | "error";
}

export const INLINE_COMMENTS_SYSTEM_PROMPT = `You are an expert code reviewer. Your task is to generate inline comments for specific lines of code that need attention.

For each issue or suggestion, provide:
1. The exact file path
2. The specific line number in the NEW code (from the diff, lines starting with +)
3. A clear, actionable comment
4. Severity level: "error" for bugs/security issues, "warning" for code smells/improvements, "info" for suggestions/nitpicks

Output format: JSON array of comments. Example:
[
  {
    "path": "src/utils/auth.ts",
    "line": 42,
    "body": "**Security Issue**: This password comparison is vulnerable to timing attacks. Use crypto.timingSafeEqual() instead.",
    "severity": "error"
  },
  {
    "path": "src/components/Button.tsx",
    "line": 15,
    "body": "**Suggestion**: Consider memoizing this callback with useCallback to prevent unnecessary re-renders.",
    "severity": "info"
  }
]

Only include comments for significant issues. Limit to the most important 10 comments maximum.`;

export function generateInlineCommentsPrompt(context: ReviewContext): string {
  const patches = context.files
    .filter((f) => f.patch)
    .map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join("\n\n");

  return `Review the following code changes and generate inline comments for specific issues.

## PR: ${context.prTitle}
${context.prDescription || ""}

## Code Changes
${patches}

${
  context.relevantContext
    ? `## Codebase Context
${context.relevantContext}
`
    : ""
}

Generate a JSON array of inline comments for significant issues. Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Performance issues
- Code quality problems
- Missing error handling

Return ONLY the JSON array, no additional text.`;
}

export interface ParsedReviewResponse {
  walkthrough: string;
  sequenceDiagram: string | null;
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  poem: string;
  rawMarkdown: string;
}

export function parseReviewResponse(markdown: string): ParsedReviewResponse {
  const sections: ParsedReviewResponse = {
    walkthrough: "",
    sequenceDiagram: null,
    summary: "",
    strengths: [],
    issues: [],
    suggestions: [],
    poem: "",
    rawMarkdown: markdown,
  };

  // Extract mermaid diagram
  const mermaidMatch = markdown.match(/```mermaid\n([\s\S]*?)```/);
  if (mermaidMatch) {
    sections.sequenceDiagram = mermaidMatch[1].trim();
  }

  // Extract sections using regex
  const walkthroughMatch = markdown.match(
    /\*\*Walkthrough\*\*[:\s]*([\s\S]*?)(?=\n##|\n\*\*Sequence|\n\*\*Summary|$)/i
  );
  if (walkthroughMatch) {
    sections.walkthrough = walkthroughMatch[1].trim();
  }

  const summaryMatch = markdown.match(
    /\*\*Summary\*\*[:\s]*([\s\S]*?)(?=\n##|\n\*\*Strengths|$)/i
  );
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim();
  }

  const strengthsMatch = markdown.match(
    /\*\*Strengths\*\*[:\s]*([\s\S]*?)(?=\n##|\n\*\*Issues|$)/i
  );
  if (strengthsMatch) {
    sections.strengths = extractListItems(strengthsMatch[1]);
  }

  const issuesMatch = markdown.match(
    /\*\*Issues\*\*[:\s]*([\s\S]*?)(?=\n##|\n\*\*Suggestions|$)/i
  );
  if (issuesMatch) {
    sections.issues = extractListItems(issuesMatch[1]);
  }

  const suggestionsMatch = markdown.match(
    /\*\*Suggestions\*\*[:\s]*([\s\S]*?)(?=\n##|\n\*\*Poem|$)/i
  );
  if (suggestionsMatch) {
    sections.suggestions = extractListItems(suggestionsMatch[1]);
  }

  const poemMatch = markdown.match(/\*\*Poem\*\*[:\s]*([\s\S]*?)$/i);
  if (poemMatch) {
    sections.poem = poemMatch[1].trim();
  }

  return sections;
}

function extractListItems(text: string): string[] {
  const items: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)) {
      items.push(trimmed.replace(/^[-*]\s*|\d+\.\s*/, "").trim());
    }
  }

  return items.filter((item) => item.length > 0);
}
