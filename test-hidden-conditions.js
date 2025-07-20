// Test condition evaluation for the new hidden field
function interpolate(template, data) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = data[key.trim()];

    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 'null';
    }

    // For JavaScript expressions, we need to properly quote string values
    if (typeof value === 'string') {
      return JSON.stringify(value);
    }

    // For other types (numbers, booleans, etc.), convert to string
    return String(value);
  });
}

function evaluateCondition(condition, formData) {
  if (!condition?.expression) return true;

  try {
    // Replace formData references with actual values
    const expr = interpolate(condition.expression, formData);
    console.log('Original expression:', condition.expression);
    console.log('Interpolated expression:', expr);

    // Create safe evaluation
    const result = new Function(`return ${expr}`)();
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Condition evaluation failed:', error);
    console.error('Original expression:', condition.expression);
    console.error('Interpolated expression:', interpolate(condition.expression, formData));
    return false;
  }
}

function evaluateFieldVisibility(field, formData) {
  // For hidden condition, default to false (not hidden) when no condition is provided
  const isHidden = field.conditions?.hidden ? evaluateCondition(field.conditions?.hidden, formData) : false;

  console.log(`Field ${field.id}:`);
  console.log('  isHidden:', isHidden);
  console.log('  isVisible:', !isHidden);

  return !isHidden; // Field is visible if not hidden
}

// Test cases
console.log('Testing field visibility with hidden condition:');
console.log('================================================');

// Test 1: Field with hidden condition that should hide the field
console.log('Test 1: Field should be hidden when name_text === "erik"');
const field1 = {
  id: 'dependent_field',
  conditions: {
    hidden: { expression: '{{name_text}} === "erik"' }
  }
};
const result1 = evaluateFieldVisibility(field1, { name_text: 'erik' });
console.log('Expected: false, Got:', result1);
console.log('');

// Test 2: Field with hidden condition that should show the field
console.log('Test 2: Field should be visible when name_text !== "erik"');
const result2 = evaluateFieldVisibility(field1, { name_text: 'john' });
console.log('Expected: true, Got:', result2);
console.log('');

// Test 3: Field without any conditions should be visible
console.log('Test 3: Field without conditions should be visible');
const field3 = {
  id: 'normal_field',
  conditions: {}
};
const result3 = evaluateFieldVisibility(field3, { name_text: 'erik' });
console.log('Expected: true, Got:', result3);
console.log('');

// Test 4: Complex expression
console.log('Test 4: Complex expression');
const field4 = {
  id: 'complex_field',
  conditions: {
    hidden: { expression: '{{age}} < 18 || {{name_text}} === "admin"' }
  }
};
const result4a = evaluateFieldVisibility(field4, { age: 16, name_text: 'john' });
console.log('Age 16, name john - Expected: false, Got:', result4a);

const result4b = evaluateFieldVisibility(field4, { age: 25, name_text: 'admin' });
console.log('Age 25, name admin - Expected: false, Got:', result4b);

const result4c = evaluateFieldVisibility(field4, { age: 25, name_text: 'john' });
console.log('Age 25, name john - Expected: true, Got:', result4c);

console.log('================================================');
console.log('All tests completed!');
