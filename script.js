/* =============================================
 * 🌸 THIỆP CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10
 * script.js – Toàn bộ logic & hiệu ứng
 * =============================================
 * ★ SỬA NỘI DUNG THIỆP: thay đổi các giá trị ngay bên dưới
 */

// ─── LỜI CHÚC (mỗi phần tử = 1 dòng trong thiệp, chuỗi rỗng = dòng trống) ───
const GREETING_LINES = [
    'Nhân ngày Phụ nữ Việt Nam 20/10,',
    'xin gửi tới bạn những lời yêu thương ấm áp và chân thành nhất.',
    '',
    'Cảm ơn bạn – vì sự dịu dàng, sức mạnh kiên cường,',
    'và những hy sinh thầm lặng mà lời nói',
    'không thể nào kể hết.',
    '',
    'Chúc bạn luôn tràn đầy sức khỏe, niềm vui,',
    'rạng rỡ tựa nắng ban mai,',
    'và luôn được yêu thương đúng cách bạn xứng đáng. 💐',
];

// ─── DÒNG KÝ TÊN (cuối thiệp) ───
const SIGNATURE = '— Người luôn trân trọng bạn ❤️';

// ─── NGƯỜI NHẬN MẶC ĐỊNH (dùng khi URL không có ?to=...) ───
const DEFAULT_RECIPIENT = 'Những người phụ nữ tuyệt vời';

// ─── NHẠC NỀN – để trống '' nếu chưa có file, nút nhạc sẽ tự ẩn ───
const MUSIC_URL = '';

// ─── BẢNG MÀU (tùy chỉnh nếu muốn đổi tông) ───
const PETAL_COLORS = [
    '#ff7eb3', '#ff6b9d', '#ff85a1', '#ffa3b5',
    '#e88bc4', '#d4a5e5', '#f0b6d4', '#ffb7c5',
    '#ffc0cb', '#ff7093', '#dda0dd', '#f8a4c8',
];
const CENTER_COLORS = ['#ffd700', '#ffaa00', '#ffe066', '#fff4b0'];
const LEAF_COLORS  = ['#5a9c69', '#4a7c59', '#6aaa79', '#72b585', '#3d7a50'];

/* =============================================
 * BIẾN NỘI BỘ (không cần sửa)
 * ============================================= */
const SVG_NS = 'http://www.w3.org/2000/svg';
let hasBlossomed = false;
let reducedMotion = false;
let fallingInterval = null;
let audioEl = null;
let isMusicPlaying = false;

/* =============================================
 * KHỞI TẠO
 * ============================================= */
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Kiểm tra chế độ giảm chuyển động
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lấy tên người nhận từ URL (?to=Mẹ)
    const params = new URLSearchParams(window.location.search);
    const recipient = params.get('to') || DEFAULT_RECIPIENT;
    document.getElementById('card-to').textContent = 'Gửi tới: ' + recipient;

    // Điền nội dung thiệp
    populateCard();

    // Hiệu ứng nền bokeh
    createBokeh();

    // Bướm bay lượn
    if (!reducedMotion) createButterflies();

    // Nhạc nền
    setupMusic();

    // Xử lý click bông hoa chính
    const wrap = document.getElementById('main-flower-wrap');
    wrap.addEventListener('click', handleFlowerClick);
    wrap.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlowerClick(); }
    });

    // Nút xem lại
    document.getElementById('btn-reset').addEventListener('click', resetPage);
}

/* =============================================
 * ĐIỀN NỘI DUNG THIỆP
 * ============================================= */
function populateCard() {
    const msgEl = document.getElementById('card-message');
    msgEl.innerHTML = '';
    GREETING_LINES.forEach(function (line) {
        var p = document.createElement('p');
        p.className = 'card-line' + (line === '' ? ' spacer' : '');
        p.textContent = line;
        msgEl.appendChild(p);
    });
    document.getElementById('card-signature').textContent = SIGNATURE;
}

/* =============================================
 * XỬ LÝ BÔNG HOA CHÍNH
 * ============================================= */
function handleFlowerClick() {
    if (hasBlossomed) return;
    hasBlossomed = true;

    var flower = document.getElementById('main-flower');
    var wrap   = document.getElementById('main-flower-wrap');

    // Bước 1: Nở hoa (CSS transition ~2.5 giây)
    flower.classList.add('bloomed');
    wrap.style.cursor = 'default';

    // Bước 2: Sau khi nở xong → di chuyển lên, tạo vườn hoa
    setTimeout(function () {
        wrap.classList.add('moved-up');
    }, 2600);

    // Bước 3: Vườn hoa xuất hiện
    setTimeout(function () {
        createGarden();
    }, 3000);

    // Bước 4: Cánh hoa rơi
    setTimeout(function () {
        if (!reducedMotion) startFallingPetals();
    }, 3200);

    // Bước 5: Ẩn gợi ý
    setTimeout(function () {
        document.getElementById('hint').classList.add('hidden');
    }, 3000);

    // Bước 6: Hiện thiệp
    setTimeout(function () {
        showCard();
    }, 4500);
}

/* =============================================
 * VƯỜN HOA – tạo 15-25 bông hoa quanh màn hình
 * ============================================= */
function createGarden() {
    var garden = document.getElementById('garden');
    garden.innerHTML = '';
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var count = reducedMotion ? 8 : (vw < 600 ? 14 : 22);

    // Vùng thiệp cần tránh (trung tâm màn hình)
    var safeX1 = vw / 2 - Math.min(260, vw * 0.46);
    var safeX2 = vw / 2 + Math.min(260, vw * 0.46);
    var safeY1 = vh / 2 - Math.min(240, vh * 0.38);
    var safeY2 = vh / 2 + Math.min(240, vh * 0.38);

    for (var i = 0; i < count; i++) {
        var pos = randomPositionOutsideCenter(vw, vh, safeX1, safeX2, safeY1, safeY2);
        var size = randInt(35, 65);
        var petalCount = randItem([5, 6, 7, 8]);
        var color = randItem(PETAL_COLORS);
        var centerColor = randItem(CENTER_COLORS);

        var svg = createFlowerSVG(petalCount, color, centerColor, size);
        svg.className = 'garden-flower';
        svg.style.left = pos.x + 'px';
        svg.style.top  = pos.y + 'px';
        svg.style.width  = size + 'px';
        svg.style.height = size + 'px';

        garden.appendChild(svg);

        // Xuất hiện từng bông (trễ nhau)
        (function (el, delay) {
            setTimeout(function () { el.classList.add('visible'); }, delay);
        })(svg, i * 120);

        // Xử lý touch trên mobile
        svg.addEventListener('touchstart', function () {
            var el = this;
            el.classList.add('touched');
            setTimeout(function () { el.classList.remove('touched'); }, 600);
        }, { passive: true });
    }
}

/** Tạo SVG một bông hoa nhỏ (vẽ bằng ellipse) */
function createFlowerSVG(petalCount, petalColor, centerColor, size) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-50 -50 100 100');
    svg.setAttribute('aria-hidden', 'true');

    // Thân nhỏ
    var stem = document.createElementNS(SVG_NS, 'line');
    stem.setAttribute('x1', '0'); stem.setAttribute('y1', '8');
    stem.setAttribute('x2', '0'); stem.setAttribute('y2', '45');
    stem.setAttribute('stroke', randItem(LEAF_COLORS));
    stem.setAttribute('stroke-width', '2.5');
    stem.setAttribute('stroke-linecap', 'round');
    svg.appendChild(stem);

    // Lá nhỏ
    var leaf = document.createElementNS(SVG_NS, 'path');
    leaf.setAttribute('d', 'M0 25 Q-12 18 -15 10 Q-8 15 0 25Z');
    leaf.setAttribute('fill', randItem(LEAF_COLORS));
    leaf.setAttribute('opacity', '0.75');
    svg.appendChild(leaf);

    // Cánh hoa
    var darken = tinyDarken(petalColor, 15);
    for (var i = 0; i < petalCount; i++) {
        var angle = (360 / petalCount) * i;
        var g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('transform', 'rotate(' + angle + ')');

        var petal = document.createElementNS(SVG_NS, 'ellipse');
        petal.setAttribute('cx', '0');
        petal.setAttribute('cy', '-18');
        petal.setAttribute('rx', 10 + rand(-2, 2));
        petal.setAttribute('ry', 18 + rand(-3, 3));
        petal.setAttribute('fill', i % 2 === 0 ? petalColor : darken);
        petal.setAttribute('opacity', rand(0.78, 0.92).toFixed(2));
        g.appendChild(petal);
        svg.appendChild(g);
    }

    // Nhụy
    var c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', '0'); c.setAttribute('cy', '0');
    c.setAttribute('r', '8');
    c.setAttribute('fill', centerColor);
    svg.appendChild(c);

    var c2 = document.createElementNS(SVG_NS, 'circle');
    c2.setAttribute('cx', '0'); c2.setAttribute('cy', '0');
    c2.setAttribute('r', '4');
    c2.setAttribute('fill', tinyDarken(centerColor, 30));
    svg.appendChild(c2);

    return svg;
}

/** Tìm vị trí ngẫu nhiên ngoài vùng trung tâm (tránh che thiệp) */
function randomPositionOutsideCenter(vw, vh, sx1, sx2, sy1, sy2) {
    var x, y, attempts = 0;
    do {
        x = rand(10, vw - 70);
        y = rand(10, vh - 70);
        attempts++;
    } while (attempts < 80 && x > sx1 && x < sx2 && y > sy1 && y < sy2);
    return { x: x, y: y };
}

/* =============================================
 * CÁNH HOA RƠI
 * ============================================= */
function startFallingPetals() {
    var container = document.getElementById('falling-petals');
    var maxPetals = window.innerWidth < 600 ? 25 : 45;
    var interval  = window.innerWidth < 600 ? 450 : 280;

    fallingInterval = setInterval(function () {
        // Giới hạn số cánh hoa đồng thời
        if (container.childElementCount >= maxPetals) return;
        createFallingPetal(container);
    }, interval);
}

function createFallingPetal(container) {
    var petal = document.createElement('div');
    petal.className = 'falling-petal';

    var size = rand(8, 16);
    var x = rand(0, 100);
    var duration = rand(7, 14);
    var driftMid = rand(-50, 50);
    var driftEnd = rand(-80, 80);
    var color = randItem(PETAL_COLORS);

    petal.style.cssText =
        'left:' + x + '%;' +
        'top:-20px;' +
        'width:' + size + 'px;' +
        'height:' + (size * 1.3) + 'px;' +
        'background:' + color + ';' +
        '--drift-mid:' + driftMid + 'px;' +
        '--drift-end:' + driftEnd + 'px;' +
        'animation-duration:' + duration + 's;';

    container.appendChild(petal);

    // Xóa cánh hoa sau khi animation kết thúc
    setTimeout(function () {
        if (petal.parentNode) petal.parentNode.removeChild(petal);
    }, duration * 1000 + 200);
}

/* =============================================
 * THIỆP – Hiện thiệp + hiệu ứng chữ hiện dần
 * ============================================= */
function showCard() {
    var cardWrap = document.getElementById('card-wrap');
    cardWrap.classList.add('visible');

    // Hiện từng dòng chữ (fade-in + trượt lên)
    var lines = document.querySelectorAll('#card .card-line');
    lines.forEach(function (el, i) {
        setTimeout(function () {
            el.classList.add('show');
        }, 400 + i * 280);
    });

    // Hiện nút "Xem lại"
    setTimeout(function () {
        document.getElementById('btn-reset').classList.add('show');
    }, 400 + lines.length * 280 + 300);
}

/* =============================================
 * HIỆU ỨNG NỀN – Bokeh (đốm sáng lung linh)
 * ============================================= */
function createBokeh() {
    var container = document.getElementById('bg-effects');
    var count = reducedMotion ? 0 : (window.innerWidth < 600 ? 10 : 18);

    for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'bokeh';
        var size = rand(18, 65);
        dot.style.cssText =
            'left:' + rand(0, 100) + '%;' +
            'top:' + rand(0, 100) + '%;' +
            'width:' + size + 'px;' +
            'height:' + size + 'px;' +
            'animation-duration:' + rand(18, 40) + 's;' +
            'animation-delay:' + rand(0, 12) + 's;' +
            'opacity:' + rand(0.06, 0.22) + ';';
        container.appendChild(dot);
    }
}

/* =============================================
 * HIỆU ỨNG NỀN – Bướm bay
 * ============================================= */
function createButterflies() {
    var count = window.innerWidth < 600 ? 2 : 3;
    var colors = [
        ['#f0b6d4', '#e88bc4'],
        ['#d4a5e5', '#c490d8'],
        ['#ffb7c5', '#ffa3b5'],
    ];

    for (var i = 0; i < count; i++) {
        var wrap = document.createElement('div');
        wrap.className = 'butterfly';
        wrap.style.cssText =
            'left:' + rand(10, 85) + '%;' +
            'top:' + rand(10, 70) + '%;' +
            'animation-duration:' + rand(20, 35) + 's;' +
            'animation-delay:' + rand(0, 8) + 's;';

        var s = 22 + i * 4;
        var c = colors[i % colors.length];
        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '-22 -18 44 36');
        svg.setAttribute('width', s + '');
        svg.setAttribute('height', Math.round(s * 0.8) + '');
        svg.setAttribute('aria-hidden', 'true');

        // Cánh trái
        var wl = document.createElementNS(SVG_NS, 'path');
        wl.setAttribute('d', 'M0 0 C-4 -12 -16 -16 -20 -8 C-22 -2 -14 8 0 4Z');
        wl.setAttribute('fill', c[0]);
        wl.setAttribute('opacity', '0.75');
        wl.classList.add('wing-left');
        svg.appendChild(wl);

        // Cánh phải
        var wr = document.createElementNS(SVG_NS, 'path');
        wr.setAttribute('d', 'M0 0 C4 -12 16 -16 20 -8 C22 -2 14 8 0 4Z');
        wr.setAttribute('fill', c[1]);
        wr.setAttribute('opacity', '0.75');
        wr.classList.add('wing-right');
        svg.appendChild(wr);

        // Thân bướm
        var body = document.createElementNS(SVG_NS, 'ellipse');
        body.setAttribute('cx', '0'); body.setAttribute('cy', '0');
        body.setAttribute('rx', '1.5'); body.setAttribute('ry', '6');
        body.setAttribute('fill', '#7a5a6a');
        svg.appendChild(body);

        // Râu
        var a1 = document.createElementNS(SVG_NS, 'line');
        a1.setAttribute('x1', '0'); a1.setAttribute('y1', '-6');
        a1.setAttribute('x2', '-5'); a1.setAttribute('y2', '-14');
        a1.setAttribute('stroke', '#7a5a6a'); a1.setAttribute('stroke-width', '0.6');
        svg.appendChild(a1);

        var a2 = document.createElementNS(SVG_NS, 'line');
        a2.setAttribute('x1', '0'); a2.setAttribute('y1', '-6');
        a2.setAttribute('x2', '5'); a2.setAttribute('y2', '-14');
        a2.setAttribute('stroke', '#7a5a6a'); a2.setAttribute('stroke-width', '0.6');
        svg.appendChild(a2);

        wrap.appendChild(svg);
        document.body.appendChild(wrap);
    }
}

/* =============================================
 * NHẠC NỀN
 * ============================================= */
function setupMusic() {
    var btn = document.getElementById('btn-music');
    if (!MUSIC_URL) return; // Không có nhạc → giữ nút ẩn

    btn.classList.add('visible');

    btn.addEventListener('click', function () {
        if (!audioEl) {
            audioEl = new Audio(MUSIC_URL);
            audioEl.loop = true;
            audioEl.volume = 0.35;
        }
        if (isMusicPlaying) {
            audioEl.pause();
            btn.classList.remove('playing');
        } else {
            audioEl.play().catch(function () { /* trình duyệt chặn autoplay */ });
            btn.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });
}

/* =============================================
 * XEM LẠI – Reset toàn bộ về trạng thái ban đầu
 * ============================================= */
function resetPage() {
    hasBlossomed = false;

    // Dừng cánh hoa rơi
    if (fallingInterval) { clearInterval(fallingInterval); fallingInterval = null; }

    // Xóa vườn hoa, cánh hoa rơi
    document.getElementById('garden').innerHTML = '';
    document.getElementById('falling-petals').innerHTML = '';

    // Reset hoa chính
    var flower = document.getElementById('main-flower');
    var wrap   = document.getElementById('main-flower-wrap');
    flower.classList.remove('bloomed');
    wrap.classList.remove('moved-up');
    wrap.style.cursor = 'pointer';

    // Ẩn thiệp
    var cardWrap = document.getElementById('card-wrap');
    cardWrap.classList.remove('visible');
    document.querySelectorAll('#card .card-line').forEach(function (el) {
        el.classList.remove('show');
    });
    document.getElementById('btn-reset').classList.remove('show');

    // Hiện gợi ý
    document.getElementById('hint').classList.remove('hidden');

    // Làm mới bokeh (ngẫu nhiên khác)
    document.getElementById('bg-effects').innerHTML = '';
    createBokeh();

    // Làm mới bướm
    document.querySelectorAll('.butterfly').forEach(function (b) { b.remove(); });
    if (!reducedMotion) createButterflies();
}

/* =============================================
 * TIỆN ÍCH
 * ============================================= */

/** Số thực ngẫu nhiên trong khoảng [min, max) */
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

/** Số nguyên ngẫu nhiên trong khoảng [min, max] */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Chọn ngẫu nhiên một phần tử từ mảng */
function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Tối màu hex đơn giản (amount = 0-255) */
function tinyDarken(hex, amount) {
    hex = hex.replace('#', '');
    var r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
    var g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
    var b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

