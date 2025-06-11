import fetch from 'node-fetch';

async function testAIPrescription() {
  try {
    const response = await fetch('http://localhost:5000/api/ai-prescriptions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        cancerType: 'breast',
        treatmentStage: 'post-treatment',
        medicalClearance: 'cleared',
        physicalAssessment: {
          energyLevel: 7,
          mobilityStatus: 8,
          painLevel: 3
        }
      })
    });

    const data = await response.json();
    console.log('AI Prescription Response:', JSON.stringify(data, null, 2));
    
    if (data.programName) {
      console.log('\n✅ AI Prescription Generated Successfully!');
      console.log('Program:', data.programName);
      console.log('Duration:', data.duration, 'weeks');
      console.log('Frequency:', data.frequency, 'sessions/week');
      console.log('Tier:', data.tier);
      console.log('Exercise Count:', data.exercises?.length || 0);
    } else {
      console.log('❌ Error:', data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIPrescription();