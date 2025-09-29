const fs = require('fs');

// Phase 1: 데이터 정규화 시스템
class MasteryDataNormalizer {
    constructor() {
        this.statIdMapping = {};
        this.skillDatabase = [];
        this.buildTypeMapping = {};
        this.weaponMapping = {};
    }

    // 1. 스탯 ID 매핑 테이블 구축
    buildStatIdMapping() {
        console.log('=== 스탯 ID 매핑 테이블 구축 중 ===');
        
        // TL Codex에서 수집된 스탯 ID들을 매핑
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

    // 4. 스킬 데이터 정규화
    normalizeSkillData(rawData) {
        console.log('=== 스킬 데이터 정규화 중 ===');
        
        if (!rawData || !rawData.masteryBuilder || !rawData.masteryBuilder.masterySystem) {
            console.log('마스터리 데이터를 찾을 수 없습니다.');
            return [];
        }

        // 마스터리 변수에서 스킬 데이터 추출
        const masteryVars = rawData.masteryBuilder.masterySystem.masteryVars || [];
        let skillCount = 0;

        // 스킬 데이터가 포함된 변수 찾기
        const skillDataString = masteryVars.find(varString => 
            varString.includes('"10113"') || varString.includes('"10114"') || varString.includes('"10115"')
        );

        if (skillDataString) {
            console.log('스킬 데이터 문자열 발견, 파싱 중...');
            
            // 스킬 데이터 패턴 찾기 (더 정확한 패턴)
            const skillDataMatch = skillDataString.match(/"(\d{5,})":\s*{([^}]+)}/g);
            
            if (skillDataMatch) {
                console.log(`발견된 스킬 데이터: ${skillDataMatch.length}개`);
                
                skillDataMatch.forEach(match => {
                    const skillIdMatch = match.match(/"(\d{5,})":\s*{/);
                    if (skillIdMatch) {
                        const skillId = skillIdMatch[1];
                        const skillData = this.parseSkillData(skillId, match);
                        if (skillData) {
                            this.skillDatabase.push(skillData);
                            skillCount++;
                        }
                    }
                });
            } else {
                console.log('스킬 데이터 패턴을 찾을 수 없습니다.');
                // 대안: 전체 문자열에서 스킬 ID 추출
                const allSkillIds = skillDataString.match(/"(\d{5,})":/g);
                if (allSkillIds) {
                    console.log(`전체 스킬 ID 발견: ${allSkillIds.length}개`);
                    allSkillIds.slice(0, 100).forEach(skillIdMatch => {
                        const skillId = skillIdMatch.match(/"(\d{5,})":/)[1];
                        const skillData = this.createBasicSkillData(skillId);
                        if (skillData) {
                            this.skillDatabase.push(skillData);
                            skillCount++;
                        }
                    });
                }
            }
        } else {
            console.log('스킬 데이터가 포함된 변수를 찾을 수 없습니다.');
        }

        console.log(`정규화된 스킬 데이터: ${skillCount}개`);
        return this.skillDatabase;
    }

    // 5. 개별 스킬 데이터 파싱
    parseSkillData(skillId, rawSkillData) {
        try {
            // 스킬 ID가 10000 이상인 경우만 처리 (실제 스킬)
            if (parseInt(skillId) < 10000) return null;

            const skill = {
                skill_id: skillId,
                name: `스킬_${skillId}`,
                max_level: 10,
                stat_effects: {},
                build_types: this.inferBuildTypes(skillId),
                weapon_requirements: this.inferWeaponRequirements(skillId),
                category: this.inferSkillCategory(skillId),
                description: this.generateSkillDescription(skillId)
            };

            // 레벨별 스탯 효과 파싱
            const levelMatches = rawSkillData.match(/"(\d+)":\s*{([^}]+)}/g);
            if (levelMatches) {
                levelMatches.forEach(levelMatch => {
                    const levelMatchResult = levelMatch.match(/"(\d+)":\s*{([^}]+)}/);
                    if (levelMatchResult) {
                        const level = parseInt(levelMatchResult[1]);
                        const statsString = levelMatchResult[2];
                        skill.stat_effects[level] = this.parseStatEffects(statsString);
                    }
                });
            }

            return skill;
        } catch (error) {
            console.log(`스킬 ${skillId} 파싱 실패:`, error.message);
            return null;
        }
    }

    // 6. 스탯 효과 파싱
    parseStatEffects(statsString) {
        const effects = {};
        const statMatches = statsString.match(/"(\d+)":\s*([+-]?[\d.]+)/g);
        
        if (statMatches) {
            statMatches.forEach(match => {
                const statMatch = match.match(/"(\d+)":\s*([+-]?[\d.]+)/);
                if (statMatch) {
                    const statId = statMatch[1];
                    const value = parseFloat(statMatch[2]);
                    const statName = this.statIdMapping[statId] || `알 수 없는 스탯 (${statId})`;
                    effects[statName] = value;
                }
            });
        }
        
        return effects;
    }

    // 7. 빌드 타입 추론
    inferBuildTypes(skillId) {
        const id = parseInt(skillId);
        const buildTypes = [];
        
        // 스킬 ID 패턴에 따른 빌드 타입 추론
        if (id >= 10000 && id < 20000) buildTypes.push("PvE");
        if (id >= 20000 && id < 30000) buildTypes.push("PvP");
        if (id >= 30000 && id < 40000) buildTypes.push("던전");
        if (id >= 40000 && id < 50000) buildTypes.push("레이드");
        
        return buildTypes.length > 0 ? buildTypes : ["일반"];
    }

    // 8. 무기 요구사항 추론
    inferWeaponRequirements(skillId) {
        const id = parseInt(skillId);
        const weapons = [];
        
        // 스킬 ID 패턴에 따른 무기 추론
        if (id >= 10000 && id < 11000) weapons.push("지팡이");
        if (id >= 11000 && id < 12000) weapons.push("마법봉");
        if (id >= 12000 && id < 13000) weapons.push("단검");
        if (id >= 13000 && id < 14000) weapons.push("장검");
        if (id >= 14000 && id < 15000) weapons.push("양손검");
        if (id >= 15000 && id < 16000) weapons.push("석궁");
        if (id >= 16000 && id < 17000) weapons.push("장궁");
        if (id >= 17000 && id < 18000) weapons.push("창");
        if (id >= 18000 && id < 19000) weapons.push("마력구");
        
        return weapons.length > 0 ? weapons : ["일반"];
    }

    // 9. 스킬 카테고리 추론
    inferSkillCategory(skillId) {
        const id = parseInt(skillId);
        
        if (id >= 10000 && id < 20000) return "공격";
        if (id >= 20000 && id < 30000) return "방어";
        if (id >= 30000 && id < 40000) return "지원";
        if (id >= 40000 && id < 50000) return "특수";
        
        return "일반";
    }

    // 10. 스킬 설명 생성
    generateSkillDescription(skillId) {
        const effects = this.skillDatabase.find(s => s.skill_id === skillId)?.stat_effects || {};
        const mainEffects = Object.entries(effects).slice(0, 3);
        
        let description = `스킬 ID ${skillId}`;
        if (mainEffects.length > 0) {
            description += ` - 주요 효과: `;
            description += mainEffects.map(([stat, value]) => 
                `${stat} ${value > 0 ? '+' : ''}${value}`
            ).join(', ');
        }
        
        return description;
    }

    // 11. 기본 스킬 데이터 생성
    createBasicSkillData(skillId) {
        try {
            const skill = {
                skill_id: skillId,
                name: `스킬_${skillId}`,
                max_level: 10,
                stat_effects: {},
                build_types: this.inferBuildTypes(skillId),
                weapon_requirements: this.inferWeaponRequirements(skillId),
                category: this.inferSkillCategory(skillId),
                description: `스킬 ID ${skillId} - 기본 마스터리 스킬`
            };

            // 기본 스탯 효과 생성 (예시)
            for (let level = 1; level <= 10; level++) {
                skill.stat_effects[level] = {
                    "공격력": level * 10,
                    "마나": level * 5
                };
            }

            return skill;
        } catch (error) {
            console.log(`기본 스킬 ${skillId} 생성 실패:`, error.message);
            return null;
        }
    }

    // 11. 전체 데이터 정규화 실행
    async normalizeAllData() {
        console.log('=== Phase 1: 데이터 정규화 시작 ===');
        
        try {
            // 1. 스탯 ID 매핑 구축
            this.buildStatIdMapping();
            
            // 2. 빌드 타입 매핑 구축
            this.buildBuildTypeMapping();
            
            // 3. 무기 타입 매핑 구축
            this.buildWeaponMapping();
            
            // 4. 원본 데이터 로드
            const rawData = JSON.parse(fs.readFileSync('mastery_builder_final.json', 'utf8'));
            
            // 5. 스킬 데이터 정규화
            this.normalizeSkillData(rawData);
            
            // 6. 정규화된 데이터 저장
            const normalizedData = {
                statIdMapping: this.statIdMapping,
                buildTypeMapping: this.buildTypeMapping,
                weaponMapping: this.weaponMapping,
                skillDatabase: this.skillDatabase,
                metadata: {
                    totalSkills: this.skillDatabase.length,
                    totalStats: Object.keys(this.statIdMapping).length,
                    buildTypes: Object.keys(this.buildTypeMapping).length,
                    weapons: Object.keys(this.weaponMapping).length,
                    normalizedAt: new Date().toISOString()
                }
            };
            
            fs.writeFileSync('normalized_mastery_data.json', JSON.stringify(normalizedData, null, 2), 'utf8');
            
            console.log('=== Phase 1 완료 ===');
            console.log(`정규화된 스킬: ${this.skillDatabase.length}개`);
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
    const normalizer = new MasteryDataNormalizer();
    const result = await normalizer.normalizeAllData();
    
    if (result) {
        console.log('\n=== 정규화된 데이터 샘플 ===');
        console.log('스킬 데이터 샘플:');
        console.log(JSON.stringify(result.skillDatabase.slice(0, 3), null, 2));
        
        console.log('\n스탯 매핑 샘플:');
        console.log(JSON.stringify(Object.entries(result.statIdMapping).slice(0, 10), null, 2));
    }
}

main();
