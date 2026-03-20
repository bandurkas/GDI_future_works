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

        const data = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `all!A1:J100`,
        });

        console.log("Values length:", data.data.values ? data.data.values.length : 0);
        console.log("Values:", JSON.stringify(data.data.values, null, 2));
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
