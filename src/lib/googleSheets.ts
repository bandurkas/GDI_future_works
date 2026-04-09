import { google } from 'googleapis';

export async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

export async function appendToLogSheet(rows: string[][]) {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = meta.data.sheets?.[0]?.properties?.title || 'Sheet1';

    const existing = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:A1`,
    });
    
    if (!existing.data.values?.length) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['Date', 'Time', 'Order ID', 'Name', 'WhatsApp', 'Course', 'Amount (IDR)', 'Status', 'Transaction ID']],
            },
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rows },
    });
}

export async function appendToInterestSheet(rows: string[][]) {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    let sheetName = meta.data.sheets?.find(s => s.properties?.title === 'iTTiInterest')?.properties?.title
                 || 'iTTiInterest';

    // If sheet doesn't exist yet, fall back to first sheet until manually created
    const sheetExists = meta.data.sheets?.some(s => s.properties?.title === 'iTTiInterest');
    if (!sheetExists) {
        sheetName = meta.data.sheets?.[0]?.properties?.title || 'Sheet1';
    }

    const existing = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:A1`,
    });

    if (!existing.data.values?.length) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['Date', 'Time', 'Name', 'Email', 'Country', 'Interest', 'Goal', 'Budget']],
            },
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rows },
    });
}

export async function appendToTutorSheet(rows: string[][]) {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_TUTOR_SHEET_ID || process.env.GOOGLE_SHEET_ID; // Use specific sheet if available, else primary
    
    // Check if the sheet "TutorApplications" exists, else use first sheet
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    let sheetName = meta.data.sheets?.find(s => s.properties?.title === 'TutorApplications')?.properties?.title 
                 || meta.data.sheets?.[0]?.properties?.title 
                 || 'Sheet1';

    // Header check specifically for TutorApplications
    const existing = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:A1`,
    });
    
    if (!existing.data.values?.length) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['Date', 'Time', 'Name', 'Email', 'Phone', 'Expertise', 'Bio', 'LinkedIn', 'Video Link', 'Portfolio Link', 'Curriculum', 'Lesson Plan', 'UTM Source', 'UTM Medium', 'UTM Campaign']],
            },
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rows },
    });
}
