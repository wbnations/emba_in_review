const fs = require('fs');
const path = require('path');

// path to data and photos folder
const dataPath = path.join(__dirname, 'cohort-data.json');
const photosDir = path.join(__dirname, 'public', 'photos');

// load and sort students by last name (alphabetical)
const raw = fs.readFileSync(dataPath, 'utf8');
const { students } = JSON.parse(raw);
const sortedStudents = [...students].sort((a, b) => {
  const lastA = a.name.trim().split(' ').pop().toLowerCase();
  const lastB = b.name.trim().split(' ').pop().toLowerCase();
  return lastA.localeCompare(lastB);
});

// read photo files and sort by numeric part
const files = fs.readdirSync(photosDir).filter(f => f.match(/image-\d+\.jpg$/i));
files.sort((a, b) => {
  const numA = parseInt(a.match(/image-(\d+)\.jpg/i)[1], 10);
  const numB = parseInt(b.match(/image-(\d+)\.jpg/i)[1], 10);
  return numA - numB;
});

if (files.length !== sortedStudents.length) {
  console.warn('Warning: number of image files does not match number of students');
}

files.forEach((file, idx) => {
  const student = sortedStudents[idx];
  if (!student) return;
  const oldPath = path.join(photosDir, file);
  const newName = student.id + path.extname(file);
  const newPath = path.join(photosDir, newName);
  try {
    fs.renameSync(oldPath, newPath);
    console.log(`${file} -> ${newName}`);
  } catch (err) {
    console.error(`Failed to rename ${file}:`, err);
  }
});

console.log('Rename complete');
