import prisma from "../config/db.js";
import { analyzeJavaScript } from "../services/staticAnalyzer.js";
import { analyzeComplexity } from "../services/complexityAnalyzer.js";
import { generateAIReview } from "../services/aiReviewer.js";

export async function createReview(req, res) {
  try {
    const { title, language = "JavaScript", sourceCode } = req.body;

    if (!sourceCode?.trim()) {
      return res.status(400).json({ message: "Source code is required" });
    }

    const findings = language.toLowerCase() === "javascript"
      ? analyzeJavaScript(sourceCode)
      : [];

    const metrics = analyzeComplexity(sourceCode);
    const ai = await generateAIReview(sourceCode, findings, metrics);

    const errors = findings.filter(f => f.severity === "Error").length;
    const warnings = findings.filter(f => f.severity === "Warning").length;
    const suggestions = findings.filter(f => f.severity === "Suggestion").length;

    const score = Math.max(0, 100 - errors * 12 - warnings * 5 - suggestions * 2);

    const submission = await prisma.codeSubmission.create({
      data: {
        userId: req.user.id,
        title: title || "Untitled Review",
        language,
        sourceCode
      }
    });

    const review = await prisma.review.create({
      data: {
        submissionId: submission.id,
        reviewType: "Complete Analysis",
        overallScore: score,
        summary: ai.summary,
        metrics: { ...metrics, ai },
        findings: {
          create: findings.map(f => ({
            ...f,
            fileName: "source-code"
          }))
        }
      },
      include: { findings: true, submission: true }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Review failed", error: error.message });
  }
}

export async function getReviews(req, res) {
  const reviews = await prisma.review.findMany({
    where: { submission: { userId: req.user.id } },
    include: { findings: true, submission: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(reviews);
}

export async function getReview(req, res) {
  const review = await prisma.review.findFirst({
    where: {
      id: Number(req.params.id),
      submission: { userId: req.user.id }
    },
    include: { findings: true, submission: true }
  });

  if (!review) return res.status(404).json({ message: "Review not found" });
  res.json(review);
}

export async function deleteReview(req, res) {
  const review = await prisma.review.findFirst({
    where: { id: Number(req.params.id), submission: { userId: req.user.id } }
  });

  if (!review) return res.status(404).json({ message: "Review not found" });

  await prisma.review.delete({ where: { id: review.id } });
  res.json({ message: "Review deleted" });
}

export async function getDashboard(req, res) {
  const reviews = await prisma.review.findMany({
    where: { submission: { userId: req.user.id } },
    include: { findings: true }
  });

  const totalIssues = reviews.reduce((sum, r) => sum + r.findings.length, 0);
  const averageScore = reviews.length
    ? Math.round(reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length)
    : 0;

  res.json({
    totalReviews: reviews.length,
    averageScore,
    totalIssues,
    passedReviews: reviews.filter(r => (r.overallScore || 0) >= 70).length
  });
}