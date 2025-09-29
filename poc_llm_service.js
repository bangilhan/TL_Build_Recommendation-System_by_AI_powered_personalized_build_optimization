const sqlite3 = require('sqlite3').verbose();

class PoCLLMService {
    constructor(dbPath = "poc_mastery.db") {
        this.dbPath = dbPath;
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 오류:', err.message);
                    reject(err);
                } else {
                    console.log(`LLM 서비스 데이터베이스 연결: ${this.dbPath}`);
                    resolve();
                }
            });
        });
    }

    // 1. 사용자 입력을 상황으로 매핑
    async mapUserInputToSituation(userInput) {
        return new Promise((resolve, reject) => {
            // 간단한 키워드 매핑 (실제로는 LLM이 더 정교하게 처리)
            const keywords = userInput.toLowerCase();
            let matchedSituation = null;

            // 키워드 기반 매핑
            if (keywords.includes('pvp') || keywords.includes('대결') || keywords.includes('싸움')) {
                if (keywords.includes('1vs1') || keywords.includes('1대1')) {
                    matchedSituation = 1; // PvP 1vs1
                } else if (keywords.includes('그룹') || keywords.includes('팀')) {
                    matchedSituation = 2; // PvP 그룹전
                } else if (keywords.includes('암살') || keywords.includes('기습')) {
                    matchedSituation = 3; // PvP 암살자
                } else {
                    matchedSituation = 1; // 기본 PvP
                }
            } else if (keywords.includes('보스') || keywords.includes('레이드')) {
                matchedSituation = 4; // 보스 레이드
            } else if (keywords.includes('던전') || keywords.includes('클리어')) {
                matchedSituation = 5; // 던전 클리어
            } else if (keywords.includes('사냥') || keywords.includes('파밍')) {
                matchedSituation = 6; // 사냥터 파밍
            } else if (keywords.includes('탱커') || keywords.includes('방패')) {
                matchedSituation = 7; // 탱커 빌드
            } else if (keywords.includes('딜러') || keywords.includes('데미지')) {
                matchedSituation = 8; // 딜러 빌드
            } else if (keywords.includes('서포터') || keywords.includes('힐')) {
                matchedSituation = 9; // 서포터 빌드
            } else {
                matchedSituation = 10; // 균형 빌드
            }

            // 상황 정보 조회
            this.db.get(
                "SELECT * FROM situations WHERE situation_id = ?",
                [matchedSituation],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // 2. 추천 아이템 정보 조회
    async getRecommendedItems(itemIds) {
        return new Promise((resolve, reject) => {
            const ids = itemIds.split(',').map(id => parseInt(id.trim()));
            const placeholders = ids.map(() => '?').join(',');
            
            this.db.all(
                `SELECT * FROM items WHERE item_id IN (${placeholders})`,
                ids,
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

    // 3. LLM 스타일 추천 설명 생성
    generateRecommendationExplanation(situation, items) {
        const situationName = situation.situation_name;
        const situationDesc = situation.situation_description;
        const buildType = situation.build_type;
        const difficulty = situation.difficulty;

        let explanation = `🎯 **${situationName} 추천 빌드**\n\n`;
        explanation += `**상황 분석**: ${situationDesc}\n`;
        explanation += `**빌드 타입**: ${buildType.toUpperCase()}\n`;
        explanation += `**난이도**: ${difficulty}\n\n`;

        explanation += `**추천 아이템 및 이유**:\n\n`;

        items.forEach((item, index) => {
            explanation += `${index + 1}. **${item.item_name}** (${item.rarity})\n`;
            explanation += `   - 효과: ${item.base_stats}\n`;
            explanation += `   - 설명: ${item.description}\n`;
            explanation += `   - 비용: ${item.cost.toLocaleString()} 골드\n`;
            
            // 상황별 맞춤 설명
            if (buildType === 'pvp') {
                explanation += `   - PvP에서 중요한 이유: ${this.getPvPReason(item)}\n`;
            } else if (buildType === 'pve') {
                explanation += `   - PvE에서 중요한 이유: ${this.getPvEReason(item)}\n`;
            } else if (buildType === 'tank') {
                explanation += `   - 탱커로서 중요한 이유: ${this.getTankReason(item)}\n`;
            } else if (buildType === 'dps') {
                explanation += `   - 딜러로서 중요한 이유: ${this.getDPSReason(item)}\n`;
            }
            explanation += `\n`;
        });

        // 총 비용 계산
        const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
        explanation += `💰 **총 예상 비용**: ${totalCost.toLocaleString()} 골드\n\n`;

        // 추가 팁
        explanation += `💡 **추가 팁**:\n`;
        explanation += this.getAdditionalTips(buildType, difficulty);

        return explanation;
    }

    // 4. PvP 관련 이유 생성
    getPvPReason(item) {
        const reasons = {
            '무기': 'PvP에서는 빠른 처치가 승리의 열쇠입니다. 높은 공격력으로 상대방을 압도하세요.',
            '방어구': 'PvP에서 생존은 필수입니다. 적의 공격을 버티고 역습할 기회를 만드세요.',
            '장신구': 'PvP 특화 스탯으로 상대방보다 우위를 점하세요.',
            '특수': '특별한 능력으로 예상치 못한 전술을 구사하세요.'
        };
        return reasons[item.item_type] || 'PvP 상황에 최적화된 성능을 제공합니다.';
    }

    // 5. PvE 관련 이유 생성
    getPvEReason(item) {
        const reasons = {
            '무기': 'PvE에서는 지속적인 딜링이 중요합니다. 안정적인 데미지로 몬스터를 처리하세요.',
            '방어구': '장시간 사냥을 위해 충분한 방어력을 확보하세요.',
            '장신구': 'PvE 효율성을 높이는 스탯으로 사냥 속도를 향상시키세요.',
            '특수': '특수 능력으로 사냥 효율을 극대화하세요.'
        };
        return reasons[item.item_type] || 'PvE 상황에 최적화된 성능을 제공합니다.';
    }

    // 6. 탱커 관련 이유 생성
    getTankReason(item) {
        const reasons = {
            '무기': '탱커도 어느 정도 딜링이 필요합니다. 위협 수준을 유지하세요.',
            '방어구': '탱커의 핵심! 높은 방어력으로 팀을 보호하세요.',
            '장신구': '생존력과 위협 수준을 동시에 높이는 스탯을 선택하세요.',
            '특수': '특수 능력으로 팀 전체의 생존률을 높이세요.'
        };
        return reasons[item.item_type] || '탱커 역할에 최적화된 성능을 제공합니다.';
    }

    // 7. 딜러 관련 이유 생성
    getDPSReason(item) {
        const reasons = {
            '무기': '딜러의 핵심! 최대한 높은 데미지를 뽑아내세요.',
            '방어구': '딜링에 집중할 수 있도록 최소한의 방어력을 확보하세요.',
            '장신구': '공격력과 치명타를 극대화하는 스탯을 선택하세요.',
            '특수': '특수 능력으로 딜링을 더욱 강화하세요.'
        };
        return reasons[item.item_type] || '딜러 역할에 최적화된 성능을 제공합니다.';
    }

    // 8. 추가 팁 생성
    getAdditionalTips(buildType, difficulty) {
        const tips = {
            'pvp': {
                'high': '• 상대방의 패턴을 파악하고 적절한 타이밍에 스킬을 사용하세요.\n• 이동과 회피에 신경 쓰세요.\n• 상대방의 약점을 노리는 전술을 구사하세요.',
                'medium': '• 기본적인 PvP 스킬을 익히고 연습하세요.\n• 적절한 거리 유지가 중요합니다.\n• 팀워크를 고려한 포지셔닝을 하세요.',
                'low': '• PvP 기본기를 익히는 것부터 시작하세요.\n• 안전한 거리에서 공격하세요.'
            },
            'pve': {
                'high': '• 보스의 패턴을 완전히 파악하고 대응하세요.\n• 팀원과의 협력이 필수입니다.\n• 리소스 관리에 신경 쓰세요.',
                'medium': '• 몬스터의 특성을 파악하고 효율적으로 사냥하세요.\n• 지속적인 딜링을 위해 마나 관리를 하세요.',
                'low': '• 기본적인 사냥 패턴을 익히세요.\n• 안전한 사냥터에서 시작하세요.'
            },
            'tank': {
                'high': '• 팀원의 생존을 최우선으로 하세요.\n• 위협 수준을 지속적으로 유지하세요.\n• 보스의 공격 패턴을 완전히 파악하세요.',
                'medium': '• 기본적인 탱킹 스킬을 익히세요.\n• 팀원과의 소통이 중요합니다.',
                'low': '• 탱킹의 기본기를 익히는 것부터 시작하세요.'
            },
            'dps': {
                'high': '• 최대한 높은 데미지를 뽑아내세요.\n• 딜링 타이밍을 정확히 파악하세요.\n• 팀원과의 시너지를 고려하세요.',
                'medium': '• 안정적인 딜링을 우선으로 하세요.\n• 생존과 딜링의 균형을 맞추세요.',
                'low': '• 기본적인 딜링 패턴을 익히세요.'
            }
        };

        return tips[buildType]?.[difficulty] || '• 기본적인 게임 플레이를 익히세요.\n• 팀원과의 협력을 중요시하세요.';
    }

    // 9. 쿼리 로그 저장
    async logQuery(userInput, situation, items, response) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO query_logs (user_input, situation_matched, items_recommended, llm_response)
                 VALUES (?, ?, ?, ?)`,
                [
                    userInput,
                    situation.situation_name,
                    items.map(item => item.item_id).join(','),
                    response
                ],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    // 10. 메인 추천 함수
    async getRecommendation(userInput) {
        try {
            console.log(`사용자 입력: "${userInput}"`);
            
            // 1. 상황 매핑
            const situation = await this.mapUserInputToSituation(userInput);
            console.log(`매핑된 상황: ${situation.situation_name}`);
            
            // 2. 추천 아이템 조회
            const items = await this.getRecommendedItems(situation.recommended_items);
            console.log(`추천 아이템: ${items.length}개`);
            
            // 3. 추천 설명 생성
            const explanation = this.generateRecommendationExplanation(situation, items);
            
            // 4. 로그 저장
            await this.logQuery(userInput, situation, items, explanation);
            
            return {
                success: true,
                situation: situation,
                items: items,
                explanation: explanation,
                totalCost: items.reduce((sum, item) => sum + item.cost, 0)
            };
            
        } catch (error) {
            console.error('추천 생성 오류:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 11. 상황 목록 조회
    async getSituations() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM situations ORDER BY situation_id", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 12. 아이템 목록 조회
    async getItems() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM items ORDER BY item_id", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 13. 쿼리 로그 조회
    async getQueryLogs() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM query_logs ORDER BY created_at DESC LIMIT 50", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
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
                        console.log("LLM 서비스 데이터베이스 연결 종료");
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
async function testLLMService() {
    console.log("=== LLM 서비스 테스트 시작 ===");
    
    const llmService = new PoCLLMService();
    
    try {
        await llmService.connect();
        
        // 테스트 쿼리들
        const testQueries = [
            "보스 레이드에서 딜러 하고 싶어",
            "PvP 1vs1에서 이기고 싶어",
            "탱커로 플레이하고 싶어",
            "던전 클리어용 빌드 추천해줘"
        ];
        
        for (const query of testQueries) {
            console.log(`\n--- 테스트 쿼리: "${query}" ---`);
            const result = await llmService.getRecommendation(query);
            
            if (result.success) {
                console.log("✅ 추천 성공!");
                console.log(`상황: ${result.situation.situation_name}`);
                console.log(`아이템 수: ${result.items.length}개`);
                console.log(`총 비용: ${result.totalCost.toLocaleString()} 골드`);
                console.log("\n추천 설명:");
                console.log(result.explanation);
            } else {
                console.log("❌ 추천 실패:", result.error);
            }
            
            console.log("\n" + "=".repeat(50));
        }
        
    } catch (error) {
        console.error("테스트 오류:", error.message);
    } finally {
        await llmService.close();
    }
}

// 모듈 내보내기
module.exports = PoCLLMService;

// 직접 실행 시 테스트
if (require.main === module) {
    testLLMService();
}
