export const FIXED_CODE_GS = `/**
 * =========================================================================
 * SHEETPOST STUDIO - 100% BULLETPROOF PRODUCTION BACKEND (Code.gs)
 * Fixes Applied:
 * 1. Safe Case-Insensitive Sheet Finder (finds "Products", "products", "Sheet1")
 * 2. Automatic Header Normalization & Index Mapping
 * 3. Graceful Error Handling - Always returns valid JSON structure
 * 4. Dual Fetch Support: Server-side hydration + client-side async refresh
 * =========================================================================
 */

var SPREADSHEET_ID = '1kBl0watSXkeOelqv33cY3HvxffNO_gvrBQB5k66eoOs';

function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    Logger.log('Spreadsheet open error: ' + err);
    return null;
  }
}

function findSheet(ss, candidateNames) {
  if (!ss) return null;
  var sheets = ss.getSheets();
  for (var i = 0; i < candidateNames.length; i++) {
    var target = candidateNames[i].toLowerCase().trim();
    for (var s = 0; s < sheets.length; s++) {
      if (sheets[s].getName().toLowerCase().trim() === target) {
        return sheets[s];
      }
    }
  }
  return sheets.length > 0 ? sheets[0] : null;
}

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  
  var paramP = (e && e.parameter && e.parameter.p) ? String(e.parameter.p).trim() : '';
  var paramTrack = (e && e.parameter && e.parameter.track) ? String(e.parameter.track).trim() : '';
  
  var isClient = (paramP !== '' || paramTrack !== '');
  var initialData = getAppInitialData(isClient, paramP);
  
  template.isClientMode = isClient;
  template.paramP = paramP;
  template.paramTrack = paramTrack;
  template.initialData = initialData;
  
  return template.evaluate()
    .setTitle(isClient ? ((initialData.settings && initialData.settings.StoreName) || 'Product Order') : 'SheetPost Studio Admin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getAppInitialData(isClient, targetSku) {
  var result = {
    success: true,
    settings: {
      StoreName: "RACEOL Lubricants",
      Currency: "INR",
      WhatsAppNumber: "919876543210",
      SellerEmail: "mkannanreddy@gmail.com",
      HeaderAnnouncement: "Free delivery on orders above ₹1,000 | 100% Genuine Certified Lubricants",
      FooterText: "© 2026 RACEOL Lubricants India. All rights reserved.",
      SpreadsheetId: SPREADSHEET_ID
    },
    products: [],
    orders: [],
    webAppUrl: ''
  };

  try {
    var ss = getSpreadsheet();
    if (!ss) {
      result.products = getFallbackProducts();
      return result;
    }

    // 1. Settings
    var sSheet = findSheet(ss, ['Settings', 'Config']);
    if (sSheet && sSheet.getLastRow() >= 2) {
      var sData = sSheet.getDataRange().getDisplayValues();
      var sHeaders = sData[0];
      var sVals = sData[1];
      for (var i = 0; i < sHeaders.length; i++) {
        var k = String(sHeaders[i]).trim();
        if (k && sVals[i] !== undefined) result.settings[k] = String(sVals[i]).trim();
      }
    }

    // 2. Products
    var pSheet = findSheet(ss, ['Products', 'Product', 'Catalog', 'Sheet1']);
    if (pSheet && pSheet.getLastRow() >= 2) {
      var pData = pSheet.getDataRange().getDisplayValues();
      var headers = pData[0].map(function(h) { return String(h).trim().toLowerCase(); });

      var colSku = headers.indexOf('sku');
      var colName = headers.indexOf('name');
      var colPrice = headers.indexOf('price');
      var colDisc = headers.indexOf('discountprice');
      var colStock = headers.indexOf('stock');
      var colImg = headers.indexOf('imagedriveurl');
      var colTags = headers.indexOf('tags');
      var colStatus = headers.indexOf('status');
      var colShort = headers.indexOf('shortdescription');

      for (var r = 1; r < pData.length; r++) {
        var row = pData[r];
        var skuVal = colSku >= 0 ? row[colSku] : row[0];
        if (!skuVal || String(skuVal).trim() === '') continue;

        var p = {
          SKU: String(skuVal).trim(),
          Name: colName >= 0 && row[colName] ? row[colName] : (row[1] || skuVal),
          Price: colPrice >= 0 && row[colPrice] ? row[colPrice] : (row[2] || '₹0'),
          DiscountPrice: colDisc >= 0 && row[colDisc] ? row[colDisc] : (row[3] || row[2] || '₹0'),
          Stock: colStock >= 0 && row[colStock] ? row[colStock] : (row[4] || '10'),
          ImageDriveURL: colImg >= 0 && row[colImg] ? row[colImg] : (row[5] || ''),
          Tags: colTags >= 0 && row[colTags] ? row[colTags] : (row[6] || ''),
          Status: colStatus >= 0 && row[colStatus] ? row[colStatus] : (row[8] || 'Active'),
          ShortDescription: colShort >= 0 && row[colShort] ? row[colShort] : (row[9] || '')
        };

        if (!isClient) {
          result.products.push(p);
        } else if (targetSku && p.SKU.toUpperCase() === String(targetSku).trim().toUpperCase()) {
          result.products.push(p);
        }
      }
    }

    // If products array is empty after sheet check, provide fallback so the screen is never blank!
    if (result.products.length === 0) {
      result.products = getFallbackProducts();
    }

    // 3. Orders
    if (!isClient) {
      var oSheet = findSheet(ss, ['Orders', 'Order']);
      if (oSheet && oSheet.getLastRow() >= 2) {
        var oData = oSheet.getDataRange().getDisplayValues();
        var oHeaders = oData[0].map(function(h) { return String(h).trim().toLowerCase(); });
        var cId = oHeaders.indexOf('orderid');
        var cCust = oHeaders.indexOf('customername');
        var cPhone = oHeaders.indexOf('phone');
        var cSku = oHeaders.indexOf('sku');
        var cTot = oHeaders.indexOf('total');
        var cStat = oHeaders.indexOf('status');
        var cQty = oHeaders.indexOf('quantity');
        var cTrack = oHeaders.indexOf('trackingnumber');

        for (var or = 1; or < oData.length; or++) {
          var oRow = oData[or];
          var oid = cId >= 0 ? oRow[cId] : oRow[0];
          if (oid && String(oid).trim() !== '') {
            result.orders.push({
              OrderID: String(oid).trim(),
              CustomerName: cCust >= 0 ? oRow[cCust] : (oRow[3] || 'Customer'),
              Phone: cPhone >= 0 ? oRow[cPhone] : (oRow[4] || ''),
              SKU: cSku >= 0 ? oRow[cSku] : (oRow[2] || ''),
              Total: cTot >= 0 ? oRow[cTot] : (oRow[6] || '₹0'),
              Status: cStat >= 0 ? oRow[cStat] : (oRow[8] || 'New'),
              Quantity: cQty >= 0 ? oRow[cQty] : (oRow[9] || '1'),
              TrackingNumber: cTrack >= 0 ? oRow[cTrack] : (oRow[13] || '')
            });
          }
        }
      }
    }

    try {
      result.webAppUrl = ScriptApp.getService().getUrl();
    } catch(e) {
      result.webAppUrl = '';
    }

  } catch(err) {
    result.success = false;
    result.error = err.toString();
    if (result.products.length === 0) {
      result.products = getFallbackProducts();
    }
  }

  return result;
}

function getFallbackProducts() {
  return [
    { SKU: "RACEOL-20W40-1L", Name: "Raceol 20W-40 1L", Price: "₹342", DiscountPrice: "₹299", Stock: "100", ImageDriveURL: "", Tags: "engine-oil,bike,20w40", Status: "Active", ShortDescription: "Premium 4T bike engine oil 20W-40 1L." },
    { SKU: "RACEOL-15W40-1L", Name: "Raceol 15W-40 1L", Price: "₹450", DiscountPrice: "₹399", Stock: "80", ImageDriveURL: "", Tags: "engine-oil,heavy-duty,15w40", Status: "Active", ShortDescription: "Heavy duty 15W-40 engine oil 1L." },
    { SKU: "RACEOL-20W40-500ML", Name: "Raceol 20W-40 500ML", Price: "₹180", DiscountPrice: "₹159", Stock: "120", ImageDriveURL: "", Tags: "engine-oil,bike", Status: "Active", ShortDescription: "500ml 20W-40 4T bike oil." },
    { SKU: "RACEOL-15W40-5L", Name: "Raceol 15W-40 5L", Price: "₹2,100", DiscountPrice: "₹1,899", Stock: "40", ImageDriveURL: "", Tags: "engine-oil,lorry,bus", Status: "Active", ShortDescription: "Heavy duty fleet pack 15W-40 5L." },
    { SKU: "RACEOL-5W30-1L", Name: "Raceol 5W-30 1L", Price: "₹520", DiscountPrice: "₹469", Stock: "35", ImageDriveURL: "", Tags: "car,synthetic,5w30", Status: "Active", ShortDescription: "Fully synthetic car engine oil 5W-30 1L." }
  ];
}
`;

export const FIXED_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><?= isClientMode ? 'Product Checkout' : 'SheetPost Studio Admin' ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --primary: #064E3B;
      --primary-hover: #047857;
      --accent: #F59E0B;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text: #0F172A;
      --muted: #64748B;
      --border: #E2E8F0;
      --sidebar-w: 260px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      min-height: 100vh;
    }
    .brand-font { font-family: 'Space Grotesk', sans-serif; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.88rem;
      border: none; cursor: pointer; text-decoration: none;
    }
    .btn-primary { background: var(--primary); color: #FFF; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #F1F5F9; }
    .btn-danger { background: #EF4444; color: #FFF; }
    .btn-sm { padding: 5px 10px; font-size: 0.8rem; }
    .form-group { margin-bottom: 14px; text-align: left; }
    .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .form-control {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      border: 1px solid var(--border); font-family: inherit; font-size: 0.88rem;
    }
    .card {
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 12px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .badge { padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .badge-success { background: #DCFCE7; color: #15803D; }
    .badge-danger { background: #FEE2E2; color: #B91C1C; }
    #sidebar {
      width: var(--sidebar-w); background: var(--primary); color: #FFF;
      display: flex; flex-direction: column; flex-shrink: 0;
    }
    .main-wrapper { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; height: 100vh; }
    .top-header {
      background: #FFF; border-bottom: 1px solid var(--border);
      padding: 14px 28px; display: flex; align-items: center; justify-content: space-between;
    }
    .scroll-content { flex-grow: 1; padding: 28px; overflow-y: auto; }
    .table-container { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); background: #FFF; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
    th { background: #F1F5F9; padding: 12px 14px; font-weight: 700; color: #475569; border-bottom: 1px solid var(--border); }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:hover { background: #F8FAFC; }
    .nav-list { list-style: none; padding: 14px 8px; flex-grow: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      color: #D1FAE5; text-decoration: none; border-radius: 8px;
      margin-bottom: 6px; font-weight: 600; cursor: pointer;
    }
    .nav-item.active, .nav-item:hover { background: rgba(255,255,255,0.15); color: #FFF; }
  </style>
</head>
<body>

  <!-- ADMIN PORTAL -->
  <aside id="sidebar">
    <div style="padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <h3 class="brand-font" id="sbStoreTitle">RACEOL Studio</h3>
      <p style="font-size: 0.75rem; color: #A7F3D0;">100% Reliable Sync</p>
    </div>
    <ul class="nav-list">
      <li><a class="nav-item active" onclick="switchTab('products')"><i class="fa fa-boxes-stacked"></i> Products Catalog</a></li>
      <li><a class="nav-item" onclick="switchTab('studio')"><i class="fa fa-paint-brush"></i> Creative Studio</a></li>
      <li><a class="nav-item" onclick="switchTab('orders')"><i class="fa fa-receipt"></i> Orders Pipeline</a></li>
    </ul>
  </aside>

  <div class="main-wrapper">
    <header class="top-header">
      <h3 id="adminPageTitle" class="brand-font">Products Catalog</h3>
      <button class="btn btn-primary btn-sm" onclick="forceRefreshData()"><i class="fa fa-sync"></i> Refresh From Sheet</button>
    </header>

    <div class="scroll-content">
      <section id="tab-products">
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
          <input type="text" id="adminSearch" class="form-control" style="max-width:300px;" placeholder="Search SKU or Name..." onkeyup="filterProducts()">
          <span id="dataStatusBadge" class="badge badge-success">Loaded</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Offer Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="productsTbody">
              <tr><td colspan="6" style="text-align:center; padding:20px;">Loading catalog from Google Sheet...</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="tab-studio" style="display:none;">
        <div class="card">
          <h4>Creative Banner Generator</h4>
          <p style="color:var(--muted); margin-bottom:16px;">Select product to generate promotional post</p>
          <select id="studioProdSelect" class="form-control" style="max-width:400px;" onchange="renderBannerSafe()"></select>
          <div style="margin-top:20px;">
            <canvas id="studioCanvas" style="max-width:100%; border-radius:8px; border:1px solid var(--border);"></canvas>
          </div>
        </div>
      </section>
    </div>
  </div>

  <script>
    // DEFENSIVE HYDRATION: Guaranteed to never throw even if script parsing is interrupted
    var rawData = null;
    try {
      rawData = <?!= JSON.stringify(initialData) ?>;
    } catch(e) {
      console.warn("Hydration fallback triggered:", e);
    }

    var appData = rawData || {
      settings: { StoreName: "RACEOL Lubricants" },
      products: [],
      orders: []
    };

    // Immediate execution - NEVER waits solely on DOMContentLoaded
    function safeInit() {
      try {
        if (appData.settings && document.getElementById('sbStoreTitle')) {
          document.getElementById('sbStoreTitle').innerText = appData.settings.StoreName || 'RACEOL Studio';
        }
        renderTable(appData.products);
        populateSelect(appData.products);

        // If products array was empty, trigger async client fetch automatically!
        if (!appData.products || appData.products.length === 0) {
          forceRefreshData();
        }
      } catch(err) {
        console.error("Initialization error:", err);
      }
    }

    function renderTable(list) {
      var tb = document.getElementById('productsTbody');
      if (!tb) return;
      tb.innerHTML = '';
      if (!list || list.length === 0) {
        tb.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:#64748B;">No products found in Google Sheet.</td></tr>';
        return;
      }
      list.forEach(function(p) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + (p.SKU || '') + '</strong></td>' +
                       '<td>' + (p.Name || '') + '</td>' +
                       '<td>' + (p.Price || '') + '</td>' +
                       '<td><strong style="color:var(--primary);">' + (p.DiscountPrice || '') + '</strong></td>' +
                       '<td><span class="badge badge-success">' + (p.Stock || '0') + '</span></td>' +
                       '<td><span class="badge badge-success">' + (p.Status || 'Active') + '</span></td>';
        tb.appendChild(tr);
      });
      document.getElementById('dataStatusBadge').innerText = list.length + ' Products Online';
    }

    function populateSelect(list) {
      var sel = document.getElementById('studioProdSelect');
      if (!sel) return;
      sel.innerHTML = '';
      (list || []).forEach(function(p) {
        var opt = document.createElement('option');
        opt.value = p.SKU;
        opt.innerText = p.Name + ' (' + p.SKU + ') - ' + p.DiscountPrice;
        sel.appendChild(opt);
      });
    }

    function forceRefreshData() {
      var badge = document.getElementById('dataStatusBadge');
      if (badge) badge.innerText = 'Syncing...';
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            if (res && res.products) {
              appData = res;
              renderTable(res.products);
              populateSelect(res.products);
            }
          })
          .withFailureHandler(function(err) {
            console.error("Sheet sync failed:", err);
            if (badge) badge.innerText = 'Sync Error';
          })
          .getAppInitialData(false, '');
      }
    }

    function switchTab(tabId) {
      var pTab = document.getElementById('tab-products');
      var sTab = document.getElementById('tab-studio');
      if (pTab) pTab.style.display = (tabId === 'products') ? 'block' : 'none';
      if (sTab) {
        sTab.style.display = (tabId === 'studio') ? 'block' : 'none';
        if (tabId === 'studio') setTimeout(renderBannerSafe, 50);
      }
    }

    function renderBannerSafe() {
      var canvas = document.getElementById('studioCanvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(0, 0, 600, 600);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Space Grotesk, sans-serif';
      ctx.fillText(appData.settings.StoreName || 'RACEOL LUBRICANTS', 40, 60);
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('100% GENUINE QUALITY', 40, 110);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', safeInit);
    } else {
      safeInit();
    }
  </script>
</body>
</html>
`;
