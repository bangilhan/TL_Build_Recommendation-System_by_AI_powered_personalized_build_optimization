const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://dycuolwtjaectfdzbopb.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y3VvbHd0amFlY3RmZHpib3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDIwODEsImV4cCI6MjA3NDgxODA4MX0.P8HaKFJwBdQGgkeRD_sjlvD0CL_QTxZGl4Hk784hwmY'
);

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 캐릭터 정보 조회 함수
async function getCharacter(serverName, characterName) {
    try {
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('서버명', serverName)
            .eq('캐릭터이름', characterName)
            .single();

        if (error) {
            console.error('캐릭터 조회 오류:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('캐릭터 조회 예외:', error);
        return null;
    }
}

// 캐릭터의 장비 정보 조회 함수
async function getCharacterEquipment(characterId) {
    try {
        const { data, error } = await supabase
            .from('characters_items')
            .select(`
                *,
                items_info (
                    아이템이름,
                    부위,
                    등급,
                    옵션명,
                    값
                )
            `)
            .eq('캐릭터아이디', characterId);

        if (error) {
            console.error('장비 조회 오류:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('장비 조회 예외:', error);
        return [];
    }
}

// 빌드 추천 조회 함수
async function getBuildRecommendations(characterId, userRequest) {
    try {
        let query = supabase
            .from('builds')
            .select('*')
            .eq('privacy', 'public')
            .order('rating_average', { ascending: false });

        if (userRequest.includes('공격') || userRequest.includes('딜') || userRequest.includes('dps')) {
            query = query.contains('role_tags', ['dps']);
        } else if (userRequest.includes('생존') || userRequest.includes('방어') || userRequest.includes('tank')) {
            query = query.contains('role_tags', ['tank']);
        } else if (userRequest.includes('지원') || userRequest.includes('힐') || userRequest.includes('support')) {
            query = query.contains('role_tags', ['support']);
        }

        const { data, error } = await query.limit(5);

        if (error) {
            console.error('빌드 조회 오류:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('빌드 조회 예외:', error);
        return [];
    }
}

// 아이템 추천 조회 함수
async function getItemRecommendations(characterId, userRequest) {
    try {
        let query = supabase
            .from('items_info')
            .select('*')
            .order('값', { ascending: false });

        if (userRequest.includes('무기')) {
            query = query.eq('부위', '무기');
        } else if (userRequest.includes('방어구')) {
            query = query.in('부위', ['투구', '상의', '하의', '신발', '장갑']);
        } else if (userRequest.includes('액세서리')) {
            query = query.in('부위', ['목걸이', '반지', '팔찌', '벨트', '망토', '귀걸이']);
        }

        const { data, error } = await query.limit(10);

        if (error) {
            console.error('아이템 조회 오류:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('아이템 조회 예외:', error);
        return [];
    }
}

// 메인 페이지
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TL Build Recommendation System</title>
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

        .demo-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #e9ecef;
        }

        .demo-section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
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
            margin-right: 10px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .result-section {
            background: #e8f5e8;
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
            border: 2px solid #c3e6c3;
        }

        .result-section h3 {
            color: #27ae60;
            margin-bottom: 20px;
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
            <h1>🎮 TL Build Recommendation System</h1>
            <p>AI-powered personalized build optimization for Throne and Liberty</p>
        </div>

        <div class="main-content">
            <div class="demo-section">
                <h2>📋 캐릭터 정보 입력</h2>
                
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
                
                <button class="btn" onclick="loadCharacter()">🔍 캐릭터 정보 조회</button>
                <button class="btn" onclick="clearCharacter()">🗑️ 초기화</button>
            </div>

            <div id="characterInfo" class="result-section" style="display: none;">
                <h3>👤 캐릭터 정보</h3>
                <div id="characterDetails"></div>
            </div>

            <div class="demo-section">
                <h2>💬 추천 요청</h2>
                <div class="input-group">
                    <label for="userRequest">어떤 부분을 개선하고 싶으신가요?</label>
                    <textarea id="userRequest" placeholder="예: 던전 클리어가 어려워, 공격력이 부족해&#10;예: PvP에서 자꾸 죽어, 생존이 안돼&#10;예: 마나가 부족해서 스킬을 못써"></textarea>
                </div>
                <button class="btn" onclick="getRecommendation()">🚀 맞춤형 추천 받기</button>
            </div>

            <div id="recommendationResult" class="result-section" style="display: none;">
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
            <p>© 2024 TL Build Recommendation System - AI-powered personalized build optimization</p>
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

            // 로딩 상태
            characterInfo.style.display = 'block';
            characterDetails.innerHTML = '<div class="loading"><div class="spinner"></div>캐릭터 정보를 조회하고 있습니다...</div>';

            try {
                const response = await fetch('/api/character', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        serverName: serverName,
                        characterName: characterName
                    })
                });

                const data = await response.json();

                if (data.success) {
                    currentCharacterId = data.characterId;
                    currentCharacterData = data.characterData;
                    
                    // 캐릭터 기본 정보 표시
                    characterDetails.innerHTML = \`
                        <div class="success">
                            <h4>✅ 캐릭터 정보 조회 성공!</h4>
                            <p><strong>서버:</strong> \${data.characterData.server}</p>
                            <p><strong>캐릭터명:</strong> \${data.characterData.name}</p>
                            <p><strong>레벨:</strong> \${data.characterData.level}</p>
                            <p><strong>클래스:</strong> \${data.characterData.class}</p>
                            <p><strong>마지막 업데이트:</strong> \${new Date(data.characterData.lastUpdated).toLocaleString()}</p>
                        </div>
                    \`;
                } else {
                    characterDetails.innerHTML = \`
                        <div class="error">
                            <h4>❌ 캐릭터 조회 실패</h4>
                            <p>\${data.error}</p>
                        </div>
                    \`;
                }
                
            } catch (error) {
                characterDetails.innerHTML = \`
                    <div class="error">
                        <h4>❌ 캐릭터 조회 실패</h4>
                        <p>오류가 발생했습니다. 다시 시도해주세요.</p>
                    </div>
                \`;
            }
        }

        async function getRecommendation() {
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

                const data = await response.json();

                if (data.success) {
                    const recommendations = data.recommendations || [];
                    const totalImprovement = data.improvementAnalysis?.totalImprovement || 0;

                    recommendationContent.innerHTML = \`
                        <div class="success">
                            <h4>✅ 맞춤형 추천 완료!</h4>
                            <p><strong>분석된 문제점:</strong> \${recommendations.length}개 슬롯 개선 필요</p>
                            <p><strong>추천 아이템:</strong> \${recommendations.length}개</p>
                            <p><strong>총 개선 효과:</strong> \${totalImprovement}점 향상</p>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <h4>🎯 추천 아이템 목록</h4>
                            \${recommendations.map(rec => \`
                                <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; border: 1px solid #ddd;">
                                    <div style="font-size: 1.1em; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">\${rec.slot} 슬롯</div>
                                    <div style="color: #e74c3c; font-weight: 600; margin-bottom: 10px;">
                                        \${rec.currentItem} → \${rec.recommendedItem}
                                    </div>
                                    <div style="color: #27ae60; font-weight: 600;">
                                        개선 효과: +\${rec.improvement}점 향상
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    \`;
                } else {
                    recommendationContent.innerHTML = \`
                        <div class="error">
                            <h4>❌ 추천 생성 실패</h4>
                            <p>\${data.error}</p>
                        </div>
                    \`;
                }
                
            } catch (error) {
                recommendationContent.innerHTML = \`
                    <div class="error">
                        <h4>❌ 추천 생성 실패</h4>
                        <p>오류가 발생했습니다. 다시 시도해주세요.</p>
                    </div>
                \`;
            }
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
                getRecommendation();
            }
        });
    </script>
</body>
</html>`);
});

// API 엔드포인트들
app.post('/api/character', async (req, res) => {
    const { serverName, characterName } = req.body;
    
    if (!serverName || !characterName) {
        return res.json({
            success: false,
            error: '서버명과 캐릭터명이 필요합니다.'
        });
    }

    try {
        // Supabase에서 캐릭터 정보 조회
        const character = await getCharacter(serverName, characterName);
        
        if (!character) {
            return res.json({
                success: false,
                error: '캐릭터를 찾을 수 없습니다.'
            });
        }

        // 캐릭터의 장비 정보 조회
        const equipment = await getCharacterEquipment(character.캐릭터아이디);

        res.json({
            success: true,
            characterId: character.캐릭터아이디,
            characterData: {
                server: character.서버명,
                name: character.캐릭터이름,
                level: character.레벨,
                class: character.클래스,
                equipment: equipment.map(item => ({
                    slot: item.부위,
                    itemName: item.items_info?.아이템이름 || '알 수 없음',
                    grade: item.items_info?.등급 || '일반',
                    option: item.items_info?.옵션명 || '',
                    value: item.items_info?.값 || 0
                })),
                lastUpdated: character.생성일
            }
        });
    } catch (error) {
        console.error('캐릭터 조회 오류:', error);
        res.json({
            success: false,
            error: '캐릭터 조회 중 오류가 발생했습니다.'
        });
    }
});

app.post('/api/character-recommend', async (req, res) => {
    const { characterId, userRequest } = req.body;
    
    if (!characterId || !userRequest) {
        return res.json({
            success: false,
            error: '캐릭터 ID와 요청사항이 필요합니다.'
        });
    }

    try {
        // Supabase에서 빌드 추천 조회
        const buildRecommendations = await getBuildRecommendations(characterId, userRequest);
        
        // Supabase에서 아이템 추천 조회
        const itemRecommendations = await getItemRecommendations(characterId, userRequest);

        // 추천 결과 포맷팅
        const recommendations = itemRecommendations.slice(0, 5).map(item => ({
            slot: item.부위,
            currentItem: '현재 장비',
            currentGrade: 1,
            recommendedItem: item.아이템이름,
            improvement: Math.floor(item.값 || 0),
            grade: item.등급,
            option: item.옵션명
        }));

        const totalImprovement = recommendations.reduce((sum, rec) => sum + rec.improvement, 0);

        res.json({
            success: true,
            characterId: characterId,
            currentEquipment: [],
            currentStats: [],
            equipmentAnalysis: {
                weakestSlots: recommendations
            },
            recommendations: recommendations,
            buildRecommendations: buildRecommendations,
            improvementAnalysis: {
                totalImprovement: totalImprovement,
                costSavings: recommendations.reduce((sum, rec) => sum + rec.currentGrade * 1000, 0),
                recommendationCount: recommendations.length,
                summary: `${recommendations.length}개 아이템 추천으로 총 ${totalImprovement}점 향상`
            }
        });
    } catch (error) {
        console.error('추천 조회 오류:', error);
        res.json({
            success: false,
            error: '추천 조회 중 오류가 발생했습니다.'
        });
    }
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Vercel 서버리스 함수로 내보내기
module.exports = app;