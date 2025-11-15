/**
 * index.js
 * Main CLI app — [1..55] merepresentasikan langkah alur program
 *
 * Prepared by: Ririn
 */

// [1] START - program dijalankan (node index.js)
import readline from 'readline/promises';
// [2] Import modules: Student & StudentManager
import { stdin as input, stdout as output } from 'process';
import Student from './src/Student.js';
import StudentManager from './src/StudentManager.js';

// [3] Create instance manager
const rl = readline.createInterface({ input, output });
const manager = new StudentManager();

// [4] MAIN LOOP - show menu (1-8)
// [5] Read user input (choice)
// Utility helper: prompt non-empty
async function promptNonEmpty(promptText) {
  let val = '';
  do {
    val = await rl.question(promptText);
    if (String(val).trim() === '') {
      console.log('Input tidak boleh kosong. Silakan coba lagi.');
    }
  } while (String(val).trim() === '');
  return val.trim();
}

// ------------------ Handlers ------------------

// ========== Tambah Siswa Baru ==========
async function addNewStudent() {
  // [6] If choice == "1"
  try {
    // [7] Prompt "Masukkan ID siswa:"
    const id = await promptNonEmpty('ID siswa: ');

    // [9] Check if manager.findStudent(id) exists?
    if (manager.findStudent(id)) {
      // [10] Show "ID sudah digunakan"
      console.log(`Gagal: ID "${id}" sudah digunakan.`);
      return;
    }

    // [11] Prompt "Nama siswa" dan "Kelas"
    const name = await promptNonEmpty('Nama siswa: ');
    const className = await promptNonEmpty('Kelas (mis. 10A): ');

    // [12] new Student(id, name, class)
    const student = new Student(id, name, className);

    // [13] manager.addStudent(student)
    const ok = manager.addStudent(student);

    // [14] Show success message
    if (ok) console.log('Siswa berhasil ditambahkan.');
    else console.log('Gagal menambahkan siswa.');
  } catch (err) {
    console.log('Error:', err.message);
  }
  // [15] Return to MAIN LOOP
}

// ========== Lihat Semua Siswa ==========
function viewAllStudents() {
  // [16] If choice == "2"
  // [17] manager.listStudents() -> displayAllStudents
  // [18] If no data -> show "Belum ada data siswa"
  // [19] Else -> loop each student.displayInfo()
  // [20] Return to MAIN LOOP
  manager.displayAllStudents(); // internal handles empty case
}

// ========== Cari Siswa (by ID) ==========
async function searchStudent() {
  // [21] If choice == "3"
  const id = await promptNonEmpty('Masukkan ID siswa: ');
  // [23] s = manager.findStudent(id)
  const s = manager.findStudent(id);
  // [24]/[25] Null vs show info
  if (!s) {
    console.log(`Siswa dengan ID "${id}" tidak ditemukan.`);
  } else {
    console.log('\n' + s.displayInfo());
  }
}

// ========== Update Data Siswa ==========
async function updateStudent() {
  // [26] If choice == "4"
  const id = await promptNonEmpty('Masukkan ID siswa yang akan diupdate: ');
  const s = manager.findStudent(id);
  // [28] If not found -> show "tidak ditemukan"
  if (!s) {
    console.log(`Siswa dengan ID "${id}" tidak ditemukan.`);
    return;
  }
  // [29] Else show current info
  console.log('Data saat ini:');
  console.log(s.displayInfo());

  // [30] Prompt nama baru & kelas baru (allow empty = skip)
  const newName = await rl.question('Nama baru (kosong = tidak diubah): ');
  const newClass = await rl.question('Kelas baru (kosong = tidak diubah): ');

  // [31] If both empty -> show "tidak ada perubahan"
  const updateData = {};
  if (String(newName).trim() !== '') updateData.name = newName.trim();
  if (String(newClass).trim() !== '') updateData.className = newClass.trim();
  if (Object.keys(updateData).length === 0) {
    console.log('Tidak ada perubahan yang dilakukan.');
    return;
  }

  // [32] Else -> manager.updateStudent(id, data)
  const ok = manager.updateStudent(id, updateData);
  // [33] Show update success/fail
  if (ok) console.log('Data siswa berhasil diperbarui.');
  else console.log('Gagal memperbarui data siswa.');
  // [34] Return to MAIN LOOP
}

// ========== Hapus Siswa (mulai) ==========
async function deleteStudent() {
  // [35] If choice == "5"
  const id = await promptNonEmpty('Masukkan ID siswa yang akan dihapus: '); // [36]
  const s = manager.findStudent(id);
  if (!s) {
    console.log(`Siswa dengan ID "${id}" tidak ditemukan.`);
    return;
  }
  console.log('Data siswa:');
  console.log(s.displayInfo());
  // confirm
  const confirm = await rl.question('Yakin hapus siswa ini? (y/n): ');
  if (confirm.toLowerCase() === 'y') {
    // perform deletion
    const ok = manager.removeStudent(id); // [36] -> manager.removeStudent implements delete
    if (ok) console.log('Siswa berhasil dihapus.');
    else console.log('Gagal menghapus siswa.');
  } else {
    console.log('Batal menghapus.');
  }
}

// ========== Tambah Nilai Siswa ==========
async function addGradeToStudent() {
  // [37] If choice == "6"
  const id = await promptNonEmpty('Masukkan ID siswa: '); // [38]
  const s = manager.findStudent(id);
  if (!s) {
    console.log(`Siswa dengan ID "${id}" tidak ditemukan.`);
    return;
  }
  // [39] Show current info
  console.log('Data siswa:');
  console.log(s.displayInfo());

  // [40] Prompt subject & score
  const subject = await promptNonEmpty('Mata pelajaran: ');
  const rawScore = await promptNonEmpty('Nilai (0-100): ');
  const score = Number(rawScore);

  // [41] Validate score numeric (0–100)
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    console.log('Nilai tidak valid. Harus angka antara 0 - 100.');
    return;
  }

  try {
    // [42] student.addGrade(subject, score)
    s.addGrade(subject, score);
    // [43] manager.save() (optional persistence) -> internal call
    if (typeof manager._saveToFile === 'function') manager._saveToFile();
    // [44] Show success + average
    console.log('Nilai berhasil ditambahkan / diupdate.');
    console.log(`Rata-rata baru: ${s.getAverage()} (${s.getGradeStatus()})`);
  } catch (err) {
    console.log('Error:', err.message);
  }
  // [45] Return to MAIN LOOP
}

// ========== Lihat Top 3 Siswa ==========
function viewTopStudents() {
  // [46] If choice == "7"
  // [47] top = manager.getTopStudents(3)
  const top = manager.getTopStudents(3);
  // [48] If empty -> show "Belum ada data"
  if (!top || top.length === 0) {
    console.log('Belum ada data siswa.');
    return;
  }
  // [49] Else -> show ranking list (#1–#3)
  top.forEach((s, idx) => {
    console.log(`\n#${idx + 1} - ${s.name} (ID: ${s.id})`);
    console.log(`Kelas: ${s.className}`);
    console.log(`Rata-rata: ${s.getAverage()}`);
    console.log(`Status: ${s.getGradeStatus()}`);
  });
  // [50] Return to MAIN LOOP
}

// ========== Keluar Program ==========
async function main() {
  // [51] If choice == "8" handled in loop below
  console.log('Selamat datang di Sistem Manajemen Nilai Siswa!');
  let running = true;

  while (running) {
    // [4]
    console.log('\n=================================');
    console.log('=== SISTEM MANAJEMEN NILAI SISWA ===');
    console.log('=================================');
    console.log('1. Tambah Siswa Baru');
    console.log('2. Lihat Semua Siswa');
    console.log('3. Cari Siswa');
    console.log('4. Update Data Siswa');
    console.log('5. Hapus Siswa');
    console.log('6. Tambah Nilai Siswa');
    console.log('7. Lihat Top 3 Siswa');
    console.log('8. Keluar');
    console.log('=================================');

    // [5]
    const choice = (await rl.question('Pilih menu (1-8): ')).trim();

    switch (choice) {
      case '1':
        await addNewStudent(); // [6..15]
        break;
      case '2':
        viewAllStudents(); // [16..20]
        break;
      case '3':
        await searchStudent(); // [21..25]
        break;
      case '4':
        await updateStudent(); // [26..34]
        break;
      case '5':
        await deleteStudent(); // [35..36]
        break;
      case '6':
        await addGradeToStudent(); // [37..45]
        break;
      case '7':
        viewTopStudents(); // [46..50]
        break;
      case '8':
        // [51] If choice == "8"
        running = false; // [52]
        break;
      default:
        console.log('Pilihan tidak valid. Mohon masukkan angka 1-8.');
    }
  }

  // [53] Close readline
  await rl.close();
  // [54] Show "Terima kasih"
  console.log('\nTerima kasih telah menggunakan aplikasi ini!');
  // [55] END
}

main().catch((err) => {
  console.error('Fatal error:', err);
  rl.close();
});
