const puppeteer = require('puppeteer');
const fs = require('fs');

async function debugMasteryBuilder() {
    console.log('=== 마스터리 빌더 디버깅 시작 ===');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // 무기 마스터리 빌더 페이지 방문
        console.log('무기 마스터리 빌더 페이지 방문 중...');
        await page.goto('https://tlcodex.com/kr/masterybuilder/', { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
        });
        
        // 페이지 로딩 대기
        await page.waitForTimeout(5000);
        
        // 페이지 구조 상세 분석
        const pageStructure = await page.evaluate(() => {
            const structure = {
                title: document.title,
                url: window.location.href,
                bodyClasses: document.body.className,
                allElements: [],
                weaponElements: [],
                masteryElements: [],
                buildTypeElements: [],
                scriptElements: [],
                apiCalls: []
            };
            
            // 모든 요소 분석 (처음 100개)
            const allElements = document.querySelectorAll('*');
            allElements.forEach((el, index) => {
                if (index < 100) {
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
            
            // 무기 관련 요소 찾기
            const weaponSelectors = [
                '.weapon',
                '.mastery',
                '.tab',
                '.button',
                '[data-weapon]',
                '[data-mastery]',
                '[data-tab]',
                'input[type="radio"]',
                'input[type="checkbox"]'
            ];
            
            weaponSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    structure.weaponElements.push({
                        selector: selector,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        textContent: el.textContent?.substring(0, 200) || '',
                        attributes: Array.from(el.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                });
            });
            
            // 마스터리 노드 관련 요소 찾기
            const masterySelectors = [
                '.node',
                '.skill',
                '.point',
                '.circle',
                '.hexagon',
                '[data-node]',
                '[data-skill]',
                '[data-point]',
                'svg',
                'canvas'
            ];
            
            masterySelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    structure.masteryElements.push({
                        selector: selector,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        textContent: el.textContent?.substring(0, 200) || '',
                        innerHTML: el.innerHTML?.substring(0, 500) || '',
                        attributes: Array.from(el.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                });
            });
            
            // 빌드 타입 관련 요소 찾기
            const buildTypeSelectors = [
                'input[name*="build"]',
                'input[name*="type"]',
                'select[name*="build"]',
                'select[name*="type"]',
                '.build-type',
                '.type-selector'
            ];
            
            buildTypeSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    structure.buildTypeElements.push({
                        selector: selector,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        name: el.name,
                        value: el.value,
                        textContent: el.textContent?.substring(0, 200) || '',
                        attributes: Array.from(el.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                });
            });
            
            // 스크립트 요소 분석
            const scripts = document.querySelectorAll('script');
            scripts.forEach((script, index) => {
                if (index < 10) { // 처음 10개만
                    const content = script.textContent || script.innerHTML;
                    structure.scriptElements.push({
                        index: index,
                        src: script.src,
                        type: script.type,
                        contentLength: content.length,
                        content: content.substring(0, 1000) + '...',
                        hasApi: content.includes('api') || content.includes('fetch') || content.includes('ajax'),
                        hasMastery: content.includes('mastery') || content.includes('skill') || content.includes('build')
                    });
                }
            });
            
            // API 호출 패턴 찾기
            const allScripts = document.querySelectorAll('script');
            allScripts.forEach(script => {
                const content = script.textContent || script.innerHTML;
                if (content.includes('fetch') || content.includes('ajax') || content.includes('api')) {
                    // API URL 패턴 찾기
                    const apiPatterns = [
                        /fetch\(['"`]([^'"`]*)['"`]/g,
                        /ajax\(['"`]([^'"`]*)['"`]/g,
                        /url:\s*['"`]([^'"`]*)['"`]/g,
                        /endpoint:\s*['"`]([^'"`]*)['"`]/g
                    ];
                    
                    apiPatterns.forEach(pattern => {
                        let match;
                        while ((match = pattern.exec(content)) !== null) {
                            structure.apiCalls.push({
                                url: match[1],
                                context: content.substring(Math.max(0, match.index - 50), match.index + 50)
                            });
                        }
                    });
                }
            });
            
            return structure;
        });
        
        console.log('페이지 제목:', pageStructure.title);
        console.log('URL:', pageStructure.url);
        console.log('전체 요소 개수:', pageStructure.allElements.length);
        console.log('무기 요소 개수:', pageStructure.weaponElements.length);
        console.log('마스터리 요소 개수:', pageStructure.masteryElements.length);
        console.log('빌드 타입 요소 개수:', pageStructure.buildTypeElements.length);
        console.log('스크립트 개수:', pageStructure.scriptElements.length);
        console.log('API 호출 개수:', pageStructure.apiCalls.length);
        
        // 무기 요소들 출력
        if (pageStructure.weaponElements.length > 0) {
            console.log('\n발견된 무기 요소들:');
            pageStructure.weaponElements.forEach((element, index) => {
                console.log(`${index + 1}. ${element.selector} - ${element.tagName}.${element.className}`);
                console.log(`   텍스트: ${element.textContent}`);
                console.log(`   속성:`, element.attributes);
                console.log('');
            });
        }
        
        // 마스터리 요소들 출력
        if (pageStructure.masteryElements.length > 0) {
            console.log('\n발견된 마스터리 요소들:');
            pageStructure.masteryElements.forEach((element, index) => {
                console.log(`${index + 1}. ${element.selector} - ${element.tagName}.${element.className}`);
                console.log(`   텍스트: ${element.textContent}`);
                console.log(`   HTML: ${element.innerHTML.substring(0, 200)}...`);
                console.log('');
            });
        }
        
        // 빌드 타입 요소들 출력
        if (pageStructure.buildTypeElements.length > 0) {
            console.log('\n발견된 빌드 타입 요소들:');
            pageStructure.buildTypeElements.forEach((element, index) => {
                console.log(`${index + 1}. ${element.selector} - ${element.tagName}.${element.className}`);
                console.log(`   이름: ${element.name}, 값: ${element.value}`);
                console.log(`   텍스트: ${element.textContent}`);
                console.log('');
            });
        }
        
        // API 호출들 출력
        if (pageStructure.apiCalls.length > 0) {
            console.log('\n발견된 API 호출들:');
            pageStructure.apiCalls.forEach((call, index) => {
                console.log(`${index + 1}. ${call.url}`);
                console.log(`   컨텍스트: ${call.context}`);
                console.log('');
            });
        }
        
        // 페이지 소스 저장
        const pageContent = await page.content();
        fs.writeFileSync('mastery_builder_debug.html', pageContent, 'utf8');
        console.log('디버그 페이지 소스 저장됨: mastery_builder_debug.html');
        
        // 스크린샷 저장
        await page.screenshot({ path: 'mastery_builder_debug.png', fullPage: true });
        console.log('디버그 스크린샷 저장됨: mastery_builder_debug.png');
        
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        await debugMasteryBuilder();
    } catch (error) {
        console.error('마스터리 빌더 디버깅 중 오류:', error.message);
    }
}

main();
