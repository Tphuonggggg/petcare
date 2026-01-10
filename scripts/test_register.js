#!/usr/bin/env node

/**
 * Test Script for Registration API
 * Usage: node test_register.js
 */

const apiUrl = "http://localhost:5000";

// Test Data - Tạo account mới
const testRegisterData = {
  fullName: "Nguyễn Văn Test",
  phone: "0912345678",
  email: "test@example.com",
  cccd: "012345678901",
  gender: "M",
  birthDate: "1995-06-15",
  password: "TestPassword123",
  confirmPassword: "TestPassword123",
};

// Test invalid data
const testInvalidData = [
  {
    name: "Missing Full Name",
    data: { ...testRegisterData, fullName: "" },
  },
  {
    name: "Invalid Email",
    data: { ...testRegisterData, email: "not-an-email" },
  },
  {
    name: "CCCD not 12 digits",
    data: { ...testRegisterData, cccd: "12345" },
  },
  {
    name: "Too young (under 18)",
    data: { ...testRegisterData, birthDate: new Date().toISOString().split("T")[0] },
  },
  {
    name: "Passwords don't match",
    data: { ...testRegisterData, confirmPassword: "DifferentPassword123" },
  },
  {
    name: "Password too short",
    data: { ...testRegisterData, password: "123", confirmPassword: "123" },
  },
];

async function testRegister() {
  console.log("🧪 Testing Registration API\n");
  console.log(`API URL: ${apiUrl}\n`);

  // Test 1: Valid Registration
  console.log("=" + "=".repeat(60));
  console.log("TEST 1: Valid Registration");
  console.log("=" + "=".repeat(60));
  try {
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRegisterData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ FAILED");
      console.log("Error:", data);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n");

  // Test 2: Invalid registrations
  for (const testCase of testInvalidData) {
    console.log("=" + "=".repeat(60));
    console.log(`TEST: ${testCase.name}`);
    console.log("=" + "=".repeat(60));
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.data),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("✅ Correctly rejected");
        console.log("Error message:", data.message);
      } else {
        console.log("❌ Should have failed but passed!");
      }
    } catch (error) {
      console.log("❌ ERROR:", error.message);
    }
    console.log();
  }

  // Test 3: Duplicate phone
  console.log("=" + "=".repeat(60));
  console.log("TEST: Duplicate Phone");
  console.log("=" + "=".repeat(60));
  try {
    // Try to register with the same phone from test 1
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...testRegisterData,
        email: "different@example.com", // Change email to avoid that conflict
        cccd: "111111111111", // Change CCCD to avoid that conflict
      }),
    });

    const data = await response.json();

    if (!response.ok && data.message.includes("điện thoại")) {
      console.log("✅ Correctly rejected duplicate phone");
      console.log("Error:", data.message);
    } else {
      console.log("Result:", response.ok ? "Success" : "Failed");
      console.log("Response:", data);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n✅ All tests completed");
}

testRegister();
