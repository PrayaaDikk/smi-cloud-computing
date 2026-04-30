// ── CANVAS GRID ──
const canvas = document.getElementById("grid-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

function initParticles() {
    particles = [];
    const cols = Math.ceil(canvas.width / 80);
    const rows = Math.ceil(canvas.height / 80);
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (Math.random() > 0.8) {
                particles.push({
                    x: c * 80 + 40,
                    y: r * 80 + 40,
                    size: Math.random() * 1.5 + 0.5,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.008 + 0.004,
                });
            }
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = "rgba(10,10,10,0.04)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = "rgba(10,10,10,0.04)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    // Particles (grid intersections that pulse)
    particles.forEach((p) => {
        p.phase += p.speed;
        const alpha = ((Math.sin(p.phase) + 1) / 2) * 0.25 + 0.02;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,10,10,${alpha})`;
        ctx.fill();
    });
    requestAnimationFrame(drawGrid);
}

resize();
window.addEventListener("resize", resize);
drawGrid();

// ── AUDIO ──
let audioCtx = null,
    gainNode = null,
    isPlaying = false;

function createAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);
    [
        [55, "sine", 0.5],
        [82, "sine", 0.25],
        [110, "triangle", 0.12],
        [165, "sine", 0.08],
    ].forEach(([f, t, g]) => {
        const osc = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        osc.type = t;
        osc.frequency.value = f;
        g2.gain.value = g;
        const lfo = audioCtx.createOscillator();
        const lg = audioCtx.createGain();
        lfo.frequency.value = 0.1 + Math.random() * 0.1;
        lg.gain.value = 1.2;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        osc.connect(g2);
        g2.connect(gainNode);
        osc.start();
        lfo.start();
    });
}

function toggleAudio() {
    const waves = document.getElementById("audioWaves");
    const dot = document.getElementById("audioDot");
    const lbl = document.getElementById("audioLbl");
    if (!isPlaying) {
        if (!audioCtx) createAudio();
        if (audioCtx.state === "suspended") audioCtx.resume();
        gainNode.gain.setTargetAtTime(0.025, audioCtx.currentTime, 0.8);
        waves.classList.remove("paused");
        dot.classList.remove("off");
        lbl.textContent = "Berhenti";
        isPlaying = true;
    } else {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
        waves.classList.add("paused");
        dot.classList.add("off");
        lbl.textContent = "Putar";
        isPlaying = false;
    }
}

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("visible");
        });
    },
    { threshold: 0.08 },
);
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

// ── TABS ──
function switchTab(id, btn) {
    document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
    document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    btn.classList.add("active");
}

// ── STATS COUNTER ──
function animCount(el, target, suffix, dur) {
    let s = 0;
    const step = target / (dur / 16);
    const t = setInterval(() => {
        s += step;
        if (s >= target) {
            el.textContent = target + suffix;
            clearInterval(t);
            return;
        }
        el.textContent = Math.floor(s) + suffix;
    }, 16);
}
const sObs = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                animCount(document.getElementById("stat1"), 679, " M", 1600);
                animCount(document.getElementById("stat2"), 94, "%", 1600);
                animCount(document.getElementById("stat3"), 23, "%", 1600);
                animCount(document.getElementById("stat4"), 105, "", 1600);
                sObs.disconnect();
            }
        });
    },
    { threshold: 0.3 },
);
sObs.observe(document.querySelector(".stats-wrapper"));

// ── QUIZ ──
const questions = [
    {
        q: "Manakah yang paling tepat menggambarkan karakteristik utama cloud computing?",
        opts: [
            "Memerlukan perangkat keras khusus di setiap lokasi pengguna",
            "Kemampuan self-service on-demand dengan elastisitas sumber daya",
            "Lokasi server yang selalu berada di negara pengguna",
            "Tidak memerlukan username dan password",
        ],
        ans: 1,
        exp: "Karakteristik utama cloud computing adalah self-service on-demand dan elastisitas — kemampuan menyesuaikan kapasitas secara otomatis sesuai kebutuhan.",
    },
    {
        q: "Perusahaan startup e-commerce ingin membangun aplikasi web tanpa mengelola server. Model layanan cloud apa yang paling sesuai?",
        opts: [
            "Infrastructure as a Service (IaaS)",
            "Software as a Service (SaaS)",
            "Platform as a Service (PaaS)",
            "Database as a Service (DBaaS)",
        ],
        ans: 2,
        exp: "PaaS menyediakan platform pengembangan lengkap sehingga developer hanya perlu fokus menulis dan mendeploy kode aplikasi tanpa mengelola infrastruktur.",
    },
    {
        q: "Bank besar ingin menggunakan cloud untuk fleksibilitas tapi tetap harus menyimpan data nasabah di infrastruktur sendiri karena regulasi. Model deployment mana yang paling cocok?",
        opts: [
            "Public Cloud",
            "Private Cloud",
            "Hybrid Cloud",
            "Community Cloud",
        ],
        ans: 2,
        exp: "Hybrid Cloud menggabungkan public cloud untuk fleksibilitas dengan private cloud untuk data sensitif yang diatur regulasi — keseimbangan antara compliance dan efisiensi.",
    },
    {
        q: "Apa yang dimaksud dengan model 'Pay-as-you-go' dalam cloud computing?",
        opts: [
            "Membayar di muka untuk satu tahun penuh penggunaan server",
            "Membeli hardware fisik dan membayar biaya perawatan tahunan",
            "Membayar hanya untuk sumber daya yang benar-benar digunakan, dihitung per jam atau per detik",
            "Berlangganan paket bulanan dengan kuota tetap",
        ],
        ans: 2,
        exp: "Pay-as-you-go berarti membayar hanya untuk sumber daya yang dikonsumsi, mengubah biaya modal (CapEx) menjadi biaya operasional fleksibel (OpEx).",
    },
    {
        q: "Manakah yang BUKAN termasuk provider cloud publik terbesar di dunia?",
        opts: [
            "Amazon Web Services (AWS)",
            "Microsoft Azure",
            "Google Cloud Platform (GCP)",
            "Adobe Creative Cloud",
        ],
        ans: 3,
        exp: "Adobe Creative Cloud adalah layanan SaaS untuk alat kreatif seperti Photoshop — bukan penyedia infrastruktur cloud publik. AWS, Azure, dan GCP adalah tiga cloud provider terbesar.",
    },
    {
        q: "Perusahaan menggunakan Gmail, Google Drive, dan Google Meet untuk operasional sehari-hari. Model layanan cloud apa yang digunakan?",
        opts: [
            "Infrastructure as a Service (IaaS)",
            "Platform as a Service (PaaS)",
            "Software as a Service (SaaS)",
            "Function as a Service (FaaS)",
        ],
        ans: 2,
        exp: "Gmail, Drive, dan Meet adalah contoh SaaS — dikelola sepenuhnya oleh Google, diakses pengguna melalui browser tanpa instalasi atau pengelolaan infrastruktur.",
    },
    {
        q: "Apa yang dimaksud dengan 'Vendor Lock-in' dalam cloud computing?",
        opts: [
            "Fitur keamanan untuk mengunci akses ke layanan cloud",
            "Ketergantungan pada satu penyedia cloud yang membuat sulit berpindah ke provider lain",
            "Kontrak eksklusif dengan vendor perangkat keras",
            "Sistem autentikasi dua faktor dari vendor cloud",
        ],
        ans: 1,
        exp: "Vendor lock-in terjadi ketika organisasi sangat bergantung pada ekosistem satu penyedia cloud, sehingga perpindahan ke provider lain menjadi sangat mahal dan kompleks.",
    },
    {
        q: "Teknologi apa yang menjadi fondasi utama cloud computing yang memungkinkan banyak 'mesin virtual' berjalan di satu perangkat keras fisik?",
        opts: [
            "Blockchain",
            "Virtualisasi",
            "Enkripsi end-to-end",
            "5G Network Slicing",
        ],
        ans: 1,
        exp: "Virtualisasi memungkinkan satu server fisik dibagi menjadi banyak mesin virtual (VM) yang terisolasi, memaksimalkan utilisasi hardware — fondasi efisiensi cloud.",
    },
    {
        q: "Aplikasi e-commerce mengalami lonjakan trafik 10x saat harbolnas. Kemampuan cloud untuk otomatis menambah kapasitas saat trafik tinggi disebut apa?",
        opts: [
            "Load Balancing",
            "Auto Scaling",
            "Content Delivery Network (CDN)",
            "Disaster Recovery",
        ],
        ans: 1,
        exp: "Auto Scaling adalah kemampuan cloud menyesuaikan jumlah server berdasarkan beban kerja aktual — naik saat trafik tinggi, turun setelah normal untuk menghemat biaya.",
    },
    {
        q: "Sebuah organisasi ingin memastikan data tetap aman dan dapat dipulihkan jika terjadi bencana alam. Fitur cloud apa yang paling relevan?",
        opts: [
            "Auto Scaling",
            "Multi-tenancy",
            "Disaster Recovery & Backup",
            "Content Delivery Network",
        ],
        ans: 2,
        exp: "Disaster Recovery & Backup memastikan data direplikasi ke beberapa lokasi geografis berbeda, sehingga layanan dapat dipulihkan dengan cepat jika terjadi kegagalan atau bencana.",
    },
];

let currentQ = 0,
    score = 0,
    answered = false;

function loadQuestion() {
    const q = questions[currentQ];
    const total = questions.length;
    const pct = Math.round((currentQ / total) * 100);
    document.getElementById("qNum").textContent =
        `SOAL ${String(currentQ + 1).padStart(2, "0")}`;
    document.getElementById("qText").textContent = q.q;
    document.getElementById("qProgress").textContent =
        `Pertanyaan ${currentQ + 1} dari ${total}`;
    document.getElementById("progressFill").style.width = pct + "%";
    document.getElementById("scoreDisplay").textContent = score;
    const grid = document.getElementById("optionsGrid");
    grid.innerHTML = "";
    const letters = ["A", "B", "C", "D"];
    q.opts.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span>${opt}</span>`;
        btn.onclick = () => selectAnswer(i, btn);
        grid.appendChild(btn);
    });
    document.getElementById("quizFeedback").className = "quiz-feedback";
    document.getElementById("nextBtn").className = "quiz-next-btn";
    answered = false;
}

function selectAnswer(idx, btn) {
    if (answered) return;
    answered = true;
    const q = questions[currentQ];
    const allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach((b) => (b.disabled = true));
    const fb = document.getElementById("quizFeedback");
    const nextBtn = document.getElementById("nextBtn");
    if (idx === q.ans) {
        btn.classList.add("correct");
        score += 10;
        fb.className = "quiz-feedback show";
        fb.innerHTML = `<strong>Tepat sekali!</strong> ${q.exp}`;
        playBeep(660, 0.08, 0.15);
    } else {
        btn.classList.add("wrong");
        allBtns[q.ans].classList.add("correct");
        fb.className = "quiz-feedback show";
        fb.innerHTML = `<strong>Kurang tepat.</strong> Jawaban yang benar adalah [${["A", "B", "C", "D"][q.ans]}]. ${q.exp}`;
        playBeep(200, 0.06, 0.12);
    }
    document.getElementById("scoreDisplay").textContent = score;
    nextBtn.className = "quiz-next-btn show";
    nextBtn.textContent =
        currentQ < questions.length - 1
            ? "Pertanyaan Berikutnya →"
            : "Lihat Hasil →";
}

function playBeep(freq, vol, dur) {
    try {
        const ac = new AudioContext();
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g);
        g.connect(ac.destination);
        o.frequency.value = freq;
        g.gain.value = vol;
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        o.stop(ac.currentTime + dur);
    } catch (e) {}
}

function nextQuestion() {
    currentQ++;
    if (currentQ >= questions.length) showResult();
    else loadQuestion();
}

function showResult() {
    document.getElementById("quizGame").style.display = "none";
    const result = document.getElementById("quizResult");
    result.className = "quiz-result show";
    const correct = score / 10;
    const wrong = questions.length - correct;
    const pct = Math.round((correct / questions.length) * 100);
    // Animate ring
    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (pct / 100) * circumference;
    setTimeout(() => {
        document.getElementById("ringFill").style.strokeDashoffset = offset;
    }, 100);
    document.getElementById("resultPct").textContent = pct + "%";
    document.getElementById("rsCorrect").textContent = correct;
    document.getElementById("rsWrong").textContent = wrong;
    document.getElementById("rsScore").textContent = score;
    let title, desc;
    if (pct >= 90) {
        title = "Luar Biasa!";
        desc =
            "Kamu menguasai Cloud Computing dengan sangat baik. Pertahankan terus semangat belajarmu!";
    } else if (pct >= 70) {
        title = "Bagus Sekali!";
        desc =
            "Pemahaman kamu tentang Cloud Computing sudah solid. Terus pelajari konsep yang masih kurang!";
    } else if (pct >= 50) {
        title = "Cukup Baik!";
        desc =
            "Kamu sudah memahami dasar-dasarnya. Pelajari kembali materi di atas, terutama model layanan dan deployment.";
    } else {
        title = "Jangan Menyerah!";
        desc =
            "Baca kembali materi penjelasan di atas dan coba lagi. Kamu pasti bisa mendapat nilai lebih baik!";
    }
    document.getElementById("resultTitle").textContent = title;
    document.getElementById("resultDesc").textContent = desc;
    document.getElementById("progressFill").style.width = "100%";
    document.getElementById("qProgress").textContent = "Kuis Selesai!";
}

function restartQuiz() {
    currentQ = 0;
    score = 0;
    document.getElementById("quizGame").style.display = "block";
    document.getElementById("quizResult").className = "quiz-result";
    document.getElementById("ringFill").style.strokeDashoffset = 376;
    loadQuestion();
}

loadQuestion();

const audio = document.getElementById("myAudio");
const audioDot = document.getElementById("audioDot");
const audioWaves = document.getElementById("audioWaves");
const audioLbl = document.getElementById("audioLbl");

function toggleAudio() {
    if (audio.paused) {
        // Memutar Audio
        audio.play().catch((error) => {
            console.log("Autoplay dicegah oleh browser, butuh interaksi user.");
        });

        // Update Visual UI
        audioDot.classList.remove("off");
        audioWaves.classList.remove("paused");
        audioLbl.textContent = "Berhenti";
    } else {
        // Menghentikan Audio
        audio.pause();

        // Update Visual UI
        audioDot.classList.add("off");
        audioWaves.classList.add("paused");
        audioLbl.textContent = "Putar";
    }
}
