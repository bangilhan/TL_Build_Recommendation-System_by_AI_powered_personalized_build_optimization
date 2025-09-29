const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class PoCDatabaseSetup {
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
                    console.log(`데이터베이스 연결: ${this.dbPath}`);
                    resolve();
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const queries = [
                // items 테이블 생성
                `CREATE TABLE IF NOT EXISTS items (
                    item_id INTEGER PRIMARY KEY,
                    item_name TEXT NOT NULL,
                    item_type TEXT NOT NULL,
                    base_stats TEXT,
                    description TEXT,
                    grade INTEGER DEFAULT 1,
                    rarity TEXT DEFAULT 'common',
                    cost INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                
                // situations 테이블 생성
                `CREATE TABLE IF NOT EXISTS situations (
                    situation_id INTEGER PRIMARY KEY,
                    situation_name TEXT NOT NULL,
                    situation_description TEXT,
                    recommended_items TEXT,
                    build_type TEXT,
                    difficulty TEXT DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                
                // 사용자 쿼리 로그 테이블
                `CREATE TABLE IF NOT EXISTS query_logs (
                    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_input TEXT,
                    situation_matched TEXT,
                    items_recommended TEXT,
                    llm_response TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            ];

            let completed = 0;
            queries.forEach((query, index) => {
                this.db.run(query, (err) => {
                    if (err) {
                        console.error(`테이블 생성 오류 (${index + 1}):`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === queries.length) {
                            console.log("테이블 생성 완료");
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async insertSampleItems() {
        return new Promise((resolve, reject) => {
            const sampleItems = [
                // 무기류
                [1, "용의 검", "무기", "공격력+50, 치명타+15%", "고대 용의 힘이 깃든 검", 5, "epic", 50000],
                [2, "마법사의 지팡이", "무기", "마법공격력+60, 마나+100", "마법 에너지가 응축된 지팡이", 4, "rare", 35000],
                [3, "암살자의 단검", "무기", "공격력+40, 이동속도+20%", "빠른 공격을 위한 단검", 3, "uncommon", 20000],
                [4, "궁수의 석궁", "무기", "원거리공격력+55, 정확도+25%", "정밀한 조준이 가능한 석궁", 4, "rare", 40000],
                
                // 방어구류
                [5, "용의 갑옷", "방어구", "방어력+80, 체력+150", "용의 비늘로 만든 갑옷", 5, "epic", 60000],
                [6, "마법사의 로브", "방어구", "마법방어력+70, 마나+120", "마법 저항력이 높은 로브", 4, "rare", 45000],
                [7, "암살자의 가죽갑옷", "방어구", "방어력+50, 민첩+30", "가벼우면서도 튼튼한 갑옷", 3, "uncommon", 25000],
                [8, "궁수의 경갑", "방어구", "방어력+45, 이동속도+25%", "빠른 움직임을 위한 경갑", 3, "uncommon", 22000],
                
                // 장신구류
                [9, "용의 목걸이", "장신구", "모든스탯+20, 치명타피해+30%", "용의 힘을 담은 목걸이", 5, "epic", 70000],
                [10, "마법사의 반지", "장신구", "마법공격력+40, 마나회복+50%", "마법 증폭 반지", 4, "rare", 50000],
                [11, "암살자의 팔찌", "장신구", "공격속도+35%, 치명타+20%", "빠른 공격을 위한 팔찌", 4, "rare", 40000],
                [12, "궁수의 귀걸이", "장신구", "정확도+40%, 원거리공격력+25", "정밀한 조준을 위한 귀걸이", 3, "uncommon", 30000],
                
                // 특수 아이템
                [13, "용의 심장", "특수", "모든스탯+50, 특수스킬+1", "용의 핵심 에너지", 6, "legendary", 150000],
                [14, "마법의 구슬", "특수", "마나+200, 마법저항+100%", "마법 에너지의 결정체", 5, "epic", 80000],
                [15, "그림자의 망토", "특수", "은신+100%, 이동속도+50%", "그림자 속으로 숨을 수 있는 망토", 4, "rare", 60000]
            ];

            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO items 
                (item_id, item_name, item_type, base_stats, description, grade, rarity, cost)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let completed = 0;
            sampleItems.forEach((item, index) => {
                stmt.run(item, (err) => {
                    if (err) {
                        console.error(`아이템 삽입 오류 (${index + 1}):`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === sampleItems.length) {
                            stmt.finalize();
                            console.log(`샘플 아이템 ${sampleItems.length}개 삽입 완료`);
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async insertSampleSituations() {
        return new Promise((resolve, reject) => {
            const sampleSituations = [
                // PvP 상황들
                [1, "PvP 1vs1", "1대1 대결에서 승리하기 위한 빌드", "1,7,11,15", "pvp", "high"],
                [2, "PvP 그룹전", "그룹 PvP에서 팀 기여도 극대화", "5,9,13", "pvp", "high"],
                [3, "PvP 암살자", "빠른 기습과 도주가 중요한 PvP", "3,7,11,15", "pvp", "medium"],
                
                // PvE 상황들
                [4, "보스 레이드", "강력한 보스와의 장시간 전투", "1,5,9,13", "pve", "high"],
                [5, "던전 클리어", "다양한 몬스터와의 연속 전투", "2,6,10,14", "pve", "medium"],
                [6, "사냥터 파밍", "효율적인 몬스터 사냥", "4,8,12", "pve", "low"],
                
                // 특수 상황들
                [7, "탱커 빌드", "팀의 방패 역할", "5,6,9,13", "tank", "high"],
                [8, "딜러 빌드", "최대 데미지 출력", "1,2,9,10,13", "dps", "high"],
                [9, "서포터 빌드", "팀 버프와 힐링", "2,6,10,14", "support", "medium"],
                [10, "균형 빌드", "다양한 상황에 대응", "1,5,9,11", "balanced", "medium"]
            ];

            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO situations 
                (situation_id, situation_name, situation_description, recommended_items, build_type, difficulty)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            let completed = 0;
            sampleSituations.forEach((situation, index) => {
                stmt.run(situation, (err) => {
                    if (err) {
                        console.error(`상황 삽입 오류 (${index + 1}):`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === sampleSituations.length) {
                            stmt.finalize();
                            console.log(`샘플 상황 ${sampleSituations.length}개 삽입 완료`);
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async verifyData() {
        return new Promise((resolve, reject) => {
            // 아이템 개수 확인
            this.db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`아이템 개수: ${row.count}개`);

                // 상황 개수 확인
                this.db.get("SELECT COUNT(*) as count FROM situations", (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log(`상황 개수: ${row.count}개`);

                    // 샘플 데이터 출력
                    console.log("\n=== 아이템 샘플 ===");
                    this.db.all("SELECT * FROM items LIMIT 5", (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        rows.forEach(row => {
                            console.log(`ID: ${row.item_id}, 이름: ${row.item_name}, 타입: ${row.item_type}, 스탯: ${row.base_stats}`);
                        });

                        console.log("\n=== 상황 샘플 ===");
                        this.db.all("SELECT * FROM situations LIMIT 5", (err, rows) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            rows.forEach(row => {
                                console.log(`ID: ${row.situation_id}, 이름: ${row.situation_name}, 추천아이템: ${row.recommended_items}`);
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
                        console.log("데이터베이스 연결 종료");
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
    console.log("=== PoC 데이터베이스 설정 시작 ===");
    
    // 데이터베이스 설정
    const dbSetup = new PoCDatabaseSetup();
    
    try {
        // 데이터베이스 연결
        await dbSetup.connect();
        
        // 테이블 생성
        await dbSetup.createTables();
        
        // 샘플 데이터 삽입
        await dbSetup.insertSampleItems();
        await dbSetup.insertSampleSituations();
        
        // 데이터 검증
        await dbSetup.verifyData();
        
        console.log("\n=== PoC 데이터베이스 설정 완료 ===");
        console.log("이제 LLM 연동 및 웹 인터페이스 구현을 진행할 수 있습니다!");
        
    } catch (error) {
        console.error("오류 발생:", error.message);
    } finally {
        await dbSetup.close();
    }
}

main();
