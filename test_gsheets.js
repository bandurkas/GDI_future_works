require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });
const { google } = require('googleapis');

async function run() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetName = meta.data.sheets[0].properties.title;
        console.log("Sheet Name we will write to:", sheetName);

        const append = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:A`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [['2025-01-01','12:00','TEST-LOCAL','Alice','123','TEST','100','✅ Paid','TEST']] },
        });
        
        console.log("Append result:", JSON.stringify(append.data));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}
run();
