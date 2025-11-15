/**
 * src/StudentManager.js
 * Class untuk mengelola koleksi siswa (CRUD + persistence optional)
 *
 * Komentar bernomor terhubung ke index.js:
 * - addStudent -> [13]
 * - findStudent -> [23]
 * - updateStudent -> [32]
 * - removeStudent -> [36]
 * - getAllStudents/displayAllStudents -> [17..20]
 * - getTopStudents -> [47]
 * - _saveToFile -> [43]
 */

import fs from 'fs';
import path from 'path';
import Student from './Student.js';

class StudentManager {
  constructor(options = {}) {
    // array untuk menyimpan Student instances
    this.students = []; // [3] manager container
    this.dataDir = options.dataDir || path.resolve(process.cwd(), 'data');
    this.dataFile = path.join(this.dataDir, 'students.json');

    // mencoba load data (jika ada) -> berkaitan dengan [3] inisialisasi
    try {
      this._ensureDataDir();
      this._loadFromFile(); // optional persistence (silently ignore errors)
    } catch (err) {
      // do nothing, start with empty array
    }
  }

  // Pastikan folder data ada
  _ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // [43] load data from file saat inisialisasi
  _loadFromFile() {
    if (!fs.existsSync(this.dataFile)) return;
    const raw = fs.readFileSync(this.dataFile, { encoding: 'utf-8' });
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    this.students = arr.map((obj) => Student.fromObject(obj)); // restore instances
  }

  // [43] menyimpan data ke data/students.json (dipanggil setelah perubahan)
  _saveToFile() {
    try {
      this._ensureDataDir();
      const arr = this.students.map((s) => s.toJSON());
      fs.writeFileSync(this.dataFile, JSON.stringify(arr, null, 2), {
        encoding: 'utf-8',
      });
    } catch (err) {
      console.error('Gagal menyimpan data:', err.message);
    }
  }

  /**
   * [13] Menambah student
   * Validasi: instance Student & ID unik
   */
  addStudent(student) {
    if (!(student instanceof Student)) {
      throw new Error('Parameter harus instance Student.');
    }
    const exists = this.findStudent(student.id);
    if (exists) return false;
    this.students.push(student);
    this._saveToFile();
    return true;
  }

  /**
   * [36] removeStudent
   */
  removeStudent(id) {
    const idx = this.students.findIndex((s) => s.id === String(id));
    if (idx === -1) return false;
    this.students.splice(idx, 1);
    this._saveToFile();
    return true;
  }

  /**
   * [23] findStudent by ID
   */
  findStudent(id) {
    return this.students.find((s) => s.id === String(id)) || null;
  }

  /**
   * [32] updateStudent
   */
  updateStudent(id, data = {}) {
    const student = this.findStudent(id);
    if (!student) return false;
    if (data.name !== undefined) student.name = data.name;
    if (data.className !== undefined) student.className = data.className;
    this._saveToFile();
    return true;
  }

  /**
   * [17] getAllStudents
   */
  getAllStudents() {
    return [...this.students];
  }

  /**
   * [47] getTopStudents(n)
   */
  getTopStudents(n = 3) {
    return [...this.students]
      .sort((a, b) => b.getAverage() - a.getAverage())
      .slice(0, n);
  }

  /**
   * [17..20] displayAllStudents : menampilkan atau pesan kosong
   */
  displayAllStudents() {
    if (this.students.length === 0) {
      console.log('Belum ada data siswa.');
      return;
    }
    this.students.forEach((s, idx) => {
      console.log(`\n=== Siswa #${idx + 1} ===`);
      console.log(s.displayInfo());
    });
  }

  /**
   * BONUS helpers:
   */
  getStudentsByClass(className) {
    return this.students.filter((s) => s.className === String(className));
  }

  getClassStatistics(className) {
    const arr = this.getStudentsByClass(className);
    const count = arr.length;
    const average =
      count === 0
        ? 0
        : Math.round(
            (arr.reduce((acc, s) => acc + s.getAverage(), 0) / count) * 100
          ) / 100;
    return { count, average };
  }
}

export default StudentManager;
