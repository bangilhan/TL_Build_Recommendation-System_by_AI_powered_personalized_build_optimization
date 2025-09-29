const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectTLCodexData() {
    console.log('=== TL Codex 최종 데이터 수집 시작 ===');
    
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
            itemSets: [],
            monsters: [],
            locations: []
        };
        
        // 수집할 페이지들 정의
        const pagesToCollect = [
            { url: 'https://tlcodex.com/kr/items/weapons/dagger/', category: 'weapons', name: '단검' },
            { url: 'https://tlcodex.com/kr/items/weapons/sword/', category: 'weapons', name: '장검' },
            { url: 'https://tlcodex.com/kr/items/weapons/staff/', category: 'weapons', name: '지팡이' },
            { url: 'https://tlcodex.com/kr/items/weapons/crossbow/', category: 'weapons', name: '석궁' },
            { url: 'https://tlcodex.com/kr/items/armor/head/', category: 'armor', name: '투구' },
            { url: 'https://tlcodex.com/kr/items/armor/chest/', category: 'armor', name: '상의' },
            { url: 'https://tlcodex.com/kr/items/accessories/necklace/', category: 'accessories', name: '목걸이' },
            { url: 'https://tlcodex.com/kr/items/accessories/ring/', category: 'accessories', name: '반지' },
            { url: 'https://tlcodex.com/kr/skills/dagger/', category: 'skills', name: '단검 스킬' },
            { url: 'https://tlcodex.com/kr/skills/staff/', category: 'skills', name: '지팡이 스킬' },
            { url: 'https://tlcodex.com/kr/items/runes/', category: 'runes', name: '룬' },
            { url: 'https://tlcodex.com/kr/items/artifacts/', category: 'artifacts', name: '아티팩트' },
            { url: 'https://tlcodex.com/kr/itemsets/', category: 'itemSets', name: '아이템 세트' }
        ];
        
        for (const pageInfo of pagesToCollect) {
            try {
                console.log(`\n수집 중: ${pageInfo.name} (${pageInfo.url})`);
                
                await page.goto(pageInfo.url, { 
                    waitUntil: 'networkidle2', 
                    timeout: 30000 
                });
                
                // 페이지 로딩 대기
                await page.waitForTimeout(3000);
                
                // 아이템 데이터 추출
                const pageData = await page.evaluate(() => {
                    const items = [];
                    
                    // 아이템 링크들 찾기
                    const itemLinks = document.querySelectorAll('a.qtooltip[data-id]');
                    
                    itemLinks.forEach(link => {
                        const item = {
                            id: link.getAttribute('data-id'),
                            name: link.textContent?.trim(),
                            href: link.href,
                            grade: link.className.includes('item_grade_') ? 
                                link.className.match(/item_grade_(\d+)/)?.[1] : null,
                            category: 'unknown'
                        };
                        
                        // 등급 정보 추출
                        if (link.className.includes('item_grade_8')) item.grade = '8';
                        else if (link.className.includes('item_grade_7')) item.grade = '7';
                        else if (link.className.includes('item_grade_6')) item.grade = '6';
                        else if (link.className.includes('item_grade_5')) item.grade = '5';
                        else if (link.className.includes('item_grade_4')) item.grade = '4';
                        else if (link.className.includes('item_grade_3')) item.grade = '3';
                        else if (link.className.includes('item_grade_2')) item.grade = '2';
                        else if (link.className.includes('item_grade_1')) item.grade = '1';
                        
                        // 아이템이 유효한 경우만 추가
                        if (item.id && item.name && item.name.length > 0) {
                            items.push(item);
                        }
                    });
                    
                    return items;
                });
                
                console.log(`수집된 아이템: ${pageData.length}개`);
                
                // 카테고리별로 분류
                if (pageInfo.category in tlCodexData) {
                    tlCodexData[pageInfo.category].push(...pageData);
                }
                
                await page.waitForTimeout(1000);
                
            } catch (error) {
                console.log(`수집 실패: ${pageInfo.name} - ${error.message}`);
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
