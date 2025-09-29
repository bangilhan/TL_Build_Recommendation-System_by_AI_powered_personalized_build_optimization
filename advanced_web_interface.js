const express = require('express');
const path = require('path');
const PoCLLMService = require('./poc_llm_service');
const AdvancedEquipmentAnalyzer = require('./advanced_equipment_analyzer');

class AdvancedWebInterface {
    constructor(port = 3001) {
        this.app = express();
        this.port = port;
        this.llmService = new PoCLLMService();
        this.advancedAnalyzer = new AdvancedEquipmentAnalyzer();
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
            res.send(this.getAdvancedMainPageHTML());
        });

        // 기본 추천 API
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

        // 고급 추천 API
        this.app.post('/api/advanced-recommend', async (req, res) => {
            try {
                const { userInput } = req.body;
                
                if (!userInput || userInput.trim() === '') {
                    return res.json({
                        success: false,
                        error: '사용자 입력이 필요합니다.'
                    });
                }

                const result = await this.advancedAnalyzer.generateAdvancedRecommendation(userInput.trim());
                res.json(result);
                
            } catch (error) {
                console.error('고급 API 오류:', error.message);
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
    }

    getAdvancedMainPageHTML() {
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TL 고급 마스터리 빌드 추천 시스템</title>
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
            max-width: 1400px;
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

        .mode-selector {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
        }

        .mode-btn {
            background: white;
            border: 2px solid #ddd;
            padding: 15px 30px;
            margin: 0 10px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
        }

        .mode-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
        }

        .mode-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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

        .mode-description {
            background: #e9ecef;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 1.1em;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 TL 고급 마스터리 빌드 추천 시스템</h1>
            <p>AI가 당신의 현재 장비 상황을 분석하여 최적의 빌드를 추천해드립니다</p>
        </div>

        <div class="main-content">
            <div class="mode-selector">
                <div class="mode-btn active" onclick="switchMode('basic')">기본 추천</div>
                <div class="mode-btn" onclick="switchMode('advanced')">고급 분석</div>
            </div>

            <div id="modeDescription" class="mode-description">
                <strong>기본 추천 모드:</strong> 상황에 맞는 일반적인 빌드 추천을 제공합니다. "보스 레이드에서 딜러 하고 싶어"와 같은 간단한 요청에 적합합니다.
            </div>

            <div class="input-section">
                <div class="input-group">
                    <label for="userInput">어떤 상황에서 플레이하고 싶으신가요?</label>
                    <textarea id="userInput" placeholder="기본 모드: 보스 레이드에서 딜러 하고 싶어&#10;고급 모드: 던전 클리어가 너무 어려워, 현재 무기 등급 3인데 공격력이 부족해"></textarea>
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
                <div id="basicExamples">
                    <div class="example-item" onclick="setExample('보스 레이드에서 딜러 하고 싶어')">
                        "보스 레이드에서 딜러 하고 싶어"
                    </div>
                    <div class="example-item" onclick="setExample('PvP 1vs1에서 이기고 싶어')">
                        "PvP 1vs1에서 이기고 싶어"
                    </div>
                    <div class="example-item" onclick="setExample('탱커로 플레이하고 싶어')">
                        "탱커로 플레이하고 싶어"
                    </div>
                </div>
                <div id="advancedExamples" style="display: none;">
                    <div class="example-item" onclick="setExample('던전 클리어가 너무 어려워, 현재 무기 등급 3인데 공격력이 부족해')">
                        "던전 클리어가 너무 어려워, 현재 무기 등급 3인데 공격력이 부족해"
                    </div>
                    <div class="example-item" onclick="setExample('PvP에서 자꾸 죽어, 방어구 등급 4인데 생존이 안돼')">
                        "PvP에서 자꾸 죽어, 방어구 등급 4인데 생존이 안돼"
                    </div>
                    <div class="example-item" onclick="setExample('마나가 부족해서 스킬을 못써, 장신구 등급 3인데 마나 문제야')">
                        "마나가 부족해서 스킬을 못써, 장신구 등급 3인데 마나 문제야"
                    </div>
                    <div class="example-item" onclick="setExample('보스 레이드에서 딜링이 부족해, 무기 등급 5인데 치명타가 낮아')">
                        "보스 레이드에서 딜링이 부족해, 무기 등급 5인데 치명타가 낮아"
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 TL 고급 마스터리 빌드 추천 시스템 - AI 기반 개인화 빌드 추천 시스템</p>
        </div>
    </div>

    <script>
        let currentMode = 'basic';

        function switchMode(mode) {
            currentMode = mode;
            
            // 버튼 상태 업데이트
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // 설명 업데이트
            const description = document.getElementById('modeDescription');
            if (mode === 'basic') {
                description.innerHTML = '<strong>기본 추천 모드:</strong> 상황에 맞는 일반적인 빌드 추천을 제공합니다. "보스 레이드에서 딜러 하고 싶어"와 같은 간단한 요청에 적합합니다.';
                document.getElementById('basicExamples').style.display = 'block';
                document.getElementById('advancedExamples').style.display = 'none';
            } else {
                description.innerHTML = '<strong>고급 분석 모드:</strong> 현재 장비 상황을 분석하여 동일 등급 내에서 최적화된 아이템을 추천합니다. "던전 클리어가 어려워, 무기 등급 3인데 공격력이 부족해"와 같은 구체적인 문제 해결에 적합합니다.';
                document.getElementById('basicExamples').style.display = 'none';
                document.getElementById('advancedExamples').style.display = 'block';
            }
        }

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
                const endpoint = currentMode === 'basic' ? '/api/recommend' : '/api/advanced-recommend';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userInput })
                });

                const result = await response.json();

                if (result.success) {
                    if (currentMode === 'basic') {
                        displayBasicResult(result);
                    } else {
                        displayAdvancedResult(result);
                    }
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

        function displayBasicResult(result) {
            const resultCard = document.getElementById('resultCard');
            resultCard.innerHTML = \`
                <div class="success">
                    <h2>✅ 기본 추천 완료!</h2>
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
        }

        function displayAdvancedResult(result) {
            const resultCard = document.getElementById('resultCard');
            resultCard.innerHTML = \`
                <div class="success">
                    <h2>✅ 고급 분석 완료!</h2>
                    <p><strong>문제점:</strong> \${result.currentEquipment.problem.join(', ')}</p>
                    <p><strong>난이도:</strong> \${result.currentEquipment.difficulty}</p>
                    <p><strong>현재 장비:</strong> 무기 등급 \${result.currentEquipment.weapon || '미지정'}, 방어구 등급 \${result.currentEquipment.armor || '미지정'}</p>
                    <p><strong>총 비용:</strong> \${result.totalCost.toLocaleString()} 골드</p>
                </div>
                
                <div class="recommendation">
                    \${result.explanation}
                </div>
                
                <div class="item-grid">
                    \${result.recommendations.map(item => \`
                        <div class="item-card">
                            <div class="item-name">\${item.item_name}</div>
                            <div class="item-stats">\${item.base_stats}</div>
                            <div class="item-cost">\${item.cost.toLocaleString()} 골드</div>
                            <div style="margin-top: 10px; color: #666; font-size: 0.9em;">\${item.description}</div>
                            <div style="margin-top: 10px; color: #e74c3c; font-weight: 600;">개선 효과: \${item.improvement}점 향상</div>
                        </div>
                    \`).join('')}
                </div>
            \`;
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
            // 서비스들 연결
            await this.llmService.connect();
            await this.advancedAnalyzer.connect();
            console.log('모든 서비스 연결 완료');

            // 서버 시작
            this.app.listen(this.port, () => {
                console.log(`🚀 고급 PoC 웹 인터페이스가 http://localhost:${this.port} 에서 실행 중입니다!`);
                console.log('브라우저에서 위 주소로 접속하여 테스트해보세요.');
                console.log('기본 추천과 고급 분석 두 가지 모드를 모두 사용할 수 있습니다.');
            });

        } catch (error) {
            console.error('서버 시작 오류:', error.message);
        }
    }

    async stop() {
        try {
            await this.llmService.close();
            await this.advancedAnalyzer.close();
            console.log('서버가 종료되었습니다.');
        } catch (error) {
            console.error('서버 종료 오류:', error.message);
        }
    }
}

// 서버 시작
const webInterface = new AdvancedWebInterface(3001);
webInterface.start();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n서버를 종료합니다...');
    await webInterface.stop();
    process.exit(0);
});

module.exports = AdvancedWebInterface;
