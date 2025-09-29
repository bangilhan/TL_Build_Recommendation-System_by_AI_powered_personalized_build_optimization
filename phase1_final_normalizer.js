const fs = require('fs');

// Phase 1: 최종 정규화 시스템 (실제 데이터 구조에 맞춤)
class FinalMasteryDataNormalizer {
    constructor() {
        this.statIdMapping = {};
        this.skillDatabase = [];
        this.buildTypeMapping = {};
        this.weaponMapping = {};
        this.nodeDatabase = [];
        this.itemDatabase = [];
        this.masterySystem = {};
    }

    // 1. 스탯 ID 매핑 테이블 구축
    buildStatIdMapping() {
        console.log('=== 스탯 ID 매핑 테이블 구축 중 ===');
        
        this.statIdMapping = {
            // 기본 스탯
            "155": "힘 (STR)",
            "156": "체력 (CON)", 
            "157": "민첩 (DEX)",
            "158": "지각 (PER)",
            "159": "정신력 (SPI)",
            "160": "지능 (INT)",
            "161": "지능 (INT)",
            "162": "지능 (INT)",
            
            // 공격력 관련
            "143": "공격력 (주무기)",
            "144": "공격력 (보조무기)",
            "145": "공격력 (원거리)",
            "128": "물리 공격력",
            "129": "마법 공격력", 
            "130": "원거리 공격력",
            "131": "물리 공격력",
            "132": "마법 공격력",
            "133": "원거리 공격력",
            "134": "물리 공격력",
            "135": "마법 공격력",
            "136": "원거리 공격력",
            "137": "물리 공격력",
            "138": "마법 공격력",
            "139": "원거리 공격력",
            "140": "물리 공격력",
            "141": "마법 공격력",
            "142": "원거리 공격력",
            
            // 방어력 관련
            "146": "물리 방어력",
            "147": "마법 방어력",
            "148": "원거리 방어력",
            "149": "물리 방어력",
            "150": "마법 방어력",
            "151": "원거리 방어력",
            "152": "물리 방어력",
            "153": "마법 방어력",
            "154": "원거리 방어력",
            
            // 특수 스탯
            "163": "마나",
            "164": "체력",
            "165": "체력",
            "166": "체력",
            "167": "체력",
            "168": "체력",
            "169": "체력",
            "170": "체력",
            "171": "체력",
            "172": "체력",
            "173": "체력",
            "174": "체력",
            "175": "체력",
            "176": "체력",
            "177": "체력",
            "178": "체력",
            "179": "체력",
            
            // 치명타 관련
            "126": "치명타 확률",
            "125": "마나 소모량",
            
            // 기타 스탯
            "203": "마나 소모량",
            "204": "쿨다운 감소",
            "205": "이동속도",
            "206": "공격속도",
            "207": "시전속도",
            "208": "회피율",
            "209": "차단율",
            "210": "치명타 피해",
            "211": "치명타 확률",
            "212": "치명타 피해",
            "213": "치명타 확률",
            "214": "치명타 피해",
            "215": "치명타 확률",
            "216": "치명타 피해",
            "217": "치명타 확률",
            "218": "치명타 피해",
            "219": "치명타 확률",
            "220": "치명타 피해",
            "221": "치명타 확률",
            "222": "치명타 피해",
            "223": "치명타 확률",
            "224": "치명타 피해",
            "225": "치명타 확률",
            "226": "치명타 피해",
            "227": "치명타 확률",
            "228": "치명타 피해",
            "229": "치명타 확률",
            "230": "치명타 피해",
            "231": "치명타 확률",
            "232": "치명타 피해",
            "233": "치명타 확률",
            "234": "치명타 피해",
            "235": "치명타 확률",
            "236": "치명타 피해",
            "237": "치명타 확률",
            "238": "치명타 피해",
            "239": "치명타 확률",
            "240": "치명타 피해",
            "241": "치명타 확률",
            "242": "치명타 피해",
            "243": "치명타 확률",
            "244": "치명타 피해",
            "245": "치명타 확률",
            "246": "치명타 피해",
            "247": "치명타 확률",
            "248": "치명타 피해",
            "249": "치명타 확률",
            "250": "치명타 피해",
            "251": "치명타 확률",
            "252": "치명타 피해",
            "253": "치명타 확률",
            "254": "치명타 피해",
            "255": "치명타 확률",
            "256": "치명타 피해",
            "257": "치명타 확률",
            "258": "치명타 피해",
            "259": "치명타 확률",
            "260": "치명타 피해",
            "261": "치명타 확률",
            "262": "치명타 피해",
            "263": "치명타 확률",
            "264": "치명타 피해",
            "265": "치명타 확률",
            "266": "치명타 피해",
            "267": "치명타 확률",
            "268": "치명타 피해",
            "269": "치명타 확률",
            "270": "치명타 피해",
            "271": "치명타 확률",
            "272": "치명타 피해",
            "273": "치명타 확률",
            "274": "치명타 피해",
            "275": "치명타 확률",
            "276": "치명타 피해",
            "277": "치명타 확률",
            "278": "치명타 피해",
            "279": "치명타 확률",
            "280": "치명타 피해",
            "281": "치명타 확률",
            "282": "치명타 피해",
            "283": "치명타 확률",
            "284": "치명타 피해",
            "285": "치명타 확률",
            "286": "치명타 피해",
            "287": "치명타 확률",
            "288": "치명타 피해",
            "289": "치명타 확률",
            "290": "치명타 피해",
            "291": "치명타 확률",
            "292": "치명타 피해",
            "293": "치명타 확률",
            "294": "치명타 피해",
            "295": "치명타 확률",
            "296": "치명타 피해",
            "297": "치명타 확률",
            "298": "치명타 피해",
            "299": "치명타 확률",
            "300": "치명타 피해"
        };
        
        console.log(`스탯 ID 매핑 완료: ${Object.keys(this.statIdMapping).length}개`);
        return this.statIdMapping;
    }

    // 2. 빌드 타입 매핑
    buildBuildTypeMapping() {
        console.log('=== 빌드 타입 매핑 구축 중 ===');
        
        this.buildTypeMapping = {
            "1": "PvE",
            "2": "PvP", 
            "3": "던전",
            "4": "레이드",
            "5": "공성",
            "6": "월드 보스",
            "7": "일반"
        };
        
        console.log(`빌드 타입 매핑 완료: ${Object.keys(this.buildTypeMapping).length}개`);
        return this.buildTypeMapping;
    }

    // 3. 무기 타입 매핑
    buildWeaponMapping() {
        console.log('=== 무기 타입 매핑 구축 중 ===');
        
        this.weaponMapping = {
            "greatsword": "양손검",
            "sword": "장검",
            "dagger": "단검",
            "crossbow": "석궁",
            "bow": "장궁",
            "staff": "지팡이",
            "wand": "마법봉",
            "spear": "창",
            "orb": "마력구"
        };
        
        console.log(`무기 타입 매핑 완료: ${Object.keys(this.weaponMapping).length}개`);
        return this.weaponMapping;
    }

    // 4. 마스터리 시스템 데이터 추출
    extractMasterySystemData(rawData) {
        console.log('=== 마스터리 시스템 데이터 추출 중 ===');
        
        if (!rawData || !rawData.masteryBuilder || !rawData.masteryBuilder.masterySystem) {
            console.log('마스터리 데이터를 찾을 수 없습니다.');
            return;
        }

        const buildVars = rawData.masteryBuilder.masterySystem.buildVars || [];
        let itemCount = 0;
        let nodeCount = 0;

        // builder_data 변수 찾기
        const builderDataVar = buildVars.find(varString => 
            varString.includes('var builder_data=')
        );

        if (builderDataVar) {
            console.log('builder_data 변수 발견, 파싱 중...');
            
            try {
                const jsonStart = builderDataVar.indexOf('var builder_data=') + 'var builder_data='.length;
                const jsonString = builderDataVar.substring(jsonStart);
                const builderData = JSON.parse(jsonString);
                
                console.log('builder_data 파싱 성공');
                
                // 아이템 데이터 처리
                if (builderData.items) {
                    Object.entries(builderData.items).forEach(([itemId, itemData]) => {
                        const itemInfo = this.createItemFromData(itemId, itemData);
                        if (itemInfo) {
                            this.itemDatabase.push(itemInfo);
                            itemCount++;
                        }
                    });
                }
                
                // 노드 아이템 데이터 처리
                if (builderData.nodeitems) {
                    Object.entries(builderData.nodeitems).forEach(([nodeId, nodeData]) => {
                        const nodeInfo = this.createNodeFromData(nodeId, nodeData);
                        if (nodeInfo) {
                            this.nodeDatabase.push(nodeInfo);
                            nodeCount++;
                        }
                    });
                }
                
                // 마스터리 시스템 정보 저장
                this.masterySystem = {
                    totalItems: itemCount,
                    totalNodes: nodeCount,
                    buildTypes: rawData.masteryBuilder.buildTypes || [],
                    canvasInfo: rawData.masteryBuilder.canvasInfo || {},
                    formData: rawData.masteryBuilder.formData || {}
                };
                
            } catch (error) {
                console.log('builder_data 파싱 실패:', error.message);
            }
        } else {
            console.log('builder_data 변수를 찾을 수 없습니다.');
        }

        console.log(`추출된 아이템: ${itemCount}개`);
        console.log(`추출된 노드: ${nodeCount}개`);
    }

    // 5. 아이템 데이터 생성
    createItemFromData(itemId, itemData) {
        try {
            if (!Array.isArray(itemData) || itemData.length < 2) {
                return null;
            }

            const itemName = itemData[0];
            const itemGrade = itemData[1];
            const itemIcon = itemData[2] || '';

            const item = {
                item_id: itemId,
                name: itemName,
                grade: itemGrade,
                icon: itemIcon,
                category: this.inferItemCategory(itemName),
                type: this.inferItemType(itemName),
                description: this.generateItemDescription(itemName, itemGrade),
                cost_info: this.generateItemCostInfo(itemGrade),
                rarity: this.inferItemRarity(itemGrade)
            };

            return item;
        } catch (error) {
            console.log(`아이템 ${itemId} 생성 실패:`, error.message);
            return null;
        }
    }

    // 6. 노드 데이터 생성
    createNodeFromData(nodeId, nodeData) {
        try {
            if (typeof nodeData !== 'object' || nodeData === null) {
                return null;
            }

            const node = {
                node_id: nodeId,
                required_items: {},
                total_cost: 0,
                category: this.inferNodeCategory(nodeId),
                tier: this.inferNodeTier(nodeId),
                description: `마스터리 노드 ${nodeId}`,
                difficulty: this.inferNodeDifficulty(nodeId, nodeData)
            };

            // 필요한 아이템과 비용 계산
            Object.entries(nodeData).forEach(([itemId, quantity]) => {
                node.required_items[itemId] = quantity;
                node.total_cost += quantity;
            });

            return node;
        } catch (error) {
            console.log(`노드 ${nodeId} 생성 실패:`, error.message);
            return null;
        }
    }

    // 7. 아이템 카테고리 추론
    inferItemCategory(itemName) {
        const categories = {
            '원석': ['원석', 'gem', 'stone'],
            '화폐': ['솔란트', 'adena', 'gold'],
            '재료': ['재료', 'material', 'ingredient'],
            '소모품': ['포션', 'potion', 'consumable'],
            '장비': ['무기', 'weapon', 'armor', 'equipment']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => itemName.toLowerCase().includes(keyword.toLowerCase()))) {
                return category;
            }
        }

        return '기타';
    }

    // 8. 아이템 타입 추론
    inferItemType(itemName) {
        if (itemName.includes('원석')) return 'enhancement_stone';
        if (itemName.includes('솔란트')) return 'currency';
        return 'material';
    }

    // 9. 아이템 희귀도 추론
    inferItemRarity(grade) {
        if (grade >= 8) return 'legendary';
        if (grade >= 6) return 'epic';
        if (grade >= 4) return 'rare';
        if (grade >= 2) return 'uncommon';
        return 'common';
    }

    // 10. 노드 카테고리 추론
    inferNodeCategory(nodeId) {
        const id = parseInt(nodeId);
        
        if (id >= 10000 && id < 20000) return '기본';
        if (id >= 20000 && id < 30000) return '고급';
        if (id >= 30000 && id < 40000) return '전문';
        if (id >= 40000 && id < 50000) return '마스터';
        
        return '일반';
    }

    // 11. 노드 티어 추론
    inferNodeTier(nodeId) {
        const id = parseInt(nodeId);
        
        if (id >= 10000 && id < 15000) return 1;
        if (id >= 15000 && id < 20000) return 2;
        if (id >= 20000 && id < 25000) return 3;
        if (id >= 25000 && id < 30000) return 4;
        if (id >= 30000 && id < 35000) return 5;
        if (id >= 35000 && id < 40000) return 6;
        if (id >= 40000 && id < 45000) return 7;
        if (id >= 45000 && id < 50000) return 8;
        
        return 1;
    }

    // 12. 노드 난이도 추론
    inferNodeDifficulty(nodeId, nodeData) {
        const totalCost = Object.values(nodeData).reduce((sum, cost) => sum + cost, 0);
        
        if (totalCost >= 1000000) return 'extreme';
        if (totalCost >= 100000) return 'hard';
        if (totalCost >= 10000) return 'medium';
        if (totalCost >= 1000) return 'easy';
        return 'trivial';
    }

    // 13. 아이템 설명 생성
    generateItemDescription(itemName, grade) {
        const rarity = this.inferItemRarity(grade);
        const rarityNames = {
            'common': '일반',
            'uncommon': '고급',
            'rare': '희귀',
            'epic': '영웅',
            'legendary': '전설'
        };
        
        return `${itemName} (${rarityNames[rarity]} 등급 ${grade})`;
    }

    // 14. 아이템 비용 정보 생성
    generateItemCostInfo(grade) {
        const baseCost = 1000;
        const gradeMultiplier = Math.pow(2, grade - 1);
        
        return {
            base_value: baseCost * gradeMultiplier,
            market_value: baseCost * gradeMultiplier * 1.2,
            crafting_cost: baseCost * gradeMultiplier * 0.8
        };
    }

    // 15. 전체 데이터 정규화 실행
    async normalizeAllData() {
        console.log('=== Phase 1: 최종 데이터 정규화 시작 ===');
        
        try {
            // 1. 스탯 ID 매핑 구축
            this.buildStatIdMapping();
            
            // 2. 빌드 타입 매핑 구축
            this.buildBuildTypeMapping();
            
            // 3. 무기 타입 매핑 구축
            this.buildWeaponMapping();
            
            // 4. 원본 데이터 로드
            const rawData = JSON.parse(fs.readFileSync('mastery_builder_final.json', 'utf8'));
            
            // 5. 마스터리 시스템 데이터 추출
            this.extractMasterySystemData(rawData);
            
            // 6. 정규화된 데이터 저장
            const normalizedData = {
                statIdMapping: this.statIdMapping,
                buildTypeMapping: this.buildTypeMapping,
                weaponMapping: this.weaponMapping,
                itemDatabase: this.itemDatabase,
                nodeDatabase: this.nodeDatabase,
                masterySystem: this.masterySystem,
                metadata: {
                    totalItems: this.itemDatabase.length,
                    totalNodes: this.nodeDatabase.length,
                    totalStats: Object.keys(this.statIdMapping).length,
                    buildTypes: Object.keys(this.buildTypeMapping).length,
                    weapons: Object.keys(this.weaponMapping).length,
                    normalizedAt: new Date().toISOString()
                }
            };
            
            fs.writeFileSync('normalized_mastery_data.json', JSON.stringify(normalizedData, null, 2), 'utf8');
            
            console.log('=== Phase 1 완료 ===');
            console.log(`정규화된 아이템: ${this.itemDatabase.length}개`);
            console.log(`정규화된 노드: ${this.nodeDatabase.length}개`);
            console.log(`스탯 매핑: ${Object.keys(this.statIdMapping).length}개`);
            console.log(`빌드 타입: ${Object.keys(this.buildTypeMapping).length}개`);
            console.log(`무기 타입: ${Object.keys(this.weaponMapping).length}개`);
            
            return normalizedData;
            
        } catch (error) {
            console.error('데이터 정규화 중 오류:', error.message);
            return null;
        }
    }
}

// 실행
async function main() {
    const normalizer = new FinalMasteryDataNormalizer();
    const result = await normalizer.normalizeAllData();
    
    if (result) {
        console.log('\n=== 정규화된 데이터 샘플 ===');
        console.log('아이템 데이터 샘플:');
        console.log(JSON.stringify(result.itemDatabase, null, 2));
        
        console.log('\n노드 데이터 샘플:');
        console.log(JSON.stringify(result.nodeDatabase.slice(0, 5), null, 2));
        
        console.log('\n마스터리 시스템 정보:');
        console.log(JSON.stringify(result.masterySystem, null, 2));
        
        console.log('\n스탯 매핑 샘플:');
        console.log(JSON.stringify(Object.entries(result.statIdMapping).slice(0, 10), null, 2));
    }
}

main();
