function toggleSidebar() {
  document.getElementById('sidebarUtama').classList.toggle('buka');
  document.getElementById('overlaySidebar').classList.toggle('buka');
}

var JUDUL_HALAMAN = {
  sppw: '(SPPW) Surat Permohonan Perpanjangan Waktu',
  baps: 'BAPS (Berita Acara Pekerjaan Selesai)',
  qc: 'Form QC Instalasi FOC dan FOT',
  history: 'History Dokumen'
};
function bukaHalaman(id, tombol) {
  document.querySelectorAll('.halaman-utama').forEach(function (el) {
    el.classList.remove('aktif');
  });
  document.querySelectorAll('.nav-item').forEach(function (el) {
    el.classList.remove('aktif');
  });
  document.getElementById(id).classList.add('aktif');
  tombol.classList.add('aktif');
  document.getElementById('isiHalaman').classList.toggle('mode-layout', id === 'sppw' || id === 'baps' || id === 'qc');
  setTimeout(hitungSkala, 0);
  if (id === 'history') renderHistory();
  document.getElementById('bcHalaman').textContent = JUDUL_HALAMAN[id];
  document.getElementById('judulHalaman').textContent = JUDUL_HALAMAN[id];
  document.getElementById('sidebarUtama').classList.remove('buka');
  document.getElementById('overlaySidebar').classList.remove('buka');
}

var BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];
function fmtTgl(v) {
  if (!v) return '';
  var p = v.split('-');
  return parseInt(p[2], 10) + ' ' + BULAN[parseInt(p[1], 10) - 1] + ' ' + p[0];
}

var FORM_IDS = [
  'noSurat',
  'tglSurat',
  'kota',
  'tglSuratMitra',
  'linkDari',
  'linkKe',
  'noPa',
  'tglPerpanjangan',
  'jabatanManager',
  'namaManager',
  'pilihMitra'
];
var mitraDb = [];

//--- SPPW ---
function muatMitra() {
  try {
    mitraDb = JSON.parse(localStorage.getItem('sppw_mitra') || '[]');
  } catch (e) {
    mitraDb = [];
  }
  if (localStorage.getItem('mitra_v2')) {
    mitraDb = mitraDb
      .filter(function (m) {
        return !(m.nama && m.nama.toUpperCase() === 'PT TUNAS ZETA UTAMA' && !m.alamat);
      })
      .map(function (m) {
        return { nama: m.nama, alamat: m.alamat || '' };
      });
    localStorage.setItem('sppw_mitra', JSON.stringify(mitraDb));
    localStorage.removeItem('mitra_v2');
  }
  if (!mitraDb.length) {
    mitraDb = [{ nama: 'PT Contoh Mitra Jaya', alamat: 'Jl. Contoh Raya No. 10, Bandung' }];
  }
  renderPilihanMitra();
  renderDaftarMitra();
}
function simpanMitra() {
  localStorage.setItem('sppw_mitra', JSON.stringify(mitraDb));
}

function renderPilihanMitra() {
  var sel = document.getElementById('pilihMitra');
  var nilaiSebelumnya = sel.value;
  sel.innerHTML =
    '<option value="">-- Pilih Mitra --</option>' +
    mitraDb
      .map(function (m, i) {
        return '<option value="' + i + '">' + m.nama.replace(/</g, '&lt;') + '</option>';
      })
      .join('');
  sel.value = nilaiSebelumnya;
}
function renderDaftarMitra() {
  var wrap = document.getElementById('daftarMitra');
  wrap.innerHTML =
    mitraDb
      .map(function (m, i) {
        return (
          '<div class="item"><div><div class="nama">' +
          m.nama.replace(/</g, '&lt;') +
          '</div><div class="alamat">' +
          m.alamat.replace(/</g, '&lt;') +
          '</div></div><button onclick="hapusMitra(' +
          i +
          ')">Hapus</button></div>'
        );
      })
      .join('') || '<div class="alamat">Belum ada mitra tersimpan.</div>';
}
function tambahMitra() {
  var nama = document.getElementById('mitraBaruNama').value.trim();
  var alamat = document.getElementById('mitraBaruAlamat').value.trim();
  if (!nama) {
    infoPesan('Nama mitra belum diisi.');
    return;
  }
  mitraDb.push({ nama: nama, alamat: alamat });
  simpanMitra();
  renderPilihanMitra();
  renderDaftarMitra();
  document.getElementById('mitraBaruNama').value = '';
  document.getElementById('mitraBaruAlamat').value = '';
}
function hapusMitra(i) {
  tanyaYa('Hapus mitra "' + mitraDb[i].nama + '" dari daftar?', function () {
    hapusMitraLangsung(i);
  });
}
function hapusMitraLangsung(i) {
  mitraDb.splice(i, 1);
  simpanMitra();
  renderPilihanMitra();
  renderDaftarMitra();
  perbaruiPreview();
}
function toggleKelolaMitra() {
  document.getElementById('panelMitra').classList.toggle('buka');
}
function pilihMitraBerubah() {
  simpanIsianForm();
  perbaruiPreview();
}

function isiAtauKosong(id, teks) {
  var el = document.getElementById(id);
  if (!el) return;
  if (teks) {
    el.textContent = teks;
    el.classList.remove('kosong');
  } else {
    el.textContent = id.indexOf('Link') >= 0 ? '______' : '__________';
    el.classList.add('kosong');
  }
}

function perbaruiPreview() {
  var idxMitra = document.getElementById('pilihMitra').value;
  var mitra = idxMitra !== '' ? mitraDb[idxMitra] : null;

  isiAtauKosong('pNoSurat', document.getElementById('noSurat').value);
  document.getElementById('pKota').textContent = document.getElementById('kota').value || 'Bandung';
  isiAtauKosong('pTglSurat', fmtTgl(document.getElementById('tglSurat').value));

  isiAtauKosong('pNamaMitraTujuan', mitra ? mitra.nama : '');
  isiAtauKosong('pAlamatMitraTujuan', mitra ? mitra.alamat : '');
  isiAtauKosong('pNamaMitra', mitra ? mitra.nama : '');

  isiAtauKosong('pTglSuratMitra', fmtTgl(document.getElementById('tglSuratMitra').value));
  isiAtauKosong('pLinkDari', document.getElementById('linkDari').value);
  isiAtauKosong('pLinkKe', document.getElementById('linkKe').value);
  isiAtauKosong('pNoPa', document.getElementById('noPa').value);
  isiAtauKosong('pTglPerpanjangan', fmtTgl(document.getElementById('tglPerpanjangan').value));

  document.getElementById('pJabatan').textContent = document.getElementById('jabatanManager').value;
  document.getElementById('pNamaManager').textContent = document.getElementById('namaManager').value;
  perbaruiTombolKosong();
}

function simpanIsianForm() {
  var isian = {};
  FORM_IDS.forEach(function (id) {
    var e = document.getElementById(id);
    if (e) isian[id] = e.value;
  });
  localStorage.setItem('sppw_form', JSON.stringify(isian));
}
function muatIsianForm() {
  try {
    var isian = JSON.parse(localStorage.getItem('sppw_form') || '{}');
    FORM_IDS.forEach(function (id) {
      var e = document.getElementById(id);
      if (e && isian[id] !== undefined) e.value = isian[id];
    });
  } catch (e) {}
}

function kosongkan() {
  tanyaYa('Kosongkan semua isian surat? Daftar mitra tersimpan tidak akan terhapus.', kosongkanLangsung);
}
function kosongkanLangsung() {
  sheetReset('sppw');
  FORM_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = defSppw(id);
  });
  simpanIsianForm();
  perbaruiPreview();
}

document.querySelectorAll('.form-wrap input, .form-wrap textarea').forEach(function (el) {
  ['input', 'change'].forEach(function (ev) {
    el.addEventListener(ev, function () {
      simpanIsianForm();
      perbaruiPreview();
    });
  });
});

// ----- DATA MITRA BAPS (terpisah dari mitra SPPW) -----
var bapsMitraDb = [];
var editBapsIdx = null;
function escB(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}
function simpanBapsMitra() {
  localStorage.setItem('baps_mitra', JSON.stringify(bapsMitraDb));
}
function muatBapsMitra() {
  var raw = null;
  try {
    raw = JSON.parse(localStorage.getItem('baps_mitra'));
  } catch (e) {}
  if (!Array.isArray(raw)) {
    raw = [
      {
        nama: 'PT TUNAS ZETA UTAMA',
        perjanjian: '09024245/PJ/01/PST/2022',
        amd1: '1709.Amd/HKM.02.01/IC010109/2024',
        amd2: '1473.Amd/HKM.02.01/IC010004/2025',
        pejNama: 'Mohammad Annief',
        pejJabatan: 'Direktur',
        pejAlamat:
          'Jl. Graha DLA Lantai 2 Suite 06, Jl. Otto Iskandardinata No. 392, Kel. Nyengseret, Kec. Astana Anyar, Kota Bandung 40242'
      }
    ];
  }
  bapsMitraDb = raw.map(function (m) {
    var r = {
      nama: m.nama || '',
      perjanjian: m.perjanjian || '',
      amd1: m.amd1 || '',
      amd2: m.amd2 || '',
      pejNama: m.pejNama || '',
      pejJabatan: m.pejJabatan || '',
      pejAlamat: m.pejAlamat || ''
    };
    if (r.nama.toUpperCase() === 'PT TUNAS ZETA UTAMA' && !r.pejNama && !r.pejJabatan && !r.pejAlamat) {
      r.pejNama = 'Mohammad Annief';
      r.pejJabatan = 'Direktur';
      r.pejAlamat =
        'Jl. Graha DLA Lantai 2 Suite 06, Jl. Otto Iskandardinata No. 392, Kel. Nyengseret, Kec. Astana Anyar, Kota Bandung 40242';
    }
    return r;
  });
  simpanBapsMitra();
  renderBapsMitra();
}
function renderBapsMitra() {
  var sel = document.getElementById('bapsPelaksana');
  var v = sel.value;
  sel.innerHTML =
    '<option value="">-- Pilih Pelaksana Pekerjaan --</option>' +
    bapsMitraDb
      .map(function (m) {
        return '<option value="' + escB(m.nama) + '">' + escB(m.nama) + '</option>';
      })
      .join('');
  sel.value = v;
  document.getElementById('bapsDaftarMitra').innerHTML =
    bapsMitraDb
      .map(function (m, i) {
        var info = [];
        if (m.perjanjian) info.push('Perjanjian: ' + escB(m.perjanjian));
        if (m.amd1) info.push('Amd I: ' + escB(m.amd1));
        if (m.amd2) info.push('Amd II: ' + escB(m.amd2));
        if (m.pejNama) info.push('TTD: ' + escB(m.pejNama) + (m.pejJabatan ? ' (' + escB(m.pejJabatan) + ')' : ''));
        return (
          '<div class="item"><div><div class="nama">' +
          escB(m.nama) +
          '</div>' +
          '<div class="info">' +
          (info.length ? info.join(' &middot; ') : 'Data perjanjian belum diisi') +
          '</div></div>' +
          '<div class="aksi-item"><button class="edit" type="button" onclick="editMitraBaps(' +
          i +
          ')">Edit</button>' +
          '<button type="button" onclick="hapusMitraBaps(' +
          i +
          ')">Hapus</button></div></div>'
        );
      })
      .join('') || '<div class="alamat">Belum ada mitra tersimpan.</div>';
}
function resetFormMitraBaps() {
  editBapsIdx = null;
  [
    'bapsMitraNama',
    'bapsMitraPerjanjian',
    'bapsMitraAmd1',
    'bapsMitraAmd2',
    'bapsMitraPejNama',
    'bapsMitraPejJabatan',
    'bapsMitraPejAlamat'
  ].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('bapsBtnSimpanMitra').textContent = 'Simpan';
  document.getElementById('bapsBtnBatalMitra').style.display = 'none';
}
function tambahMitraBaps() {
  var d = {
    nama: document.getElementById('bapsMitraNama').value.trim(),
    perjanjian: document.getElementById('bapsMitraPerjanjian').value.trim(),
    amd1: document.getElementById('bapsMitraAmd1').value.trim(),
    amd2: document.getElementById('bapsMitraAmd2').value.trim(),
    pejNama: document.getElementById('bapsMitraPejNama').value.trim(),
    pejJabatan: document.getElementById('bapsMitraPejJabatan').value.trim(),
    pejAlamat: document.getElementById('bapsMitraPejAlamat').value.trim()
  };
  if (!d.nama) {
    infoPesan('Nama mitra belum diisi.');
    return;
  }
  var kembar = bapsMitraDb.some(function (m, i) {
    return i !== editBapsIdx && m.nama.toLowerCase() === d.nama.toLowerCase();
  });
  if (kembar) {
    infoPesan('Mitra dengan nama itu sudah ada. Gunakan tombol Edit untuk mengubah datanya.');
    return;
  }
  var sel = document.getElementById('bapsPelaksana');
  var terpilihDiedit = false;
  if (editBapsIdx !== null) {
    terpilihDiedit = sel.value !== '' && sel.value === bapsMitraDb[editBapsIdx].nama;
    bapsMitraDb[editBapsIdx] = d;
  } else {
    bapsMitraDb.push(d);
  }
  simpanBapsMitra();
  renderBapsMitra();
  resetFormMitraBaps();
  if (terpilihDiedit) sel.value = d.nama;
  isiDariPelaksana();
}
function editMitraBaps(i) {
  var m = bapsMitraDb[i];
  editBapsIdx = i;
  document.getElementById('bapsMitraNama').value = m.nama;
  document.getElementById('bapsMitraPerjanjian').value = m.perjanjian;
  document.getElementById('bapsMitraAmd1').value = m.amd1;
  document.getElementById('bapsMitraAmd2').value = m.amd2;
  document.getElementById('bapsMitraPejNama').value = m.pejNama;
  document.getElementById('bapsMitraPejJabatan').value = m.pejJabatan;
  document.getElementById('bapsMitraPejAlamat').value = m.pejAlamat;
  document.getElementById('bapsBtnSimpanMitra').textContent = 'Update';
  document.getElementById('bapsBtnBatalMitra').style.display = '';
  document.getElementById('bapsPanelMitra').classList.add('buka');
  document.getElementById('bapsMitraNama').focus();
}
function hapusMitraBaps(i) {
  tanyaYa('Hapus mitra "' + bapsMitraDb[i].nama + '" dari daftar?', function () {
    hapusMitraBapsLangsung(i);
  });
}
function hapusMitraBapsLangsung(i) {
  bapsMitraDb.splice(i, 1);
  simpanBapsMitra();
  resetFormMitraBaps();
  renderBapsMitra();
  isiDariPelaksana();
}
function toggleKelolaMitraBaps() {
  document.getElementById('bapsPanelMitra').classList.toggle('buka');
}
// pilih Pelaksana Pekerjaan -> No. Perjanjian, Amd I, Amd II langsung terisi (tanpa ditampilkan di form)
function isiDariPelaksana() {
  var nama = document.getElementById('bapsPelaksana').value;
  var m = bapsMitraDb.filter(function (x) {
    return x.nama === nama;
  })[0];
  document.getElementById('bapsPerjanjian').value = m ? m.perjanjian : '';
  document.getElementById('bapsAmd1').value = m ? m.amd1 : '';
  document.getElementById('bapsAmd2').value = m ? m.amd2 : '';
  document.getElementById('bapsPejNama').value = m ? m.pejNama : '';
  document.getElementById('bapsPejJabatan').value = m ? m.pejJabatan : '';
  document.getElementById('bapsPejAlamat').value = m ? m.pejAlamat : '';
  perbaruiBaps();
}

// ----- BAPS -----
function hariIni() {
  var d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
var BAPS_DEF = {
  bapsTglBaps: hariIni(),
  bapsTglPerp: '',
  bapsNoBaps: '',
  bapsHariKerja: '',
  bapsSanksiKerja: '',
  bapsHariDok: '',
  bapsSanksiDok: '',
  bapsPekerjaan: '',
  bapsPoSap: '',
  bapsNoSo: '',
  bapsPerjanjian: '',
  bapsAmd1: '',
  bapsAmd2: '',
  bapsPelaksana: '',
  bapsTgl1: '',
  bapsTgl2: '',
  bapsTgl3: '',
  bapsTgl4: '',
  bapsPejNama: '',
  bapsPejJabatan: '',
  bapsPejAlamat: '',
  bapsPlnNama: 'Eka Saprihadi Harahap',
  bapsPlnJabatan: 'Manager Bidang Pembangunan dan Delivery Layanan SBU Regional Jawa Barat',
  bapsPlnAlamat: 'Jl.WR.Supratman No.58 Bandung'
};
var SPPW_DEF = {
  kota: 'Bandung',
  jabatanManager: 'MANAGER BIDANG PEMBANGUNAN DAN DELIVERY LAYANAN SBU REGIONAL JAWA BARAT',
  namaManager: 'Eka Saprihadi Harahap'
};
function defSppw(id) {
  return SPPW_DEF.hasOwnProperty(id) ? SPPW_DEF[id] : '';
}

var NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];
var NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
var SATUAN = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
function terbilang(n) {
  if (n < 12) return SATUAN[n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '');
  if (n < 200) return 'Seratus' + (n > 100 ? ' ' + terbilang(n - 100) : '');
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
  if (n < 2000) return 'Seribu' + (n > 1000 ? ' ' + terbilang(n - 1000) : '');
  return terbilang(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
}
function fmtTglPanjang(v) {
  // 2026-10-22 -> 22 Oktober 2026
  var p = v.split('-');
  return parseInt(p[2], 10) + ' ' + NAMA_BULAN[parseInt(p[1], 10) - 1] + ' ' + p[0];
}
var BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function fmtTglBaps(v) {
  // 2025-12-16 -> 16-Des-2025
  var p = v.split('-');
  return p[2] + '-' + BULAN_PENDEK[parseInt(p[1], 10) - 1] + '-' + p[0];
}
function parsePersen(t) {
  var n = parseFloat(String(t).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function fmtPersen(n) {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}
function kalimatTelat(on, objek, hari, pct) {
  if (!on) return '<s>Mengalami</s>/tidak mengalami keterlambatan ' + objek;
  var h = parseInt(hari, 10);
  var hs = h > 0 ? '<b>' + terbilang(h) + ' (' + h + ')</b>' : '<b>&hellip;</b>';
  var ps = String(pct).trim() ? fmtPersen(parsePersen(pct)) + '%' : '&hellip;%';
  return 'Mengalami/<s>tidak mengalami</s> keterlambatan ' + objek + ' selama ' + hs + ' hari Kalender = ' + ps;
}
function isiBaps(sel, teks, ph) {
  document.querySelectorAll(sel).forEach(function (el) {
    if (teks) {
      el.textContent = teks;
      el.classList.remove('kosong');
    } else {
      el.textContent = ph || '__________';
      el.classList.add('kosong');
    }
  });
}
function nilaiBaps(id) {
  return document.getElementById(id).value.trim();
}
function fmtTglPendek(v) {
  if (!v) return '';
  var p = v.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}
function perbaruiBaps() {
  [1, 2, 3, 4].forEach(function (n) {
    document.getElementById('pbTgl' + n).textContent =
      fmtTglPendek(document.getElementById('bapsTgl' + n).value) || '-';
  });
  isiBaps('#pbPekerjaan', nilaiBaps('bapsPekerjaan'));
  isiBaps('#pbPoSap', nilaiBaps('bapsPoSap'));
  isiBaps('#pbNoSo', nilaiBaps('bapsNoSo'));
  isiBaps('#pbPerjanjian', nilaiBaps('bapsPerjanjian'));
  isiBaps('#pbAmd1', nilaiBaps('bapsAmd1'));
  isiBaps('#pbAmd2', nilaiBaps('bapsAmd2'));
  // kalau mitra sudah dipilih, amandemen yang kosong tidak ditampilkan
  var adaPel = nilaiBaps('bapsPelaksana') !== '';
  document.getElementById('pbRowAmd1').hidden = adaPel && !nilaiBaps('bapsAmd1');
  document.getElementById('pbRowAmd2').hidden = adaPel && !nilaiBaps('bapsAmd2');
  isiBaps('.pb-pelaksana', nilaiBaps('bapsPelaksana'));
  document.getElementById('pbTglPerp').textContent = fmtTglPendek(document.getElementById('bapsTglPerp').value) || '-';
  // tanggal BAPS (hari ini / tanggal dibuat)
  var tb = nilaiBaps('bapsTglBaps'),
    tp = tb ? tb.split('-') : null;
  var dt = tp ? new Date(+tp[0], +tp[1] - 1, +tp[2]) : null;
  isiBaps('#pbHari', dt ? NAMA_HARI[dt.getDay()] : '', '\u2026');
  isiBaps('#pbTglBaps', tp ? terbilang(parseInt(tp[2], 10)) : '', '\u2026');
  isiBaps('#pbBulanBaps', tp ? NAMA_BULAN[parseInt(tp[1], 10) - 1] : '', '\u2026');
  isiBaps('#pbTahunBaps', tp ? terbilang(+tp[0]) : '', '\u2026');
  isiBaps('#pbTglAngka', tp ? tp[2] + '/' + tp[1] + '/' + tp[0] : '', '\u2026/\u2026/\u2026');
  // "per tanggal ..." = Realisasi Penyelesaian (II)
  var t2 = nilaiBaps('bapsTgl2');
  isiBaps('#pbTglSelesai', t2 ? fmtTglBaps(t2) : '', '\u2026');
  // no BAPS di judul
  var nb = nilaiBaps('bapsNoBaps');
  document.getElementById('pbNoBaps').textContent = nb ? (nb.charAt(0) === '(' ? nb : '(' + nb + ')') : '(NO BAPS)';
  // keterlambatan, sanksi, dan persentase pembayaran
  var tk = document.getElementById('bapsTelatKerja').checked,
    td = document.getElementById('bapsTelatDok').checked;
  document.getElementById('bapsTelatKerjaDetail').hidden = !tk;
  document.getElementById('bapsTelatDokDetail').hidden = !td;
  document.getElementById('pbTelatKerja').innerHTML = kalimatTelat(
    tk,
    'pekerjaan',
    nilaiBaps('bapsHariKerja'),
    nilaiBaps('bapsSanksiKerja')
  );
  document.getElementById('pbTelatDok').innerHTML = kalimatTelat(
    td,
    'dokumentasi',
    nilaiBaps('bapsHariDok'),
    nilaiBaps('bapsSanksiDok')
  );
  document.getElementById('pbK3').innerHTML = document.getElementById('bapsTidakK3').checked
    ? '<s>Memenuhi</s>/tidak memenuhi aspek K3'
    : 'Memenuhi<s>/tidak memenuhi</s> aspek K3';
  var sanksi =
    (tk ? parsePersen(nilaiBaps('bapsSanksiKerja')) : 0) + (td ? parsePersen(nilaiBaps('bapsSanksiDok')) : 0);
  var bayar = Math.max(0, 100 - sanksi);
  document.getElementById('pbSanksi').textContent = fmtPersen(sanksi);
  document.getElementById('pbBayar').textContent = fmtPersen(bayar) + '%';
  document.getElementById('bapsRingkasSanksi').innerHTML =
    'Total sanksi ' + fmtPersen(sanksi) + '% &rarr; persentase pembayaran ' + fmtPersen(bayar) + '%';
  isiBaps('#pbPlnNama, #pbTtdPlnNama', nilaiBaps('bapsPlnNama'));
  isiBaps('#pbPlnJabatan, #pbTtdPlnJabatan', nilaiBaps('bapsPlnJabatan'));
  isiBaps('#pbPlnAlamat', nilaiBaps('bapsPlnAlamat'));
  isiBaps('#pbPejNama, #pbTtdPejNama', nilaiBaps('bapsPejNama'));
  isiBaps('#pbPejJabatan, #pbTtdPejJabatan', nilaiBaps('bapsPejJabatan'));
  isiBaps('#pbPejAlamat', nilaiBaps('bapsPejAlamat'));
  var d = {};
  Object.keys(BAPS_DEF).forEach(function (id) {
    d[id] = document.getElementById(id).value;
  });
  d.bapsTelatKerja = document.getElementById('bapsTelatKerja').checked ? '1' : '';
  d.bapsTelatDok = document.getElementById('bapsTelatDok').checked ? '1' : '';
  d.bapsTidakK3 = document.getElementById('bapsTidakK3').checked ? '1' : '';
  try {
    localStorage.setItem('baps_form', JSON.stringify(d));
  } catch (e) {}
  perbaruiTombolKosong();
}
function muatBaps() {
  try {
    var d = JSON.parse(localStorage.getItem('baps_form') || '{}');
    Object.keys(BAPS_DEF).forEach(function (id) {
      if (id !== 'bapsTglBaps' && d[id] !== undefined) document.getElementById(id).value = d[id];
    });
    document.getElementById('bapsTelatKerja').checked = d.bapsTelatKerja === '1';
    document.getElementById('bapsTelatDok').checked = d.bapsTelatDok === '1';
    document.getElementById('bapsTidakK3').checked = d.bapsTidakK3 === '1';
  } catch (e) {}
}
function kosongkanBaps() {
  tanyaYa('Kosongkan semua isian BAPS?', kosongkanBapsLangsung);
}
function kosongkanBapsLangsung() {
  sheetReset('baps');
  Object.keys(BAPS_DEF).forEach(function (id) {
    document.getElementById(id).value = BAPS_DEF[id];
  });
  document.getElementById('bapsTelatKerja').checked = false;
  document.getElementById('bapsTelatDok').checked = false;
  document.getElementById('bapsTidakK3').checked = false;
  perbaruiBaps();
}
// tombol Kosongkan hanya aktif kalau isian sudah berbeda dari kondisi awal
function perbaruiTombolKosong() {
  var sppw = FORM_IDS.some(function (id) {
    var e = document.getElementById(id);
    return e && e.value !== defSppw(id);
  });
  var baps =
    Object.keys(BAPS_DEF).some(function (id) {
      var e = document.getElementById(id);
      return e && e.value !== BAPS_DEF[id];
    }) ||
    document.getElementById('bapsTelatKerja').checked ||
    document.getElementById('bapsTelatDok').checked ||
    document.getElementById('bapsTidakK3').checked;
  var b1 = document.getElementById('btnKosongSppw'),
    b2 = document.getElementById('btnKosongBaps');
  if (b1) b1.disabled = !sppw;
  if (b2) b2.disabled = !baps;
  var sv = function (id, ada) {
    var e = document.getElementById(id);
    if (e && !e.getAttribute('data-sibuk')) e.disabled = !ada;
  };
  sv('btnSaveSppw', sppw);
  sv('btnSaveBaps', baps);
  var b3 = document.getElementById('btnKosongQc');
  var qcIsi =
    QC_IDS.some(function (id) {
      var e = document.getElementById(id);
      return e && e.value !== '';
    }) ||
    (typeof qcRows !== 'undefined' && qcRows.length > 0);
  if (b3) b3.disabled = !qcIsi;
  sv('btnSaveQc', qcIsi);
}
document.querySelectorAll('#baps .form-wrap input').forEach(function (el) {
  el.addEventListener('input', perbaruiBaps);
});
[
  ['bapsTelatKerja', 'bapsHariKerja', 'bapsSanksiKerja'],
  ['bapsTelatDok', 'bapsHariDok', 'bapsSanksiDok']
].forEach(function (g) {
  document.getElementById(g[0]).addEventListener('change', function () {
    if (!this.checked) {
      document.getElementById(g[1]).value = '';
      document.getElementById(g[2]).value = '';
    }
    perbaruiBaps();
  });
});

// ----- QC -----
var QC_IDS = [
  'qcTglQc',
  'qcNoPr',
  'qcNamaPekerjaan',
  'qcRekanan',
  'qcPop',
  'qcPelanggan',
  'qcAlamat',
  'qcPtl',
  'qcTglTest'
];
function perbaruiQc() {
  var d = {};
  QC_IDS.forEach(function (id) {
    var el = document.getElementById(id),
      v = el.value.trim();
    d[id] = el.value;
    document.getElementById('pv_' + id).textContent = el.type === 'date' && v ? fmtTglPanjang(v) : v;
  });
  try {
    localStorage.setItem('qc_form', JSON.stringify(d));
    localStorage.setItem('qc_rows', JSON.stringify(qcRows));
  } catch (e) {}
  perbaruiVolumeQc();
  perbaruiTombolKosong();
}
function muatQc() {
  try {
    var d = JSON.parse(localStorage.getItem('qc_form') || '{}');
    QC_IDS.forEach(function (id) {
      if (d[id] !== undefined) document.getElementById(id).value = d[id];
    });
  } catch (e) {}
}
function kosongkanQc() {
  tanyaYa('Kosongkan semua isian QC?', kosongkanQcLangsung);
}
function kosongkanQcLangsung() {
  QC_IDS.forEach(function (id) {
    document.getElementById(id).value = '';
  });
  qcRows = [];
  renderDaftarQc();
  resetEntryQc();
  perbaruiQc();
}
document.querySelectorAll('#qc .form-wrap input').forEach(function (el) {
  el.addEventListener('input', perbaruiQc);
});

var QC_ITEMS = [
  [1, 'Survey jalur kabel max 3 hari', '', 'LOT', 1, 310.2],
  [2, 'Penarikan FOC ADSS Short Span', '', 'M', 1, 326.0],
  [3, 'Penarikan FOC 8000 - 16000m', '', 'M', 1, 341.0],
  [4, 'Penarikan FOC lebih 16000 m', '', 'M', 1, 357.4],
  [5, 'Penarikan FOC under 800 m', '', 'LOT', 1, 373.9],
  [6, 'Galian Penarikan Jalur Tanah Taman', '', 'M', 1, 388.9],
  [7, 'Galian Penarikan Jalur Rojok Alur', '', 'M', 1, 405.3],
  [8, 'Penarikan gorong2 FOC ADSS Short Span', '', 'M', 1, 428.0],
  [9, 'Handhole 40x40x40 cm (Permanen)', '', 'LOT', 1, 449.2],
  [10, 'Manhole 80x80x100 cm (Permanen)', '', 'LOT', 1, 464.2],
  [11, 'Jointing per core (excl. labeling)', '', 'U', 1, 479.2],
  [12, 'Trace core (per JB/ODF/Splitter/FDT/FAT)', '', 'U', 1, 500.4],
  [13, 'OTDR per core (excl. jointing)', '', 'U', 1, 521.6],
  [14, 'Labeling Joint Box', '', 'U', 1, 536.6],
  [15, 'Labeling Kabel(1 pole 2 label,perapihan)', '', 'U', 1, 557.8],
  [16, 'Labeling In Site Plan (labeling all)', '', 'U', 1, 579.0],
  [17, 'Instalasi FOT MC (POP-CPE)', '', 'AU', 1, 594.0],
  [18, 'Instalasi Splitter GPON / ODP / box', '', 'AU', 1, 609.0],
  [19, 'Pembongkaran kabel ADSS Short Span', '', 'M', 1, 630.2],
  [20, 'Galian Penarikan Jalur Boring', '', 'M', 1, 651.4],
  [21, 'Penarikan FOC ADSS Long (dokumentasi)', '', 'M', 1, 672.6],
  [22, 'Jointing ADSS LS per core', '', 'AU', 1, 693.8],
  [23, 'Pembongkaran kabel ADSS LS(re-drumming)', '', 'M', 1, 715.0],
  [24, 'Instalasi CCTV ( survey,instalasi)', '', 'AU', 1, 736.2],
  [25, 'Instalasi Access Point', '', 'AU', 1, 751.2],
  [26, 'Instalasi VMS (Video Management System)', '', 'AU', 2, 63.1],
  [27, 'Instalasi Drop Wire(inc Jasa)', '', 'M', 2, 84.3],
  [28, 'Instalasi Rack dan Power Supply', '', 'AU', 2, 102.5],
  [29, 'Instalasi Rack (12u dan 20u)', '', 'AU', 2, 120.7],
  [30, 'Dismantle perangkat FOT di user/ di POP', '', 'AU', 2, 141.9],
  [31, 'Penarikan kabel UTP', '', 'M', 2, 163.1],
  [32, 'Transportasi ADSS SS atau LS jarak > 120K', '', 'LOT', 2, 184.3],
  [33, 'Subduct HDPE Crsing (min 3 kbl FA96/144)', 'M', 'M', 2, 211.7],
  [34, 'Rumah Kabel (Adaptor > 1000 /1442 core)', 'U', '', 2, 239.1],
  [35, 'Rumah Kabel (Adaptor 576 core I/O)', 'U', '', 2, 264.8],
  [36, 'Fitting Deadend, 6 - 48 core satu sisi', 'U', '', 2, 284.3],
  [37, 'Fitting Suspension, 6-48 core', 'U', '', 2, 299.3],
  [38, 'Fitting Deadend, 96 - 144 core satu sisi', 'U', '', 2, 320.5],
  [39, 'Fitting Suspension 96-144 core', 'U', '', 2, 341.7],
  [40, 'Bracket Deadend (Steel Band, Stop Link)', 'U', '', 2, 362.9],
  [41, 'Bracket Suspension(Stel Band, Stop Link)', 'U', '', 2, 390.3],
  [42, 'Splitter Distribusi 1:8 (Spliter only)', 'U', '', 2, 411.5],
  [43, 'Splitter Distribusi 1:16 (Spliter only)', 'U', '', 2, 426.5],
  [44, 'Patch Cord Single Mode 1 pasang 1.5m', 'U', '', 2, 447.7],
  [45, 'Patch Cord Single Mode 1 pasang 3m', 'U', '', 2, 468.9],
  [46, 'Patch Cord Single Mode 1 pasang 5m', 'U', '', 2, 483.9],
  [47, 'Patch Cord Single Mode 1 pasang 10m', 'U', '', 2, 505.1],
  [48, 'Patch Cord Single Mode 1 pasang 15m', 'U', '', 2, 532.5],
  [49, 'Patch Cord Multi Mode 1 pasang 1.5m', 'U', '', 2, 559.9],
  [50, 'Patch Cord Multi Mode 1 pasang 3m', 'U', '', 2, 581.1],
  [51, 'Patch Cord Multi Mode 1 pasang 5m', 'U', '', 2, 596.1],
  [52, 'Patch Cord Multi Mode 1 pasang 10m', 'U', '', 2, 617.3],
  [53, 'Patch Cord Multi Mode 1 pasang 15m', 'U', '', 2, 644.7],
  [54, 'Patch Cord Single Mode single core 1.5m', 'U', '', 2, 672.1],
  [55, 'Patch Cord Single Mode single core 3m', 'U', '', 2, 699.5],
  [56, 'Patch Cord Single Mode single core 5m', 'U', '', 2, 726.9],
  [57, 'Patch Cord Single Mode single core 10m', 'U', '', 2, 754.3],
  [58, 'Patch Cord Single Mode single core 15m', 'U', '', 3, 64.0],
  [59, 'Joint Box Closure 96 Core', 'U', '', 3, 85.2],
  [60, 'Joint Box Closure 144 Core', 'U', '', 3, 98.2],
  [61, 'Joint Box 24 Core', 'U', '', 3, 113.2],
  [62, 'Joint Box 48 Core', 'U', '', 3, 127.1],
  [63, 'Joint Box 96 Core', 'U', '', 3, 142.1],
  [64, 'Joint Box 144 Core', 'U', '', 3, 157.1],
  [65, 'ODF Rack Mounted 6 Core (SC upc Litech)', 'U', '', 3, 172.1],
  [66, 'ODF Wall Mounted 6 Core (SC upc Litech)', 'U', '', 3, 199.5],
  [67, 'ODF Rack Mounted 12 Core(SC upc Litech)', 'U', '', 3, 226.9],
  [68, 'ODF Rack Mounted 24 Core(SC upc Litech)', 'U', '', 3, 254.3],
  [69, 'ODF Rack Mounted 48 Core(SC upc Litech)', 'U', '', 3, 289.9],
  [70, 'ODF Rack Mounted 96 core (SC upc Litech)', 'U', '', 3, 317.3],
  [71, 'ODF Rack Mounted 144 core(SC upc Litech)', 'U', '', 3, 344.7],
  [72, 'Rack Wall Mounted 12 U', 'U', '', 3, 365.9],
  [73, 'Pipa Galvanis 3/4" (2 meter)', 'BTG', '', 3, 380.9],
  [74, 'Pipa Galvanis 1/4" (2 meter)', 'BTG', '', 3, 395.9],
  [75, 'Pipa PVC 3/4" (3 meter)', 'BTG', '', 3, 410.9],
  [76, 'Subduct HDPE outer Ø 50 mm,inner Ø 42mm', 'M', '', 3, 432.1],
  [77, 'Rumah Kabel (Adaptor 288 core)', 'U', '', 3, 453.3],
  [78, 'Rumah Kabel (Adaptor 144 core)', 'U', '', 3, 468.3],
  [79, 'Tiang Besi 7 m (incl Jasa)', 'BTG', '', 3, 483.3],
  [80, 'Tiang Besi 9 m (incl Jasa)', 'BTG', '', 3, 498.3],
  [81, 'Tiang besi 12m (incl jasa)', 'BTG', '', 3, 513.3],
  [82, 'Tiang Beton 9m - 200 daN (incl Jasa Psg)', 'BTG', '', 3, 534.5],
  [83, 'Tiang Beton 12 m 200 daN (incl Jasa Psg)', 'BTG', '', 3, 561.9],
  [84, 'Tiang Beton 14 m 350daN (incl Jasa Psg)', 'BTG', '', 3, 589.3],
  [85, 'I-Ring (4mm x 250mm)', 'U', '', 3, 608.5],
  [86, 'Kawat Selling 10mm', 'U', '', 3, 622.5],
  [87, 'Tension Fitting ADSS LS 900 satu sisi', 'U', '', 3, 637.5],
  [88, 'Tension Fitting ADSS LS 1200 satu sisi', 'U', '', 3, 652.5],
  [89, 'Suspension Fitting ADSS LS 900', 'U', '', 3, 667.5],
  [90, 'Suspension Fitting ADSS LS 1200', 'U', '', 3, 682.5],
  [91, 'Spiral Vibration Dumper span 600', 'U', '', 3, 697.5],
  [92, 'Tower Fit H+clamp (3 fm 6m,4siku,2brsng)', 'U', '', 3, 712.5],
  [93, 'Tower Fit I + clamp (1 fm 6 m, 2 clamp)', 'U', '', 3, 739.9],
  [94, 'Tension Fitting ADSS LS 400/600 1 sisi', 'U', '', 3, 767.3],
  [95, 'Corona coil span 600', 'U', '', 4, 54.9],
  [96, 'Suspension Fitting ADSS LS 400/600', 'U', '', 4, 69.9],
  [97, 'Gantry Box ADSS (stainless steel)24 core', 'U', '', 4, 84.9],
  [98, 'Gantry Box ADSS (stainless steel)48 core', 'U', '', 4, 112.3],
  [99, 'Gantry Box ADSS (stainless steel)96 core', 'U', '', 4, 139.7],
  [100, 'Kabel duct dinding (memuat 2 kabel)', 'M', '', 4, 167.1],
  [101, 'Box ODP 16c Out( SC/UPC SM Adptr 9pcs )', 'U', '', 4, 188.6],
  [102, 'Box ODP 16c Out( SC/UPC SM Adptr 17pcs )', 'U', '', 4, 216.0],
  [103, 'Corona coil span 900', 'U', '', 4, 243.4],
  [104, 'Spiral Vibration Dumper span 900', 'U', '', 4, 264.9]
];
var QC_BY_NO = {};
QC_ITEMS.forEach(function (r) {
  QC_BY_NO[r[0]] = { no: r[0], nama: r[1], c: r[2], g: r[3], page: r[4], y: r[5] };
});
var QC_COL = { A: 266.5, B: 315.3, E: 414.6, F: 463.5 }; // posisi tengah kolom (pt)
var qcRows = []; // { no, vol }
var qcSel = '',
  qcHasil = [],
  qcIdx = 0;
function escQ(x) {
  return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
function hintQc(no) {
  var it = QC_BY_NO[no];
  if (!it) return 'Belum ada pekerjaan dipilih.';
  var t = [];
  if (it.c) t.push('kolom A &amp; B (Material, ' + it.c + ')');
  if (it.g) t.push('kolom E &amp; F (Jasa, ' + it.g + ')');
  return 'Masuk ke ' + t.join(' dan ');
}
function qcCocok(teks) {
  var t = teks.trim().toLowerCase(),
    h;
  if (!t) h = QC_ITEMS.slice();
  else if (/^\d+$/.test(t)) {
    h = QC_ITEMS.filter(function (r) {
      return String(r[0]).indexOf(t) === 0;
    });
    h.sort(function (a, b) {
      return (String(a[0]) === t ? 0 : 1) - (String(b[0]) === t ? 0 : 1) || a[0] - b[0];
    });
  } else
    h = QC_ITEMS.filter(function (r) {
      return r[1].toLowerCase().indexOf(t) > -1;
    });
  return h;
}
function tampilDd() {
  var dd = document.getElementById('qcDd');
  qcHasil = qcCocok(document.getElementById('qcCari').value);
  if (qcIdx >= qcHasil.length) qcIdx = 0;
  if (!qcHasil.length) {
    dd.innerHTML = '<div class="qc-opt"><small style="margin:0">Tidak ada yang cocok</small></div>';
    dd.hidden = false;
    return;
  }
  dd.innerHTML = qcHasil
    .map(function (r, i) {
      return (
        '<div class="qc-opt' +
        (i === qcIdx ? ' sel' : '') +
        '" data-no="' +
        r[0] +
        '"><b>' +
        r[0] +
        '</b><span>' +
        escQ(r[1]) +
        '</span><small>' +
        escQ([r[2], r[3]].filter(Boolean).join('/')) +
        '</small></div>'
      );
    })
    .join('');
  dd.hidden = false;
  var sel = dd.querySelector('.sel');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}
function tutupDd() {
  document.getElementById('qcDd').hidden = true;
}
function pilihQc(no) {
  var it = QC_BY_NO[no];
  if (!it) return;
  qcSel = String(no);
  document.getElementById('qcCari').value = it.no + '. ' + it.nama;
  document.getElementById('qcHintCari').innerHTML = hintQc(qcSel);
  tutupDd();
  var v = document.getElementById('qcVol');
  v.focus();
  v.select();
}
function resetEntryQc() {
  qcSel = '';
  document.getElementById('qcCari').value = '';
  document.getElementById('qcVol').value = '';
  document.getElementById('qcHintCari').innerHTML = 'Belum ada pekerjaan dipilih.';
  tutupDd();
}
function tambahQc() {
  var cari = document.getElementById('qcCari'),
    vol = document.getElementById('qcVol');
  if (!qcSel) {
    cari.focus();
    tampilDd();
    return;
  }
  var v = vol.value.trim();
  if (!v) {
    vol.focus();
    return;
  }
  var ada = qcRows.filter(function (r) {
    return r.no === qcSel;
  })[0];
  if (ada) ada.vol = v;
  else qcRows.push({ no: qcSel, vol: v });
  resetEntryQc();
  renderDaftarQc();
  perbaruiQc();
  cari.focus();
}
function renderDaftarQc() {
  var box = document.getElementById('qcDaftar');
  if (!qcRows.length) {
    box.innerHTML = '';
    return;
  }
  box.innerHTML =
    '<p class="qc-hint" style="margin:2px 0 4px">Sudah ditambahkan (' +
    qcRows.length +
    ')</p>' +
    qcRows
      .slice()
      .reverse()
      .map(function (r) {
        var it = QC_BY_NO[r.no];
        return (
          '<div class="qc-item" data-no="' +
          r.no +
          '"><div class="qc-item-t"><b>' +
          r.no +
          '.</b> ' +
          escQ(it.nama) +
          '<small>' +
          hintQc(r.no) +
          '</small></div>' +
          '<input type="text" inputmode="decimal" class="qc-item-vol" value="' +
          escQ(r.vol) +
          '"><button type="button" class="qc-hapus" title="Hapus">&times;</button></div>'
        );
      })
      .join('');
}
function muatBarisQc() {
  var raw = [];
  try {
    raw = JSON.parse(localStorage.getItem('qc_rows') || '[]');
  } catch (e) {}
  qcRows = [];
  (Array.isArray(raw) ? raw : []).forEach(function (r) {
    var no = String(r.no || ''),
      vol = String(r.vol || r.awal || r.akhir || '');
    if (QC_BY_NO[no] && vol) qcRows.push({ no: no, vol: vol });
  });
  renderDaftarQc();
  var pg4 = document.querySelectorAll('#qc .kertas-qc')[3];
  if (pg4 && !document.getElementById('pv_qcPtlTtd')) {
    var t = document.createElement('div');
    t.className = 'qc-ttd';
    t.id = 'pv_qcPtlTtd';
    pg4.appendChild(t);
  }
}
(function () {
  var cari = document.getElementById('qcCari'),
    vol = document.getElementById('qcVol'),
    dd = document.getElementById('qcDd'),
    daftar = document.getElementById('qcDaftar');
  cari.addEventListener('focus', function () {
    document.getElementById('qcEntry').scrollIntoView({ block: 'start' });
    if (!qcSel) {
      qcIdx = 0;
      tampilDd();
    }
  });
  cari.addEventListener('input', function () {
    qcSel = '';
    qcIdx = 0;
    document.getElementById('qcHintCari').innerHTML = 'Belum ada pekerjaan dipilih.';
    var h = qcCocok(cari.value),
      t = cari.value.trim();
    if (/^\d+$/.test(t) && h.length === 1) {
      pilihQc(h[0][0]);
      return;
    } // nomor sudah pasti satu: langsung pilih
    tampilDd();
  });
  cari.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (dd.hidden) {
        tampilDd();
        return;
      }
      qcIdx = (qcIdx + (e.key === 'ArrowDown' ? 1 : -1) + qcHasil.length) % Math.max(qcHasil.length, 1);
      tampilDd();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!dd.hidden && qcHasil.length) pilihQc(qcHasil[qcIdx][0]);
      else if (qcSel) {
        vol.focus();
        vol.select();
      }
    } else if (e.key === 'Escape') tutupDd();
  });
  cari.addEventListener('blur', function () {
    setTimeout(tutupDd, 150);
  });
  dd.addEventListener('mousedown', function (e) {
    var o = e.target.closest('.qc-opt');
    if (!o || !o.getAttribute('data-no')) return;
    e.preventDefault();
    pilihQc(o.getAttribute('data-no'));
  });
  vol.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      tambahQc();
    }
  });
  document.getElementById('qcTambah').addEventListener('click', tambahQc);
  daftar.addEventListener('input', function (e) {
    if (!e.target.classList.contains('qc-item-vol')) return;
    var no = e.target.closest('.qc-item').getAttribute('data-no');
    qcRows.forEach(function (r) {
      if (r.no === no) r.vol = e.target.value;
    });
    perbaruiQc();
  });
  daftar.addEventListener('click', function (e) {
    if (!e.target.classList.contains('qc-hapus')) return;
    var no = e.target.closest('.qc-item').getAttribute('data-no');
    qcRows = qcRows.filter(function (r) {
      return r.no !== no;
    });
    renderDaftarQc();
    perbaruiQc();
  });
})();
function perbaruiVolumeQc() {
  document.querySelectorAll('#qc .qc-n').forEach(function (el) {
    el.remove();
  });
  var pages = document.querySelectorAll('#qc .kertas-qc');
  qcRows.forEach(function (r) {
    var it = QC_BY_NO[r.no],
      v = r.vol.trim(),
      pg = pages[it ? it.page - 1 : -1];
    if (!it || !v || !pg) return;
    var cols = [];
    if (it.c) cols.push('A', 'B'); // Vol Awal & Vol Akhir sama
    if (it.g) cols.push('E', 'F');
    cols.forEach(function (c) {
      var el = document.createElement('div');
      el.className = 'qc-n';
      el.style.left = QC_COL[c] - 23 + 'pt';
      el.style.top = it.y + 'pt';
      el.textContent = v;
      pg.appendChild(el);
    });
  });
  var ttd = document.getElementById('pv_qcPtlTtd');
  if (ttd) ttd.textContent = document.getElementById('qcPtl').value.trim();
}

// dialog di dalam halaman (confirm/alert bawaan browser bisa diblokir di beberapa tampilan)
function tanyaYa(pesan, ya, batal) {
  var ov = document.createElement('div');
  ov.className = 'dlg-ov';
  var kotak = document.createElement('div');
  kotak.className = 'dlg';
  var p = document.createElement('p');
  p.textContent = pesan;
  var tb = document.createElement('div');
  tb.className = 'dlg-btn';
  var bt = document.createElement('button');
  bt.type = 'button';
  bt.className = 'btn-baps abu';
  bt.textContent = 'Batal';
  var by = document.createElement('button');
  by.type = 'button';
  by.className = 'btn-baps';
  by.textContent = 'Ya';
  tb.appendChild(bt);
  tb.appendChild(by);
  kotak.appendChild(p);
  kotak.appendChild(tb);
  ov.appendChild(kotak);
  function tutup() {
    document.removeEventListener('keydown', tombol, true);
    if (ov.parentNode) ov.parentNode.removeChild(ov);
  }
  function tombol(e) {
    if (e.key === 'Escape') {
      tutup();
      if (batal) batal();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      tutup();
      ya();
    }
  }
  bt.addEventListener('click', function () {
    tutup();
    if (batal) batal();
  });
  by.addEventListener('click', function () {
    tutup();
    ya();
  });
  ov.addEventListener('mousedown', function (e) {
    if (e.target === ov) {
      tutup();
      if (batal) batal();
    }
  });
  document.addEventListener('keydown', tombol, true);
  document.body.appendChild(ov);
  by.focus();
}
function infoPesan(teks) {
  var t = document.createElement('div');
  t.className = 'toast-info';
  t.textContent = teks;
  document.body.appendChild(t);
  setTimeout(function () {
    if (t.parentNode) t.parentNode.removeChild(t);
  }, 3200);
}

// ----- Save sebagai PDF (A4, tanpa dialog print) -----
function namaFilePdf(awal, nilai) {
  var v = String(nilai || '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return awal + (v ? ' ' + v : '');
}
function simpanPdf(bagian, tombol) {
  if (!window.html2canvas || !window.jspdf) {
    infoPesan('Library PDF belum termuat. Coba muat ulang halaman.');
    return;
  }
  var val = function (id) {
    var e = document.getElementById(id);
    return e ? e.value : '';
  };
  var nama =
    bagian === 'sppw'
      ? namaFilePdf('SPPW', val('noPa'))
      : bagian === 'baps'
        ? namaFilePdf('BAPS', val('bapsNoSo'))
        : namaFilePdf('QC', val('qcNoPr'));
  var halaman = document.querySelectorAll('#' + bagian + ' .kertas');
  var teksAsli = tombol.innerHTML;
  tombol.setAttribute('data-sibuk', '1');
  tombol.disabled = true;
  tombol.innerHTML = '&#8987; Menyimpan...';
  var pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  var i = 0;
  function selesai() {
    tombol.removeAttribute('data-sibuk');
    tombol.innerHTML = teksAsli;
    perbaruiTombolKosong();
  }
  function berikut() {
    if (i >= halaman.length) {
      pdf.save(nama + '.pdf');
      catatHistory(bagian, 'Save');
      selesai();
      return;
    }
    var host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;height:297mm;background:#fff;';
    var k = halaman[i].cloneNode(true);
    k.style.transform = 'none';
    k.style.boxShadow = 'none';
    host.appendChild(k);
    document.body.appendChild(host);
    window
      .html2canvas(k, { scale: 2, backgroundColor: '#ffffff', logging: false })
      .then(function (c) {
        document.body.removeChild(host);
        if (i > 0) pdf.addPage();
        pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        i++;
        berikut();
      })
      .catch(function (err) {
        if (host.parentNode) host.parentNode.removeChild(host);
        infoPesan('Gagal menyimpan PDF: ' + err);
        selesai();
      });
  }
  berikut();
}

// ----- HISTORY -----
var HIST_KEY = 'history_dok',
  histFilter = 'semua';
var HIST_LABEL = { sppw: ['SPPW', 'PA'], baps: ['BAPS', 'SO'], qc: ['QC', 'PR'] };
function muatHistory() {
  var d = [];
  try {
    d = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
  } catch (e) {}
  return Array.isArray(d)
    ? d.filter(function (r) {
        return r && r.id && r.waktu && HIST_LABEL[String(r.jenis || '').toLowerCase()];
      })
    : [];
}
function simpanHistory(d) {
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(d));
  } catch (e) {
    infoPesan('History gagal disimpan: penyimpanan browser penuh.');
  }
}
function rapikanHistory(daftar) {
  return daftar.slice().sort(function (a, b) {
    return b.waktu - a.waktu;
  });
}
function ambilSnapshot(b) {
  var g = function (id) {
      var e = document.getElementById(id);
      return e ? e.value : '';
    },
    d = {};
  if (b === 'sppw') {
    FORM_IDS.forEach(function (id) {
      d[id] = g(id);
    });
    var sel = document.getElementById('pilihMitra');
    d._mitra = sel && sel.value !== '' && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : '';
  } else if (b === 'baps') {
    Object.keys(BAPS_DEF).forEach(function (id) {
      d[id] = g(id);
    });
    d.bapsTelatKerja = document.getElementById('bapsTelatKerja').checked ? '1' : '';
    d.bapsTelatDok = document.getElementById('bapsTelatDok').checked ? '1' : '';
    d.bapsTidakK3 = document.getElementById('bapsTidakK3').checked ? '1' : '';
  } else {
    QC_IDS.forEach(function (id) {
      d[id] = g(id);
    });
    d.rows = JSON.parse(JSON.stringify(qcRows));
  }
  return d;
}
function ringkasHistory(b) {
  var g = function (id) {
    var e = document.getElementById(id);
    return e ? e.value.trim() : '';
  };
  if (b === 'sppw') {
    var sel = document.getElementById('pilihMitra');
    var mitra = sel && sel.value !== '' && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : '';
    return {
      nomor: g('noPa'),
      ringkas: [mitra, g('noSurat') && 'No. surat ' + g('noSurat')].filter(Boolean).join(' \u00b7 ')
    };
  }
  if (b === 'baps')
    return {
      nomor: g('bapsNoSo'),
      ringkas: [g('bapsNoBaps') && 'No. BAPS ' + g('bapsNoBaps'), g('bapsPekerjaan'), g('bapsPelaksana')]
        .filter(Boolean)
        .join(' \u00b7 ')
    };
  return { nomor: g('qcNoPr'), ringkas: [g('qcNamaPekerjaan'), g('qcPelanggan')].filter(Boolean).join(' \u00b7 ') };
}
function catatHistory(b, aksi) {
  var info = ringkasHistory(b),
    jenis = HIST_LABEL[b][0];
  var e = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    jenis: jenis,
    nomor: info.nomor,
    ringkas: info.ringkas,
    waktu: Date.now(),
    aksi: aksi,
    data: ambilSnapshot(b)
  };
  var daftar = muatHistory();
  if (info.nomor) {
    // dokumen dengan nomor yang sama diperbarui, bukan dobel
    daftar = daftar.filter(function (r) {
      return !(r.jenis === jenis && String(r.nomor || '').toLowerCase() === info.nomor.toLowerCase());
    });
  }
  daftar.push(e);
  simpanHistory(rapikanHistory(daftar));
  renderHistory();
}
function bagianTerisi(b) {
  perbaruiTombolKosong();
  var btn = document.getElementById({ sppw: 'btnKosongSppw', baps: 'btnKosongBaps', qc: 'btnKosongQc' }[b]);
  return btn && !btn.disabled;
}
function cetak(b) {
  if (bagianTerisi(b)) catatHistory(b, 'Print');
  window.print();
}
function fmtWaktuHist(t) {
  var d = new Date(t),
    p = function (n) {
      return ('0' + n).slice(-2);
    };
  return (
    d.getDate() +
    ' ' +
    BULAN_PENDEK[d.getMonth()] +
    ' ' +
    d.getFullYear() +
    ', ' +
    p(d.getHours()) +
    ':' +
    p(d.getMinutes())
  );
}
function renderHistory() {
  var semua = rapikanHistory(muatHistory());
  var hitung = { semua: semua.length, SPPW: 0, BAPS: 0, QC: 0 };
  semua.forEach(function (r) {
    hitung[r.jenis]++;
  });
  document.getElementById('histChips').innerHTML = [
    ['semua', 'Semua'],
    ['SPPW', 'SPPW'],
    ['BAPS', 'BAPS'],
    ['QC', 'QC']
  ]
    .map(function (c) {
      return (
        '<button type="button" class="hist-chip' +
        (histFilter === c[0] ? ' aktif' : '') +
        '" data-f="' +
        c[0] +
        '">' +
        c[1] +
        ' (' +
        hitung[c[0]] +
        ')</button>'
      );
    })
    .join('');
  var tampil = semua.filter(function (r) {
    return histFilter === 'semua' || r.jenis === histFilter;
  });
  document.getElementById('histList').innerHTML = tampil.length
    ? tampil
        .map(function (r) {
          var lab = HIST_LABEL[r.jenis.toLowerCase()];
          return (
            '<div class="hist-item"><span class="hist-badge ' +
            r.jenis.toLowerCase() +
            '">' +
            r.jenis +
            '</span>' +
            '<div class="hist-t"><b>' +
            (r.nomor ? lab[1] + ' ' + escQ(r.nomor) : '(tanpa nomor ' + lab[1] + ')') +
            '</b>' +
            (r.ringkas ? ' \u2014 ' + escQ(r.ringkas) : '') +
            '<small>' +
            r.aksi +
            ' \u00b7 ' +
            fmtWaktuHist(r.waktu) +
            '</small></div>' +
            '<div class="hist-aksi"><button type="button" class="btn-baps" data-buka="' +
            r.id +
            '">Buka lagi</button><button type="button" class="btn-baps abu" data-hapus="' +
            r.id +
            '">Hapus</button></div></div>'
          );
        })
        .join('')
    : '<p class="hist-kosong">' +
      (semua.length
        ? 'Tidak ada history untuk filter ini.'
        : 'Belum ada history. Dokumen yang di-Save atau di-Print akan tercatat di sini.') +
      '</p>';
  document.getElementById('histHapusSemua').disabled = !semua.length;
}
function pulihkanHistory(id) {
  var r = muatHistory().filter(function (x) {
    return x.id === id;
  })[0];
  if (!r) return;
  var b = r.jenis.toLowerCase(),
    d = r.data || {},
    el = function (x) {
      return document.getElementById(x);
    };
  if (b === 'sppw') {
    FORM_IDS.forEach(function (k) {
      if (el(k) && d[k] !== undefined) el(k).value = d[k];
    });
    var sel = el('pilihMitra');
    if (d._mitra)
      for (var i = 0; i < sel.options.length; i++)
        if (sel.options[i].text === d._mitra) {
          sel.selectedIndex = i;
          break;
        }
    simpanIsianForm();
    perbaruiPreview();
  } else if (b === 'baps') {
    var pel = d.bapsPelaksana,
      selP = el('bapsPelaksana');
    if (
      pel &&
      !Array.prototype.some.call(selP.options, function (o) {
        return o.value === pel;
      })
    ) {
      var o = document.createElement('option');
      o.value = pel;
      o.textContent = pel;
      selP.appendChild(o);
    }
    Object.keys(BAPS_DEF).forEach(function (k) {
      if (d[k] !== undefined) el(k).value = d[k];
    });
    el('bapsTelatKerja').checked = d.bapsTelatKerja === '1';
    el('bapsTelatDok').checked = d.bapsTelatDok === '1';
    el('bapsTidakK3').checked = d.bapsTidakK3 === '1';
    perbaruiBaps();
  } else {
    QC_IDS.forEach(function (k) {
      if (d[k] !== undefined) el(k).value = d[k];
    });
    qcRows = (Array.isArray(d.rows) ? d.rows : []).filter(function (x) {
      return QC_BY_NO[x.no] && x.vol;
    });
    renderDaftarQc();
    perbaruiQc();
  }
  bukaHalaman(b, el({ sppw: 'navSppw', baps: 'navBaps', qc: 'navQc' }[b]));
  infoPesan('Data ' + r.jenis + (r.nomor ? ' ' + r.nomor : '') + ' dibuka kembali.');
}
function initHistory() {
  try {
    localStorage.removeItem('history_set'); // pengaturan lama (batas jumlah/hari) sudah tidak dipakai
  } catch (e) {}
  document.getElementById('histChips').addEventListener('click', function (e) {
    var f = e.target.getAttribute('data-f');
    if (f) {
      histFilter = f;
      renderHistory();
    }
  });
  document.getElementById('histList').addEventListener('click', function (e) {
    var bk = e.target.getAttribute('data-buka'),
      hp = e.target.getAttribute('data-hapus');
    if (bk) pulihkanHistory(bk);
    if (hp) {
      simpanHistory(
        muatHistory().filter(function (r) {
          return r.id !== hp;
        })
      );
      renderHistory();
    }
  });
  document.getElementById('histHapusSemua').addEventListener('click', function () {
    tanyaYa('Hapus semua history? Dokumen yang sudah di-Save tidak ikut terhapus.', function () {
      simpanHistory([]);
      renderHistory();
    });
  });
  renderHistory();
}

// ----- SPREADSHEET (Google Sheets "PENDING DOK MITRA AKTIVASI", dicari lewat kolom NO PA) -----
var SHEET_ID = '15AkBc2T8fgxijwfSczZZg0Kqqhl9j5wDunkpID35gKU',
  SHEET_GID = '0';
var sheetCache = {},
  sheetData = { sppw: [], baps: [] },
  sheetToken = { sppw: 0, baps: 0 },
  sheetSeq = 0;
var BLN_SHEET = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  mei: 5,
  may: 5,
  jun: 6,
  jul: 7,
  agu: 8,
  agt: 8,
  aug: 8,
  sep: 9,
  okt: 10,
  oct: 10,
  nov: 11,
  des: 12,
  dec: 12
};
function isoTgl(y, m, d) {
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return '';
  return y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2);
}
function tglSheet(sel) {
  // sel = {v, f} dari Google Sheets; hasilnya yyyy-mm-dd atau ''
  if (!sel || sel.v === null || sel.v === undefined) return '';
  var v = sel.v,
    m;
  if (typeof v === 'string' && (m = v.match(/^Date\((\d+),\s*(\d+),\s*(\d+)/))) return isoTgl(+m[1], +m[2] + 1, +m[3]);
  var t = String(sel.f != null ? sel.f : v);
  if ((m = t.match(/(\d{1,2})[-\s\/.]([A-Za-z]{3,})[-\s\/.](\d{4})/)) && BLN_SHEET[m[2].slice(0, 3).toLowerCase()])
    return isoTgl(+m[3], BLN_SHEET[m[2].slice(0, 3).toLowerCase()], +m[1]);
  if ((m = t.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/))) return isoTgl(+m[3], +m[2], +m[1]);
  return '';
}
function teksSheet(sel) {
  return (sel && sel.v !== null && sel.v !== undefined ? String(sel.v) : '').replace(/\s+/g, ' ').trim();
}
function poSheet(sel) {
  // beberapa nomor PO dalam satu sel -> dipisah koma
  if (!sel || sel.v === null || sel.v === undefined) return '';
  return String(sel.v)
    .split(/[\s,;]+/)
    .filter(function (x) {
      return x && x !== '0';
    })
    .join(', ');
}
function normNama(x) {
  return String(x || '')
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function normPa(x) {
  return String(x || '')
    .replace(/\s+/g, '')
    .toLowerCase();
}
function cariSheet(pa) {
  var kunci = normPa(pa);
  if (sheetCache[kunci]) return Promise.resolve(sheetCache[kunci]);
  return new Promise(function (resolve, reject) {
    var cb = '__gv' + ++sheetSeq + '_' + Date.now(),
      sc = document.createElement('script'),
      waktu;
    var q = "select C,D,E,I,K,L,M,N,O,R where lower(C) contains '" + kunci.replace(/['"\\]/g, '') + "'";
    function bersih() {
      clearTimeout(waktu);
      try {
        delete window[cb];
      } catch (e) {
        window[cb] = undefined;
      }
      if (sc.parentNode) sc.parentNode.removeChild(sc);
    }
    window[cb] = function (r) {
      bersih();
      if (!r || r.status !== 'ok' || !r.table) {
        reject(new Error('respon spreadsheet tidak valid'));
        return;
      }
      var hasil = (r.table.rows || [])
        .map(function (b) {
          var c = b.c || [];
          return {
            pa: teksSheet(c[0]),
            customer: teksSheet(c[1]),
            node: teksSheet(c[2]),
            mitra: teksSheet(c[3]),
            delivery: tglSheet(c[4]),
            target: tglSheet(c[5]),
            perp: tglSheet(c[6]),
            testcom: tglSheet(c[7]),
            submit: tglSheet(c[8]),
            po: poSheet(c[9])
          };
        })
        .filter(function (x) {
          return normPa(x.pa) === kunci;
        });
      sheetCache[kunci] = hasil;
      resolve(hasil);
    };
    sc.onerror = function () {
      bersih();
      reject(new Error('gagal memuat'));
    };
    waktu = setTimeout(function () {
      bersih();
      reject(new Error('timeout'));
    }, 15000);
    sc.src =
      'https://docs.google.com/spreadsheets/d/' +
      SHEET_ID +
      '/gviz/tq?gid=' +
      SHEET_GID +
      '&tqx=' +
      encodeURIComponent('out:json;responseHandler:' + cb) +
      '&tq=' +
      encodeURIComponent(q);
    document.head.appendChild(sc);
  });
}
function pilihSheetEl(b) {
  return document.getElementById(b === 'sppw' ? 'sheetPilihSppw' : 'sheetPilihBaps');
}
function statusSheet(b, teks, jenis) {
  var e = document.getElementById(b === 'sppw' ? 'sheetStatusSppw' : 'sheetStatusBaps');
  e.textContent = teks;
  e.className = 'sheet-status ' + (jenis || '');
}
function sheetReset(b) {
  sheetToken[b]++;
  statusSheet(b, '');
  var s = pilihSheetEl(b);
  s.hidden = true;
  s.innerHTML = '';
  sheetData[b] = [];
}
function terapkanSheet(b, r) {
  var el = function (x) {
    return document.getElementById(x);
  };
  if (b === 'sppw') {
    el('linkDari').value = r.customer;
    el('linkKe').value = r.node;
    simpanIsianForm();
    perbaruiPreview();
    return { teks: '\u2713 Terisi dari spreadsheet: Customer & Node.', jenis: 'ok' };
  }
  el('bapsTgl1').value = r.delivery;
  el('bapsTgl2').value = r.testcom;
  el('bapsTgl3').value = r.target;
  el('bapsTgl4').value = r.submit;
  el('bapsTglPerp').value = r.perp;
  el('bapsPoSap').value = r.po;
  var bagian = ['Tanggal I\u2013IV'],
    jenis = 'ok',
    tambahan = '';
  if (r.perp) bagian.push('Perpanjangan Waktu');
  if (r.po) bagian.push('No PO SAP');
  if (r.mitra) {
    // Pelaksana Pekerjaan = MITRA AKTIVASI (kolom I), dicocokkan dengan Data Mitra
    var m = bapsMitraDb.filter(function (x) {
      return normNama(x.nama) === normNama(r.mitra);
    })[0];
    if (m) {
      el('bapsPelaksana').value = m.nama;
      isiDariPelaksana();
      bagian.push('Pelaksana (' + m.nama + ')');
    } else {
      el('bapsPelaksana').value = '';
      isiDariPelaksana();
      jenis = 'warn';
      tambahan =
        ' Mitra "' +
        r.mitra +
        '" belum ada di Data Mitra, silakan tambahkan (nama sudah disiapkan di form Tambah Data Mitra).';
      resetFormMitraBaps();
      el('bapsMitraNama').value = r.mitra;
      el('bapsPanelMitra').classList.add('buka');
    }
  }
  perbaruiBaps();
  return { teks: '\u2713 Terisi dari spreadsheet: ' + bagian.join(', ') + '.' + tambahan, jenis: jenis };
}
function tampilHasilSheet(b, i) {
  var rows = sheetData[b],
    info = terapkanSheet(b, rows[i]);
  statusSheet(
    b,
    info.teks + (rows.length > 1 ? ' Ada ' + rows.length + ' baris untuk nomor ini, pilih yang sesuai.' : ''),
    info.jenis
  );
}
function jalankanSheet(b, kunci) {
  var tok = ++sheetToken[b];
  statusSheet(b, 'Mencari di spreadsheet...', '');
  cariSheet(kunci)
    .then(function (rows) {
      if (tok !== sheetToken[b]) return;
      var sel = pilihSheetEl(b);
      sheetData[b] = rows;
      if (!rows.length) {
        sel.hidden = true;
        sel.innerHTML = '';
        statusSheet(b, 'Nomor tidak ditemukan di spreadsheet. Isi manual.', 'warn');
        return;
      }
      sel.innerHTML = rows
        .map(function (r, i) {
          return (
            '<option value="' +
            i +
            '">' +
            (i + 1) +
            '. ' +
            escQ(r.mitra || '(mitra kosong)') +
            ' \u00b7 Delivery ' +
            (r.delivery ? fmtTglBaps(r.delivery) : '-') +
            '</option>'
          );
        })
        .join('');
      sel.value = String(rows.length - 1);
      sel.hidden = rows.length < 2; // baris terakhir dianggap yang terbaru
      tampilHasilSheet(b, rows.length - 1);
    })
    .catch(function () {
      if (tok !== sheetToken[b]) return;
      statusSheet(b, 'Tidak bisa terhubung ke spreadsheet (cek internet dan izin berbagi sheet). Isi manual.', 'err');
    });
}
function pasangSheet() {
  [
    ['sppw', 'noPa'],
    ['baps', 'bapsNoSo']
  ].forEach(function (g) {
    var el = document.getElementById(g[1]),
      timer;
    el.addEventListener('input', function () {
      clearTimeout(timer);
      sheetToken[g[0]]++;
      var q = el.value.trim();
      if (q.length < 8) {
        statusSheet(g[0], '');
        pilihSheetEl(g[0]).hidden = true;
        return;
      }
      statusSheet(g[0], 'Mencari di spreadsheet...', '');
      timer = setTimeout(function () {
        jalankanSheet(g[0], q);
      }, 700);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && el.value.trim().length >= 8) {
        e.preventDefault();
        clearTimeout(timer);
        jalankanSheet(g[0], el.value.trim());
      }
    });
    pilihSheetEl(g[0]).addEventListener('change', function () {
      if (sheetData[g[0]][+this.value]) tampilHasilSheet(g[0], +this.value);
    });
  });
}

function hitungSkala() {
  var W = (210 * 96) / 25.4,
    H = (297 * 96) / 25.4; // ukuran A4 dalam px
  document.querySelectorAll('.kertas-area').forEach(function (area) {
    if (!area.clientWidth) return;
    var s = area.clientWidth / W;
    if (window.innerWidth > 880 && area.clientHeight) s = Math.min(s, area.clientHeight / H);
    area.style.setProperty('--s', s.toFixed(4));
  });
}
if (window.ResizeObserver) {
  var ro = new ResizeObserver(hitungSkala);
  document.querySelectorAll('.kertas-area').forEach(function (a) {
    ro.observe(a);
  });
}
window.addEventListener('resize', hitungSkala);

muatMitra();
muatBapsMitra();
muatIsianForm();
perbaruiPreview();
document.getElementById('bapsTglBaps').value = BAPS_DEF.bapsTglBaps; // selalu mulai dari hari ini
muatBaps();
muatQc();
muatBarisQc();
perbaruiQc();
initHistory();
pasangSheet();
isiDariPelaksana();
hitungSkala();
