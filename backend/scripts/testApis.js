const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

// Helper for making HTTP requests in native Node
function request(baseUrl, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('   Running FoodFlow Backend API Integration Tests');
  console.log('======================================================\n');

  let server;
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} - ${details}`);
      failedCount++;
    }
  }

  try {
    // Start temporary test server
    server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Test 1: Customer registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request(baseUrl, 'POST', '/api/auth/register', {
      name: 'Test Customer',
      email: testEmail,
      password: 'password123'
    });
    assert(
      regRes.status === 201 && regRes.data.token && regRes.data.user.email === testEmail,
      '1. Customer registration (/api/auth/register)',
      `Status: ${regRes.status}, Body: ${JSON.stringify(regRes.data)}`
    );
    const customerToken = regRes.data.token;

    // Test 2: Customer login
    const loginRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: testEmail,
      password: 'password123'
    });
    assert(
      loginRes.status === 200 && loginRes.data.token && loginRes.data.user.name === 'Test Customer',
      '2. Customer login (/api/auth/login)',
      `Status: ${loginRes.status}`
    );

    // Test 3: Invalid login
    const invalidLoginRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: testEmail,
      password: 'wrong_password'
    });
    assert(
      invalidLoginRes.status === 401 && invalidLoginRes.data.success === false,
      '3. Invalid login handling (wrong password returns 401)',
      `Status: ${invalidLoginRes.status}`
    );

    // Test 4: Restaurant listing
    const restRes = await request(baseUrl, 'GET', '/api/restaurants');
    assert(
      restRes.status === 200 && Array.isArray(restRes.data) && restRes.data.length >= 1,
      '4. Restaurant listing (/api/restaurants)',
      `Found ${Array.isArray(restRes.data) ? restRes.data.length : 0} restaurants`
    );

    const firstRest = restRes.data[0];
    const restId = firstRest ? firstRest.id : 1;

    // Test 5: Restaurant details
    const restDetailRes = await request(baseUrl, 'GET', `/api/restaurants/${restId}`);
    assert(
      restDetailRes.status === 200 && restDetailRes.data.id === restId && restDetailRes.data.name,
      `5. Restaurant details (/api/restaurants/${restId})`,
      `Status: ${restDetailRes.status}`
    );

    // Test 6: Menu listing
    const menuRes = await request(baseUrl, 'GET', `/api/restaurants/${restId}/menu`);
    assert(
      menuRes.status === 200 && Array.isArray(menuRes.data) && menuRes.data.length >= 1,
      `6. Menu listing (/api/restaurants/${restId}/menu)`,
      `Found ${Array.isArray(menuRes.data) ? menuRes.data.length : 0} items`
    );

    const firstMenuItem = menuRes.data[0];

    // Test 7: Order creation (calculate total from DB + 50 delivery fee)
    const orderPayload = {
      restaurantId: restId,
      items: [
        { id: firstMenuItem.id, quantity: 2 }
      ],
      address: '123 Test Street, Mumbai 400001'
    };

    const orderRes = await request(baseUrl, 'POST', '/api/orders', orderPayload, {
      Authorization: `Bearer ${customerToken}`
    });

    const expectedTotal = (firstMenuItem.price * 2) + 50;
    assert(
      orderRes.status === 201 &&
      orderRes.data.order &&
      orderRes.data.order.total === expectedTotal &&
      orderRes.data.order.status === 'PLACED',
      '7. Order creation with backend total calculation and DB transaction (/api/orders)',
      `Status: ${orderRes.status}, Total: ${orderRes.data?.order?.total}, Expected: ${expectedTotal}`
    );

    const createdOrderId = orderRes.data?.order?.id;

    // Test 8: Customer order history
    const orderHistoryRes = await request(baseUrl, 'GET', '/api/orders', null, {
      Authorization: `Bearer ${customerToken}`
    });
    assert(
      orderHistoryRes.status === 200 &&
      Array.isArray(orderHistoryRes.data) &&
      orderHistoryRes.data.some(o => o.id === createdOrderId),
      '8. Customer order history (/api/orders)',
      `Status: ${orderHistoryRes.status}`
    );

    // Test 9: Specific order details
    const orderDetailRes = await request(baseUrl, 'GET', `/api/orders/${createdOrderId}`, null, {
      Authorization: `Bearer ${customerToken}`
    });
    assert(
      orderDetailRes.status === 200 &&
      orderDetailRes.data.id === createdOrderId &&
      orderDetailRes.data.items.length === 1,
      `9. Order details (/api/orders/${createdOrderId})`,
      `Status: ${orderDetailRes.status}`
    );

    // Test 10: Unauthorized request (missing token)
    const unauthRes = await request(baseUrl, 'GET', '/api/orders');
    assert(
      unauthRes.status === 401 && unauthRes.data.success === false,
      '10. Unauthorized request rejected with 401 (/api/orders without token)',
      `Status: ${unauthRes.status}`
    );

    // Login as seeded admin for order status update test
    const adminLoginRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: 'admin@foodflow.com',
      password: 'Admin@123'
    });
    const adminToken = adminLoginRes.data?.token;

    // Test 11: Restaurant/admin order status update
    const statusUpdateRes = await request(
      baseUrl,
      'PUT',
      `/api/orders/${createdOrderId}/status`,
      { status: 'ACCEPTED' },
      { Authorization: `Bearer ${adminToken}` }
    );
    assert(
      statusUpdateRes.status === 200 && statusUpdateRes.data.status === 'ACCEPTED',
      `11. Admin order status update to ACCEPTED (/api/orders/${createdOrderId}/status)`,
      `Status: ${statusUpdateRes.status}`
    );

    console.log('\n------------------------------------------------------');
    console.log(`Test Summary: Passed: ${passedCount} / Total: ${passedCount + failedCount}`);
    console.log('------------------------------------------------------\n');

    if (failedCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    // Close pool so process exits cleanly
    await pool.end();
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
