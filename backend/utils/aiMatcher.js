// Step 1: Calculate the mathematical cosine similarity between two numeric arrays (vectors)
function calculateCosineSimilarity(vecA, vecB) {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Step 2: Convert text skills into vectors (1s and 0s) and score them
exports.getMatchScore = (studentSkills, projectSkills) => {
  // Convert everything to lowercase to ensure "React" matches "react"
  const sSkills = studentSkills.map(s => s.toLowerCase().trim());
  const pSkills = projectSkills.map(s => s.toLowerCase().trim());

  const allSkills = Array.from(new Set([...sSkills, ...pSkills]));
  
  const vecA = allSkills.map(skill => sSkills.includes(skill) ? 1 : 0);
  const vecB = allSkills.map(skill => pSkills.includes(skill) ? 1 : 0);
  
  return Math.round(calculateCosineSimilarity(vecA, vecB) * 100);
};