const fs = require('fs');
const path = require('path');

const csvFile = path.join(__dirname, 'EMBA_2026.csv');
const xlsxFile = path.join(__dirname, 'public', 'EMBA Class of 2026 Schedule 2.xlsx');

// helper to parse a simple CSV (comma separated, no quoting handling)
function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const header = lines.shift().split(',').map(h => h.trim());
  const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
  return { header, rows };
}

function buildMap(rows, termIdx, courseIdx) {
  const map = {};
  rows.forEach(cols => {
    const term = cols[termIdx];
    const course = cols[courseIdx];
    if (!term || !course) return;
    map[term] = map[term] || [];
    if (!map[term].includes(course)) map[term].push(course);
  });
  return map;
}

if (fs.existsSync(csvFile)) {
  console.log('Reading CSV file', csvFile);
  const text = fs.readFileSync(csvFile, 'utf8');
  const { header, rows } = parseCsv(text);
  // attempt to locate columns named "Term" and "Course" (case-insensitive)
  const termIdx = header.findIndex(h => /term/i.test(h));
  const courseIdx = header.findIndex(h => /course/i.test(h));
  if (termIdx === -1 || courseIdx === -1) {
    console.error('Could not locate Term/Course columns in CSV headers', header);
    process.exit(1);
  }
  const courseMap = buildMap(rows, termIdx, courseIdx);
  console.log('courseMap =', JSON.stringify(courseMap, null, 2));
  process.exit(0);
}

// fallback: try to read XLSX if xlsx package is installed
if (fs.existsSync(xlsxFile)) {
  let xlsx;
  try {
    xlsx = require('xlsx');
  } catch (err) {
    console.error('Found XLSX file but "xlsx" npm package is not installed.');
    console.error('Run "npm install xlsx" and re-run this script, or convert the spreadsheet to CSV.');
    process.exit(1);
  }

  console.log('Reading XLSX file', xlsxFile);
  const wb = xlsx.readFile(xlsxFile);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  if (data.length === 0) {
    console.error('Spreadsheet appears empty');
    process.exit(1);
  }
  const header = data[0].map(h => (h || '').toString());
  const rows = data.slice(1);
  const termIdx = header.findIndex(h => /term/i.test(h));
  const courseIdx = header.findIndex(h => /course/i.test(h));
  if (termIdx === -1 || courseIdx === -1) {
    console.error('Could not locate Term/Course columns in spreadsheet header', header);
    process.exit(1);
  }
  const courseMap = buildMap(rows, termIdx, courseIdx);
  console.log('courseMap =', JSON.stringify(courseMap, null, 2));
  process.exit(0);
}

console.error('No CSV or XLSX schedule file found.');
console.error('Put EMBA_2026.csv in the project root or the xlsx schedule into public/ and try again.');
process.exit(1);
