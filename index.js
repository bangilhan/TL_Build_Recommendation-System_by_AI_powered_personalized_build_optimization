const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');

// 환경변수 (Vercel Settings → Environment Variables 에서 설정)
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
    res.send(`
<!DOCTYPE html>
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

            characterInfo.style.display = 'block';
            characterDetails.innerHTML = '<div style="text-align: center; padding: 20px;">캐릭터 정보를 조회하고 있습니다...</div>';

            // 시뮬레이션된 캐릭터 데이터 (더 다양한 장비)
            const classes = ['전사', '마법사', '궁수', '도적', '성기사', '사제'];
            const selectedClass = classes[Math.floor(Math.random() * classes.length)];
            
            const mockCharacterData = {
                server: serverName,
                name: characterName,
                level: Math.floor(Math.random() * 20) + 40,
                class: selectedClass,
                equipment: {
                    weapon: { 
                        itemName: selectedClass === '마법사' ? '마법사의 지팡이' : 
                                 selectedClass === '궁수' ? '정확도 활' : 
                                 selectedClass === '도적' ? '암살자의 단검' : '강철 검', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: Math.floor(Math.random() * 3),
                        stats: {
                            attack: Math.floor(Math.random() * 40) + 30,
                            defense: Math.floor(Math.random() * 20) + 15,
                            health: Math.floor(Math.random() * 30) + 20,
                            mana: Math.floor(Math.random() * 25) + 15,
                            crit: Math.floor(Math.random() * 8) + 5,
                            dex: Math.floor(Math.random() * 10) + 8
                        }
                    },
                    chest: { 
                        itemName: selectedClass === '마법사' ? '마법사의 로브' : 
                                 selectedClass === '도적' ? '암살자의 가죽갑옷' : '강철 갑옷', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: Math.floor(Math.random() * 2),
                        stats: {
                            attack: Math.floor(Math.random() * 25) + 20,
                            defense: Math.floor(Math.random() * 35) + 25,
                            health: Math.floor(Math.random() * 40) + 30,
                            mana: Math.floor(Math.random() * 20) + 15,
                            crit: Math.floor(Math.random() * 6) + 3,
                            dex: Math.floor(Math.random() * 8) + 5
                        }
                    },
                    ring1: { 
                        itemName: selectedClass === '마법사' ? '마나 반지' : '공격 반지', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: Math.floor(Math.random() * 2),
                        stats: {
                            attack: Math.floor(Math.random() * 20) + 15,
                            defense: Math.floor(Math.random() * 15) + 10,
                            health: Math.floor(Math.random() * 25) + 15,
                            mana: Math.floor(Math.random() * 30) + 20,
                            crit: Math.floor(Math.random() * 10) + 5,
                            dex: Math.floor(Math.random() * 8) + 5
                        }
                    },
                    ring2: { 
                        itemName: '방어 반지', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: 0,
                        stats: {
                            attack: Math.floor(Math.random() * 15) + 10,
                            defense: Math.floor(Math.random() * 25) + 20,
                            health: Math.floor(Math.random() * 30) + 20,
                            mana: Math.floor(Math.random() * 20) + 15,
                            crit: Math.floor(Math.random() * 8) + 4,
                            dex: Math.floor(Math.random() * 6) + 4
                        }
                    },
                    earring1: { 
                        itemName: '치명타 귀걸이', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: 0,
                        stats: {
                            attack: Math.floor(Math.random() * 18) + 12,
                            defense: Math.floor(Math.random() * 12) + 8,
                            health: Math.floor(Math.random() * 20) + 15,
                            mana: Math.floor(Math.random() * 25) + 18,
                            crit: Math.floor(Math.random() * 12) + 8,
                            dex: Math.floor(Math.random() * 10) + 6
                        }
                    },
                    earring2: { 
                        itemName: '치명타 귀걸이', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: 0,
                        stats: {
                            attack: Math.floor(Math.random() * 18) + 12,
                            defense: Math.floor(Math.random() * 12) + 8,
                            health: Math.floor(Math.random() * 20) + 15,
                            mana: Math.floor(Math.random() * 25) + 18,
                            crit: Math.floor(Math.random() * 12) + 8,
                            dex: Math.floor(Math.random() * 10) + 6
                        }
                    },
                    necklace: { 
                        itemName: '수호의 목걸이', 
                        grade: Math.floor(Math.random() * 3) + 2, 
                        enhancementLevel: 0,
                        stats: {
                            attack: Math.floor(Math.random() * 22) + 18,
                            defense: Math.floor(Math.random() * 20) + 15,
                            health: Math.floor(Math.random() * 35) + 25,
                            mana: Math.floor(Math.random() * 28) + 20,
                            crit: Math.floor(Math.random() * 10) + 6,
                            dex: Math.floor(Math.random() * 12) + 8
                        }
                    },
                    artifact: { 
                        itemName: '마법의 구슬', 
                        grade: Math.floor(Math.random() * 2) + 4, 
                        enhancementLevel: 0,
                        stats: {
                            attack: Math.floor(Math.random() * 30) + 25,
                            defense: Math.floor(Math.random() * 25) + 20,
                            health: Math.floor(Math.random() * 40) + 30,
                            mana: Math.floor(Math.random() * 35) + 25,
                            crit: Math.floor(Math.random() * 15) + 10,
                            dex: Math.floor(Math.random() * 15) + 10
                        }
                    }
                },
                stats: {
                    strength: Math.floor(Math.random() * 50) + 20,
                    constitution: Math.floor(Math.random() * 50) + 20,
                    dexterity: Math.floor(Math.random() * 50) + 20,
                    intelligence: Math.floor(Math.random() * 50) + 20
                },
                lastUpdated: new Date().toISOString()
            };

            currentCharacterId = 1;
            currentCharacterData = mockCharacterData;
            
            characterDetails.innerHTML = \`
                <div class="success">
                    <h4>✅ 캐릭터 정보 조회 성공!</h4>
                    <p><strong>서버:</strong> \${mockCharacterData.server}</p>
                    <p><strong>캐릭터명:</strong> \${mockCharacterData.name}</p>
                    <p><strong>레벨:</strong> \${mockCharacterData.level}</p>
                    <p><strong>클래스:</strong> \${mockCharacterData.class}</p>
                    <p><strong>마지막 업데이트:</strong> \${new Date(mockCharacterData.lastUpdated).toLocaleString()}</p>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>📊 현재 스탯</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
                            <div style="font-weight: 600; color: #e74c3c;">힘</div>
                            <div style="font-size: 1.2em; font-weight: bold;">\${mockCharacterData.stats.strength}</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
                            <div style="font-weight: 600; color: #3498db;">체력</div>
                            <div style="font-size: 1.2em; font-weight: bold;">\${mockCharacterData.stats.constitution}</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
                            <div style="font-weight: 600; color: #27ae60;">민첩</div>
                            <div style="font-size: 1.2em; font-weight: bold;">\${mockCharacterData.stats.dexterity}</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
                            <div style="font-weight: 600; color: #9b59b6;">지능</div>
                            <div style="font-size: 1.2em; font-weight: bold;">\${mockCharacterData.stats.intelligence}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>⚔️ 현재 장비</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                        \${Object.entries(mockCharacterData.equipment).map(([slot, item]) => {
                            const slotNames = {
                                weapon: '무기',
                                chest: '갑옷', 
                                ring1: '반지1',
                                ring2: '반지2',
                                earring1: '귀걸이1',
                                earring2: '귀걸이2',
                                necklace: '목걸이',
                                artifact: '아티팩트'
                            };
                            return \`
                                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">\${slotNames[slot]}</div>
                                    <div style="color: #e74c3c; font-weight: 600; margin-bottom: 5px;">\${item.itemName}</div>
                                    <div style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 8px;">등급 \${item.grade} (+\${item.enhancementLevel})</div>
                                    <div style="font-size: 0.8em; color: #555; line-height: 1.4;">
                                        <div>attack: +\${item.stats.attack}</div>
                                        <div>defense: +\${item.stats.defense}</div>
                                        <div>health: +\${item.stats.health}</div>
                                        <div>mana: +\${item.stats.mana}</div>
                                        <div>crit: +\${item.stats.crit}</div>
                                        <div>dex: +\${item.stats.dex}</div>
                                    </div>
                                </div>
                            \`;
                        }).join('')}
                    </div>
                </div>
            \`;
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
            recommendationContent.innerHTML = '<div style="text-align: center; padding: 20px;">캐릭터 정보를 분석하고 맞춤형 추천을 생성하고 있습니다...</div>';

            // 시뮬레이션된 추천 결과 (사용자 요청에 따라 동적으로 생성)
            const slotNames = {
                weapon: '무기',
                chest: '갑옷',
                ring1: '반지1',
                ring2: '반지2',
                earring1: '귀걸이1',
                earring2: '귀걸이2',
                necklace: '목걸이',
                artifact: '아티팩트'
            };
            
            const itemDatabase = {
                weapon: [
                    { name: '정확도 검', stats: { attack: 65, defense: 25, health: 45, mana: 30, crit: 12, dex: 15 } },
                    { name: '속도 검', stats: { attack: 55, defense: 20, health: 35, mana: 25, crit: 15, dex: 18 } },
                    { name: '파괴의 도끼', stats: { attack: 75, defense: 30, health: 55, mana: 20, crit: 8, dex: 10 } },
                    { name: '태양의 검', stats: { attack: 70, defense: 28, health: 50, mana: 35, crit: 10, dex: 12 } },
                    { name: '현자의 지팡이', stats: { attack: 60, defense: 22, health: 40, mana: 50, crit: 14, dex: 16 } }
                ],
                chest: [
                    { name: '강철 갑옷', stats: { attack: 30, defense: 60, health: 80, mana: 25, crit: 5, dex: 8 } },
                    { name: '민첩의 로브', stats: { attack: 25, defense: 45, health: 60, mana: 40, crit: 8, dex: 15 } },
                    { name: '튼튼한 갑옷', stats: { attack: 35, defense: 70, health: 90, mana: 20, crit: 3, dex: 5 } },
                    { name: '마법 저항 로브', stats: { attack: 20, defense: 50, health: 70, mana: 55, crit: 10, dex: 12 } },
                    { name: '수호자의 갑옷', stats: { attack: 40, defense: 80, health: 100, mana: 30, crit: 6, dex: 10 } }
                ],
                ring1: [
                    { name: '공격 반지', stats: { attack: 25, defense: 15, health: 30, mana: 20, crit: 12, dex: 10 } },
                    { name: '방어 반지', stats: { attack: 15, defense: 30, health: 40, mana: 15, crit: 8, dex: 8 } },
                    { name: '마나 반지', stats: { attack: 20, defense: 12, health: 25, mana: 45, crit: 10, dex: 12 } },
                    { name: '치명타 반지', stats: { attack: 30, defense: 10, health: 20, mana: 25, crit: 18, dex: 15 } },
                    { name: '활력의 반지', stats: { attack: 18, defense: 20, health: 50, mana: 30, crit: 6, dex: 8 } }
                ],
                ring2: [
                    { name: '공격 반지', stats: { attack: 25, defense: 15, health: 30, mana: 20, crit: 12, dex: 10 } },
                    { name: '방어 반지', stats: { attack: 15, defense: 30, health: 40, mana: 15, crit: 8, dex: 8 } },
                    { name: '마나 반지', stats: { attack: 20, defense: 12, health: 25, mana: 45, crit: 10, dex: 12 } },
                    { name: '치명타 반지', stats: { attack: 30, defense: 10, health: 20, mana: 25, crit: 18, dex: 15 } },
                    { name: '활력의 반지', stats: { attack: 18, defense: 20, health: 50, mana: 30, crit: 6, dex: 8 } }
                ],
                earring1: [
                    { name: '치명타 귀걸이', stats: { attack: 20, defense: 8, health: 25, mana: 30, crit: 20, dex: 12 } },
                    { name: '마나 귀걸이', stats: { attack: 15, defense: 10, health: 20, mana: 40, crit: 8, dex: 10 } },
                    { name: '방어 귀걸이', stats: { attack: 12, defense: 25, health: 35, mana: 20, crit: 6, dex: 8 } },
                    { name: '공격 귀걸이', stats: { attack: 28, defense: 6, health: 15, mana: 15, crit: 15, dex: 14 } }
                ],
                earring2: [
                    { name: '치명타 귀걸이', stats: { attack: 20, defense: 8, health: 25, mana: 30, crit: 20, dex: 12 } },
                    { name: '마나 귀걸이', stats: { attack: 15, defense: 10, health: 20, mana: 40, crit: 8, dex: 10 } },
                    { name: '방어 귀걸이', stats: { attack: 12, defense: 25, health: 35, mana: 20, crit: 6, dex: 8 } },
                    { name: '공격 귀걸이', stats: { attack: 28, defense: 6, health: 15, mana: 15, crit: 15, dex: 14 } }
                ],
                necklace: [
                    { name: '수호의 목걸이', stats: { attack: 35, defense: 40, health: 60, mana: 45, crit: 12, dex: 15 } },
                    { name: '마력의 목걸이', stats: { attack: 30, defense: 25, health: 45, mana: 65, crit: 15, dex: 18 } },
                    { name: '신속의 목걸이', stats: { attack: 25, defense: 30, health: 40, mana: 35, crit: 18, dex: 25 } },
                    { name: '영웅의 문장', stats: { attack: 40, defense: 35, health: 55, mana: 50, crit: 14, dex: 20 } }
                ],
                artifact: [
                    { name: '고대 용의 심장', stats: { attack: 80, defense: 70, health: 120, mana: 90, crit: 25, dex: 30 } },
                    { name: '마법의 구슬', stats: { attack: 60, defense: 50, health: 80, mana: 120, crit: 20, dex: 25 } },
                    { name: '그림자의 망토', stats: { attack: 70, defense: 40, health: 70, mana: 60, crit: 30, dex: 35 } },
                    { name: '신비한 구슬', stats: { attack: 75, defense: 60, health: 100, mana: 100, crit: 22, dex: 28 } }
                ]
            };
            
            // 사용자 요청에 따라 추천 개수 결정
            let recommendationCount = 2;
            if (userRequest.includes('어려워') || userRequest.includes('부족해') || userRequest.includes('안돼')) {
                recommendationCount = 4;
            } else if (userRequest.includes('많이') || userRequest.includes('완전히')) {
                recommendationCount = 6;
            }
            
            const mockRecommendations = [];
            const slots = Object.keys(slotNames);
            
            for (let i = 0; i < Math.min(recommendationCount, slots.length); i++) {
                const slot = slots[i];
                const currentItem = currentCharacterData.equipment[slot]?.itemName || '기본 아이템';
                const currentGrade = currentCharacterData.equipment[slot]?.grade || 3;
                const currentStats = currentCharacterData.equipment[slot]?.stats || { attack: 0, defense: 0, health: 0, mana: 0, crit: 0, dex: 0 };
                
                // 같은 슬롯의 다른 아이템 추천
                const availableItems = itemDatabase[slot] || [{ name: '개선된 아이템', stats: { attack: 0, defense: 0, health: 0, mana: 0, crit: 0, dex: 0 } }];
                const recommendedItemData = availableItems[Math.floor(Math.random() * availableItems.length)];
                
                // 스탯 개선 계산
                const statImprovements = {
                    attack: Math.max(0, recommendedItemData.stats.attack - currentStats.attack),
                    defense: Math.max(0, recommendedItemData.stats.defense - currentStats.defense),
                    health: Math.max(0, recommendedItemData.stats.health - currentStats.health),
                    mana: Math.max(0, recommendedItemData.stats.mana - currentStats.mana),
                    crit: Math.max(0, recommendedItemData.stats.crit - currentStats.crit),
                    dex: Math.max(0, recommendedItemData.stats.dex - currentStats.dex)
                };
                
                const totalImprovement = Object.values(statImprovements).reduce((sum, val) => sum + val, 0);
                
                mockRecommendations.push({
                    slot: slot,
                    slotName: slotNames[slot],
                    currentItem: currentItem,
                    currentGrade: currentGrade,
                    currentStats: currentStats,
                    recommendedItem: recommendedItemData.name,
                    recommendedStats: recommendedItemData.stats,
                    statImprovements: statImprovements,
                    improvement: totalImprovement
                });
            }

            const totalImprovement = mockRecommendations.reduce((sum, rec) => sum + rec.improvement, 0);
            const costSavings = mockRecommendations.reduce((sum, rec) => sum + rec.currentGrade * 1000, 0);

            recommendationContent.innerHTML = \`
                <div class="success">
                    <h4>✅ 맞춤형 추천 완료!</h4>
                    <p><strong>분석된 문제점:</strong> \${mockRecommendations.length}개 슬롯 개선 필요</p>
                    <p><strong>추천 아이템:</strong> \${mockRecommendations.length}개</p>
                    <p><strong>총 개선 효과:</strong> \${totalImprovement}점 향상</p>
                    <p><strong>비용 절약:</strong> \${costSavings.toLocaleString()} 골드</p>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>🎯 추천 아이템 목록</h4>
                    \${mockRecommendations.map(rec => \`
                        <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; border: 1px solid #ddd;">
                            <div style="font-size: 1.1em; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">\${rec.slotName} 슬롯</div>
                            <div style="color: #e74c3c; font-weight: 600; margin-bottom: 10px;">
                                \${rec.currentItem} (등급 \${rec.currentGrade}) → \${rec.recommendedItem}
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <div style="font-weight: 600; color: #7f8c8d; margin-bottom: 5px;">현재 스탯</div>
                                    <div style="font-size: 0.8em; color: #555; line-height: 1.4;">
                                        <div>attack: +\${rec.currentStats.attack}</div>
                                        <div>defense: +\${rec.currentStats.defense}</div>
                                        <div>health: +\${rec.currentStats.health}</div>
                                        <div>mana: +\${rec.currentStats.mana}</div>
                                        <div>crit: +\${rec.currentStats.crit}</div>
                                        <div>dex: +\${rec.currentStats.dex}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #27ae60; margin-bottom: 5px;">추천 아이템 스탯</div>
                                    <div style="font-size: 0.8em; color: #555; line-height: 1.4;">
                                        <div>attack: +\${rec.recommendedStats.attack}</div>
                                        <div>defense: +\${rec.recommendedStats.defense}</div>
                                        <div>health: +\${rec.recommendedStats.health}</div>
                                        <div>mana: +\${rec.recommendedStats.mana}</div>
                                        <div>crit: +\${rec.recommendedStats.crit}</div>
                                        <div>dex: +\${rec.recommendedStats.dex}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background: #e8f5e8; padding: 10px; border-radius: 8px; border: 1px solid #c3e6c3;">
                                <div style="font-weight: 600; color: #27ae60; margin-bottom: 5px;">스탯 개선 효과</div>
                                <div style="font-size: 0.8em; color: #555; line-height: 1.4;">
                                    \${Object.entries(rec.statImprovements).map(([stat, improvement]) => 
                                        improvement > 0 ? \`<div style="color: #27ae60;">\${stat}: +\${improvement}</div>\` : ''
                                    ).join('')}
                                </div>
                                <div style="color: #27ae60; font-weight: 600; margin-top: 5px;">
                                    총 개선 효과: +\${rec.improvement}점 향상
                                </div>
                            </div>
                        </div>
                    \`).join('')}
                </div>
                
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h4>💡 추천 요약</h4>
                    <p>\${mockRecommendations.length}개 슬롯 개선으로 총 \${totalImprovement}점 향상, \${costSavings.toLocaleString()} 골드 절약</p>
                </div>
            \`;
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
</html>
    `);
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

        // 간단한 필터로 관련 아이템 Top N 조회
        let sql = 'SELECT * FROM items_info WHERE 1=1';
        const params = [];
        if (userQuery.includes('영웅')) { sql += ' AND 등급 = ?'; params.push('영웅'); }
        if (userQuery.includes('무기')) { sql += ' AND 부위 = ?'; params.push('무기'); }
        if (userQuery.includes('방어구')) { sql += ' AND 부위 IN (?,?,?,?,?)'; params.push('투구','상의','하의','장갑','신발'); }
        sql += ' ORDER BY 값 DESC LIMIT 20';
        const items = await queryDB(sql, params);

        // VLLM 서버 호출
        const llmResp = await axios.post(
            `${VLLM_API_URL}/chat/completions`,
            {
                model: 'deepseek-coder-7b',
                messages: [
                    {
                        role: 'system',
                        content: `당신은 Throne and Liberty 빌드 추천 전문가입니다.\n아래 데이터베이스 아이템 정보를 바탕으로, 사용자의 상황과 캐릭터 장비/스탯을 고려해 적합한 아이템을 추천하세요.\n추천 이유를 짧고 명확히 설명하세요. 모르면 '정보 부족'이라고 답변하세요.\n\n[DB 아이템 Top N]\n${JSON.stringify(items, null, 2)}\n\n[캐릭터 정보]\n${JSON.stringify(characterInfo || {}, null, 2)}`
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
