const express = require('express');
const path = require('path');
const PoCLLMService = require('./poc_llm_service');

class PoCWebInterface {
    constructor(port = 3000) {
        this.app = express();
        this.port = port;
        this.llmService = new PoCLLMService();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // 정적 파일 서빙
        this.app.use(express.static('public'));
        
        // JSON 파싱
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS 설정
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    setupRoutes() {
        // 메인 페이지
        this.app.get('/', (req, res) => {
            res.send(this.getMainPageHTML());
        });

        // 추천 API
        this.app.post('/api/recommend', async (req, res) => {
            try {
                const { userInput } = req.body;
                
                if (!userInput || userInput.trim() === '') {
                    return res.json({
                        success: false,
                        error: '사용자 입력이 필요합니다.'
                    });
                }

                const result = await this.llmService.getRecommendation(userInput.trim());
                res.json(result);
                
            } catch (error) {
                console.error('API 오류:', error.message);
                res.json({
                    success: false,
                    error: '서버 오류가 발생했습니다.'
                });
            }
        });

        // 상황 목록 API
        this.app.get('/api/situations', async (req, res) => {
            try {
                const situations = await this.llmService.getSituations();
                res.json({ success: true, situations });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // 아이템 목록 API
        this.app.get('/api/items', async (req, res) => {
            try {
                const items = await this.llmService.getItems();
                res.json({ success: true, items });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // 쿼리 로그 API
        this.app.get('/api/logs', async (req, res) => {
            try {
                const logs = await this.llmService.getQueryLogs();
                res.json({ success: true, logs });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });
    }

    getMainPageHTML() {
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TL 마스터리 빌드 추천 PoC</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #f39c12, #e74c3c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .main-content {
            padding: 40px;
        }

        .input-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #e9ecef;
        }

        .input-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.1em;
        }

        input[type="text"], textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 1.1em;
            transition: border-color 0.3s ease;
        }

        input[type="text"]:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .result-section {
            margin-top: 30px;
        }

        .result-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 2px solid #e9ecef;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #667eea;
            font-size: 1.2em;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: #fee;
            color: #c33;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #fcc;
        }

        .success {
            background: #efe;
            color: #363;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #cfc;
        }

        .recommendation {
            white-space: pre-line;
            line-height: 1.6;
            font-size: 1.1em;
        }

        .item-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .item-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border: 2px solid #e9ecef;
        }

        .item-name {
            font-size: 1.3em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .item-stats {
            color: #667eea;
            font-weight: 500;
            margin-bottom: 10px;
        }

        .item-cost {
            color: #e74c3c;
            font-weight: 600;
        }

        .examples {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
        }

        .examples h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.3em;
        }

        .example-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .example-item:hover {
            background: #e9ecef;
        }

        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 TL 마스터리 빌드 추천 PoC</h1>
            <p>AI가 당신의 상황에 맞는 최적의 빌드를 추천해드립니다</p>
        </div>

        <div class="main-content">
            <div class="input-section">
                <div class="input-group">
                    <label for="userInput">어떤 상황에서 플레이하고 싶으신가요?</label>
                    <textarea id="userInput" placeholder="예: 보스 레이드에서 딜러 하고 싶어, PvP 1vs1에서 이기고 싶어, 탱커로 플레이하고 싶어..."></textarea>
                </div>
                <button class="btn" onclick="getRecommendation()">🚀 빌드 추천 받기</button>
            </div>

            <div class="result-section" id="resultSection" style="display: none;">
                <div class="result-card" id="resultCard">
                    <!-- 결과가 여기에 표시됩니다 -->
                </div>
            </div>

            <div class="examples">
                <h3>💡 추천 질문 예시</h3>
                <div class="example-item" onclick="setExample('보스 레이드에서 딜러 하고 싶어')">
                    "보스 레이드에서 딜러 하고 싶어"
                </div>
                <div class="example-item" onclick="setExample('PvP 1vs1에서 이기고 싶어')">
                    "PvP 1vs1에서 이기고 싶어"
                </div>
                <div class="example-item" onclick="setExample('탱커로 플레이하고 싶어')">
                    "탱커로 플레이하고 싶어"
                </div>
                <div class="example-item" onclick="setExample('던전 클리어용 빌드 추천해줘')">
                    "던전 클리어용 빌드 추천해줘"
                </div>
                <div class="example-item" onclick="setExample('사냥터 파밍 효율적으로 하고 싶어')">
                    "사냥터 파밍 효율적으로 하고 싶어"
                </div>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 TL 마스터리 빌드 추천 PoC - AI 기반 개인화 빌드 추천 시스템</p>
        </div>
    </div>

    <script>
        function setExample(text) {
            document.getElementById('userInput').value = text;
        }

        async function getRecommendation() {
            const userInput = document.getElementById('userInput').value.trim();
            const resultSection = document.getElementById('resultSection');
            const resultCard = document.getElementById('resultCard');
            const btn = document.querySelector('.btn');

            if (!userInput) {
                alert('상황을 입력해주세요!');
                return;
            }

            // 로딩 상태
            btn.disabled = true;
            btn.textContent = '🔄 추천 생성 중...';
            resultSection.style.display = 'block';
            resultCard.innerHTML = \`
                <div class="loading">
                    <div class="spinner"></div>
                    AI가 당신의 상황을 분석하고 최적의 빌드를 추천하고 있습니다...
                </div>
            \`;

            try {
                const response = await fetch('/api/recommend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userInput })
                });

                const result = await response.json();

                if (result.success) {
                    resultCard.innerHTML = \`
                        <div class="success">
                            <h2>✅ 추천 완료!</h2>
                            <p><strong>상황:</strong> \${result.situation.situation_name}</p>
                            <p><strong>빌드 타입:</strong> \${result.situation.build_type.toUpperCase()}</p>
                            <p><strong>난이도:</strong> \${result.situation.difficulty}</p>
                            <p><strong>총 비용:</strong> \${result.totalCost.toLocaleString()} 골드</p>
                        </div>
                        
                        <div class="recommendation">
                            \${result.explanation}
                        </div>
                        
                        <div class="item-grid">
                            \${result.items.map(item => \`
                                <div class="item-card">
                                    <div class="item-name">\${item.item_name}</div>
                                    <div class="item-stats">\${item.base_stats}</div>
                                    <div class="item-cost">\${item.cost.toLocaleString()} 골드</div>
                                    <div style="margin-top: 10px; color: #666; font-size: 0.9em;">\${item.description}</div>
                                </div>
                            \`).join('')}
                        </div>
                    \`;
                } else {
                    resultCard.innerHTML = \`
                        <div class="error">
                            <h3>❌ 오류 발생</h3>
                            <p>\${result.error}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                resultCard.innerHTML = \`
                    <div class="error">
                        <h3>❌ 네트워크 오류</h3>
                        <p>서버와의 통신 중 오류가 발생했습니다. 다시 시도해주세요.</p>
                    </div>
                \`;
            } finally {
                btn.disabled = false;
                btn.textContent = '🚀 빌드 추천 받기';
            }
        }

        // Enter 키로 추천 받기
        document.getElementById('userInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                getRecommendation();
            }
        });
    </script>
</body>
</html>
        `;
    }

    async start() {
        try {
            // LLM 서비스 연결
            await this.llmService.connect();
            console.log('LLM 서비스 연결 완료');

            // 서버 시작
            this.app.listen(this.port, () => {
                console.log(`🚀 PoC 웹 인터페이스가 http://localhost:${this.port} 에서 실행 중입니다!`);
                console.log('브라우저에서 위 주소로 접속하여 테스트해보세요.');
            });

        } catch (error) {
            console.error('서버 시작 오류:', error.message);
        }
    }

    async stop() {
        try {
            await this.llmService.close();
            console.log('서버가 종료되었습니다.');
        } catch (error) {
            console.error('서버 종료 오류:', error.message);
        }
    }
}

// 서버 시작
const webInterface = new PoCWebInterface(3000);
webInterface.start();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n서버를 종료합니다...');
    await webInterface.stop();
    process.exit(0);
});

module.exports = PoCWebInterface;
