(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Created By Script',
        phone: '0900999000',
        email: 'script.created@example.com',
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
