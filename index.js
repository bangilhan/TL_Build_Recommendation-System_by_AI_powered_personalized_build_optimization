const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');

// 환경변수 (Vercel Settings → Environment Variables)
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const VLLM_API_URL = process.env.VLLM_API_URL; // 예: http://172.20.92.48:30709/v1
const VLLM_API_KEY = process.env.VLLM_API_KEY || 'sk-local';

async function queryDB(sql, params = []) {
    const conn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        charset: 'utf8mb4'
    });
    try {
        const [rows] = await conn.execute(sql, params);
        return rows;
    } finally {
        await conn.end();
    }
}

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

// 메인 페이지
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TL Build Recommendation System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
        .main-content { padding: 40px; }
        .demo-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 2px solid #e9ecef;
        }
        .input-group { margin-bottom: 20px; }
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
        textarea { resize: vertical; min-height: 100px; }
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
        .result-section {
            background: #e8f5e8;
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
            border: 2px solid #c3e6c3;
        }
        .success {
            background: #efe;
            color: #363;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #cfc;
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
            document.querySelectorAll('.server-btn').forEach(function(btn){
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
            characterInfo.style.display = 'block';
            characterDetails.innerHTML = '<div style="text-align: center; padding: 20px;">캐릭터 정보를 조회하고 있습니다...</div>';

            try {
                const resp = await fetch('/api/character', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serverName: serverName, characterName: characterName })
                });
                const data = await resp.json();
                if (!data.success) {
                    characterDetails.innerHTML = '<div class="error">❌ ' + (data.message || '캐릭터 조회 실패') + '</div>';
                    return;
                }

                currentCharacterId = data.character.캐릭터아이디;
                currentCharacterData = { server: data.character.서버명, name: data.character.캐릭터이름 };

                var html = ''
                    + '<div class="success">'
                    +   '<h4>✅ 캐릭터 정보 조회 성공!</h4>'
                    +   '<p><strong>서버:</strong> ' + (data.character.서버명 || '') + '</p>'
                    +   '<p><strong>캐릭터명:</strong> ' + data.character.캐릭터이름 + '</p>'
                    +   '<p><strong>레벨:</strong> ' + (data.character.레벨 || '') + '</p>'
                    +   '<p><strong>클래스:</strong> ' + (data.character.클래스 || '') + '</p>'
                    + '</div>'
                    + '<div style="margin-top: 20px;">'
                    +   '<h4>⚔️ 현재 장비</h4>'
                    +   '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">'
                    +     data.equipment.map(function(item){
                            return '<div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">'
                                 +   '<div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">' + item.부위 + '</div>'
                                 +   '<div style="color: #e74c3c; font-weight: 600; margin-bottom: 5px;">' + item.아이템이름 + '</div>'
                                 +   '<div style="color: #7f8c8d; font-size: 0.9em;">등급 ' + item.등급 + '</div>'
                                 +   '<div style="font-size: 0.8em; color: #555;">' + (item.옵션명 || '') + ': ' + (item.값 || '') + '</div>'
                                 + '</div>';
                        }).join('')
                    +   '</div>'
                    + '</div>';

                characterDetails.innerHTML = html;
            } catch (e) {
                characterDetails.innerHTML = '<div class="error">❌ ' + (e.message || '오류') + '</div>';
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

            recommendationResult.style.display = 'block';
            recommendationContent.innerHTML = '<div style="text-align: center; padding: 20px;">AI가 데이터베이스와 LLM을 사용해 추천을 생성하고 있습니다...</div>';

            try {
                const resp = await fetch('/api/llm-recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userQuery: userRequest, characterInfo: currentCharacterData })
                });
                const data = await resp.json();
                if (!data.success && !data.fallback) {
                    throw new Error(data.message || '추천 실패');
                }
                if (data.fallback) {
                    recommendationContent.innerHTML = '<div class="error">LLM 호출 실패. 나중에 다시 시도해주세요.</div>';
                    return;
                }

                var recHtml = ''
                    + '<div class="success">'
                    +   '<h4>🤖 AI 추천 결과</h4>'
                    +   '<div style="white-space: pre-wrap; line-height: 1.6;">' + (data.recommendation || '') + '</div>'
                    +   '<div style="margin-top:10px;color:#555;">분석된 아이템 수: ' + (data.db_items_count || 0) + '개</div>'
                    + '</div>';

                recommendationContent.innerHTML = recHtml;
            } catch (e) {
                recommendationContent.innerHTML = '<div class="error">❌ ' + (e.message || '오류') + '</div>';
            }
        }

        function clearCharacter() {
            document.getElementById('serverName').value = '';
            document.getElementById('characterName').value = '';
            document.getElementById('userRequest').value = '';
            document.getElementById('characterInfo').style.display = 'none';
            document.getElementById('recommendationResult').style.display = 'none';
            currentCharacterId = null;
            currentCharacterData = null;
            document.querySelectorAll('.server-btn').forEach(function(btn){
                btn.classList.remove('selected');
            });
        }

        document.getElementById('characterName').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadCharacter();
            }
        });

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

// 캐릭터 + 착용장비 조회 API (DB 연동)
app.post('/api/character', async (req, res) => {
    try {
        const { serverName, characterName } = req.body || {};
        if (!characterName) {
            return res.status(400).json({ success: false, message: '캐릭터명을 입력해주세요.' });
        }

        const rows = await queryDB(
            'SELECT * FROM characters WHERE 캐릭터이름 = ?' + (serverName ? ' AND 서버명 = ?' : ''),
            serverName ? [characterName, serverName] : [characterName]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: '해당 캐릭터를 찾을 수 없습니다.' });
        }

        const character = rows[0];
        const equipment = await queryDB(
            `SELECT ci.부위, i.아이템이름, i.등급, i.옵션명, i.값
             FROM characters_items ci
             JOIN items_info i ON i.아이템아이디 = ci.아이템아이디
             WHERE ci.캐릭터아이디 = ?
             ORDER BY FIELD(ci.부위,'무기','투구','상의','하의','장갑','신발','목걸이','반지','허리띠','망토')`,
            [character.캐릭터아이디]
        );

        res.json({ success: true, character, equipment });
    } catch (e) {
        console.error('[/api/character] error:', e);
        res.status(500).json({ success: false, message: '캐릭터 조회 실패', error: String(e) });
    }
});

// VLLM 기반 추천 API (DB + LLM 연동)
app.post('/api/llm-recommend', async (req, res) => {
    try {
        const { userQuery, characterInfo } = req.body || {};
        if (!userQuery) {
            return res.status(400).json({ success: false, message: '추천 요청이 비어있습니다.' });
        }

        let sql = 'SELECT * FROM items_info WHERE 1=1';
        const params = [];
        if (userQuery.includes('영웅')) { sql += ' AND 등급 = ?'; params.push('영웅'); }
        if (userQuery.includes('무기')) { sql += ' AND 부위 = ?'; params.push('무기'); }
        if (userQuery.includes('방어구')) { sql += ' AND 부위 IN (?,?,?,?,?)'; params.push('투구','상의','하의','장갑','신발'); }
        sql += ' ORDER BY 값 DESC LIMIT 20';
        const items = await queryDB(sql, params);

        const llmResp = await axios.post(
            `${VLLM_API_URL}/chat/completions`,
            {
                model: 'deepseek-coder-7b',
                messages: [
                    {
                        role: 'system',
                        content:
`당신은 Throne and Liberty 빌드 추천 전문가입니다.
아래 데이터베이스 아이템 정보를 바탕으로, 사용자의 상황과 캐릭터 장비/스탯을 고려해 적합한 아이템을 추천하세요.
추천 이유를 짧고 명확히 설명하세요. 모르면 '정보 부족'이라고 답변하세요.

[DB 아이템 Top N]
${JSON.stringify(items, null, 2)}

[캐릭터 정보]
${JSON.stringify(characterInfo || {}, null, 2)}`
                    },
                    { role: 'user', content: userQuery }
                ],
                temperature: 0.1,
                max_tokens: 512
            },
            { headers: { Authorization: `Bearer ${VLLM_API_KEY}` }, timeout: 30000 }
        );

        const text = llmResp.data?.choices?.[0]?.message?.content || '(빈 응답)';
        res.json({ success: true, recommendation: text, db_items_count: items.length });
    } catch (e) {
        console.error('[/api/llm-recommend] error:', e?.response?.data || e);
        res.status(500).json({ success: false, message: 'LLM 추천 실패', error: String(e), fallback: true });
    }
});

// 헬스 체크
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = app;