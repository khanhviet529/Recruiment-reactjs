const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, '../Database-main/database.json'));
const middlewares = jsonServer.defaults();
const routes = require('./routes.json');

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(jsonServer.rewriter(routes));

// Add custom routes before JSON Server router

// Custom authentication routes
server.post('/auth/register', (req, res) => {
  const db = router.db;
  const { email, password, name, role } = req.body;

  // Check if user already exists
  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    email,
    password,
    name,
    role,
    isVerified: false,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to database
  db.get('users').push(newUser).write();

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

server.post('/auth/login', (req, res) => {
  const db = router.db;
  const { email, password } = req.body;

  // Find user
  const user = db.get('users').find({ email }).value();

  // Check credentials
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  // Update last login
  db.get('users')
    .find({ id: user.id })
    .assign({ lastLogin: new Date().toISOString() })
    .write();

  // Send response without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token: 'fake-jwt-token' });
});

// Forgot password route
server.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const db = router.db;
  
  // Check if user exists
  const user = db.get('users').find({ email }).value();
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
  }
  
  // In a real app, you would send an email with a reset token
  // For this mock server, just return success message
  res.status(200).json({ message: 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.' });
});

// Reset password route
server.post('/auth/reset-password', (req, res) => {
  const { token, password } = req.body;
  
  // In a real app, you would verify the token and update the user's password
  // For this mock server, just return a success response
  res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công' });
});

// Add Agora token generation endpoint for video calls
server.post('/generate-token', (req, res) => {
  const { channelName, uid, role } = req.body;
  
  // In a real application, this would generate a proper Agora token
  // For mock purposes, return a dummy token
  console.log('Token requested for:', { channelName, uid, role });
  
  // Create a dummy token based on the provided values
  const dummyToken = `agora-token-${channelName}-${uid}-${Date.now()}`;
  
  // Simulate slight delay for a real token service
  setTimeout(() => {
    res.json({ 
      token: dummyToken,
      channelName,
      uid,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // Expires in 1 hour
    });
  }, 200);
});

// Meeting join/leave endpoints to track participants
server.post('/meetings/:id/join', (req, res) => {
  const meetingId = req.params.id;
  const { userId, deviceInfo } = req.body;
  
  console.log(`User ${userId} joined meeting ${meetingId} from ${deviceInfo}`);
  
  // Get the meeting
  const db = router.db;
  const meeting = db.get('meetings').find({ id: meetingId }).value();
  
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }
  
  // Update meeting status to ongoing if it was scheduled
  if (meeting.status === 'scheduled') {
    db.get('meetings')
      .find({ id: meetingId })
      .assign({ 
        status: 'ongoing',
        updatedAt: new Date().toISOString() 
      })
      .write();
  }
  
  // Record the join event
  const joinEvent = {
    id: Date.now().toString(),
    meetingId,
    userId,
    action: 'join',
    deviceInfo,
    timestamp: new Date().toISOString()
  };
  
  db.get('meetingEvents').push(joinEvent).write();
  
  res.status(200).json({ success: true });
});

server.post('/meetings/:id/leave', (req, res) => {
  const meetingId = req.params.id;
  const { userId, reason } = req.body;
  
  console.log(`User ${userId} left meeting ${meetingId}, reason: ${reason}`);
  
  // Record the leave event
  const db = router.db;
  const leaveEvent = {
    id: Date.now().toString(),
    meetingId,
    userId,
    action: 'leave',
    reason,
    timestamp: new Date().toISOString()
  };
  
  db.get('meetingEvents').push(leaveEvent).write();
  
  // Check if all participants have left
  const joinEvents = db.get('meetingEvents')
    .filter({ meetingId, action: 'join' })
    .value();
  
  const leaveEvents = db.get('meetingEvents')
    .filter({ meetingId, action: 'leave' })
    .value();
    
  // If everyone has left, mark the meeting as completed
  if (joinEvents.length > 0 && joinEvents.length === leaveEvents.length) {
    db.get('meetings')
      .find({ id: meetingId })
      .assign({ 
        status: 'completed',
        updatedAt: new Date().toISOString() 
      })
      .write();
  }
  
  res.status(200).json({ success: true });
});

// Meeting details endpoint
server.get('/meetings/:id/details', (req, res) => {
  const meetingId = req.params.id;
  const db = router.db;
  
  const meeting = db.get('meetings').find({ id: meetingId }).value();
  
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }
  
  // Get meeting participants
  const participants = meeting.participants || [];
  
  // Check meeting status based on time if not explicitly set
  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  
  let status = meeting.status;
  
  // Always respect time-based logic for meeting status
  // Future meetings should always be scheduled
  if (now < startTime) {
    status = 'scheduled';
  } 
  // Current meetings should be ongoing
  else if (now >= startTime && now <= endTime) {
    status = meeting.status === 'cancelled' ? 'cancelled' : 'ongoing';
  } 
  // Past meetings are completed unless cancelled
  else if (now > endTime) {
    status = meeting.status === 'cancelled' ? 'cancelled' : 'completed';
  }
  
  // Update meeting status if changed
  if (status !== meeting.status) {
    db.get('meetings')
      .find({ id: meetingId })
      .assign({ 
        status,
        updatedAt: new Date().toISOString() 
      })
      .write();
    
    // Update the local meeting object
    meeting.status = status;
  }
  
  res.json({ 
    meeting,
    participants
  });
});

// Custom routes as per rule.md
// Employer routes
server.get('/employers/:id/jobs', (req, res) => {
  const employerId = parseInt(req.params.id);
  const jobs = router.db.get('jobs').filter({ employerId }).value();
  res.json(jobs);
});

// Job applications routes
server.get('/jobs/:id/applications', (req, res) => {
  const jobId = parseInt(req.params.id);
  const applications = router.db.get('applications').filter({ jobId }).value();
  res.json(applications);
});

// Candidate (applicant) routes
server.get('/candidates/:id/applications', (req, res) => {
  const candidateId = parseInt(req.params.id);
  const applications = router.db.get('applications').filter({ candidateId }).value();
  res.json(applications);
});

// Saved Jobs by candidateId
server.get('/candidates/:id/savedJobs', (req, res) => {
  const candidateId = parseInt(req.params.id);
  const savedJobs = router.db.get('savedJobs').filter({ candidateId }).value();
  res.json(savedJobs);
});

// Categories with jobs count
server.get('/categories/with-jobs-count', (req, res) => {
  const categories = router.db.get('categories').value();
  const jobs = router.db.get('jobs').value();
  
  const categoriesWithCount = categories.map(category => {
    const jobsCount = jobs.filter(job => job.categoryId === category.id).length;
    return {
      ...category,
      jobsCount
    };
  });
  
  res.json(categoriesWithCount);
});

// Custom middlewares for timestamps
server.use((req, res, next) => {
  // Add timestamps for create/update operations
  if (req.method === 'POST') {
    req.body.createdAt = new Date().toISOString();
    req.body.updatedAt = new Date().toISOString();
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    req.body.updatedAt = new Date().toISOString();
  }
  next();
});

// Use default router (without /api prefix)
server.use(router);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`JSON Server đang chạy tại http://localhost:${PORT}`);
  console.log('Những endpoint chính:');
  console.log('  GET    /users');
  console.log('  GET    /jobs');
  console.log('  GET    /applications');
  console.log('  GET    /employers');
  console.log('  GET    /candidates');
  console.log('  POST   /auth/register');
  console.log('  POST   /auth/login');
  console.log('  GET    /employers/:id/jobs');
  console.log('  GET    /jobs/:id/applications');
  console.log('  GET    /jobs?_sort=createdAt&_order=desc (để sắp xếp)');
  console.log('  GET    /jobs?title_like=developer (tìm kiếm)');
  console.log('  GET    /jobs?status=active (filter theo trạng thái)');
  console.log('  GET    /jobs?views_gte=100&views_lte=300 (filter theo khoảng)');
}); 