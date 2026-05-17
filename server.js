const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// Upload photo endpoint
app.post('/api/upload-photo', (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image data' });

    // Remove data URL prefix (e.g. "data:image/png;base64,")
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imgDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    fs.writeFileSync(path.join(imgDir, 'profile.png'), base64Data, 'base64');
    res.json({ success: true });
});

// Upload page
app.get('/upload', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Upload Profile Photo</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a1120;color:#f0f4f8;display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{background:rgba(15,30,56,0.6);border:2px dashed rgba(34,124,242,0.3);border-radius:20px;padding:60px 40px;text-align:center;max-width:480px;width:90%;cursor:pointer;transition:all .3s}
.box:hover,.box.drag{border-color:#57B7F2;background:rgba(34,124,242,0.08)}
h1{font-size:1.5rem;margin-bottom:8px;color:#57B7F2}
p{color:rgba(200,215,235,0.55);font-size:.9rem;margin-bottom:24px}
input[type=file]{display:none}
.btn{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#227CF2,#57B7F2);color:#fff;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;margin-top:12px}
.preview{max-width:200px;border-radius:50%;margin:16px auto;display:none;border:3px solid #227CF2}
.done{color:#4ade80;font-size:1.1rem;font-weight:600;display:none;margin-top:16px}
</style></head>
<body>
<div class="box" id="dropZone">
<h1>Upload Your Profile Photo</h1>
<p>Drag & drop your photo here, or click to browse</p>
<img class="preview" id="preview">
<input type="file" id="fileInput" accept="image/*">
<button class="btn" onclick="document.getElementById('fileInput').click()">Choose Photo</button>
<div class="done" id="done">✓ Photo saved! <a href="/" style="color:#57B7F2">Go to portfolio →</a></div>
</div>
<script>
const drop=document.getElementById('dropZone'),input=document.getElementById('fileInput'),preview=document.getElementById('preview'),done=document.getElementById('done');
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag')});
drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0])});
input.addEventListener('change',e=>{if(e.target.files[0])handleFile(e.target.files[0])});
function handleFile(file){
  const reader=new FileReader();
  reader.onload=async e=>{
    preview.src=e.target.result;preview.style.display='block';
    const res=await fetch('/api/upload-photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:e.target.result})});
    if(res.ok){done.style.display='block'}
  };
  reader.readAsDataURL(file);
}
</script></body></html>`);
});

// Contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('New contact submission:', { name, email, message });
    res.json({ success: true, message: 'Thank you for reaching out!' });
});

// Serve portfolio
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only listen locally — Vercel handles this in production
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Portfolio running at http://localhost:${PORT}`);
        console.log(`Upload your photo at http://localhost:${PORT}/upload`);
    });
}

module.exports = app;
