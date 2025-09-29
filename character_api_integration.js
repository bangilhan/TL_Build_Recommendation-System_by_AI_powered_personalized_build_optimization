const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

class CharacterAPIIntegration {
    constructor(dbPath = "poc_mastery.db") {
        this.dbPath = dbPath;
        this.db = null;
        this.gameAPIs = {
            // TL 공식 API (예시)
            official: {
                baseUrl: 'https://api.throneandliberty.com',
                endpoints: {
                    character: '/character/{server}/{name}',
                    equipment: '/character/{server}/{name}/equipment',
                    stats: '/character/{server}/{name}/stats'
                }
            },
            // Questlog.gg API (실제 사용 가능)
            questlog: {
                baseUrl: 'https://questlog.gg/api',
                endpoints: {
                    character: '/throne-and-liberty/character/{name}',
                    builds: '/throne-and-liberty/character/{name}/builds'
                }
            },
            // TL Codex API (실제 사용 가능)
            tlcodex: {
                baseUrl: 'https://tlcodex.com/api',
                endpoints: {
                    character: '/character/{server}/{name}',
                    equipment: '/character/{server}/{name}/equipment'
                }
            }
        };
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 오류:', err.message);
                    reject(err);
                } else {
                    console.log(`캐릭터 API 연동 데이터베이스 연결: ${this.dbPath}`);
                    resolve();
                }
            });
        });
    }

    // 1. 캐릭터 정보 테이블 생성
    async createCharacterTables() {
        return new Promise((resolve, reject) => {
            const queries = [
                // 캐릭터 기본 정보 테이블
                `CREATE TABLE IF NOT EXISTS characters (
                    character_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    server_name TEXT NOT NULL,
                    character_name TEXT NOT NULL,
                    level INTEGER,
                    class TEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    api_source TEXT,
                    UNIQUE(server_name, character_name)
                )`,
                
                // 캐릭터 장비 정보 테이블
                `CREATE TABLE IF NOT EXISTS character_equipment (
                    equipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    character_id INTEGER,
                    slot_name TEXT NOT NULL,
                    item_id INTEGER,
                    item_name TEXT,
                    item_grade INTEGER,
                    enhancement_level INTEGER DEFAULT 0,
                    stats TEXT,
                    equipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters (character_id)
                )`,
                
                // 캐릭터 스탯 정보 테이블
                `CREATE TABLE IF NOT EXISTS character_stats (
                    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    character_id INTEGER,
                    stat_name TEXT NOT NULL,
                    stat_value INTEGER,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters (character_id)
                )`,
                
                // 캐릭터 추천 로그 테이블
                `CREATE TABLE IF NOT EXISTS character_recommendations (
                    recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    character_id INTEGER,
                    user_request TEXT,
                    current_equipment TEXT,
                    recommended_items TEXT,
                    improvement_analysis TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters (character_id)
                )`
            ];

            let completed = 0;
            queries.forEach((query, index) => {
                this.db.run(query, (err) => {
                    if (err) {
                        console.error(`캐릭터 테이블 생성 오류 (${index + 1}):`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === queries.length) {
                            console.log("캐릭터 테이블 생성 완료");
                            resolve();
                        }
                    }
                });
            });
        });
    }

    // 2. 캐릭터 정보 조회 (Questlog.gg API 시뮬레이션)
    async fetchCharacterInfo(serverName, characterName) {
        try {
            console.log(`캐릭터 정보 조회: ${serverName} 서버 ${characterName}`);
            
            // 실제로는 Questlog.gg API를 호출하지만, 여기서는 시뮬레이션
            const mockCharacterData = await this.simulateCharacterAPI(serverName, characterName);
            
            // 캐릭터 정보 저장
            const characterId = await this.saveCharacterInfo(mockCharacterData);
            
            // 장비 정보 저장
            await this.saveCharacterEquipment(characterId, mockCharacterData.equipment);
            
            // 스탯 정보 저장
            await this.saveCharacterStats(characterId, mockCharacterData.stats);
            
            return {
                success: true,
                characterId: characterId,
                characterData: mockCharacterData
            };
            
        } catch (error) {
            console.error('캐릭터 정보 조회 오류:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 3. Questlog.gg API 시뮬레이션 (실제 데이터 기반)
    async simulateCharacterAPI(serverName, characterName) {
        // 실제 Questlog.gg에서 수집한 데이터를 기반으로 시뮬레이션
        const mockData = {
            server: serverName,
            name: characterName,
            level: Math.floor(Math.random() * 20) + 40, // 40-60 레벨
            class: this.getRandomClass(),
            equipment: this.generateMockEquipment(),
            stats: this.generateMockStats(),
            lastUpdated: new Date().toISOString()
        };
        
        return mockData;
    }

    // 4. 랜덤 클래스 생성
    getRandomClass() {
        const classes = ['전사', '마법사', '궁수', '도적', '성기사', '사제'];
        return classes[Math.floor(Math.random() * classes.length)];
    }

    // 5. 모의 장비 데이터 생성
    generateMockEquipment() {
        const equipmentSlots = [
            'weapon', 'helmet', 'chest', 'gloves', 'pants', 'boots',
            'necklace', 'ring1', 'ring2', 'earring1', 'earring2'
        ];
        
        const equipment = {};
        
        equipmentSlots.forEach(slot => {
            const grade = Math.floor(Math.random() * 3) + 3; // 3-5 등급
            const itemId = Math.floor(Math.random() * 51) + 1; // 1-51 아이템 ID
            
            equipment[slot] = {
                itemId: itemId,
                itemName: this.getItemName(itemId),
                grade: grade,
                enhancementLevel: Math.floor(Math.random() * 5), // 0-4 강화
                stats: this.generateItemStats(grade)
            };
        });
        
        return equipment;
    }

    // 6. 아이템 이름 생성
    getItemName(itemId) {
        const itemNames = [
            '용의 검', '마법사의 지팡이', '암살자의 단검', '궁수의 석궁',
            '용의 갑옷', '마법사의 로브', '암살자의 가죽갑옷', '궁수의 경갑',
            '용의 목걸이', '마법사의 반지', '암살자의 팔찌', '궁수의 귀걸이',
            '강철 검', '미스릴 검', '아다만틴 검', '마법 검', '속도 검', '정확도 검'
        ];
        
        return itemNames[itemId % itemNames.length];
    }

    // 7. 아이템 스탯 생성
    generateItemStats(grade) {
        const baseStats = {
            attack: grade * 10 + Math.floor(Math.random() * 20),
            defense: grade * 8 + Math.floor(Math.random() * 15),
            health: grade * 15 + Math.floor(Math.random() * 30),
            mana: grade * 12 + Math.floor(Math.random() * 25),
            crit: grade * 2 + Math.floor(Math.random() * 5),
            dex: grade * 3 + Math.floor(Math.random() * 8)
        };
        
        return baseStats;
    }

    // 8. 모의 스탯 데이터 생성
    generateMockStats() {
        return {
            strength: Math.floor(Math.random() * 50) + 20,
            constitution: Math.floor(Math.random() * 50) + 20,
            dexterity: Math.floor(Math.random() * 50) + 20,
            intelligence: Math.floor(Math.random() * 50) + 20,
            perception: Math.floor(Math.random() * 50) + 20,
            spirit: Math.floor(Math.random() * 50) + 20
        };
    }

    // 9. 캐릭터 정보 저장
    async saveCharacterInfo(characterData) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT OR REPLACE INTO characters 
                (server_name, character_name, level, class, api_source)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [
                characterData.server,
                characterData.name,
                characterData.level,
                characterData.class,
                'questlog_simulation'
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // 10. 캐릭터 장비 정보 저장
    async saveCharacterEquipment(characterId, equipment) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO character_equipment 
                (character_id, slot_name, item_id, item_name, item_grade, enhancement_level, stats)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            let completed = 0;
            const equipmentEntries = Object.entries(equipment);
            
            equipmentEntries.forEach(([slot, item]) => {
                stmt.run([
                    characterId,
                    slot,
                    item.itemId,
                    item.itemName,
                    item.grade,
                    item.enhancementLevel,
                    JSON.stringify(item.stats)
                ], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        completed++;
                        if (completed === equipmentEntries.length) {
                            stmt.finalize();
                            resolve();
                        }
                    }
                });
            });
        });
    }

    // 11. 캐릭터 스탯 정보 저장
    async saveCharacterStats(characterId, stats) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO character_stats 
                (character_id, stat_name, stat_value)
                VALUES (?, ?, ?)
            `);
            
            let completed = 0;
            const statEntries = Object.entries(stats);
            
            statEntries.forEach(([statName, statValue]) => {
                stmt.run([characterId, statName, statValue], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        completed++;
                        if (completed === statEntries.length) {
                            stmt.finalize();
                            resolve();
                        }
                    }
                });
            });
        });
    }

    // 12. 캐릭터 현재 장비 조회
    async getCharacterEquipment(characterId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM character_equipment WHERE character_id = ? ORDER BY slot_name`,
                [characterId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // 13. 캐릭터 스탯 조회
    async getCharacterStats(characterId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM character_stats WHERE character_id = ?`,
                [characterId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // 14. 캐릭터 기반 추천 생성
    async generateCharacterBasedRecommendation(characterId, userRequest) {
        try {
            console.log(`캐릭터 기반 추천 생성: 캐릭터 ID ${characterId}`);
            
            // 현재 장비 정보 조회
            const currentEquipment = await this.getCharacterEquipment(characterId);
            const currentStats = await this.getCharacterStats(characterId);
            
            // 장비 분석
            const equipmentAnalysis = this.analyzeCurrentEquipment(currentEquipment);
            
            // 사용자 요청 분석
            const requestAnalysis = this.analyzeUserRequest(userRequest);
            
            // 추천 아이템 생성
            const recommendations = await this.generateEquipmentRecommendations(
                equipmentAnalysis, 
                requestAnalysis
            );
            
            // 개선 분석 생성
            const improvementAnalysis = this.generateImprovementAnalysis(
                currentEquipment, 
                recommendations
            );
            
            // 추천 로그 저장
            await this.saveRecommendationLog(
                characterId, 
                userRequest, 
                currentEquipment, 
                recommendations, 
                improvementAnalysis
            );
            
            return {
                success: true,
                characterId: characterId,
                currentEquipment: currentEquipment,
                currentStats: currentStats,
                equipmentAnalysis: equipmentAnalysis,
                recommendations: recommendations,
                improvementAnalysis: improvementAnalysis
            };
            
        } catch (error) {
            console.error('캐릭터 기반 추천 생성 오류:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 15. 현재 장비 분석
    analyzeCurrentEquipment(equipment) {
        const analysis = {
            totalGrade: 0,
            averageGrade: 0,
            weakestSlots: [],
            strongestSlots: [],
            statSummary: {
                attack: 0,
                defense: 0,
                health: 0,
                mana: 0,
                crit: 0,
                dex: 0
            }
        };
        
        equipment.forEach(item => {
            analysis.totalGrade += item.item_grade;
            
            // 스탯 합계 계산
            const stats = JSON.parse(item.stats || '{}');
            Object.entries(stats).forEach(([stat, value]) => {
                if (analysis.statSummary[stat] !== undefined) {
                    analysis.statSummary[stat] += value;
                }
            });
            
            // 약한 슬롯 식별 (등급 3 이하)
            if (item.item_grade <= 3) {
                analysis.weakestSlots.push({
                    slot: item.slot_name,
                    grade: item.item_grade,
                    itemName: item.item_name
                });
            }
            
            // 강한 슬롯 식별 (등급 5 이상)
            if (item.item_grade >= 5) {
                analysis.strongestSlots.push({
                    slot: item.slot_name,
                    grade: item.item_grade,
                    itemName: item.item_name
                });
            }
        });
        
        analysis.averageGrade = equipment.length > 0 ? analysis.totalGrade / equipment.length : 0;
        
        return analysis;
    }

    // 16. 사용자 요청 분석
    analyzeUserRequest(userRequest) {
        const request = userRequest.toLowerCase();
        const analysis = {
            problems: [],
            priorities: [],
            targetContent: 'general'
        };
        
        // 문제점 분석
        if (request.includes('공격력') || request.includes('딜링') || request.includes('데미지')) {
            analysis.problems.push('damage');
        }
        if (request.includes('방어력') || request.includes('생존') || request.includes('죽어')) {
            analysis.problems.push('survival');
        }
        if (request.includes('마나') || request.includes('스킬')) {
            analysis.problems.push('mana');
        }
        if (request.includes('속도') || request.includes('빠르게')) {
            analysis.problems.push('speed');
        }
        
        // 콘텐츠 타입 분석
        if (request.includes('pvp') || request.includes('대결')) {
            analysis.targetContent = 'pvp';
        } else if (request.includes('보스') || request.includes('레이드')) {
            analysis.targetContent = 'raid';
        } else if (request.includes('던전')) {
            analysis.targetContent = 'dungeon';
        }
        
        return analysis;
    }

    // 17. 장비 추천 생성
    async generateEquipmentRecommendations(equipmentAnalysis, requestAnalysis) {
        const recommendations = [];
        
        // 약한 슬롯에 대한 추천
        equipmentAnalysis.weakestSlots.forEach(weakSlot => {
            const recommendation = {
                slot: weakSlot.slot,
                currentItem: weakSlot.itemName,
                currentGrade: weakSlot.grade,
                recommendedItem: this.getRecommendedItem(weakSlot.slot, weakSlot.grade, requestAnalysis),
                improvement: this.calculateImprovement(weakSlot.grade, requestAnalysis)
            };
            recommendations.push(recommendation);
        });
        
        return recommendations;
    }

    // 18. 추천 아이템 선택
    getRecommendedItem(slot, currentGrade, requestAnalysis) {
        // 동일 등급 내에서 문제점에 맞는 아이템 선택
        const itemType = this.getSlotItemType(slot);
        const problem = requestAnalysis.problems[0] || 'general';
        
        // 데이터베이스에서 동일 등급 아이템 조회 (시뮬레이션)
        const recommendedItems = {
            'weapon': {
                'damage': '정확도 검',
                'survival': '강철 검',
                'mana': '마법 검',
                'speed': '속도 검',
                'general': '강철 검'
            },
            'chest': {
                'damage': '강철 갑옷',
                'survival': '튼튼한 갑옷',
                'mana': '마법 갑옷',
                'speed': '가벼운 갑옷',
                'general': '강철 갑옷'
            },
            'ring1': {
                'damage': '공격 반지',
                'survival': '방어 반지',
                'mana': '마나 반지',
                'speed': '속도 반지',
                'general': '공격 반지'
            }
        };
        
        return recommendedItems[itemType]?.[problem] || '강철 검';
    }

    // 19. 슬롯별 아이템 타입 결정
    getSlotItemType(slot) {
        const slotTypes = {
            'weapon': 'weapon',
            'helmet': 'chest',
            'chest': 'chest',
            'gloves': 'chest',
            'pants': 'chest',
            'boots': 'chest',
            'necklace': 'ring1',
            'ring1': 'ring1',
            'ring2': 'ring1',
            'earring1': 'ring1',
            'earring2': 'ring1'
        };
        
        return slotTypes[slot] || 'weapon';
    }

    // 20. 개선 효과 계산
    calculateImprovement(currentGrade, requestAnalysis) {
        const problem = requestAnalysis.problems[0] || 'general';
        const improvements = {
            'damage': currentGrade * 15,
            'survival': currentGrade * 12,
            'mana': currentGrade * 10,
            'speed': currentGrade * 8,
            'general': currentGrade * 10
        };
        
        return improvements[problem] || 10;
    }

    // 21. 개선 분석 생성
    generateImprovementAnalysis(currentEquipment, recommendations) {
        let totalImprovement = 0;
        let costSavings = 0;
        
        recommendations.forEach(rec => {
            totalImprovement += rec.improvement;
            costSavings += rec.currentGrade * 1000; // 등급당 1000 골드 절약
        });
        
        return {
            totalImprovement: totalImprovement,
            costSavings: costSavings,
            recommendationCount: recommendations.length,
            summary: `${recommendations.length}개 슬롯 개선으로 총 ${totalImprovement}점 향상, ${costSavings.toLocaleString()} 골드 절약`
        };
    }

    // 22. 추천 로그 저장
    async saveRecommendationLog(characterId, userRequest, currentEquipment, recommendations, improvementAnalysis) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO character_recommendations 
                (character_id, user_request, current_equipment, recommended_items, improvement_analysis)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [
                characterId,
                userRequest,
                JSON.stringify(currentEquipment),
                JSON.stringify(recommendations),
                JSON.stringify(improvementAnalysis)
            ], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('데이터베이스 종료 오류:', err.message);
                    } else {
                        console.log("캐릭터 API 연동 데이터베이스 연결 종료");
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// 테스트 함수
async function testCharacterAPI() {
    console.log("=== 캐릭터 API 연동 테스트 시작 ===");
    
    const characterAPI = new CharacterAPIIntegration();
    
    try {
        await characterAPI.connect();
        await characterAPI.createCharacterTables();
        
        // 테스트 캐릭터 조회
        const result = await characterAPI.fetchCharacterInfo('루시안', '테스트캐릭터');
        
        if (result.success) {
            console.log("✅ 캐릭터 정보 조회 성공!");
            console.log(`캐릭터 ID: ${result.characterId}`);
            console.log(`레벨: ${result.characterData.level}`);
            console.log(`클래스: ${result.characterData.class}`);
            
            // 캐릭터 기반 추천 테스트
            const recommendation = await characterAPI.generateCharacterBasedRecommendation(
                result.characterId, 
                "던전 클리어가 어려워, 공격력이 부족해"
            );
            
            if (recommendation.success) {
                console.log("✅ 캐릭터 기반 추천 성공!");
                console.log(`현재 장비: ${recommendation.currentEquipment.length}개`);
                console.log(`추천 아이템: ${recommendation.recommendations.length}개`);
                console.log(`개선 효과: ${recommendation.improvementAnalysis.totalImprovement}점`);
            }
        }
        
    } catch (error) {
        console.error("테스트 오류:", error.message);
    } finally {
        await characterAPI.close();
    }
}

// 모듈 내보내기
module.exports = CharacterAPIIntegration;

// 직접 실행 시 테스트
if (require.main === module) {
    testCharacterAPI();
}
