const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectQuestlogData() {
    console.log('=== Questlog.gg 데이터 수집 시작 ===');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const apiResponses = [];
        
        // API 응답 수집
        page.on('response', async (response) => {
            const responseUrl = response.url();
            
            if (responseUrl.includes('/api/trpc/') && response.status() === 200) {
                try {
                    const responseData = await response.json();
                    apiResponses.push({
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
        
        // 여러 페이지 방문하여 데이터 수집
        const urls = [
            'https://questlog.gg/throne-and-liberty/ko/character-builder/RepeatingChestMeditateTwilight',
            'https://questlog.gg/throne-and-liberty/ko/skill-builder?tag=pve-grinding',
            'https://questlog.gg/throne-and-liberty/ko/character-builder/ThePeerlessCookOfMana/combat-simulator?build-id=6446458'
        ];
        
        for (const url of urls) {
            console.log(`방문 중: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForTimeout(3000);
        }
        
        console.log(`총 ${apiResponses.length}개의 API 응답 수집 완료`);
        
        // 데이터 분류 및 저장
        const categorizedData = {
            characters: [],
            builds: [],
            equipment: [],
            skills: [],
            weaponSpecializations: [],
            statFormats: [],
            runeSynergies: []
        };
        
        apiResponses.forEach(response => {
            if (response.data.result && response.data.result.data) {
                const data = response.data.result.data;
                
                if (data.character) {
                    categorizedData.characters.push(data.character);
                }
                if (data.builds) {
                    categorizedData.builds.push(...data.builds);
                }
                if (data.equipment) {
                    categorizedData.equipment.push(...data.equipment);
                }
                if (data.skillSets) {
                    categorizedData.skills.push(...data.skillSets);
                }
                if (data.weaponSpecializations) {
                    categorizedData.weaponSpecializations.push(...data.weaponSpecializations);
                }
                if (data.statFormats) {
                    categorizedData.statFormats.push(...data.statFormats);
                }
                if (data.runeSynergies) {
                    categorizedData.runeSynergies.push(...data.runeSynergies);
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
        
        return categorizedData;
        
    } finally {
        await browser.close();
    }
}

async function collectTLCodexData() {
    console.log('=== TL Codex 데이터 수집 시작 ===');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const tlCodexData = {
            weapons: [],
            armor: [],
            accessories: [],
            skills: [],
            runes: [],
            artifacts: [],
            itemSets: []
        };
        
        // TL Codex 메인 페이지 방문
        await page.goto('https://tlcodex.com/kr/', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // 데이터베이스 섹션의 링크들 수집
        const databaseLinks = await page.evaluate(() => {
            const links = [];
            const dbSection = document.querySelector('[data-section="database"]');
            if (dbSection) {
                const linkElements = dbSection.querySelectorAll('a[href]');
                linkElements.forEach(link => {
                    if (link.href.includes('/kr/') && !link.href.includes('#')) {
                        links.push({
                            text: link.textContent.trim(),
                            href: link.href,
                            category: link.closest('li')?.textContent?.trim() || 'unknown'
                        });
                    }
                });
            }
            return links;
        });
        
        console.log(`발견된 데이터베이스 링크: ${databaseLinks.length}개`);
        
        // 각 링크 방문하여 데이터 수집
        for (const link of databaseLinks.slice(0, 10)) { // 처음 10개만 수집
            try {
                console.log(`수집 중: ${link.text} - ${link.href}`);
                await page.goto(link.href, { waitUntil: 'networkidle2', timeout: 15000 });
                
                // 페이지에서 아이템 데이터 추출
                const pageData = await page.evaluate(() => {
                    const items = [];
                    const itemElements = document.querySelectorAll('[data-item-id], .item-card, .weapon-card, .armor-card');
                    
                    itemElements.forEach(element => {
                        const item = {
                            id: element.getAttribute('data-item-id') || element.id,
                            name: element.querySelector('.item-name, .weapon-name, .armor-name')?.textContent?.trim(),
                            type: element.className,
                            stats: {},
                            description: element.querySelector('.item-description')?.textContent?.trim()
                        };
                        
                        // 스탯 정보 추출
                        const statElements = element.querySelectorAll('.stat, .stat-value');
                        statElements.forEach(statEl => {
                            const statName = statEl.querySelector('.stat-name')?.textContent?.trim();
                            const statValue = statEl.querySelector('.stat-value')?.textContent?.trim();
                            if (statName && statValue) {
                                item.stats[statName] = statValue;
                            }
                        });
                        
                        if (item.id || item.name) {
                            items.push(item);
                        }
                    });
                    
                    return items;
                });
                
                // 카테고리별로 분류
                if (link.category.includes('무기') || link.text.includes('무기')) {
                    tlCodexData.weapons.push(...pageData);
                } else if (link.category.includes('방어구') || link.text.includes('방어구')) {
                    tlCodexData.armor.push(...pageData);
                } else if (link.category.includes('장신구') || link.text.includes('장신구')) {
                    tlCodexData.accessories.push(...pageData);
                } else if (link.category.includes('스킬') || link.text.includes('스킬')) {
                    tlCodexData.skills.push(...pageData);
                } else if (link.category.includes('룬') || link.text.includes('룬')) {
                    tlCodexData.runes.push(...pageData);
                } else if (link.category.includes('아티팩트') || link.text.includes('아티팩트')) {
                    tlCodexData.artifacts.push(...pageData);
                } else if (link.category.includes('세트') || link.text.includes('세트')) {
                    tlCodexData.itemSets.push(...pageData);
                }
                
                await page.waitForTimeout(1000);
                
            } catch (error) {
                console.log(`수집 실패: ${link.text} - ${error.message}`);
            }
        }
        
        // 각 카테고리별로 파일 저장
        Object.keys(tlCodexData).forEach(category => {
            if (tlCodexData[category].length > 0) {
                fs.writeFileSync(
                    `tlcodex_${category}.json`, 
                    JSON.stringify(tlCodexData[category], null, 2), 
                    'utf8'
                );
                console.log(`TL Codex ${category}: ${tlCodexData[category].length}개 항목 저장`);
            }
        });
        
        return tlCodexData;
        
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('=== Throne and Liberty 데이터 수집 시작 ===');
    
    try {
        // Questlog.gg 데이터 수집
        const questlogData = await collectQuestlogData();
        
        // TL Codex 데이터 수집
        const tlCodexData = await collectTLCodexData();
        
        // 통합 데이터 저장
        const combinedData = {
            questlog: questlogData,
            tlcodex: tlCodexData,
            collectedAt: new Date().toISOString()
        };
        
        fs.writeFileSync('combined_data.json', JSON.stringify(combinedData, null, 2), 'utf8');
        
        console.log('=== 데이터 수집 완료 ===');
        console.log('Questlog.gg 데이터:', Object.keys(questlogData).map(k => `${k}: ${questlogData[k].length}`).join(', '));
        console.log('TL Codex 데이터:', Object.keys(tlCodexData).map(k => `${k}: ${tlCodexData[k].length}`).join(', '));
        
    } catch (error) {
        console.error('데이터 수집 중 오류:', error.message);
    }
}

main();
