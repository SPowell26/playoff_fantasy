/**
 * League Rules Validation Utility
 * Validates scoring rules to prevent malformed data
 */

// Schema for valid scoring rules
const SCORING_RULES_SCHEMA = {
  offensive: {
    passing: {
      yardsPerPoint: { type: 'number', min: 0, max: 1 },
      touchdownPoints: { type: 'number', min: -10, max: 20 },
      interceptionPoints: { type: 'number', min: -20, max: 0 }
    },
    rushing: {
      yardsPerPoint: { type: 'number', min: 0, max: 1 },
      touchdownPoints: { type: 'number', min: -10, max: 20 }
    },
    receiving: {
      yardsPerPoint: { type: 'number', min: 0, max: 1 },
      touchdownPoints: { type: 'number', min: -10, max: 20 }
    },
    fumbles: {
      lostPoints: { type: 'number', min: -20, max: 0 }
    }
  },
  defensive: {
    specialTeams: {
      blockedKickPoints: { type: 'number', min: 0, max: 10 },
      safetyPoints: { type: 'number', min: 0, max: 10 },
      fumbleRecoveryPoints: { type: 'number', min: 0, max: 10 },
      interceptionPoints: { type: 'number', min: 0, max: 10 },
      sackPoints: { type: 'number', min: 0, max: 10 },
      puntReturnTDPoints: { type: 'number', min: 0, max: 20 },
      kickoffReturnTDPoints: { type: 'number', min: 0, max: 20 }
    },
    pointsAllowed: {
      shutoutPoints: { type: 'number', min: -10, max: 20 },
      oneToSixPoints: { type: 'number', min: -10, max: 20 },
      sevenToThirteenPoints: { type: 'number', min: -10, max: 20 },
      fourteenToTwentyPoints: { type: 'number', min: -10, max: 20 },
      twentyOneToTwentySevenPoints: { type: 'number', min: -10, max: 20 },
      twentyEightToThirtyFourPoints: { type: 'number', min: -10, max: 20 },
      thirtyFivePlusPoints: { type: 'number', min: -20, max: 10 }
    },
    teamWinPoints: { type: 'number', min: -10, max: 20 }
  },
  kicker: {
    fieldGoals: {
      zeroToThirtyNinePoints: { type: 'number', min: 0, max: 10 },
      fortyToFortyNinePoints: { type: 'number', min: 0, max: 10 },
      fiftyPlusPoints: { type: 'number', min: 0, max: 15 }
    },
    extraPointPoints: { type: 'number', min: 0, max: 5 }
  }
};

/**
 * Validate a single field against its schema
 */
function validateField(value, schema) {
  if (typeof value !== schema.type) {
    return { valid: false, error: `Expected ${schema.type}, got ${typeof value}` };
  }
  
  if (schema.min !== undefined && value < schema.min) {
    return { valid: false, error: `Value ${value} is below minimum ${schema.min}` };
  }
  
  if (schema.max !== undefined && value > schema.max) {
    return { valid: false, error: `Value ${value} is above maximum ${schema.max}` };
  }
  
  return { valid: true };
}

/**
 * Recursively validate scoring rules object
 */
function validateScoringRules(rules, schema, path = '') {
  const errors = [];
  
  for (const [key, value] of Object.entries(schema)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in rules)) {
      errors.push(`Missing required field: ${currentPath}`);
      continue;
    }
    
    if (typeof value === 'object' && value.type) {
      // This is a field with validation rules
      const validation = validateField(rules[key], value);
      if (!validation.valid) {
        errors.push(`${currentPath}: ${validation.error}`);
      }
    } else if (typeof value === 'object') {
      // This is a nested object, recurse
      if (typeof rules[key] !== 'object') {
        errors.push(`${currentPath}: Expected object, got ${typeof rules[key]}`);
      } else {
        errors.push(...validateScoringRules(rules[key], value, currentPath));
      }
    }
  }
  
  return errors;
}

/**
 * Main validation function for league rules
 */
export function validateLeagueRules(rules) {
  if (!rules || typeof rules !== 'object') {
    return {
      valid: false,
      errors: ['Rules must be an object']
    };
  }
  
  const errors = validateScoringRules(rules, SCORING_RULES_SCHEMA);
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and normalize scoring rules
 */
export function sanitizeScoringRules(rules) {
  if (!rules || typeof rules !== 'object') {
    return null;
  }
  
  // Deep clone to avoid mutating original
  const sanitized = JSON.parse(JSON.stringify(rules));
  
  // Ensure all required fields exist with defaults
  const defaults = {
    offensive: {
      passing: { yardsPerPoint: 0.04, touchdownPoints: 4, interceptionPoints: -2 },
      rushing: { yardsPerPoint: 0.1, touchdownPoints: 6 },
      receiving: { yardsPerPoint: 0.1, touchdownPoints: 6 },
      fumbles: { lostPoints: -2 }
    },
    defensive: {
      specialTeams: {
        blockedKickPoints: 2, safetyPoints: 2, fumbleRecoveryPoints: 1,
        interceptionPoints: 2, sackPoints: 1, puntReturnTDPoints: 6,
        kickoffReturnTDPoints: 6
      },
      pointsAllowed: {
        shutoutPoints: 10, oneToSixPoints: 7, sevenToThirteenPoints: 4,
        fourteenToTwentyPoints: 1, twentyOneToTwentySevenPoints: 0,
        twentyEightToThirtyFourPoints: -1, thirtyFivePlusPoints: -4
      },
      teamWinPoints: 5
    },
    kicker: {
      fieldGoals: {
        zeroToThirtyNinePoints: 3, fortyToFortyNinePoints: 4, fiftyPlusPoints: 5
      },
      extraPointPoints: 1
    }
  };
  
  // Merge with defaults, keeping user values where valid
  return mergeWithDefaults(sanitized, defaults);
}

/**
 * Merge user rules with defaults, keeping valid user values
 */
function mergeWithDefaults(userRules, defaults) {
  const result = { ...defaults };
  
  for (const [section, sectionRules] of Object.entries(userRules)) {
    if (section in defaults && typeof sectionRules === 'object') {
      for (const [category, categoryRules] of Object.entries(sectionRules)) {
        if (category in defaults[section] && typeof categoryRules === 'object') {
          for (const [field, value] of Object.entries(categoryRules)) {
            if (field in defaults[section][category] && typeof value === 'number') {
              // Validate the value is within reasonable bounds
              const schema = getSchemaForField(section, category, field);
              if (schema && validateField(value, schema).valid) {
                result[section][category][field] = value;
              }
            }
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Get schema for a specific field
 */
function getSchemaForField(section, category, field) {
  try {
    return SCORING_RULES_SCHEMA[section][category][field];
  } catch {
    return null;
  }
}

/**
 * Shared validation for text inputs
 */
function validateTextInput(text, fieldName, maxLength = 255) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  
  // Check for potentially malicious content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid characters` };
    }
  }
  
  return { valid: true, sanitized: trimmed };
}

/**
 * Validate league name and other text inputs
 */
export function validateLeagueName(name) {
  return validateTextInput(name, 'League name');
}

/**
 * Validate commissioner name
 */
export function validateCommissionerName(name) {
  return validateTextInput(name, 'Commissioner name');
}

/**
 * Validate username/display name
 */
export function validateUsername(username) {
  return validateTextInput(username, 'Username');
}

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }
  
  if (trimmed.length > 255) {
    return { valid: false, error: 'Email cannot exceed 255 characters' };
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true, sanitized: trimmed };
} 