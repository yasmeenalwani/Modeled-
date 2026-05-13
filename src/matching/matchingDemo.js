// ============================================
// MATCHING ENGINE DEMO
// ============================================
// Shows how the matching algorithm works in practice

import { findMatches, calculateMatchScore, AGENTIC_SCORES, SERVICE_WEIGHTS } from './matchingEngine';
import { mockModels } from './mockModels';

// Sample request from a professional
const sampleRequest = {
  id: 1,
  professionalId: 'pro_sarah',
  professionalName: 'Sarah Mitchell',
  serviceId: 'highlights',
  serviceName: 'Highlights',
  requestedDate: '2024-12-06',
  requestedTime: '10am',
  location: '10001',
  
  // What the professional is looking for
  criteria: {
    hairLength: 'long',
    hairColor: 'blonde',      // Or light brown
    hairTexture: 'wavy',      // Preferred but not required
    hairCondition: 'virgin',  // Strongly preferred
    virginHair: true,
    openToChange: true,
  },
  
  // Optional/nice-to-have
  preferences: {
    experienceLevel: 'any',
    minReliabilityScore: 70,
  },
};

// Run the matching demo
export function runMatchingDemo() {
  console.log('='.repeat(60));
  console.log('MODELED MATCHING ENGINE DEMO');
  console.log('='.repeat(60));
  console.log('\nRequest:', sampleRequest.serviceName);
  console.log('Looking for:', JSON.stringify(sampleRequest.criteria, null, 2));
  console.log('\n');

  // Find matches
  const result = findMatches(mockModels, sampleRequest);
  
  console.log(`Found ${result.qualifiedMatches} matches out of ${result.totalCandidates} candidates`);
  console.log(`Average match score: ${result.averageScore}`);
  console.log('\n');
  
  // Show each match with breakdown
  result.matches.forEach((match, index) => {
    console.log(`#${index + 1} - ${match.model.firstName} ${match.model.lastName}`);
    console.log(`   Final Score: ${match.finalScore}${match.isPerfectMatch ? ' ⭐ PERFECT' : match.isStrongMatch ? ' ✓ STRONG' : ''}`);
    console.log(`   Breakdown:`);
    console.log(`     - Attribute Match: ${match.breakdown.attribute.score} (${(match.breakdown.attribute.weight * 100)}%)`);
    console.log(`     - Agentic Score:   ${match.breakdown.agentic.score} (${(match.breakdown.agentic.weight * 100)}%)`);
    const reach = match.breakdown.reachability ?? match.breakdown.location;
    console.log(`     - Reachability:    ${reach?.score ?? 0} (${((reach?.weight ?? 0.15) * 100)}%)`);
    console.log(`   Agentic Details:`);
    const agentic = match.breakdown.agentic.details;
    console.log(`     - Reliability:    ${agentic.reliability.score}`);
    console.log(`     - Feedback:       ${agentic.feedback.score}`);
    console.log(`     - Experience:     ${agentic.experience.score}`);
    console.log(`     - Engagement:     ${agentic.engagement.score}`);
    console.log(`     - Compatibility:  ${agentic.compatibility.score}`);
    console.log('\n');
  });
  
  return result;
}

// Export for testing
export { sampleRequest };

