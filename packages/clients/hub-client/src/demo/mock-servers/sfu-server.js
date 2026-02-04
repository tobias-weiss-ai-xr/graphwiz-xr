/**
 * Mock SFU Server for Testing
 *
 * Simulates the WebRTC SFU service for development/testing.
 */
import http from 'http';
const PORT = 8014;
const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    const url = new URL(req.url || '', `http://localhost:${PORT}`);
    // Health check
    if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }
    // Mock WebRTC signaling endpoint
    if (url.pathname === '/signal' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('[SFU] Received signal:', data.type);
                // Mock SDP response
                if (data.type === 'offer') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        type: 'answer',
                        sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n' +
                            's=-\r\nt=0 0\r\n' +
                            'm=audio 9 RTP/AVP 0\r\n' +
                            'a=rtpmap:0 PCMU/8000\r\n' +
                            'a=sendrecv\r\n'
                    }));
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                }
            }
            catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    // Mock participants list
    if (url.pathname === '/participants' && req.method === 'GET') {
        const roomId = url.searchParams.get('room') || 'demo-room';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            roomId,
            participants: [
                { id: 'user-1', displayName: 'Demo User 1' },
                { id: 'user-2', displayName: 'Demo User 2' }
            ]
        }));
        return;
    }
    // 404 for unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});
server.listen(PORT, () => {
    console.log(`Mock SFU Server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  GET  /health          - Health check');
    console.log('  POST /signal          - WebRTC signaling');
    console.log('  GET  /participants    - List participants');
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down mock SFU server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
