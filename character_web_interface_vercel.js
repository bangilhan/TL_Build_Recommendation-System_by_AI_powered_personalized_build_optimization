const express = require('express');
const path = require('path');
const CharacterAPIIntegration = require('./character_api_integration');
const AdvancedEquipmentAnalyzer = require('./advanced_equipment_analyzer');

class CharacterWebInterface {
    constructor(port = process.env.PORT || 3002) {
        this.app = express();
        this.port = port;
        this.characterAPI = new CharacterAPIIntegration();
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
            res.send(this.getCharacterMainPageHTML());
        });

        // 캐릭터 정보 조회 API
        this.app.post('/api/character', async (req, res) => {
            try {
                const { serverName, characterName } = req.body;
                
                if (!serverName || !characterName) {
                    return res.json({
                        success: false,
                        error: '서버명과 캐릭터명이 필요합니다.'
                    });
                }

                const result = await this.characterAPI.fetchCharacterInfo(serverName, characterName);
                res.json(result);
                
            } catch (error) {
                console.error('캐릭터 조회 API 오류:', error.message);
                res.json({
                    success: false,
                    error: '서버 오류가 발생했습니다.'
                });
            }
        });

        // 캐릭터 기반 추천 API
        this.app.post('/api/character-recommend', async (req, res) => {
            try {
                const { characterId, userRequest } = req.body;
                
                if (!characterId || !userRequest) {
                    return res.json({
                        success: false,
                        error: '캐릭터 ID와 요청사항이 필요합니다.'
                    });
                }

                const result = await this.characterAPI.generateCharacterBasedRecommendation(
                    characterId, 
                    userRequest
                );
                res.json(result);
                
            } catch (error) {
                console.error('캐릭터 추천 API 오류:', error.message);
                res.json({
                    success: false,
                    error: '서버 오류가 발생했습니다.'
                });
            }
        });

        // 캐릭터 장비 조회 API
        this.app.get('/api/character/:id/equipment', async (req, res) => {
            try {
                const characterId = req.params.id;
                const equipment = await this.characterAPI.getCharacterEquipment(characterId);
                res.json({ success: true, equipment });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // 캐릭터 스탯 조회 API
        this.app.get('/api/character/:id/stats', async (req, res) => {
            try {
                const characterId = req.params.id;
                const stats = await this.characterAPI.getCharacterStats(characterId);
                res.json({ success: true, stats });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // 헬스 체크 엔드포인트
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
    }

    getCharacterMainPageHTML() {
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TL 캐릭터 연동 빌드 추천 시스템</title>
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

        .character-input-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #e9ecef;
        }

        .input-group {
            margin-bottom: 20px;
        }

        .input-row {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }

        .input-row .input-group {
            flex: 1;
            margin-bottom: 0;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.1em;
        }

        input[type="text"], textarea, select {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 1.1em;
            transition: border-color 0.3s ease;
        }

        input[type="text"]:focus, textarea:focus, select:focus {
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
            margin-right: 10px;
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

        .btn-secondary {
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        }

        .character-info {
            background: #e8f5e8;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border: 2px solid #c3e6c3;
        }

        .character-info h3 {
            color: #27ae60;
            margin-bottom: 15px;
        }

        .character-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        .stat-name {
            font-weight: 600;
            color: #2c3e50;
        }

        .stat-value {
            color: #667eea;
            font-size: 1.2em;
            font-weight: 600;
        }

        .equipment-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .equipment-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            border: 2px solid #e9ecef;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .equipment-slot {
            font-size: 1.2em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .equipment-name {
            color: #667eea;
            font-weight: 500;
            margin-bottom: 5px;
        }

        .equipment-grade {
            color: #e74c3c;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .equipment-stats {
            color: #666;
            font-size: 0.9em;
        }

        .recommendation-section {
            background: #fff3cd;
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
            border: 2px solid #ffeaa7;
        }

        .recommendation-section h3 {
            color: #856404;
            margin-bottom: 20px;
        }

        .recommendation-item {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
        }

        .recommendation-slot {
            font-size: 1.1em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .recommendation-change {
            color: #e74c3c;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .recommendation-improvement {
            color: #27ae60;
            font-weight: 600;
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

        .server-selector {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }

        .server-btn {
            background: white;
            border: 2px solid #ddd;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
        }

        .server-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .server-btn.selected {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 TL 캐릭터 연동 빌드 추천 시스템</h1>
            <p>실제 캐릭터 정보를 연동하여 맞춤형 빌드 추천을 받아보세요</p>
        </div>

        <div class="main-content">
            <div class="character-input-section">
                <h2>📋 캐릭터 정보 입력</h2>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="serverName">서버 선택</label>
                        <div class="server-selector">
                            <div class="server-btn" onclick="selectServer('루시안')">루시안</div>
                            <div class="server-btn" onclick="selectServer('카이젠')">카이젠</div>
                            <div class="server-btn" onclick="selectServer('아르카디아')">아르카디아</div>
                            <div class="server-btn" onclick="selectServer('테스트')">테스트</div>
                        </div>
                        <input type="text" id="serverName" placeholder="서버명을 입력하거나 선택하세요" readonly>
                    </div>
                    
                    <div class="input-group">
                        <label for="characterName">캐릭터명</label>
                        <input type="text" id="characterName" placeholder="캐릭터명을 입력하세요">
                    </div>
                </div>
                
                <button class="btn" onclick="loadCharacter()">🔍 캐릭터 정보 조회</button>
                <button class="btn btn-secondary" onclick="clearCharacter()">🗑️ 초기화</button>
            </div>

            <div id="characterInfo" class="character-info" style="display: none;">
                <h3>👤 캐릭터 정보</h3>
                <div id="characterDetails"></div>
                
                <h3>📊 현재 스탯</h3>
                <div id="characterStats" class="character-stats"></div>
                
                <h3>⚔️ 현재 장비</h3>
                <div id="characterEquipment" class="equipment-grid"></div>
            </div>

            <div class="character-input-section">
                <h2>💬 추천 요청</h2>
                <div class="input-group">
                    <label for="userRequest">어떤 부분을 개선하고 싶으신가요?</label>
                    <textarea id="userRequest" placeholder="예: 던전 클리어가 어려워, 공격력이 부족해&#10;예: PvP에서 자꾸 죽어, 생존이 안돼&#10;예: 마나가 부족해서 스킬을 못써"></textarea>
                </div>
                <button class="btn" onclick="getCharacterRecommendation()">🚀 맞춤형 추천 받기</button>
            </div>

            <div id="recommendationResult" class="recommendation-section" style="display: none;">
                <h3>🎯 맞춤형 추천 결과</h3>
                <div id="recommendationContent"></div>
            </div>

            <div class="examples">
                <h3>💡 추천 요청 예시</h3>
                <div class="example-item" onclick="setRequestExample('던전 클리어가 어려워, 공격력이 부족해')">
                    "던전 클리어가 어려워, 공격력이 부족해"
                </div>
                <div class="example-item" onclick="setRequestExample('PvP에서 자꾸 죽어, 생존이 안돼')">
                    "PvP에서 자꾸 죽어, 생존이 안돼"
                </div>
                <div class="example-item" onclick="setRequestExample('마나가 부족해서 스킬을 못써')">
                    "마나가 부족해서 스킬을 못써"
                </div>
                <div class="example-item" onclick="setRequestExample('보스 레이드에서 딜링이 부족해')">
                    "보스 레이드에서 딜링이 부족해"
                </div>
                <div class="example-item" onclick="setRequestExample('속도가 느려서 움직임이 답답해')">
                    "속도가 느려서 움직임이 답답해"
                </div>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 TL 캐릭터 연동 빌드 추천 시스템 - 실제 게임 데이터 기반 개인화 추천</p>
        </div>
    </div>

    <script>
        let currentCharacterId = null;
        let currentCharacterData = null;

        function selectServer(serverName) {
            document.getElementById('serverName').value = serverName;
            document.querySelectorAll('.server-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            event.target.classList.add('selected');
        }

        async function loadCharacter() {
            const serverName = document.getElementById('serverName').value.trim();
            const characterName = document.getElementById('characterName').value.trim();
            
            if (!serverName || !characterName) {
                alert('서버명과 캐릭터명을 모두 입력해주세요!');
                return;
            }

            const characterInfo = document.getElementById('characterInfo');
            const characterDetails = document.getElementById('characterDetails');
            const characterStats = document.getElementById('characterStats');
            const characterEquipment = document.getElementById('characterEquipment');

            // 로딩 상태
            characterInfo.style.display = 'block';
            characterDetails.innerHTML = '<div class="loading"><div class="spinner"></div>캐릭터 정보를 조회하고 있습니다...</div>';
            characterStats.innerHTML = '';
            characterEquipment.innerHTML = '';

            try {
                const response = await fetch('/api/character', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ serverName, characterName })
                });

                const result = await response.json();

                if (result.success) {
                    currentCharacterId = result.characterId;
                    currentCharacterData = result.characterData;
                    
                    // 캐릭터 기본 정보 표시
                    characterDetails.innerHTML = \`
                        <div class="success">
                            <h4>✅ 캐릭터 정보 조회 성공!</h4>
                            <p><strong>서버:</strong> \${result.characterData.server}</p>
                            <p><strong>캐릭터명:</strong> \${result.characterData.name}</p>
                            <p><strong>레벨:</strong> \${result.characterData.level}</p>
                            <p><strong>클래스:</strong> \${result.characterData.class}</p>
                            <p><strong>마지막 업데이트:</strong> \${new Date(result.characterData.lastUpdated).toLocaleString()}</p>
                        </div>
                    \`;
                    
                    // 스탯 정보 표시
                    displayCharacterStats(result.characterData.stats);
                    
                    // 장비 정보 표시
                    displayCharacterEquipment(result.characterData.equipment);
                    
                } else {
                    characterDetails.innerHTML = \`
                        <div class="error">
                            <h4>❌ 캐릭터 조회 실패</h4>
                            <p>\${result.error}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                characterDetails.innerHTML = \`
                    <div class="error">
                        <h4>❌ 네트워크 오류</h4>
                        <p>서버와의 통신 중 오류가 발생했습니다. 다시 시도해주세요.</p>
                    </div>
                \`;
            }
        }

        function displayCharacterStats(stats) {
            const characterStats = document.getElementById('characterStats');
            const statEntries = Object.entries(stats);
            
            characterStats.innerHTML = statEntries.map(([statName, statValue]) => \`
                <div class="stat-item">
                    <div class="stat-name">\${statName}</div>
                    <div class="stat-value">\${statValue}</div>
                </div>
            \`).join('');
        }

        function displayCharacterEquipment(equipment) {
            const characterEquipment = document.getElementById('characterEquipment');
            const equipmentEntries = Object.entries(equipment);
            
            characterEquipment.innerHTML = equipmentEntries.map(([slot, item]) => \`
                <div class="equipment-card">
                    <div class="equipment-slot">\${slot}</div>
                    <div class="equipment-name">\${item.itemName}</div>
                    <div class="equipment-grade">등급 \${item.grade} (+\${item.enhancementLevel})</div>
                    <div class="equipment-stats">
                        \${Object.entries(item.stats).map(([stat, value]) => \`\${stat}: +\${value}\`).join(', ')}
                    </div>
                </div>
            \`).join('');
        }

        async function getCharacterRecommendation() {
            if (!currentCharacterId) {
                alert('먼저 캐릭터 정보를 조회해주세요!');
                return;
            }

            const userRequest = document.getElementById('userRequest').value.trim();
            if (!userRequest) {
                alert('추천 요청사항을 입력해주세요!');
                return;
            }

            const recommendationResult = document.getElementById('recommendationResult');
            const recommendationContent = document.getElementById('recommendationContent');

            // 로딩 상태
            recommendationResult.style.display = 'block';
            recommendationContent.innerHTML = '<div class="loading"><div class="spinner"></div>캐릭터 정보를 분석하고 맞춤형 추천을 생성하고 있습니다...</div>';

            try {
                const response = await fetch('/api/character-recommend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        characterId: currentCharacterId, 
                        userRequest: userRequest 
                    })
                });

                const result = await response.json();

                if (result.success) {
                    displayRecommendationResult(result);
                } else {
                    recommendationContent.innerHTML = \`
                        <div class="error">
                            <h4>❌ 추천 생성 실패</h4>
                            <p>\${result.error}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                recommendationContent.innerHTML = \`
                    <div class="error">
                        <h4>❌ 네트워크 오류</h4>
                        <p>서버와의 통신 중 오류가 발생했습니다. 다시 시도해주세요.</p>
                    </div>
                \`;
            }
        }

        function displayRecommendationResult(result) {
            const recommendationContent = document.getElementById('recommendationContent');
            
            recommendationContent.innerHTML = \`
                <div class="success">
                    <h4>✅ 맞춤형 추천 완료!</h4>
                    <p><strong>분석된 문제점:</strong> \${result.equipmentAnalysis.weakestSlots.length}개 슬롯 개선 필요</p>
                    <p><strong>추천 아이템:</strong> \${result.recommendations.length}개</p>
                    <p><strong>총 개선 효과:</strong> \${result.improvementAnalysis.totalImprovement}점 향상</p>
                    <p><strong>비용 절약:</strong> \${result.improvementAnalysis.costSavings.toLocaleString()} 골드</p>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>🎯 추천 아이템 목록</h4>
                    \${result.recommendations.map(rec => \`
                        <div class="recommendation-item">
                            <div class="recommendation-slot">\${rec.slot} 슬롯</div>
                            <div class="recommendation-change">
                                \${rec.currentItem} (등급 \${rec.currentGrade}) → \${rec.recommendedItem}
                            </div>
                            <div class="recommendation-improvement">
                                개선 효과: +\${rec.improvement}점 향상
                            </div>
                        </div>
                    \`).join('')}
                </div>
                
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h4>💡 추천 요약</h4>
                    <p>\${result.improvementAnalysis.summary}</p>
                </div>
            \`;
        }

        function setRequestExample(text) {
            document.getElementById('userRequest').value = text;
        }

        function clearCharacter() {
            document.getElementById('serverName').value = '';
            document.getElementById('characterName').value = '';
            document.getElementById('userRequest').value = '';
            document.getElementById('characterInfo').style.display = 'none';
            document.getElementById('recommendationResult').style.display = 'none';
            currentCharacterId = null;
            currentCharacterData = null;
            
            document.querySelectorAll('.server-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        }

        // Enter 키로 캐릭터 조회
        document.getElementById('characterName').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadCharacter();
            }
        });

        // Enter 키로 추천 요청
        document.getElementById('userRequest').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                getCharacterRecommendation();
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
            await this.characterAPI.connect();
            await this.characterAPI.createCharacterTables();
            await this.advancedAnalyzer.connect();
            console.log('모든 서비스 연결 완료');

            // 서버 시작
            this.app.listen(this.port, () => {
                console.log(`🚀 캐릭터 연동 웹 인터페이스가 http://localhost:${this.port} 에서 실행 중입니다!`);
                console.log('브라우저에서 위 주소로 접속하여 테스트해보세요.');
                console.log('실제 캐릭터 정보를 연동하여 맞춤형 추천을 받을 수 있습니다.');
            });

        } catch (error) {
            console.error('서버 시작 오류:', error.message);
        }
    }

    async stop() {
        try {
            await this.characterAPI.close();
            await this.advancedAnalyzer.close();
            console.log('서버가 종료되었습니다.');
        } catch (error) {
            console.error('서버 종료 오류:', error.message);
        }
    }
}

// 서버 시작
const characterWebInterface = new CharacterWebInterface();
characterWebInterface.start();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n서버를 종료합니다...');
    await characterWebInterface.stop();
    process.exit(0);
});

module.exports = CharacterWebInterface;
