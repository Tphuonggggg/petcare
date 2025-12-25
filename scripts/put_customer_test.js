(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/customers/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1,
        fullName: 'Automated Test from script',
        phone: '0900000001',
        email: 'customer1@gmail.com',
        pointsBalance: 0
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Request error:', err);
    process.exit(2);
  }
})();
