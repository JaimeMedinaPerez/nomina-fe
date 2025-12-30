const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body || '{}')));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log('Fetching records...');
        const records = await request({
            hostname: 'localhost',
            port: 3000,
            path: '/attendance/records',
            method: 'GET'
        });

        const today = new Date().toISOString().split('T')[0];
        // Filter for Employee 2 and Today
        const toDelete = records.filter(r => r.empleadoId === 2 && r.fecha.startsWith('2025-12-29'));

        console.log(`Found ${toDelete.length} records to delete.`);

        for (const record of toDelete) {
            console.log(`Deleting ID ${record.id}...`);
            await request({
                hostname: 'localhost',
                port: 3000,
                path: `/attendance/${record.id}`,
                method: 'DELETE'
            });
        }
        console.log('Cleanup complete.');
    } catch (e) {
        console.error(e);
    }
}

run();
