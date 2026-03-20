const fs = require('fs');
const path = require('path');

const GHOST_TERMS = [
    "'super_admin'",
    '"super_admin"',
    "'account_manager'",
    '"account_manager"',
    "'video_manager'",
    '"video_manager"',
    '"OWNER"',
    '"ADMIN"',
    '"INSTRUCTOR"',
    'Master Password',
    'ADMIN_PASSWORD'
];

const DIRECTORIES_TO_SCAN = ['src', 'app', 'components', 'lib']; // Update based on Next.js structure

let ghostsFound = 0;

function scanFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.next') || filePath.endsWith('.png') || filePath.endsWith('.jpg')) return;

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            GHOST_TERMS.forEach(term => {
                if (line.includes(term)) {
                    // Ignore this script itself
                    if (filePath.includes('ghost_hunter.js')) return;
                    
                    console.error(`👻 GHOST FOUND in ${filePath}:${index + 1}`);
                    console.error(`   -> ${line.trim()}`);
                    console.error(`   (Matched term: ${term})\n`);
                    ghostsFound++;
                }
            });
        });
    } catch (e) {
        // Skip files that can't be read as utf8 (e.g. binaries)
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (stat.isFile()) {
            scanFile(fullPath);
        }
    }
}

console.log('🕵️‍♂️ Starting Ghost Hunt for legacy variables and roles...');

DIRECTORIES_TO_SCAN.forEach(dir => {
    // Check if running directly in the root or inside src
    const targetPath = fs.existsSync(dir) ? dir : (fs.existsSync('src/' + dir) ? 'src/' + dir : null);
    if (targetPath) {
        walkDir(targetPath);
    }
});

if (ghostsFound > 0) {
    console.error(`\n🚨 Ghost Hunt Failed! Found ${ghostsFound} trailing ghosts that need to be exorcised.`);
    process.exit(1);
} else {
    console.log('\n✅ Codebase is clean! No ghosts found.');
    process.exit(0);
}
