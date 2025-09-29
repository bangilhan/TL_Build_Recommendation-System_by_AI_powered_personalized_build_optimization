const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectTLCodexData() {
    console.log('=== TL Codex 데이터 수집 시작 ===');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
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
            itemSets: [],
            monsters: [],
            locations: []
        };
        
        // TL Codex 메인 페이지 방문
        console.log('TL Codex 메인 페이지 방문 중...');
        await page.goto('https://tlcodex.com/kr/', { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });
        
        // 페이지 로딩 대기
        await page.waitForTimeout(3000);
        
        // 데이터베이스 섹션의 링크들 수집
        console.log('데이터베이스 링크 수집 중...');
        const databaseLinks = await page.evaluate(() => {
            const links = [];
            
            // 다양한 선택자로 링크 찾기
            const selectors = [
                'a[href*="/kr/"]',
                '.database-section a',
                '.nav-item a',
                '.menu-item a',
                'nav a[href*="/kr/"]'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(link => {
                    if (link.href && link.href.includes('/kr/') && !link.href.includes('#') && !link.href.includes('javascript:')) {
                        const text = link.textContent?.trim();
                        if (text && text.length > 0) {
                            links.push({
                                text: text,
                                href: link.href,
                                category: link.closest('li')?.textContent?.trim() || 'unknown'
                            });
                        }
                    }
                });
            });
            
            // 중복 제거
            const uniqueLinks = [];
            const seenHrefs = new Set();
            
            links.forEach(link => {
                if (!seenHrefs.has(link.href)) {
                    seenHrefs.add(link.href);
                    uniqueLinks.push(link);
                }
            });
            
            return uniqueLinks;
        });
        
        console.log(`발견된 데이터베이스 링크: ${databaseLinks.length}개`);
        
        // 링크 목록 출력
        databaseLinks.forEach((link, index) => {
            console.log(`${index + 1}. ${link.text} - ${link.href}`);
        });
        
        // 각 링크 방문하여 데이터 수집 (처음 15개만)
        for (let i = 0; i < Math.min(databaseLinks.length, 15); i++) {
            const link = databaseLinks[i];
            try {
                console.log(`\n수집 중 (${i + 1}/15): ${link.text}`);
                console.log(`URL: ${link.href}`);
                
                await page.goto(link.href, { 
                    waitUntil: 'networkidle2', 
                    timeout: 30000 
                });
                
                // 페이지 로딩 대기
                await page.waitForTimeout(2000);
                
                // 페이지에서 아이템 데이터 추출
                const pageData = await page.evaluate(() => {
                    const items = [];
                    
                    // 다양한 선택자로 아이템 찾기
                    const itemSelectors = [
                        '[data-item-id]',
                        '.item-card',
                        '.weapon-card',
                        '.armor-card',
                        '.accessory-card',
                        '.skill-card',
                        '.rune-card',
                        '.artifact-card',
                        '.monster-card',
                        '.location-card',
                        '.card',
                        '.item',
                        '.entry'
                    ];
                    
                    itemSelectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            const item = {
                                id: element.getAttribute('data-item-id') || element.id || `item_${items.length}`,
                                name: '',
                                type: element.className,
                                stats: {},
                                description: '',
                                category: selector.replace('.', ''),
                                href: window.location.href
                            };
                            
                            // 이름 추출
                            const nameSelectors = [
                                '.item-name',
                                '.weapon-name',
                                '.armor-name',
                                '.skill-name',
                                '.rune-name',
                                '.artifact-name',
                                '.monster-name',
                                '.location-name',
                                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                                '.title',
                                '.name'
                            ];
                            
                            nameSelectors.forEach(nameSelector => {
                                const nameEl = element.querySelector(nameSelector);
                                if (nameEl && !item.name) {
                                    item.name = nameEl.textContent?.trim();
                                }
                            });
                            
                            // 설명 추출
                            const descSelectors = [
                                '.item-description',
                                '.description',
                                '.desc',
                                '.content',
                                'p'
                            ];
                            
                            descSelectors.forEach(descSelector => {
                                const descEl = element.querySelector(descSelector);
                                if (descEl && !item.description) {
                                    item.description = descEl.textContent?.trim();
                                }
                            });
                            
                            // 스탯 정보 추출
                            const statElements = element.querySelectorAll('.stat, .stat-value, .attribute, .property');
                            statElements.forEach(statEl => {
                                const statName = statEl.querySelector('.stat-name, .attribute-name, .property-name')?.textContent?.trim();
                                const statValue = statEl.querySelector('.stat-value, .attribute-value, .property-value')?.textContent?.trim();
                                if (statName && statValue) {
                                    item.stats[statName] = statValue;
                                } else if (statEl.textContent?.includes(':')) {
                                    const parts = statEl.textContent.split(':');
                                    if (parts.length === 2) {
                                        item.stats[parts[0].trim()] = parts[1].trim();
                                    }
                                }
                            });
                            
                            // 아이템이 유효한 경우만 추가
                            if (item.id && (item.name || item.description)) {
                                items.push(item);
                            }
                        });
                    });
                    
                    return items;
                });
                
                console.log(`수집된 아이템: ${pageData.length}개`);
                
                // 카테고리별로 분류
                const category = link.text.toLowerCase();
                if (category.includes('무기') || category.includes('weapon')) {
                    tlCodexData.weapons.push(...pageData);
                } else if (category.includes('방어구') || category.includes('armor')) {
                    tlCodexData.armor.push(...pageData);
                } else if (category.includes('장신구') || category.includes('accessory')) {
                    tlCodexData.accessories.push(...pageData);
                } else if (category.includes('스킬') || category.includes('skill')) {
                    tlCodexData.skills.push(...pageData);
                } else if (category.includes('룬') || category.includes('rune')) {
                    tlCodexData.runes.push(...pageData);
                } else if (category.includes('아티팩트') || category.includes('artifact')) {
                    tlCodexData.artifacts.push(...pageData);
                } else if (category.includes('세트') || category.includes('set')) {
                    tlCodexData.itemSets.push(...pageData);
                } else if (category.includes('몬스터') || category.includes('monster')) {
                    tlCodexData.monsters.push(...pageData);
                } else if (category.includes('위치') || category.includes('location')) {
                    tlCodexData.locations.push(...pageData);
                } else {
                    // 기본적으로 weapons에 추가
                    tlCodexData.weapons.push(...pageData);
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
        
        // 통합 데이터 저장
        fs.writeFileSync('tlcodex_all_data.json', JSON.stringify(tlCodexData, null, 2), 'utf8');
        
        console.log('\n=== TL Codex 데이터 수집 완료 ===');
        Object.keys(tlCodexData).forEach(category => {
            console.log(`${category}: ${tlCodexData[category].length}개`);
        });
        
        return tlCodexData;
        
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        await collectTLCodexData();
    } catch (error) {
        console.error('TL Codex 데이터 수집 중 오류:', error.message);
    }
}

main();
