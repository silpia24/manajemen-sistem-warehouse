document.addEventListener("DOMContentLoaded", () => {
  // === DATABASE SIMULATION ===
  // Data inventaris awal (bisa didapatkan dari server di aplikasi nyata)
  let inventory = [
    {
      id: "SKU-CHG01",
      name: "Fast Charger 25W USB-C",
      quantity: 150,
      minStock: 30,
      supplier: "Elektronik Jaya",
    },
    {
      id: "SKU-PBK01",
      name: "Power Bank 10000mAh",
      quantity: 80,
      minStock: 20,
      supplier: "Energi Prima",
    },
    {
      id: "SKU-EPH01",
      name: "TWS Earphone Bluetooth 5.2",
      quantity: 25,
      minStock: 25,
      supplier: "Audio Sonic",
    },
    {
      id: "SKU-CBL01",
      name: "Kabel Data USB-C to C 1m",
      quantity: 200,
      minStock: 50,
      supplier: "Koneksi Cepat",
    },
    {
      id: "SKU-ADP01",
      name: "Adapter OTG USB-A to C",
      quantity: 90,
      minStock: 15,
      supplier: "Elektronik Jaya",
    },
  ];

  // Catatan semua transaksi
  let transactionLog = [
    {
      id: 1,
      type: "in",
      itemId: "SKU-CHG01",
      quantity: 150,
      date: new Date().toISOString(),
      user: "Staff Gudang A",
    },
    {
      id: 2,
      type: "in",
      itemId: "SKU-PBK01",
      quantity: 80,
      date: new Date().toISOString(),
      user: "Staff Gudang B",
    },
    {
      id: 3,
      type: "out",
      itemId: "SKU-PBK01",
      quantity: 10,
      date: new Date().toISOString(),
      user: "Sistem (Penjualan #SO-ELEC123)",
    },
    {
      id: 4,
      type: "in",
      itemId: "SKU-EPH01",
      quantity: 50,
      date: new Date(
        new Date().setDate(new Date().getDate() - 2)
      ).toISOString(),
      user: "Staff Gudang A",
    },
    {
      id: 5,
      type: "out",
      itemId: "SKU-CHG01",
      quantity: 20,
      date: new Date(
        new Date().setDate(new Date().getDate() - 1)
      ).toISOString(),
      user: "Sistem (Penjualan #SO-ELEC125)",
    },
  ];

  // === UI ELEMENTS ===
  const appContent = document.getElementById("app-content");
  const navLinks = {
    dashboard: document.getElementById("nav-dashboard"),
    stock: document.getElementById("nav-stock"),
    inbound: document.getElementById("nav-inbound"),
    outbound: document.getElementById("nav-outbound"),
    report: document.getElementById("nav-report"),
  };
  const modal = document.getElementById("notification-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const notificationContent = document.getElementById("notification-content");

  // === CORE LOGIC ===

  // 1. Fungsi untuk menambah barang masuk
  function addStock(itemId, itemName, quantity, minStock, supplier) {
    const item = inventory.find(
      (i) => i.id.toLowerCase() === itemId.toLowerCase()
    );
    if (item) {
      item.quantity += quantity;
    } else {
      inventory.push({
        id: itemId.toUpperCase(),
        name: itemName,
        quantity,
        minStock,
        supplier,
      });
    }
    logTransaction("in", itemId.toUpperCase(), quantity, "Staff Gudang");
    checkForLowStock();
    updateUI();
  }

  // 2. Fungsi untuk mengurangi barang keluar
  function removeStock(itemId, quantity, reference) {
    const item = inventory.find(
      (i) => i.id.toLowerCase() === itemId.toLowerCase()
    );
    if (!item) {
      showNotification(`Error: Barang dengan SKU ${itemId} tidak ditemukan.`);
      return false;
    }
    if (item.quantity < quantity) {
      showNotification(
        `Error: Stok ${item.name} tidak mencukupi. Sisa: ${item.quantity}.`
      );
      return false;
    }
    item.quantity -= quantity;
    logTransaction(
      "out",
      itemId.toUpperCase(),
      quantity,
      `Sistem (Ref: ${reference})`
    );
    checkForLowStock();
    updateUI();
    return true;
  }

  // 3. Fungsi mencatat transaksi
  function logTransaction(type, itemId, quantity, user) {
    const newLog = {
      id: transactionLog.length + 1,
      type,
      itemId,
      quantity,
      date: new Date().toISOString(),
      user,
    };
    transactionLog.unshift(newLog); // Tambahkan ke awal array agar terbaru di atas
  }

  // 4. Fungsi untuk cek stok rendah dan memberi notifikasi
  function checkForLowStock() {
    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.minStock
    );
    if (lowStockItems.length > 0) {
      let notificationHTML = `
                    <p class="text-red-600 font-semibold mb-2">Perhatian! Beberapa barang di bawah stok minimum:</p>
                    <ul class="list-disc list-inside space-y-1">
                        ${lowStockItems
                          .map(
                            (item) =>
                              `<li>${item.name} (Sisa: ${item.quantity}, Min: ${item.minStock})</li>`
                          )
                          .join("")}
                    </ul>
                    <p class="mt-4 text-sm text-gray-600">Mohon Manager Gudang untuk segera melakukan evaluasi untuk restock.</p>
                `;
      showNotification(notificationHTML);
    }
  }

  // Fungsi untuk menampilkan modal notifikasi
  function showNotification(message) {
    notificationContent.innerHTML = message;
    modal.classList.remove("hidden");
  }

  // === RENDER FUNCTIONS (menampilkan halaman) ===

  function renderDashboard() {
    const totalItems = inventory.length;
    const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventory.filter(
      (item) => item.quantity <= item.minStock
    ).length;

    const recentTransactions = transactionLog.slice(0, 5);

    appContent.innerHTML = `
                <div class="fade-in">
                    <h2 class="text-3xl font-bold mb-6">Layar Utama</h2>
                    <!-- Kartu Statistik -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-gray-500">Total Jenis Barang</h3>
                            <p class="text-3xl font-bold">${totalItems}</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-gray-500">Total Stok Barang</h3>
                            <p class="text-3xl font-bold">${totalStock}</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow ${
                          lowStockCount > 0
                            ? "border-l-4 border-red-500"
                            : "border-l-4 border-green-500"
                        }">
                            <h3 class="text-gray-500">Barang Stok Rendah</h3>
                            <p class="text-3xl font-bold">${lowStockCount}</p>
                        </div>
                    </div>

                    <!-- Menu Aksi Cepat -->
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold mb-4">Aksi Cepat</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <a href="#" id="action-inbound" class="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow hover:bg-indigo-50 transition-colors border border-gray-200 hover:border-indigo-400">
                                <div class="bg-indigo-100 p-3 rounded-full mb-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-indigo-600"><path d="M12 22v-6"/><path d="M12 16H8a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-4Z"/><path d="M12 16v6"/><path d="m15 13-3 3-3-3"/></svg>
                                </div>
                                <p class="font-semibold text-gray-700">Input Barang Masuk</p>
                            </a>
                            <a href="#" id="action-outbound" class="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow hover:bg-orange-50 transition-colors border border-gray-200 hover:border-orange-400">
                                <div class="bg-orange-100 p-3 rounded-full mb-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-orange-600"><path d="M12 22v-6"/><path d="M12 16H8a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-4Z"/><path d="M12 16v6"/><path d="m15 19-3-3-3 3"/></svg>
                                </div>
                                <p class="font-semibold text-gray-700">Proses Barang Keluar</p>
                            </a>
                        </div>
                    </div>

                    <!-- Aktivitas Terakhir -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-xl font-semibold mb-4">Aktivitas Terakhir</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="border-b">
                                        <th class="py-2 px-4">Tanggal</th>
                                        <th class="py-2 px-4">Tipe</th>
                                        <th class="py-2 px-4">Barang</th>
                                        <th class="py-2 px-4">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentTransactions
                                      .map(
                                        (log) => `
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="py-2 px-4 text-sm text-gray-600">${new Date(
                                              log.date
                                            ).toLocaleString("id-ID")}</td>
                                            <td class="py-2 px-4">
                                                <span class="px-2 py-1 text-xs rounded-full ${
                                                  log.type === "in"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }">
                                                    ${
                                                      log.type === "in"
                                                        ? "MASUK"
                                                        : "KELUAR"
                                                    }
                                                </span>
                                            </td>
                                            <td class="py-2 px-4 font-medium">${
                                              inventory.find(
                                                (i) => i.id === log.itemId
                                              )?.name || log.itemId
                                            }</td>
                                            <td class="py-2 px-4 font-medium">${
                                              log.quantity
                                            }</td>
                                        </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

    // Event listener untuk Aksi Cepat
    document.getElementById("action-inbound").addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.inbound.click();
    });
    document
      .getElementById("action-outbound")
      .addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.outbound.click();
      });
  }

  function renderStockManagement() {
    appContent.innerHTML = `
                <div class="fade-in">
                    <h2 class="text-3xl font-bold mb-6">Manajemen Stok</h2>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="border-b">
                                        <th class="py-3 px-4">SKU</th>
                                        <th class="py-3 px-4">Nama Barang</th>
                                        <th class="py-3 px-4">Pemasok</th>
                                        <th class="py-3 px-4">Stok Saat Ini</th>
                                        <th class="py-3 px-4">Stok Minimum</th>
                                        <th class="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${inventory
                                      .map((item) => {
                                        const status =
                                          item.quantity > item.minStock
                                            ? "Aman"
                                            : item.quantity > 0
                                            ? "Rendah"
                                            : "Habis";
                                        const statusColor =
                                          status === "Aman"
                                            ? "bg-green-100 text-green-800"
                                            : status === "Rendah"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800";
                                        return `
                                            <tr class="border-b hover:bg-gray-50">
                                                <td class="py-3 px-4 font-mono text-sm">${item.id}</td>
                                                <td class="py-3 px-4 font-semibold">${item.name}</td>
                                                <td class="py-3 px-4 text-sm text-gray-600">${item.supplier}</td>
                                                <td class="py-3 px-4 text-center font-bold text-lg">${item.quantity}</td>
                                                <td class="py-3 px-4 text-center">${item.minStock}</td>
                                                <td class="py-3 px-4">
                                                    <span class="px-3 py-1 text-xs font-medium rounded-full ${statusColor}">
                                                        ${status}
                                                    </span>
                                                </td>
                                            </tr>
                                        `;
                                      })
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
  }

  function renderInboundForm() {
    appContent.innerHTML = `
                <div class="fade-in">
                    <h2 class="text-3xl font-bold mb-6">Input Barang Masuk</h2>
                    <div class="bg-white p-8 rounded-lg shadow max-w-2xl mx-auto">
                        <form id="inbound-form">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Kolom Kiri -->
                                <div class="space-y-6">
                                    <div>
                                        <label for="in-item-id" class="block text-sm font-medium text-gray-700">SKU Barang (Jika sudah ada)</label>
                                        <input type="text" id="in-item-id" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: SKU-CBL02">
                                    </div>
                                    <div>
                                        <label for="in-item-name" class="block text-sm font-medium text-gray-700">Nama Barang (Jika baru)</label>
                                        <input type="text" id="in-item-name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: Headset Gaming RGB">
                                    </div>
                                     <div>
                                        <label for="in-supplier" class="block text-sm font-medium text-gray-700">Pemasok (Jika baru)</label>
                                        <input type="text" id="in-supplier" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: Audio Sonic">
                                    </div>
                                </div>
                                <!-- Kolom Kanan -->
                                <div class="space-y-6">
                                    <div>
                                        <label for="in-quantity" class="block text-sm font-medium text-gray-700">Jumlah Masuk</label>
                                        <input type="number" id="in-quantity" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" min="1">
                                    </div>
                                    <div>
                                        <label for="in-min-stock" class="block text-sm font-medium text-gray-700">Stok Minimum (Jika baru)</label>
                                        <input type="number" id="in-min-stock" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" min="0">
                                    </div>
                                </div>
                            </div>
                            <div class="mt-8 text-right">
                                <button type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
    // Add event listener for the new form
    document
      .getElementById("inbound-form")
      .addEventListener("submit", handleInboundSubmit);
  }

  function renderOutboundForm() {
    appContent.innerHTML = `
                <div class="fade-in">
                    <h2 class="text-3xl font-bold mb-6">Proses Barang Keluar</h2>
                    <div class="bg-white p-8 rounded-lg shadow max-w-lg mx-auto">
                        <p class="text-sm text-gray-600 mb-4">Form ini mensimulasikan staff gudang memproses permintaan keluar barang yang dihasilkan otomatis oleh sistem penjualan.</p>
                        <form id="outbound-form">
                            <div class="space-y-6">
                                <div>
                                    <label for="out-item-id" class="block text-sm font-medium text-gray-700">SKU Barang</label>
                                    <input list="item-list" id="out-item-id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ketik untuk mencari SKU...">
                                    <datalist id="item-list">
                                        ${inventory
                                          .map(
                                            (item) =>
                                              `<option value="${item.id}">${item.name}</option>`
                                          )
                                          .join("")}
                                    </datalist>
                                </div>
                                <div>
                                    <label for="out-quantity" class="block text-sm font-medium text-gray-700">Jumlah Keluar</label>
                                    <input type="number" id="out-quantity" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" min="1">
                                </div>
                                <div>
                                    <label for="out-reference" class="block text-sm font-medium text-gray-700">No. Referensi Penjualan</label>
                                    <input type="text" id="out-reference" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: SO-ELEC124">
                                </div>
                            </div>
                            <div class="mt-8 text-right">
                                <button type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Proses
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
    // Add event listener for the new form
    document
      .getElementById("outbound-form")
      .addEventListener("submit", handleOutboundSubmit);
  }

  function renderReport() {
    appContent.innerHTML = `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-3xl font-bold">Laporan Pergerakan Barang</h2>
                        <button id="download-excel-btn" class="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Laporan (Excel)
                        </button>
                    </div>

                    <!-- Filter Section -->
                    <div class="bg-white p-4 rounded-lg shadow mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label for="filter-start-date" class="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                                <input type="date" id="filter-start-date" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            <div>
                                <label for="filter-end-date" class="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                                <input type="date" id="filter-end-date" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            <div>
                                <label for="filter-type" class="block text-sm font-medium text-gray-700">Tipe</label>
                                <select id="filter-type" class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Semua</option>
                                    <option value="in">Masuk</option>
                                    <option value="out">Keluar</option>
                                </select>
                            </div>
                            <div class="col-span-1 md:col-span-2">
                                <label for="filter-search" class="block text-sm font-medium text-gray-700">Cari SKU / Nama Barang</label>
                                <input type="text" id="filter-search" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Masukkan SKU atau nama...">
                            </div>
                        </div>
                    </div>

                    <div id="report-table-container" class="bg-white p-6 rounded-lg shadow">
                         <!-- Tabel akan dirender di sini oleh JavaScript -->
                    </div>
                </div>
            `;

    // Initial render
    applyReportFilters();

    // Add event listeners for filters
    document
      .getElementById("filter-start-date")
      .addEventListener("change", applyReportFilters);
    document
      .getElementById("filter-end-date")
      .addEventListener("change", applyReportFilters);
    document
      .getElementById("filter-type")
      .addEventListener("change", applyReportFilters);
    document
      .getElementById("filter-search")
      .addEventListener("input", applyReportFilters);
    document
      .getElementById("download-excel-btn")
      .addEventListener("click", downloadReportAsExcel);
  }

  // Fungsi baru untuk menerapkan filter dan me-render ulang tabel
  function applyReportFilters() {
    const startDate = document.getElementById("filter-start-date").value;
    const endDate = document.getElementById("filter-end-date").value;
    const type = document.getElementById("filter-type").value;
    const searchTerm = document
      .getElementById("filter-search")
      .value.toLowerCase();

    let filteredLogs = transactionLog.filter((log) => {
      const logDate = new Date(log.date);

      // Filter tanggal
      if (startDate && new Date(startDate) > logDate) return false;
      if (endDate && new Date(endDate).setHours(23, 59, 59, 999) < logDate)
        return false;

      // Filter tipe
      if (type && log.type !== type) return false;

      // Filter search term (SKU atau Nama Barang)
      if (searchTerm) {
        const item = inventory.find((i) => i.id === log.itemId);
        const itemName = item ? item.name.toLowerCase() : "";
        const itemId = log.itemId.toLowerCase();
        if (!itemName.includes(searchTerm) && !itemId.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });

    renderReportTable(filteredLogs);
  }

  // Fungsi baru khusus untuk render tabel laporan
  function renderReportTable(logs) {
    const container = document.getElementById("report-table-container");
    if (!container) return;

    let tableHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-left" id="report-table">
                        <thead>
                            <tr class="border-b">
                                <th class="py-3 px-4">Waktu Transaksi</th>
                                <th class="py-3 px-4">Tipe</th>
                                <th class="py-3 px-4">SKU</th>
                                <th class="py-3 px-4">Nama Barang</th>
                                <th class="py-3 px-4">Jumlah</th>
                                <th class="py-3 px-4">Oleh</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                              logs.length > 0
                                ? logs
                                    .map(
                                      (log) => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="py-2 px-4 text-sm text-gray-600">${new Date(
                                      log.date
                                    ).toLocaleString("id-ID")}</td>
                                    <td class="py-2 px-4">
                                        <span class="px-2 py-1 text-xs rounded-full ${
                                          log.type === "in"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }">
                                            ${
                                              log.type === "in"
                                                ? "MASUK"
                                                : "KELUAR"
                                            }
                                        </span>
                                    </td>
                                    <td class="py-2 px-4 font-mono text-sm">${
                                      log.itemId
                                    }</td>
                                    <td class="py-2 px-4 font-medium">${
                                      inventory.find((i) => i.id === log.itemId)
                                        ?.name || "N/A"
                                    }</td>
                                    <td class="py-2 px-4 font-bold">${
                                      log.quantity
                                    }</td>
                                    <td class="py-2 px-4 text-sm">${
                                      log.user
                                    }</td>
                                </tr>
                            `
                                    )
                                    .join("")
                                : `
                                <tr>
                                    <td colspan="6" class="text-center py-8 text-gray-500">Tidak ada data yang cocok dengan filter.</td>
                                </tr>
                            `
                            }
                        </tbody>
                    </table>
                </div>
            `;
    container.innerHTML = tableHTML;
  }

  // Fungsi baru untuk download Excel
  function downloadReportAsExcel() {
    const table = document.getElementById("report-table");
    if (!table) {
      showNotification("Tidak ada data untuk diunduh.");
      return;
    }

    // Mengonversi tabel HTML menjadi workbook SheetJS
    const wb = XLSX.utils.table_to_book(table, { sheet: "Laporan Pergerakan" });

    // Membuat nama file dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `laporan_gudang_${timestamp}.xlsx`;

    // Men-trigger download file Excel
    XLSX.writeFile(wb, fileName);
  }

  // === EVENT HANDLERS ===

  function handleInboundSubmit(e) {
    e.preventDefault();
    const itemId = document.getElementById("in-item-id").value;
    const itemName = document.getElementById("in-item-name").value;
    const quantity = parseInt(document.getElementById("in-quantity").value);
    const minStock = parseInt(document.getElementById("in-min-stock").value);
    const supplier = document.getElementById("in-supplier").value;

    if (!itemId && !itemName) {
      showNotification("Error: SKU atau Nama Barang harus diisi.");
      return;
    }

    const finalItemId = itemId
      ? itemId
      : `SKU${(inventory.length + 1).toString().padStart(3, "0")}`;

    addStock(finalItemId, itemName, quantity, minStock || 0, supplier || "N/A");
    showNotification(
      `Sukses: Stok untuk ${itemName || finalItemId} berhasil ditambahkan.`
    );
    e.target.reset(); // clear form

    // Pindah ke halaman manajemen stok setelah berhasil
    setActiveNav("stock");
    renderStockManagement();
  }

  function handleOutboundSubmit(e) {
    e.preventDefault();
    const itemId = document.getElementById("out-item-id").value;
    const quantity = parseInt(document.getElementById("out-quantity").value);
    const reference = document.getElementById("out-reference").value;

    const success = removeStock(itemId, quantity, reference);
    if (success) {
      showNotification(
        `Sukses: Barang ${itemId} sebanyak ${quantity} unit telah diproses keluar.`
      );
      e.target.reset();
      // Pindah ke halaman manajemen stok setelah berhasil
      setActiveNav("stock");
      renderStockManagement();
    }
  }

  function setActiveNav(activeId) {
    Object.values(navLinks).forEach((link) => {
      link.classList.remove("bg-gray-200");
    });
    navLinks[activeId].classList.add("bg-gray-200");
  }

  // Navigasi
  navLinks.dashboard.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveNav("dashboard");
    renderDashboard();
  });
  navLinks.stock.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveNav("stock");
    renderStockManagement();
  });
  navLinks.inbound.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveNav("inbound");
    renderInboundForm();
  });
  navLinks.outbound.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveNav("outbound");
    renderOutboundForm();
  });
  navLinks.report.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveNav("report");
    renderReport();
  });

  // Modal
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // === INITIALIZATION ===
  function updateUI() {
    // Fungsi ini akan me-render ulang halaman yang sedang aktif
    const activeLink = document.querySelector("nav a.bg-gray-200");
    if (activeLink) {
      activeLink.click();
    } else {
      renderDashboard(); // default
    }
  }

  // Tampilkan dashboard saat pertama kali load
  renderDashboard();
  // Cek stok rendah saat pertama kali load
  checkForLowStock();
});
