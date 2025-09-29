const puppeteer = require('puppeteer');
const fs = require('fs');

async function debugTLCodex() {
    console.log('=== TL Codex 디버깅 시작 ===');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // 무기 페이지 방문
        console.log('무기 페이지 방문 중...');
        await page.goto('https://tlcodex.com/kr/items/weapons/dagger/', { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
        });
        
        // 페이지 로딩 대기
        await page.waitForTimeout(5000);
        
        // 페이지 구조 분석
        console.log('페이지 구조 분석 중...');
        const pageStructure = await page.evaluate(() => {
            const structure = {
                title: document.title,
                url: window.location.href,
                bodyClasses: document.body.className,
                mainContent: null,
                itemElements: [],
                allElements: []
            };
            
            // 메인 콘텐츠 찾기
            const mainSelectors = [
                'main',
                '.main-content',
                '.content',
                '.container',
                '#content',
                '.page-content'
            ];
            
            mainSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    structure.mainContent = {
                        selector: selector,
                        className: element.className,
                        id: element.id,
                        childrenCount: element.children.length,
                        textContent: element.textContent.substring(0, 200) + '...'
                    };
                }
            });
            
            // 모든 요소 분석
            const allElements = document.querySelectorAll('*');
            allElements.forEach((el, index) => {
                if (index < 50) { // 처음 50개만
                    structure.allElements.push({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        textContent: el.textContent?.substring(0, 100) || '',
                        attributes: Array.from(el.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                }
            });
            
            // 아이템 관련 요소 찾기
            const itemSelectors = [
                '.item',
                '.weapon',
                '.card',
                '.entry',
                '[data-item]',
                '[data-id]',
                '.list-item',
                '.grid-item'
            ];
            
            itemSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    structure.itemElements.push({
                        selector: selector,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        textContent: el.textContent?.substring(0, 200) || '',
                        innerHTML: el.innerHTML?.substring(0, 500) || ''
                    });
                });
            });
            
            return structure;
        });
        
        console.log('페이지 제목:', pageStructure.title);
        console.log('URL:', pageStructure.url);
        console.log('메인 콘텐츠:', pageStructure.mainContent);
        console.log('아이템 요소 개수:', pageStructure.itemElements.length);
        
        // 아이템 요소들 출력
        if (pageStructure.itemElements.length > 0) {
            console.log('\n발견된 아이템 요소들:');
            pageStructure.itemElements.forEach((item, index) => {
                console.log(`${index + 1}. ${item.selector} - ${item.tagName}.${item.className}`);
                console.log(`   텍스트: ${item.textContent}`);
                console.log(`   HTML: ${item.innerHTML.substring(0, 100)}...`);
                console.log('');
            });
        }
        
        // 페이지 소스 일부 저장
        const pageContent = await page.content();
        fs.writeFileSync('tlcodex_page_source.html', pageContent, 'utf8');
        console.log('페이지 소스 저장됨: tlcodex_page_source.html');
        
        // 스크린샷 저장
        await page.screenshot({ path: 'tlcodex_screenshot.png', fullPage: true });
        console.log('스크린샷 저장됨: tlcodex_screenshot.png');
        
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        await debugTLCodex();
    } catch (error) {
        console.error('TL Codex 디버깅 중 오류:', error.message);
    }
}

main();
