// Quick test to verify vaccines endpoint
// Run from browser console or use in a test file

const testVaccinesEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/vaccines?pageSize=100');
    const data = await response.json();
    
    console.log('=== Vaccines API Response ===');
    console.log('Raw response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array?', Array.isArray(data));
    console.log('Has items property?', data?.items ? 'Yes' : 'No');
    
    if (data?.items) {
      console.log('Items count:', data.items.length);
      console.log('First item:', data.items[0]);
    } else if (Array.isArray(data)) {
      console.log('Array length:', data.length);
      console.log('First item:', data[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run it
testVaccinesEndpoint();
