import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const workbookPath = path.resolve(process.cwd(), 'portal-data-catalog.xlsx');
const outputPath = path.resolve(process.cwd(), 'appsync-schema.graphql');

const workbook = xlsx.readFile(workbookPath);
const modelsSheet = workbook.Sheets['06_AppSync_Models'];
const fieldsSheet = workbook.Sheets['07_AppSync_Fields'];

if (!modelsSheet || !fieldsSheet) {
  throw new Error('Missing AppSync sheets. Ensure 06_AppSync_Models and 07_AppSync_Fields exist.');
}

const models = xlsx.utils.sheet_to_json(modelsSheet).filter(row => row.model_name);
const fields = xlsx.utils.sheet_to_json(fieldsSheet).filter(row => row.model_name && row.field_name);

const fieldsByModel = fields.reduce((acc, field) => {
  const name = String(field.model_name).trim();
  if (!acc[name]) acc[name] = [];
  acc[name].push(field);
  return acc;
}, {});

const enumValues = {};

const toEnumValues = (raw) => {
  if (!raw || typeof raw !== 'string') return [];
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const parts = cleaned.split(/[\/,|]/).map(v => v.trim()).filter(Boolean);
  return parts.map(v => v.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase());
};

const mapType = (type) => {
  if (!type) return 'String';
  const normalized = String(type).trim().toLowerCase();
  if (normalized === 'id') return 'ID';
  if (normalized === 'string') return 'String';
  if (normalized === 'int' || normalized === 'integer') return 'Int';
  if (normalized === 'float' || normalized === 'number' || normalized === 'decimal') return 'Float';
  if (normalized === 'boolean' || normalized === 'bool') return 'Boolean';
  if (normalized === 'date') return 'AWSDate';
  if (normalized === 'datetime') return 'AWSDateTime';
  if (normalized === 'json') return 'AWSJSON';
  if (normalized.startsWith('array<')) {
    const inner = normalized.replace('array<', '').replace('>', '');
    return `[${mapType(inner)}]`;
  }
  if (normalized.startsWith('[') && normalized.endsWith(']')) {
    const inner = normalized.slice(1, -1);
    return `[${mapType(inner)}]`;
  }
  if (normalized === 'enum') return null;
  return 'String';
};

const buildEnumName = (modelName, fieldName) => {
  return `${modelName}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}Enum`;
};

const schemaLines = [];

schemaLines.push('# Generated from portal-data-catalog.xlsx');
schemaLines.push('# Source sheets: 06_AppSync_Models, 07_AppSync_Fields');
schemaLines.push('# Review enums and auth rules before deploying.');
schemaLines.push('');
schemaLines.push('schema {');
schemaLines.push('  query: Query');
schemaLines.push('  mutation: Mutation');
schemaLines.push('  subscription: Subscription');
schemaLines.push('}');
schemaLines.push('');
schemaLines.push('scalar AWSDate');
schemaLines.push('scalar AWSDateTime');
schemaLines.push('scalar AWSJSON');
schemaLines.push('');

models.forEach((model) => {
  const modelName = String(model.model_name).trim();
  const modelFields = fieldsByModel[modelName] || [];
  const comment = model.description ? String(model.description).trim() : '';
  schemaLines.push(`type ${modelName} @model {`);
  if (comment) {
    schemaLines.push(`  # ${comment}`);
  }
  if (model.owner_role || model.read_roles || model.write_roles) {
    schemaLines.push(`  # owner_role: ${model.owner_role || ''}`);
    schemaLines.push(`  # read_roles: ${model.read_roles || ''}`);
    schemaLines.push(`  # write_roles: ${model.write_roles || ''}`);
  }

  if (modelFields.length === 0) {
    schemaLines.push('  # TODO: Add fields');
  } else {
    modelFields.forEach((field) => {
      const fieldName = String(field.field_name).trim();
      const fieldType = String(field.type || '').trim();
      const required = String(field.required || '').trim().toLowerCase() === 'yes';
      const notes = String(field.notes || '').trim();

      if (fieldType.toLowerCase() === 'enum') {
        const enumName = buildEnumName(modelName, fieldName);
        const values = toEnumValues(notes);
        if (!enumValues[enumName]) enumValues[enumName] = values;
        schemaLines.push(`  ${fieldName}: ${enumName}${required ? '!' : ''}`);
        return;
      }

      const mappedType = mapType(fieldType);
      schemaLines.push(`  ${fieldName}: ${mappedType}${required ? '!' : ''}`);
    });
  }
  schemaLines.push('}');
  schemaLines.push('');
});

Object.entries(enumValues).forEach(([enumName, values]) => {
  schemaLines.push(`enum ${enumName} {`);
  if (values.length === 0) {
    schemaLines.push('  # TODO: Define enum values');
  } else {
    values.forEach((value) => {
      schemaLines.push(`  ${value}`);
    });
  }
  schemaLines.push('}');
  schemaLines.push('');
});

schemaLines.push('type Query {');
schemaLines.push('  _placeholder: String');
schemaLines.push('}');
schemaLines.push('');
schemaLines.push('type Mutation {');
schemaLines.push('  _placeholder: String');
schemaLines.push('}');
schemaLines.push('');
schemaLines.push('type Subscription {');
schemaLines.push('  _placeholder: String');
schemaLines.push('}');

fs.writeFileSync(outputPath, schemaLines.join('\n'));
console.log(`Generated ${outputPath}`);
