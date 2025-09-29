const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectAllQuestlogData() {
    console.log('=== Questlog.gg 전체 데이터 수집 시작 ===');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const allApiResponses = [];
        
        // API 응답 수집
        page.on('response', async (response) => {
            const responseUrl = response.url();
            
            if (responseUrl.includes('/api/trpc/') && response.status() === 200) {
                try {
                    const responseData = await response.json();
                    allApiResponses.push({
                        url: responseUrl,
                        data: responseData,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`수집: ${responseUrl}`);
                } catch (error) {
                    console.log(`파싱 실패: ${responseUrl}`);
                }
            }
        });
        
        // 여러 페이지 방문
        const urls = [
            'https://questlog.gg/throne-and-liberty/ko/character-builder/RepeatingChestMeditateTwilight',
            'https://questlog.gg/throne-and-liberty/ko/skill-builder?tag=pve-grinding',
            'https://questlog.gg/throne-and-liberty/ko/character-builder/ThePeerlessCookOfMana/combat-simulator?build-id=6446458'
        ];
        
        for (const url of urls) {
            console.log(`방문 중: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForTimeout(5000);
        }
        
        console.log(`총 ${allApiResponses.length}개의 API 응답 수집 완료`);
        
        // 데이터 분류
        const categorizedData = {
            characters: [],
            builds: [],
            equipment: [],
            skills: [],
            skillTraits: [],
            weaponSpecializations: [],
            statFormats: [],
            runeSynergies: [],
            equipmentSets: [],
            equipmentRunes: []
        };
        
        allApiResponses.forEach(response => {
            if (response.data.result && response.data.result.data) {
                const data = response.data.result.data;
                
                // 캐릭터 데이터
                if (data.character) {
                    categorizedData.characters.push(data.character);
                }
                
                // 빌드 데이터
                if (data.builds) {
                    categorizedData.builds.push(...data.builds);
                }
                
                // 장비 아이템 데이터
                if (data.equipment) {
                    categorizedData.equipment.push(...data.equipment);
                }
                
                // 스킬 세트 데이터
                if (data.skillSets) {
                    categorizedData.skills.push(...data.skillSets);
                }
                
                // 스킬 특성 데이터
                if (data.skillTraits) {
                    categorizedData.skillTraits.push(...data.skillTraits);
                }
                
                // 무기 전문화 데이터
                if (data.weaponSpecializations) {
                    categorizedData.weaponSpecializations.push(...data.weaponSpecializations);
                }
                
                // 스탯 포맷 데이터
                if (data.statFormats) {
                    categorizedData.statFormats.push(...data.statFormats);
                }
                
                // 룬 시너지 데이터
                if (data.runeSynergies) {
                    categorizedData.runeSynergies.push(...data.runeSynergies);
                }
                
                // 장비 세트 데이터
                if (data.equipmentSets) {
                    categorizedData.equipmentSets.push(...data.equipmentSets);
                }
                
                // 장비 룬 데이터
                if (data.equipmentRunes) {
                    categorizedData.equipmentRunes.push(...data.equipmentRunes);
                }
            }
        });
        
        // 각 카테고리별로 파일 저장
        Object.keys(categorizedData).forEach(category => {
            if (categorizedData[category].length > 0) {
                fs.writeFileSync(
                    `questlog_${category}.json`, 
                    JSON.stringify(categorizedData[category], null, 2), 
                    'utf8'
                );
                console.log(`${category}: ${categorizedData[category].length}개 항목 저장`);
            }
        });
        
        // 통합 데이터 저장
        fs.writeFileSync('questlog_all_data.json', JSON.stringify(categorizedData, null, 2), 'utf8');
        
        // 데이터 요약 출력
        console.log('\n=== 수집된 데이터 요약 ===');
        Object.keys(categorizedData).forEach(category => {
            console.log(`${category}: ${categorizedData[category].length}개`);
        });
        
        return categorizedData;
        
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        await collectAllQuestlogData();
        console.log('\n=== 데이터 수집 완료 ===');
    } catch (error) {
        console.error('데이터 수집 중 오류:', error.message);
    }
}

main();
