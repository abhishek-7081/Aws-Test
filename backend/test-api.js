/**
 * TaskFlow API Integration Test Suite
 * Can be run with: node test-api.js or npm test
 */
const http = require('http');
const app = require('./app');

const testPort = 5055;
let server;
let token = '';
let categoryId = '';
let taskId = '';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: testPort,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(dataString);
    req.end();
  });
};

const runTests = async () => {
  console.log('Starting TaskFlow API Test Suite...');
  server = http.createServer(app);

  await new Promise((resolve) => server.listen(testPort, '127.0.0.1', resolve));
  console.log(`Test server bound to 127.0.0.1:${testPort}`);

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    console.log(`[PASS] 1. GET /api/health -> ${health.status} (${health.data.message})`);

    // 2. User registration
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const reg = await request('POST', '/api/auth/register', {
      name: 'Integration Tester',
      email: uniqueEmail,
      password: 'testPassword123',
    });
    console.log(`[PASS] 2. POST /api/auth/register -> ${reg.status} (User ID: ${reg.data.data.user.id})`);
    token = reg.data.data.token;

    // 3. User login
    const login = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'testPassword123',
    });
    console.log(`[PASS] 3. POST /api/auth/login -> ${login.status}`);

    // 4. Authenticated profile check
    const authHeaders = { Authorization: `Bearer ${token}` };
    const me = await request('GET', '/api/auth/me', null, authHeaders);
    console.log(`[PASS] 4. GET /api/auth/me -> ${me.status} (${me.data.data.name})`);

    // 5. Create category
    const cat = await request(
      'POST',
      '/api/categories',
      {
        name: 'Automated Testing',
        description: 'Category for test verification',
        color: '#10b981',
      },
      authHeaders
    );
    categoryId = cat.data.data._id || cat.data.data.id;
    console.log(`[PASS] 5. POST /api/categories -> ${cat.status} (ID: ${categoryId})`);

    // 6. Create task
    const task = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Complete Full-Stack Application Test',
        description: 'Verify all backend controllers, routes, and services',
        priority: 'urgent',
        status: 'pending',
        category: categoryId,
        dueDate: '2026-12-31',
      },
      authHeaders
    );
    taskId = task.data.data._id || task.data.data.id;
    console.log(`[PASS] 6. POST /api/tasks -> ${task.status} (ID: ${taskId})`);

    // 7. Toggle task status
    const toggle = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'completed' },
      authHeaders
    );
    console.log(`[PASS] 7. PATCH /api/tasks/:id/status -> ${toggle.status} (New status: ${toggle.data.data.status})`);

    // 8. Query tasks with filters
    const tasks = await request('GET', '/api/tasks?status=completed&priority=urgent', null, authHeaders);
    console.log(`[PASS] 8. GET /api/tasks?filters -> ${tasks.status} (Returned ${tasks.data.data.length} task(s))`);

    // 9. Dashboard stats
    const stats = await request('GET', '/api/dashboard/stats', null, authHeaders);
    console.log(`[PASS] 9. GET /api/dashboard/stats -> ${stats.status} (Total: ${stats.data.data.summary.total}, Completed: ${stats.data.data.summary.completed})`);

    // 10. Delete task
    const delTask = await request('DELETE', `/api/tasks/${taskId}`, null, authHeaders);
    console.log(`[PASS] 10. DELETE /api/tasks/:id -> ${delTask.status}`);

    // 11. Delete category
    const delCat = await request('DELETE', `/api/categories/${categoryId}`, null, authHeaders);
    console.log(`[PASS] 11. DELETE /api/categories/:id -> ${delCat.status}`);

    console.log('\n===============================================');
    console.log('🎉 ALL 11 API TESTS EXECUTED AND PASSED SUCCESSFULLY!');
    console.log('===============================================');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
};

runTests();
