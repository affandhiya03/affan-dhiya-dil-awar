// Manajemen Data Mahasiswa dengan login, CRUD, search, sort, dan file I/O

class Person {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class Student extends Person {
  constructor(nim, name, email, major, gpa) {
    super(name, email);
    this.nim = nim;
    this.major = major;
    this.gpa = Number(gpa);
  }

  toObject() {
    return { nim: this.nim, name: this.name, email: this.email, major: this.major, gpa: this.gpa };
  }
}

class StudentManager {
  #students = [];
  #storageKey = "mahasiswa_data";

  constructor() {
    this.loadFromStorage();
  }

  getAll() {
    return [...this.#students];
  }

  add(student) {
    if (this.#students.some((s) => s.nim === student.nim)) {
      throw new Error("NIM sudah terdaftar.");
    }
    this.#students.push(student);
    this.saveToStorage();
  }

  update(nim, payload) {
    const idx = this.#students.findIndex((s) => s.nim === nim);
    if (idx === -1) throw new Error("Data tidak ditemukan.");
    this.#students[idx] = new Student(
      payload.nim ?? this.#students[idx].nim,
      payload.name ?? this.#students[idx].name,
      payload.email ?? this.#students[idx].email,
      payload.major ?? this.#students[idx].major,
      payload.gpa ?? this.#students[idx].gpa
    );
    this.saveToStorage();
  }

  remove(nim) {
    const idx = this.#students.findIndex((s) => s.nim === nim);
    if (idx === -1) throw new Error("Data tidak ditemukan.");
    this.#students.splice(idx, 1);
    this.saveToStorage();
  }

  replaceAll(students) {
    this.#students = students.map((s) => new Student(s.nim, s.name, s.email, s.major, s.gpa));
    this.saveToStorage();
  }

  saveToStorage() {
    const data = this.#students.map((s) => s.toObject());
    localStorage.setItem(this.#storageKey, JSON.stringify(data));
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.#storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.#students = parsed.map((s) => new Student(s.nim, s.name, s.email, s.major, s.gpa));
      }
    } catch (err) {
      console.error("Gagal membaca dari localStorage:", err);
      this.#students = [];
    }
  }

  clearStorage() {
    localStorage.removeItem(this.#storageKey);
    this.#students = [];
  }
}

// ---- Login ----
const PASSWORD = "affan 123";

const loginForm = document.getElementById("login-form");
const loginPasswordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const appMain = document.getElementById("app-main");
const loginPanel = document.getElementById("login-panel");
const logoutBtn = document.getElementById("logout-btn");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (loginPasswordInput.value === PASSWORD) {
    const welcomeOverlay = document.getElementById("welcome-overlay");
    welcomeOverlay.classList.remove("hidden");
    
    setTimeout(() => {
      welcomeOverlay.classList.add("hidden");
      appMain.classList.remove("hidden");
      loginPanel.style.display = "none";
      logoutBtn.classList.remove("hidden");
    }, 3000);
  } else {
    loginError.textContent = "Password salah. Gunakan: affan 123";
  }
});

// ---- Logout ----
logoutBtn.addEventListener("click", () => {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    // Reset aplikasi
    appMain.classList.add("hidden");
    loginPanel.style.display = "block";
    logoutBtn.classList.add("hidden");
    loginPasswordInput.value = "";
    loginPasswordInput.focus();
    loginError.textContent = "";
  }
});

// ---- Validasi Regex ----
const regexRules = {
  nim: /^\d{1,12}$/,
  name: /^[A-Za-zÀ-ÿ\s]{3,50}$/,
  email: /^[\w.-]+@[\w.-]+\.\w{2,}$/,
  major: /^.{2,50}$/,
  gpa: /^(?:[0-3](?:\.\d{1,2})?|4(?:\.0{1,2})?)$/
};

function validateStudent({ nim, name, email, major, gpa }) {
  if (!regexRules.nim.test(nim)) return "NIM harus 1-12 digit angka.";
  if (!regexRules.name.test(name)) return "Nama minimal 3 huruf, tanpa angka.";
  if (!regexRules.email.test(email)) return "Format email tidak valid.";
  if (!regexRules.major.test(major)) return "Program studi wajib diisi.";
  if (!regexRules.gpa.test(String(gpa))) return "IPK 0.00 - 4.00 (2 desimal).";
  return "";
}

// ---- Sorting Algorithms ----
function compare(a, b, key) {
  if (key === "gpa") return a.gpa - b.gpa;
  return String(a[key]).localeCompare(String(b[key]));
}

function insertionSort(arr, key) {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const current = a[i];
    let j = i - 1;
    while (j >= 0 && compare(a[j], current, key) > 0) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = current;
  }
  return a;
}

function selectionSort(arr, key) {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (compare(a[j], a[minIdx], key) < 0) minIdx = j;
    }
    [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a;
}

function bubbleSort(arr, key) {
  const a = [...arr];
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i < a.length - 1; i++) {
      if (compare(a[i], a[i + 1], key) > 0) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swapped = true;
      }
    }
  }
  return a;
}

function merge(left, right, key) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j], key) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

function mergeSort(arr, key) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), key);
  const right = mergeSort(arr.slice(mid), key);
  return merge(left, right, key);
}

function shellSort(arr, key) {
  const a = [...arr];
  let gap = Math.floor(a.length / 2);
  while (gap > 0) {
    for (let i = gap; i < a.length; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap && compare(a[j - gap], temp, key) > 0) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  return a;
}

// ---- Searching ----
function linearSearch(arr, query, key = "all") {
  const q = query.toLowerCase();
  return arr.filter((s) => {
    if (key === "nim") return s.nim.includes(query);
    if (key === "name") return s.name.toLowerCase().includes(q);
    return s.nim.includes(query) || s.name.toLowerCase().includes(q);
  });
}

function sequentialSearch(arr, query, key = "all") {
  return linearSearch(arr, query, key);
}

function binarySearch(arr, query, key = "nim") {
  const sorted = insertionSort(arr, key);
  let low = 0;
  let high = sorted.length - 1;
  const matches = [];
  const target = String(query).toLowerCase();
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const val = String(sorted[mid][key]).toLowerCase();
    if (val === target) {
      matches.push(sorted[mid]);
      let l = mid - 1;
      while (l >= 0 && String(sorted[l][key]).toLowerCase() === target) {
        matches.push(sorted[l--]);
      }
      let r = mid + 1;
      while (r < sorted.length && String(sorted[r][key]).toLowerCase() === target) {
        matches.push(sorted[r++]);
      }
      break;
    }
    if (val < target) low = mid + 1;
    else high = mid - 1;
  }
  return matches;
}

// ---- UI Logic ----
const manager = new StudentManager();
let editingNim = null;

const form = document.getElementById("student-form");
const nimInput = document.getElementById("nim");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const majorInput = document.getElementById("major");
const gpaInput = document.getElementById("gpa");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");
const tableBody = document.getElementById("student-table-body");
const tableInfo = document.getElementById("table-info");
const searchInput = document.getElementById("search-query");
const searchMethodSelect = document.getElementById("search-method");
const searchKeySelect = document.getElementById("search-key");
const sortMethodSelect = document.getElementById("sort-method");
const sortKeySelect = document.getElementById("sort-key");
const sortOrderSelect = document.getElementById("sort-order");
const complexityList = document.getElementById("complexity-list");

const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const searchBtn = document.getElementById("search-btn");
const sortBtn = document.getElementById("sort-btn");

// Modal elements
const crudModal = document.getElementById("crud-modal");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const cancelBtn = document.getElementById("cancel-btn");
const addBtn = document.getElementById("add-btn");

// Dashboard elements
const totalStudentsEl = document.getElementById("total-students");
const avgGpaEl = document.getElementById("avg-gpa");
const maxGpaEl = document.getElementById("max-gpa");
const majorCountEl = document.getElementById("major-count");

function openModal(isEdit = false) {
  crudModal.classList.remove("hidden");
  if (isEdit) {
    modalTitle.textContent = "Edit Mahasiswa";
  } else {
    modalTitle.textContent = "Tambah Mahasiswa";
    form.reset();
    editingNim = null;
  }
}

function closeModal() {
  crudModal.classList.add("hidden");
}

addBtn.addEventListener("click", () => openModal());
modalClose.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

crudModal.addEventListener("click", (e) => {
  if (e.target === crudModal) closeModal();
});

function resetForm() {
  form.reset();
  editingNim = null;
  submitBtn.textContent = "Tambah";
  formError.textContent = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const payload = {
    nim: nimInput.value.trim(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    major: majorInput.value.trim(),
    gpa: gpaInput.value.trim()
  };

  const error = validateStudent(payload);
  if (error) {
    formError.textContent = error;
    return;
  }

  try {
    if (editingNim) {
      manager.update(editingNim, payload);
    } else {
      manager.add(new Student(payload.nim, payload.name, payload.email, payload.major, payload.gpa));
    }
    renderTable(manager.getAll());
    updateDashboard();
    resetForm();
    closeModal();
  } catch (err) {
    formError.textContent = err.message;
  }
});

form.addEventListener("reset", () => resetForm());

function updateDashboard() {
  const students = manager.getAll();
  const totalCount = students.length;
  
  totalStudentsEl.textContent = totalCount;
  
  if (totalCount === 0) {
    avgGpaEl.textContent = "0.00";
    maxGpaEl.textContent = "0.00";
    majorCountEl.textContent = "0";
  } else {
    const avgGpa = (students.reduce((sum, s) => sum + s.gpa, 0) / totalCount).toFixed(2);
    const maxGpa = Math.max(...students.map(s => s.gpa)).toFixed(2);
    const majors = new Set(students.map(s => s.major)).size;
    
    avgGpaEl.textContent = avgGpa;
    maxGpaEl.textContent = maxGpa;
    majorCountEl.textContent = majors;
  }
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.nim}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.major}</td>
      <td>${student.gpa.toFixed(2)}</td>
      <td>
        <button class="secondary" data-action="edit" data-nim="${student.nim}">Edit</button>
        <button class="danger" data-action="delete" data-nim="${student.nim}">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableInfo.textContent = data.length ? `Menampilkan ${data.length} mahasiswa.` : "Belum ada data.";
}

tableBody.addEventListener("click", (e) => {
  const btn = e.target;
  if (!(btn instanceof HTMLButtonElement)) return;
  const nim = btn.dataset.nim;
  if (!nim) return;

  if (btn.dataset.action === "edit") {
    const student = manager.getAll().find((s) => s.nim === nim);
    if (!student) return;
    nimInput.value = student.nim;
    nameInput.value = student.name;
    emailInput.value = student.email;
    majorInput.value = student.major;
    gpaInput.value = student.gpa;
    editingNim = nim;
    submitBtn.textContent = "Update";
    formError.textContent = "";
    openModal(true);
  }

  if (btn.dataset.action === "delete") {
    if (confirm(`Hapus data ${nim}?`)) {
      try {
        manager.remove(nim);
        renderTable(manager.getAll());
        updateDashboard();
      } catch (err) {
        formError.textContent = err.message;
      }
    }
  }
});

searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (!q) {
    renderTable(manager.getAll());
    tableInfo.textContent = "Query kosong, menampilkan semua data.";
    return;
  }
  const data = manager.getAll();
  let result = [];
  switch (searchMethodSelect.value) {
    case "linear":
      result = linearSearch(data, q, searchKeySelect.value);
      break;
    case "sequential":
      result = sequentialSearch(data, q, searchKeySelect.value);
      break;
    case "binary":
      result = binarySearch(data, q, searchKeySelect.value === "name" ? "name" : "nim");
      break;
    default:
      result = [];
  }
  renderTable(result);
  tableInfo.textContent = result.length
    ? `Hasil pencarian "${q}" (${searchMethodSelect.value}, ${searchKeySelect.value}): ${result.length} ditemukan.`
    : `Tidak ada hasil untuk "${q}".`;
});

sortBtn.addEventListener("click", () => {
  const key = sortKeySelect.value;
  const data = manager.getAll();
  let sorted = data;
  const method = sortMethodSelect.value;
  switch (method) {
    case "insertion":
      sorted = insertionSort(data, key);
      break;
    case "selection":
      sorted = selectionSort(data, key);
      break;
    case "bubble":
      sorted = bubbleSort(data, key);
      break;
    case "merge":
      sorted = mergeSort(data, key);
      break;
    case "shell":
      sorted = shellSort(data, key);
      break;
    default:
      sorted = data;
  }
  if (sortOrderSelect.value === "desc") {
    sorted = [...sorted].reverse();
  }
  manager.replaceAll(sorted);
  renderTable(manager.getAll());
  tableInfo.textContent = `Data diurutkan dengan ${method} sort berdasarkan ${key} (${sortOrderSelect.value}).`;
});

// ---- File I/O ----
exportBtn.addEventListener("click", () => {
  try {
    const data = manager.getAll().map((s) => s.toObject());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mahasiswa.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    formError.textContent = "Gagal menulis file: " + err.message;
  }
});

importInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error("Format tidak sesuai.");
      manager.replaceAll(parsed);
      renderTable(manager.getAll());
      updateDashboard();
      tableInfo.textContent = "Data berhasil dibaca dari file.";
    } catch (err) {
      formError.textContent = "Gagal membaca file: " + err.message;
    }
  };
  reader.onerror = () => {
    formError.textContent = "Terjadi kesalahan saat membaca file.";
  };
  reader.readAsText(file);
});

// ---- Complexity Info ----
const complexityData = [
  { feature: "Linear/Sequential Search", best: "O(1)", avg: "O(n)", worst: "O(n)" },
  { feature: "Binary Search", best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
  { feature: "Insertion / Selection / Bubble Sort", best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
  { feature: "Merge / Shell Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" }
];

function renderComplexity() {
  complexityList.innerHTML = "";
  complexityData.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.feature}: best ${item.best}, average ${item.avg}, worst ${item.worst}`;
    complexityList.appendChild(li);
  });
}

// ---- Init ----
// Sample data initialization
const sampleStudents = [
  { nim: "241011402051", name: "Afdal Laia", email: "afdal.laia@unpam.ac.id", major: "Teknik Informatika", gpa: 3.45 },
  { nim: "241011400248", name: "Dimas", email: "dimas@unpam.ac.id", major: "Teknik Informatika", gpa: 3.78 },
  { nim: "241011402104", name: "Yehezkiel", email: "yehezkiel@unpam.ac.id", major: "Teknik Informatika", gpa: 3.12 },
  { nim: "241011400231", name: "Rozi", email: "rozi@unpam.ac.id", major: "Teknik Informatika", gpa: 3.89 },
  { nim: "241011400235", name: "M Ichsan Fachrulrozi", email: "ichsan.fachrulrozi@unpam.ac.id", major: "Teknik Informatika", gpa: 3.56 },
  { nim: "241011400277", name: "Bayu Abiakso", email: "bayu.abiakso@unpam.ac.id", major: "Teknik Informatika", gpa: 3.34 },
  { nim: "241011400233", name: "Firman Gani", email: "firman.gani@unpam.ac.id", major: "Teknik Informatika", gpa: 3.67 },
  { nim: "241011401525", name: "Jiwa", email: "jiwa@unpam.ac.id", major: "Teknik Informatika", gpa: 3.23 },
  { nim: "241011401536", name: "Medina", email: "medina@unpam.ac.id", major: "Teknik Informatika", gpa: 3.91 },
  { nim: "241011401526", name: "Aldo", email: "aldo@unpam.ac.id", major: "Teknik Informatika", gpa: 3.45 },
  { nim: "241011401528", name: "Fadly", email: "fadly@unpam.ac.id", major: "Teknik Informatika", gpa: 3.72 },
  { nim: "241011402026", name: "Cristian Yuda", email: "cristian.yuda@unpam.ac.id", major: "Teknik Informatika", gpa: 3.58 },
  { nim: "241011402315", name: "Fazri", email: "fazri@unpam.ac.id", major: "Teknik Informatika", gpa: 3.81 },
  { nim: "241011400266", name: "AFFAN DHIYA DIL AWAR", email: "affan.dhiya@unpam.ac.id", major: "Teknik Informatika", gpa: 3.95 },
  { nim: "241011400232", name: "Rido Maulidan", email: "rido.maulidan@unpam.ac.id", major: "Teknik Informatika", gpa: 3.47 },
  { nim: "241011400261", name: "Muzayin", email: "muzayin@unpam.ac.id", major: "Teknik Informatika", gpa: 3.63 },
  { nim: "241011401769", name: "Sulthan Arya Satwika", email: "sulthan.arya@unpam.ac.id", major: "Teknik Informatika", gpa: 3.74 },
  { nim: "241011400276", name: "Maikel", email: "maikel@unpam.ac.id", major: "Teknik Informatika", gpa: 3.52 },
  { nim: "241011400268", name: "Fariz", email: "fariz@unpam.ac.id", major: "Teknik Informatika", gpa: 3.68 },
  { nim: "241011401936", name: "Timothy", email: "timothy@unpam.ac.id", major: "Teknik Informatika", gpa: 3.39 },
  { nim: "241011400228", name: "Adrian", email: "adrian@unpam.ac.id", major: "Teknik Informatika", gpa: 3.85 },
  { nim: "241011400253", name: "Syahrul", email: "syahrul@unpam.ac.id", major: "Teknik Informatika", gpa: 3.51 },
  { nim: "241011403270", name: "Faya", email: "faya@unpam.ac.id", major: "Teknik Informatika", gpa: 3.92 },
  { nim: "241011402755", name: "Adlina", email: "adlina@unpam.ac.id", major: "Teknik Informatika", gpa: 3.44 },
  { nim: "241011401655", name: "Ulya", email: "ulya@unpam.ac.id", major: "Teknik Informatika", gpa: 3.79 },
  { nim: "2410114002544", name: "Nia", email: "nia@unpam.ac.id", major: "Teknik Informatika", gpa: 3.66 },
  { nim: "241011402113", name: "Elis", email: "elis@unpam.ac.id", major: "Teknik Informatika", gpa: 3.55 },
  { nim: "241011400269", name: "Gilang", email: "gilang@unpam.ac.id", major: "Teknik Informatika", gpa: 3.88 }
];

// Initialize with sample data if storage is empty
if (manager.getAll().length === 0) {
  sampleStudents.forEach((data) => {
    try {
      manager.add(new Student(data.nim, data.name, data.email, data.major, data.gpa));
    } catch (err) {
      console.log(`Skipping duplicate NIM: ${data.nim}`);
    }
  });
}

renderTable(manager.getAll());
updateDashboard();
renderComplexity();