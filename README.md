const USER_SHEET = 'USER DETAILS'; // Your users tab name
const STATS_SHEET = 'admins d...'; // Change to your stats tab name

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'signup') return handleSignup(data);
    if (data.action === 'login') return handleLogin(data);
    if (data.action === 'logout') return handleLogout(data);

    return jsonResponse('error', 'Invalid action');
  } catch (err) {
    return jsonResponse('error', 'Server error: ' + err.message);
  }
}

function handleSignup(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USER_SHEET);
  const users = sheet.getDataRange().getValues();
  const headers = users[0];

  const userNameCol = headers.indexOf('userName');
  const gmailCol = headers.indexOf('GMAIL');
  const telCol = headers.indexOf('TEL');

  // Check duplicates
  for (let i = 1; i < users.length; i++) {
    if (users[i][userNameCol] === data.username) {
      return jsonResponse('error', 'Username already taken');
    }
    if (users[i][gmailCol] === data.gmail) {
      return jsonResponse('error', 'Gmail already registered');
    }
    if (users[i][telCol] === data.tel) {
      return jsonResponse('error', 'Phone number already registered');
    }
  }

  // Append: TIMESTAMP | FIRST NAME | SECOND NAME | TEL | DOB | GENDER | GMAIL | userName | PASSWORD | ROLE | DISTRICT | BALANCE | ONLINE STATUS
  sheet.appendRow([
    new Date(), // TIMESTAMP
    data.firstName,
    data.secondName,
    data.tel,
    data.dob,
    data.gender,