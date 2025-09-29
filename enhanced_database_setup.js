const sqlite3 = require('sqlite3').verbose();

class EnhancedDatabaseSetup {
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
                    console.log(`확장 데이터베이스 연결: ${this.dbPath}`);
                    resolve();
                }
            });
        });
    }

    async addEnhancedItems() {
        return new Promise((resolve, reject) => {
            const enhancedItems = [
                // 등급 3 무기들 (공격력 차별화)
                [16, "강철 검", "무기", "공격력+35, 치명타+10%", "기본적인 강철 검", 3, "uncommon", 15000],
                [17, "마법 검", "무기", "공격력+30, 마법공격력+20", "마법이 깃든 검", 3, "uncommon", 18000],
                [18, "속도 검", "무기", "공격력+25, 공격속도+30%", "빠른 공격이 가능한 검", 3, "uncommon", 16000],
                [19, "정확도 검", "무기", "공격력+40, 정확도+20%", "정확한 공격이 가능한 검", 3, "uncommon", 17000],
                
                // 등급 3 방어구들 (방어력 차별화)
                [20, "강철 갑옷", "방어구", "방어력+60, 체력+100", "기본적인 강철 갑옷", 3, "uncommon", 20000],
                [21, "마법 갑옷", "방어구", "방어력+50, 마법방어력+40", "마법 저항 갑옷", 3, "uncommon", 22000],
                [22, "가벼운 갑옷", "방어구", "방어력+45, 이동속도+25%", "가벼운 갑옷", 3, "uncommon", 18000],
                [23, "튼튼한 갑옷", "방어구", "방어력+70, 체력+120", "튼튼한 갑옷", 3, "uncommon", 25000],
                
                // 등급 3 장신구들 (스탯 차별화)
                [24, "공격 반지", "장신구", "공격력+25, 치명타+15%", "공격력 향상 반지", 3, "uncommon", 12000],
                [25, "방어 반지", "장신구", "방어력+30, 체력+80", "방어력 향상 반지", 3, "uncommon", 13000],
                [26, "마나 반지", "장신구", "마나+80, 마나회복+30%", "마나 향상 반지", 3, "uncommon", 14000],
                [27, "속도 반지", "장신구", "민첩+25, 이동속도+20%", "속도 향상 반지", 3, "uncommon", 11000],
                
                // 등급 4 무기들 (공격력 차별화)
                [28, "미스릴 검", "무기", "공격력+45, 치명타+12%", "미스릴로 만든 검", 4, "rare", 30000],
                [29, "마법 미스릴 검", "무기", "공격력+40, 마법공격력+30", "마법 미스릴 검", 4, "rare", 32000],
                [30, "속도 미스릴 검", "무기", "공격력+35, 공격속도+35%", "빠른 미스릴 검", 4, "rare", 31000],
                [31, "정확도 미스릴 검", "무기", "공격력+50, 정확도+25%", "정확한 미스릴 검", 4, "rare", 33000],
                
                // 등급 4 방어구들 (방어력 차별화)
                [32, "미스릴 갑옷", "방어구", "방어력+75, 체력+120", "미스릴 갑옷", 4, "rare", 35000],
                [33, "마법 미스릴 갑옷", "방어구", "방어력+65, 마법방어력+50", "마법 미스릴 갑옷", 4, "rare", 37000],
                [34, "가벼운 미스릴 갑옷", "방어구", "방어력+60, 이동속도+30%", "가벼운 미스릴 갑옷", 4, "rare", 36000],
                [35, "튼튼한 미스릴 갑옷", "방어구", "방어력+85, 체력+140", "튼튼한 미스릴 갑옷", 4, "rare", 40000],
                
                // 등급 4 장신구들 (스탯 차별화)
                [36, "공격 미스릴 반지", "장신구", "공격력+35, 치명타+18%", "공격 미스릴 반지", 4, "rare", 25000],
                [37, "방어 미스릴 반지", "장신구", "방어력+40, 체력+100", "방어 미스릴 반지", 4, "rare", 26000],
                [38, "마나 미스릴 반지", "장신구", "마나+100, 마나회복+40%", "마나 미스릴 반지", 4, "rare", 27000],
                [39, "속도 미스릴 반지", "장신구", "민첩+30, 이동속도+25%", "속도 미스릴 반지", 4, "rare", 24000],
                
                // 등급 5 무기들 (공격력 차별화)
                [40, "아다만틴 검", "무기", "공격력+55, 치명타+15%", "아다만틴 검", 5, "epic", 50000],
                [41, "마법 아다만틴 검", "무기", "공격력+50, 마법공격력+40", "마법 아다만틴 검", 5, "epic", 52000],
                [42, "속도 아다만틴 검", "무기", "공격력+45, 공격속도+40%", "빠른 아다만틴 검", 5, "epic", 51000],
                [43, "정확도 아다만틴 검", "무기", "공격력+60, 정확도+30%", "정확한 아다만틴 검", 5, "epic", 53000],
                
                // 등급 5 방어구들 (방어력 차별화)
                [44, "아다만틴 갑옷", "방어구", "방어력+90, 체력+140", "아다만틴 갑옷", 5, "epic", 60000],
                [45, "마법 아다만틴 갑옷", "방어구", "방어력+80, 마법방어력+60", "마법 아다만틴 갑옷", 5, "epic", 62000],
                [46, "가벼운 아다만틴 갑옷", "방어구", "방어력+75, 이동속도+35%", "가벼운 아다만틴 갑옷", 5, "epic", 61000],
                [47, "튼튼한 아다만틴 갑옷", "방어구", "방어력+100, 체력+160", "튼튼한 아다만틴 갑옷", 5, "epic", 65000],
                
                // 등급 5 장신구들 (스탯 차별화)
                [48, "공격 아다만틴 반지", "장신구", "공격력+45, 치명타+20%", "공격 아다만틴 반지", 5, "epic", 50000],
                [49, "방어 아다만틴 반지", "장신구", "방어력+50, 체력+120", "방어 아다만틴 반지", 5, "epic", 51000],
                [50, "마나 아다만틴 반지", "장신구", "마나+120, 마나회복+50%", "마나 아다만틴 반지", 5, "epic", 52000],
                [51, "속도 아다만틴 반지", "장신구", "민첩+35, 이동속도+30%", "속도 아다만틴 반지", 5, "epic", 49000]
            ];

            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO items 
                (item_id, item_name, item_type, base_stats, description, grade, rarity, cost)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let completed = 0;
            enhancedItems.forEach((item, index) => {
                stmt.run(item, (err) => {
                    if (err) {
                        console.error(`확장 아이템 삽입 오류 (${index + 1}):`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === enhancedItems.length) {
                            stmt.finalize();
                            console.log(`확장 아이템 ${enhancedItems.length}개 삽입 완료`);
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async addEnhancedSituations() {
        return new Promise((resolve, reject) => {
            const enhancedSituations = [
                // 문제별 상황 추가
                [11, "공격력 부족", "공격력이 부족해서 딜링이 안되는 상황", "16,17,18,19,24", "damage", "medium"],
                [12, "방어력 부족", "방어력이 부족해서 생존이 안되는 상황", "20,21,22,23,25", "survival", "medium"],
                [13, "마나 부족", "마나가 부족해서 스킬을 못쓰는 상황", "26,38,50", "mana", "medium"],
                [14, "속도 부족", "속도가 부족해서 움직임이 느린 상황", "18,22,27,39,51", "speed", "medium"],
                [15, "정확도 부족", "정확도가 부족해서 공격이 빗나가는 상황", "19,31,43", "accuracy", "medium"],
                
                // 등급별 상황 추가
                [16, "등급 3 최적화", "등급 3 아이템들 중 최적의 조합", "16,20,24", "optimization", "low"],
                [17, "등급 4 최적화", "등급 4 아이템들 중 최적의 조합", "28,32,36", "optimization", "medium"],
                [18, "등급 5 최적화", "등급 5 아이템들 중 최적의 조합", "40,44,48", "optimization", "high"],
                
                // 콘텐츠별 상황 추가
                [19, "던전 클리어 어려움", "던전 클리어가 어려운 상황", "16,20,24", "dungeon", "hard"],
                [20, "보스 레이드 어려움", "보스 레이드가 어려운 상황", "28,32,36", "raid", "hard"]
            ];

            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO situations 
                (situation_id, situation_name, situation_description, recommended_items, build_type, difficulty)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            let completed = 0;
            enhancedSituations.forEach((situation, index) => {
                stmt.run(situation, (err) => {
                    if (err) {
                        console.error(`확장 상황 삽입 오류 (${index + 1}):`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === enhancedSituations.length) {
                            stmt.finalize();
                            console.log(`확장 상황 ${enhancedSituations.length}개 삽입 완료`);
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async verifyEnhancedData() {
        return new Promise((resolve, reject) => {
            // 아이템 개수 확인
            this.db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`총 아이템 개수: ${row.count}개`);

                // 상황 개수 확인
                this.db.get("SELECT COUNT(*) as count FROM situations", (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log(`총 상황 개수: ${row.count}개`);

                    // 등급별 아이템 개수 확인
                    console.log("\n=== 등급별 아이템 개수 ===");
                    this.db.all("SELECT grade, COUNT(*) as count FROM items GROUP BY grade ORDER BY grade", (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        rows.forEach(row => {
                            console.log(`등급 ${row.grade}: ${row.count}개`);
                        });

                        // 타입별 아이템 개수 확인
                        console.log("\n=== 타입별 아이템 개수 ===");
                        this.db.all("SELECT item_type, COUNT(*) as count FROM items GROUP BY item_type", (err, rows) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            rows.forEach(row => {
                                console.log(`${row.item_type}: ${row.count}개`);
                            });
                            resolve();
                        });
                    });
                });
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
                        console.log("확장 데이터베이스 연결 종료");
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

async function main() {
    console.log("=== 확장 데이터베이스 설정 시작 ===");
    
    const dbSetup = new EnhancedDatabaseSetup();
    
    try {
        await dbSetup.connect();
        
        // 확장 아이템 추가
        await dbSetup.addEnhancedItems();
        
        // 확장 상황 추가
        await dbSetup.addEnhancedSituations();
        
        // 데이터 검증
        await dbSetup.verifyEnhancedData();
        
        console.log("\n=== 확장 데이터베이스 설정 완료 ===");
        console.log("이제 고급 장비 분석기를 다시 테스트할 수 있습니다!");
        
    } catch (error) {
        console.error("오류 발생:", error.message);
    } finally {
        await dbSetup.close();
    }
}

main();
