// Simple JSON output example
const testData = {
  message: "Hello World",
  timestamp: new Date().toISOString(),
  status: "success",
  data: {
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ]
  }
};

console.log(JSON.stringify(testData, null, 2));