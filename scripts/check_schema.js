const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, '..', 'CSDL.sql');
const modelsDir = path.join(__dirname, '..', 'backend', 'Models');

function parseSqlTables(sql) {
  const tables = {};
  const createRegex = /CREATE TABLE\s+([a-zA-Z0-9_]+)\s*\(([^;]+?)\)\s*;?/gms;
  let m;
  while ((m = createRegex.exec(sql)) !== null) {
    const name = m[1].trim();
    const body = m[2];
    const cols = [];
    body.split(/\r?\n/).forEach(line => {
      const l = line.trim();
      if (!l) return;
      // skip constraints and foreign keys and PRIMARY KEY lines
      if (/^CONSTRAINT\b/i.test(l)) return;
      if (/^PRIMARY KEY\b/i.test(l)) return;
      if (/^FOREIGN KEY\b/i.test(l)) return;
      if (/^UNIQUE\b/i.test(l)) return;
      // match column name at start
      const colMatch = /^\[?([A-Za-z0-9_]+)\]?\s+/i.exec(l);
      if (colMatch) {
        const col = colMatch[1].trim();
        cols.push(col.toLowerCase());
      }
    });
    tables[name.toLowerCase()] = Array.from(new Set(cols));
  }
  return tables;
}

function parseModelProps(src) {
  const props = [];
  const propRegex = /public\s+[A-Za-z0-9_<>?,\s]+\s+([A-Za-z0-9_]+)\s*{\s*get;\s*set;\s*}/g;
  let m;
  while ((m = propRegex.exec(src)) !== null) {
    props.push(m[1].toLowerCase());
  }
  return props;
}

function readModels(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.cs'));
  const models = {};
  for (const f of files) {
    const p = path.join(dir, f);
    const src = fs.readFileSync(p, 'utf8');
    const classMatch = /public\s+partial\s+class\s+([A-Za-z0-9_]+)/.exec(src) || /public\s+class\s+([A-Za-z0-9_]+)/.exec(src);
    const name = classMatch ? classMatch[1] : path.basename(f, '.cs');
    models[name.toLowerCase()] = parseModelProps(src);
  }
  return models;
}

function main() {
  if (!fs.existsSync(sqlPath)) {
    console.error('CSDL.sql not found at', sqlPath);
    process.exit(2);
  }
  if (!fs.existsSync(modelsDir)) {
    console.error('Models dir not found at', modelsDir);
    process.exit(2);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const tables = parseSqlTables(sql);
  const models = readModels(modelsDir);

  const report = [];

  // For each model, try to find matching table (by name)
  for (const mname of Object.keys(models)) {
    const table = tables[mname];
    if (!table) {
      report.push({ type: 'model_without_table', model: mname, props: models[mname] });
      continue;
    }
    const props = models[mname];
    const missing = table.filter(c => !props.includes(c) && !props.includes(c.replace(/id$/,'')));
    const extra = props.filter(p => !table.includes(p) && !table.includes(p + 'id') && p !== 'id');
    report.push({ type: 'compare', model: mname, table: mname, missing, extra });
  }

  // tables without models
  for (const tname of Object.keys(tables)) {
    if (!models[tname]) report.push({ type: 'table_without_model', table: tname, columns: tables[tname] });
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
