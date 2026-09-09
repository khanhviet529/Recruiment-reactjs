const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Create Express app
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add body parser for JSON
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Waiting Candidates API Endpoints (BEFORE json-server)
app.post('/meetings/:meetingId/waiting-candidates', (req, res) => {
  const { meetingId } = req.params;
  const candidateData = req.body;
  
  const dbPath = path.join(__dirname, 'database.json');
  let db;
  
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
  
  // Initialize waitingCandidates if it doesn't exist
  if (!db.waitingCandidates) {
    db.waitingCandidates = [];
  }
  
  // Check if candidate already exists for this meeting
  const existingIndex = db.waitingCandidates.findIndex(
    c => c.meetingId === meetingId && c.candidateId === candidateData.candidateId
  );
  
  if (existingIndex !== -1) {
    // Update existing candidate
    db.waitingCandidates[existingIndex] = {
      ...db.waitingCandidates[existingIndex],
      ...candidateData,
      meetingId,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new candidate
    const newCandidate = {
      id: Date.now().toString(),
      meetingId,
      ...candidateData,
      createdAt: new Date().toISOString()
    };
    db.waitingCandidates.push(newCandidate);
  }
  
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.json({ success: true, message: 'Candidate registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

app.get('/meetings/:meetingId/waiting-candidates', (req, res) => {
  const { meetingId } = req.params;
  
  const dbPath = path.join(__dirname, 'database.json');
  let db;
  
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
  
  if (!db.waitingCandidates) {
    return res.json([]);
  }
  
  const candidates = db.waitingCandidates.filter(c => c.meetingId === meetingId);
  res.json(candidates);
});

app.get('/meetings/:meetingId/waiting-candidates/:candidateId', (req, res) => {
  const { meetingId, candidateId } = req.params;
  
  const dbPath = path.join(__dirname, 'database.json');
  let db;
  
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
  
  if (!db.waitingCandidates) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  const candidate = db.waitingCandidates.find(
    c => c.meetingId === meetingId && c.candidateId === candidateId
  );
  
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  res.json(candidate);
});

app.patch('/meetings/:meetingId/waiting-candidates/:candidateId', (req, res) => {
  const { meetingId, candidateId } = req.params;
  const updateData = req.body;
  
  const dbPath = path.join(__dirname, 'database.json');
  let db;
  
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
  
  if (!db.waitingCandidates) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  const candidateIndex = db.waitingCandidates.findIndex(
    c => c.meetingId === meetingId && c.candidateId === candidateId
  );
  
  if (candidateIndex === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  // Update candidate
  db.waitingCandidates[candidateIndex] = {
    ...db.waitingCandidates[candidateIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.json(db.waitingCandidates[candidateIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

app.delete('/meetings/:meetingId/waiting-candidates/:candidateId', (req, res) => {
  const { meetingId, candidateId } = req.params;
  
  const dbPath = path.join(__dirname, 'database.json');
  let db;
  
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
  
  if (!db.waitingCandidates) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  const candidateIndex = db.waitingCandidates.findIndex(
    c => c.meetingId === meetingId && c.candidateId === candidateId
  );
  
  if (candidateIndex === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  // Remove candidate
  db.waitingCandidates.splice(candidateIndex, 1);
  
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.json({ success: true, message: 'Candidate removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

// Handle avatar upload for candidates
app.patch('/candidates/:id', upload.single('avatar'), (req, res) => {
  const candidateId = req.params.id;
  
  // Read the database
  const dbPath = path.join(__dirname, 'database.json');
  let db;
  
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
  
  // Find the candidate
  const candidateIndex = db.candidates.findIndex(c => c.id == candidateId);
  
  if (candidateIndex === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  let candidate = db.candidates[candidateIndex];
  
  // If file was uploaded, update avatar
  if (req.file) {
    // Delete old avatar file if it exists
    if (candidate.avatar && candidate.avatar.startsWith('http://localhost:5000/uploads/')) {
      const oldFilename = candidate.avatar.split('/').pop();
      const oldFilePath = path.join(uploadsDir, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Set new avatar URL
    candidate.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
  }
  
  // Update other fields if provided in body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (key !== 'avatar') { // Don't override avatar if file was uploaded
        candidate[key] = req.body[key];
      }
    });
  }
  
  // Save back to database
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

// Use json-server for other routes
const router = jsonServer.router('database.json');
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Uploads will be served from: http://localhost:${PORT}/uploads/`);
}); 