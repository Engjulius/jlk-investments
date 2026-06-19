const SHEET_NAME = 'USER DETAILS';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    
    const col = {
      timestamp: headers.indexOf('TIMESTAMP'),
      firstName: headers.indexOf('FIRST NAME'),
      lastName: headers.indexOf('LAST NAME'),
      phone: headers.indexOf('PHONE'),
      dob: headers.indexOf('D.O.B'),
      gender: headers.indexOf('GENDER'),
      email: headers.indexOf('EMAIL'),
      username: headers.indexOf('USERNAME'),
      password: headers.indexOf('PASSWORD'),
      role: headers.indexOf('ROLE'),
      district: headers.indexOf('DISTRICT'),
      balance: headers.indexOf('BALANCE'),
      status: headers.indexOf('ONLINE STATUS')
    };
    
    if (data.action === 'signup') {
      return handleSignup(data, sheet, values, col);
    } else if (data.action === 'login') {
      return handleLogin(data, sheet, values, col);
    }
    
    return jsonResponse({ status: 'error', message: 'Invalid action' });
    
  } catch (err) {
    return jsonResponse({ status: 'error', message: 'Server error: ' + err });
  }
}

function handleSignup(data, sheet, values, col) {
  for (let i = 1; i < values.length; i++) {
    if (values[i][col.username] === data.username) {
      return jsonResponse({ status: 'error', message: 'Username already taken' });
    }
    if (values[i][col.email] === data.email) {
      return jsonResponse({ status: 'error', message: 'Email already registered' });
    }
  }
  
  const hashedPass = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password)
  );
  
  const newRow = [];
  newRow[col.timestamp] = new Date();
  newRow[col.firstName] = data.firstName;
  newRow[col.lastName] = data.lastName;
  newRow[col.phone] = data.phone;
  newRow[col.dob] = data.dob;
  newRow[col.gender] = data.gender;
  newRow[col.email] = data.email;
  newRow[col.username] = data.username;
  newRow[col.password] = hashedPass;
  newRow[col.role] = 'user';
  newRow[col.district] = data.district;
  newRow[col.balance] = 0;
  newRow[col.status] = 'offline';
  
  sheet.appendRow(newRow);
  return jsonResponse({ status: 'success', message: 'Account created' });
}

function handleLogin(data, sheet, values, col) {
  const hashedInput = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password)
  );
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][col.username] === data.username && values[i][col.password] === hashedInput) {
      sheet.getRange(i + 1, col.status + 1).setValue('online');
      
      const user = {
        firstName: values[i][col.firstName],
        lastName: values[i][col.lastName],
        username: values[i][col.username],
        email: values[i][col.email],
        role: values[i][col.role],
        balance: values[i][col.balance],
        district: values[i][col.district]
      };
      
      return jsonResponse({ status: 'success', user: user });
    }
  }
  
  return jsonResponse({ status: 'error', message: 'Invalid username or password' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
  .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
  return ContentService.createTextOutput('')
  .setMimeType(ContentService.MimeType.TEXT);
}

function fixOldPasswords() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('USER DETAILS');
  const data = sheet.getDataRange().getValues();
  const passCol = data[0].indexOf('PASSWORD');
  for(let i = 1; i < data.length; i++) {
    if(data[i][passCol] === 'pass1') {
      const hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'pass1'));
      sheet.getRange(i+1, passCol+1).setValue(hash);
    }
  }
}
