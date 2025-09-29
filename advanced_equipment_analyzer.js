const sqlite3 = require('sqlite3').verbose();

class AdvancedEquipmentAnalyzer {
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
                    console.log(`고급 장비 분석기 데이터베이스 연결: ${this.dbPath}`);
                    resolve();
                }
            });
        });
    }

    // 1. 사용자 장비 현황 파싱
    parseUserEquipment(userInput) {
        console.log(`사용자 장비 현황 분석: "${userInput}"`);
        
        // 장비 정보 추출 패턴들
        const equipmentPatterns = {
            // 무기 패턴
            weapon: /(?:무기|weapon|검|지팡이|단검|석궁|창|마법봉|마력구).*?(?:등급|grade|티어|tier).*?(\d+)/gi,
            
            // 방어구 패턴
            armor: /(?:갑옷|armor|로브|가죽갑옷|경갑).*?(?:등급|grade|티어|tier).*?(\d+)/gi,
            
            // 장신구 패턴
            accessory: /(?:목걸이|반지|팔찌|귀걸이|necklace|ring|bracelet|earring).*?(?:등급|grade|티어|tier).*?(\d+)/gi,
            
            // 스탯 패턴
            stats: /(?:공격력|방어력|체력|마나|치명타|민첩|지능|힘|체력).*?(\d+)/gi
        };

        const currentEquipment = {
            weapon: this.extractEquipmentInfo(userInput, 'weapon'),
            armor: this.extractEquipmentInfo(userInput, 'armor'),
            accessories: this.extractEquipmentInfo(userInput, 'accessory'),
            stats: this.extractStatsInfo(userInput),
            difficulty: this.extractDifficulty(userInput),
            problem: this.extractProblem(userInput)
        };

        console.log('파싱된 장비 정보:', currentEquipment);
        return currentEquipment;
    }

    // 2. 장비 정보 추출
    extractEquipmentInfo(userInput, type) {
        const patterns = {
            weapon: [
                /(?:무기|weapon).*?(?:등급|grade|티어|tier).*?(\d+)/gi,
                /(?:검|지팡이|단검|석궁|창|마법봉|마력구).*?(?:등급|grade|티어|tier).*?(\d+)/gi
            ],
            armor: [
                /(?:갑옷|armor|로브|가죽갑옷|경갑).*?(?:등급|grade|티어|tier).*?(\d+)/gi
            ],
            accessory: [
                /(?:목걸이|반지|팔찌|귀걸이|necklace|ring|bracelet|earring).*?(?:등급|grade|티어|tier).*?(\d+)/gi
            ]
        };

        const typePatterns = patterns[type] || [];
        const grades = [];

        typePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(userInput)) !== null) {
                grades.push(parseInt(match[1]));
            }
        });

        return grades.length > 0 ? Math.max(...grades) : null;
    }

    // 3. 스탯 정보 추출
    extractStatsInfo(userInput) {
        const stats = {};
        const statPatterns = {
            attack: /(?:공격력|attack).*?(\d+)/gi,
            defense: /(?:방어력|defense).*?(\d+)/gi,
            health: /(?:체력|health|hp).*?(\d+)/gi,
            mana: /(?:마나|mana|mp).*?(\d+)/gi,
            crit: /(?:치명타|critical|crit).*?(\d+)/gi,
            dex: /(?:민첩|dexterity|dex).*?(\d+)/gi,
            int: /(?:지능|intelligence|int).*?(\d+)/gi,
            str: /(?:힘|strength|str).*?(\d+)/gi,
            con: /(?:체력|constitution|con).*?(\d+)/gi
        };

        Object.entries(statPatterns).forEach(([stat, pattern]) => {
            let match;
            while ((match = pattern.exec(userInput)) !== null) {
                stats[stat] = parseInt(match[1]);
            }
        });

        return stats;
    }

    // 4. 난이도 추출
    extractDifficulty(userInput) {
        const difficultyKeywords = {
            'easy': ['쉬움', 'easy', '간단', '쉽게'],
            'medium': ['보통', 'medium', '적당', '중간'],
            'hard': ['어려움', 'hard', '어려워', '힘들어', '어려운'],
            'extreme': ['극한', 'extreme', '매우어려움', '극도로어려움']
        };

        const lowerInput = userInput.toLowerCase();
        for (const [level, keywords] of Object.entries(difficultyKeywords)) {
            if (keywords.some(keyword => lowerInput.includes(keyword))) {
                return level;
            }
        }
        return 'medium'; // 기본값
    }

    // 5. 문제점 추출
    extractProblem(userInput) {
        const problemKeywords = {
            'damage': ['데미지', '딜링', '공격력', 'damage', 'dps'],
            'survival': ['생존', '죽어', '버티기', 'survival', 'tank'],
            'mana': ['마나', '마나부족', '마나고갈', 'mana'],
            'speed': ['속도', '느려', '빠르게', 'speed'],
            'accuracy': ['정확도', '빗나가', 'miss', 'accuracy']
        };

        const lowerInput = userInput.toLowerCase();
        const problems = [];
        
        Object.entries(problemKeywords).forEach(([problem, keywords]) => {
            if (keywords.some(keyword => lowerInput.includes(keyword))) {
                problems.push(problem);
            }
        });

        return problems.length > 0 ? problems : ['general'];
    }

    // 6. 동일 등급 아이템 조회
    async getSameGradeItems(equipmentType, grade) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM items 
                WHERE item_type = ? AND grade = ?
                ORDER BY cost ASC
            `;
            
            this.db.all(query, [equipmentType, grade], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 7. 스탯 비교 분석
    compareItemStats(item1, item2, userProblems) {
        const stats1 = this.parseItemStats(item1.base_stats);
        const stats2 = this.parseItemStats(item2.base_stats);
        
        let score1 = 0;
        let score2 = 0;
        
        // 문제점에 따른 가중치 적용
        userProblems.forEach(problem => {
            switch (problem) {
                case 'damage':
                    score1 += (stats1.attack || 0) * 2;
                    score2 += (stats2.attack || 0) * 2;
                    score1 += (stats1.crit || 0) * 1.5;
                    score2 += (stats2.crit || 0) * 1.5;
                    break;
                case 'survival':
                    score1 += (stats1.defense || 0) * 2;
                    score2 += (stats2.defense || 0) * 2;
                    score1 += (stats1.health || 0) * 1.5;
                    score2 += (stats2.health || 0) * 1.5;
                    break;
                case 'mana':
                    score1 += (stats1.mana || 0) * 2;
                    score2 += (stats2.mana || 0) * 2;
                    break;
                case 'speed':
                    score1 += (stats1.dex || 0) * 2;
                    score2 += (stats2.dex || 0) * 2;
                    break;
                case 'accuracy':
                    score1 += (stats1.accuracy || 0) * 2;
                    score2 += (stats2.accuracy || 0) * 2;
                    break;
                default:
                    // 일반적인 경우 모든 스탯 동일 가중치
                    score1 += Object.values(stats1).reduce((sum, val) => sum + (val || 0), 0);
                    score2 += Object.values(stats2).reduce((sum, val) => sum + (val || 0), 0);
            }
        });
        
        return {
            item1: { ...item1, score: score1 },
            item2: { ...item2, score: score2 },
            better: score1 > score2 ? item1 : item2,
            difference: Math.abs(score1 - score2)
        };
    }

    // 8. 아이템 스탯 파싱
    parseItemStats(statsString) {
        const stats = {};
        const patterns = {
            attack: /(?:공격력|attack).*?(\d+)/gi,
            defense: /(?:방어력|defense).*?(\d+)/gi,
            health: /(?:체력|health|hp).*?(\d+)/gi,
            mana: /(?:마나|mana|mp).*?(\d+)/gi,
            crit: /(?:치명타|critical|crit).*?(\d+)/gi,
            dex: /(?:민첩|dexterity|dex).*?(\d+)/gi,
            int: /(?:지능|intelligence|int).*?(\d+)/gi,
            str: /(?:힘|strength|str).*?(\d+)/gi,
            con: /(?:체력|constitution|con).*?(\d+)/gi,
            accuracy: /(?:정확도|accuracy).*?(\d+)/gi,
            speed: /(?:이동속도|speed).*?(\d+)/gi
        };

        Object.entries(patterns).forEach(([stat, pattern]) => {
            let match;
            while ((match = pattern.exec(statsString)) !== null) {
                stats[stat] = parseInt(match[1]);
            }
        });

        return stats;
    }

    // 9. 고도화된 추천 생성
    async generateAdvancedRecommendation(userInput) {
        try {
            console.log(`고급 추천 생성 시작: "${userInput}"`);
            
            // 1. 사용자 장비 현황 분석
            const currentEquipment = this.parseUserEquipment(userInput);
            
            // 2. 문제점별 최적화 추천
            const recommendations = [];
            
            for (const problem of currentEquipment.problem) {
                const problemRecommendations = await this.getProblemSpecificRecommendations(
                    problem, 
                    currentEquipment
                );
                recommendations.push(...problemRecommendations);
            }
            
            // 3. 추천 결과 정리 및 설명 생성
            const explanation = this.generateAdvancedExplanation(
                currentEquipment, 
                recommendations
            );
            
            return {
                success: true,
                currentEquipment: currentEquipment,
                recommendations: recommendations,
                explanation: explanation,
                totalCost: recommendations.reduce((sum, rec) => sum + rec.cost, 0)
            };
            
        } catch (error) {
            console.error('고급 추천 생성 오류:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 10. 문제별 맞춤 추천
    async getProblemSpecificRecommendations(problem, currentEquipment) {
        const recommendations = [];
        
        // 문제별 최적 아이템 타입 결정
        const optimalTypes = this.getOptimalTypesForProblem(problem);
        
        for (const type of optimalTypes) {
            // 현재 등급과 동일한 등급의 아이템들 조회
            const sameGradeItems = await this.getSameGradeItems(type, currentEquipment[type] || 3);
            
            if (sameGradeItems.length > 1) {
                // 스탯 비교 분석
                const comparison = this.compareItemStats(
                    sameGradeItems[0], 
                    sameGradeItems[1], 
                    [problem]
                );
                
                recommendations.push({
                    ...comparison.better,
                    problem: problem,
                    improvement: comparison.difference,
                    reason: this.getImprovementReason(problem, comparison.better)
                });
            }
        }
        
        return recommendations;
    }

    // 11. 문제별 최적 아이템 타입 결정
    getOptimalTypesForProblem(problem) {
        const typeMapping = {
            'damage': ['무기', '장신구'],
            'survival': ['방어구', '장신구'],
            'mana': ['장신구', '특수'],
            'speed': ['방어구', '장신구'],
            'accuracy': ['무기', '장신구'],
            'general': ['무기', '방어구', '장신구']
        };
        
        return typeMapping[problem] || ['무기'];
    }

    // 12. 개선 이유 생성
    getImprovementReason(problem, item) {
        const reasons = {
            'damage': `이 아이템은 공격력과 치명타를 크게 향상시켜 딜링 문제를 해결해줍니다.`,
            'survival': `이 아이템은 방어력과 체력을 크게 향상시켜 생존 문제를 해결해줍니다.`,
            'mana': `이 아이템은 마나와 마나 회복을 크게 향상시켜 마나 문제를 해결해줍니다.`,
            'speed': `이 아이템은 민첩과 이동속도를 크게 향상시켜 속도 문제를 해결해줍니다.`,
            'accuracy': `이 아이템은 정확도를 크게 향상시켜 명중률 문제를 해결해줍니다.`,
            'general': `이 아이템은 전반적인 스탯을 향상시켜 게임 플레이를 개선해줍니다.`
        };
        
        return reasons[problem] || reasons['general'];
    }

    // 13. 고급 설명 생성
    generateAdvancedExplanation(currentEquipment, recommendations) {
        let explanation = `🎯 **맞춤형 장비 최적화 추천**\n\n`;
        
        explanation += `**현재 상황 분석**:\n`;
        explanation += `- 문제점: ${currentEquipment.problem.join(', ')}\n`;
        explanation += `- 난이도: ${currentEquipment.difficulty}\n`;
        explanation += `- 현재 장비 등급: 무기 ${currentEquipment.weapon || '미지정'}, 방어구 ${currentEquipment.armor || '미지정'}\n\n`;
        
        explanation += `**동일 등급 내 최적화 추천**:\n\n`;
        
        recommendations.forEach((rec, index) => {
            explanation += `${index + 1}. **${rec.item_name}** (${rec.rarity})\n`;
            explanation += `   - 효과: ${rec.base_stats}\n`;
            explanation += `   - 비용: ${rec.cost.toLocaleString()} 골드\n`;
            explanation += `   - 개선 효과: ${rec.improvement}점 향상\n`;
            explanation += `   - 추천 이유: ${rec.reason}\n\n`;
        });
        
        explanation += `💡 **핵심 포인트**:\n`;
        explanation += `• 동일 등급 내에서도 스탯 조합에 따라 성능 차이가 큽니다.\n`;
        explanation += `• 현재 겪고 있는 문제점에 특화된 스탯을 우선시하세요.\n`;
        explanation += `• 비용 대비 효과가 가장 높은 아이템을 선택하세요.\n`;
        
        return explanation;
    }

    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('데이터베이스 종료 오류:', err.message);
                    } else {
                        console.log("고급 장비 분석기 데이터베이스 연결 종료");
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
async function testAdvancedAnalyzer() {
    console.log("=== 고급 장비 분석기 테스트 시작 ===");
    
    const analyzer = new AdvancedEquipmentAnalyzer();
    
    try {
        await analyzer.connect();
        
        // 테스트 쿼리들
        const testQueries = [
            "던전 클리어가 너무 어려워, 현재 무기 등급 3인데 공격력이 부족해",
            "PvP에서 자꾸 죽어, 방어구 등급 4인데 생존이 안돼",
            "마나가 부족해서 스킬을 못써, 장신구 등급 3인데 마나 문제야",
            "보스 레이드에서 딜링이 부족해, 무기 등급 5인데 치명타가 낮아"
        ];
        
        for (const query of testQueries) {
            console.log(`\n--- 테스트 쿼리: "${query}" ---`);
            const result = await analyzer.generateAdvancedRecommendation(query);
            
            if (result.success) {
                console.log("✅ 고급 추천 성공!");
                console.log(`문제점: ${result.currentEquipment.problem.join(', ')}`);
                console.log(`추천 아이템: ${result.recommendations.length}개`);
                console.log(`총 비용: ${result.totalCost.toLocaleString()} 골드`);
                console.log("\n추천 설명:");
                console.log(result.explanation);
            } else {
                console.log("❌ 고급 추천 실패:", result.error);
            }
            
            console.log("\n" + "=".repeat(50));
        }
        
    } catch (error) {
        console.error("테스트 오류:", error.message);
    } finally {
        await analyzer.close();
    }
}

// 모듈 내보내기
module.exports = AdvancedEquipmentAnalyzer;

// 직접 실행 시 테스트
if (require.main === module) {
    testAdvancedAnalyzer();
}
