// Test UUID generation
console.log('Testing UUID generation:\n');

// Old way (broken)
const oldId = Math.random().toString(36).substr(2, 9);
console.log('Old way (broken):');
console.log('  ID:', oldId);
console.log('  Length:', oldId.length);
console.log('  Format: NOT a UUID');

// New way (crypto.randomUUID)
const newId = crypto.randomUUID();
console.log('\nNew way (crypto.randomUUID):');
console.log('  ID:', newId);
console.log('  Length:', newId.length);
console.log('  Format: Valid UUID v4');

// Regex test
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
console.log('\nUUID Validation:');
console.log('  Old ID valid UUID?', uuidRegex.test(oldId) ? '✅' : '❌');
console.log('  New ID valid UUID?', uuidRegex.test(newId) ? '✅' : '❌');
