const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectMasteryBuilderData() {
    console.log('=== 무기 마스터리 빌더 데이터 수집 시작 ===');
    
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
        
        // 마스터리 빌더 데이터 수집
        const masteryData = await page.evaluate(() => {
            const data = {
                weaponTypes: [],
                masteryNodes: [],
                buildTypes: [],
                rules: [],
                stats: {},
                apiEndpoints: []
            };
            
            // 1. 무기 타입 수집
            const weaponTabs = document.querySelectorAll('.weapon-tab, .mastery-tab, [data-weapon-type]');
            weaponTabs.forEach(tab => {
                const weaponType = {
                    id: tab.getAttribute('data-weapon-type') || tab.id,
                    name: tab.textContent?.trim(),
                    className: tab.className,
                    isActive: tab.classList.contains('active') || tab.classList.contains('selected')
                };
                if (weaponType.name && weaponType.name.length > 0) {
                    data.weaponTypes.push(weaponType);
                }
            });
            
            // 2. 빌드 타입 수집
            const buildTypeElements = document.querySelectorAll('input[type="radio"][name*="build"], .build-type, [data-build-type]');
            buildTypeElements.forEach(element => {
                const buildType = {
                    id: element.id || element.getAttribute('data-build-type'),
                    name: element.value || element.textContent?.trim(),
                    type: element.type,
                    isChecked: element.checked || element.classList.contains('selected')
                };
                if (buildType.name && buildType.name.length > 0) {
                    data.buildTypes.push(buildType);
                }
            });
            
            // 3. 마스터리 노드 수집
            const nodeElements = document.querySelectorAll('.mastery-node, .skill-node, [data-node-id], .node');
            nodeElements.forEach(node => {
                const nodeData = {
                    id: node.getAttribute('data-node-id') || node.id,
                    name: node.getAttribute('data-name') || node.textContent?.trim(),
                    level: node.getAttribute('data-level'),
                    cost: node.getAttribute('data-cost'),
                    requirements: node.getAttribute('data-requirements'),
                    effects: node.getAttribute('data-effects'),
                    position: {
                        x: node.getAttribute('data-x'),
                        y: node.getAttribute('data-y')
                    },
                    className: node.className,
                    isActive: node.classList.contains('active') || node.classList.contains('selected'),
                    isLocked: node.classList.contains('locked') || node.classList.contains('disabled')
                };
                
                // 노드 내부 아이콘 정보
                const icon = node.querySelector('img, .icon, .skill-icon');
                if (icon) {
                    nodeData.icon = {
                        src: icon.src || icon.getAttribute('src'),
                        alt: icon.alt || icon.getAttribute('alt'),
                        className: icon.className
                    };
                }
                
                data.masteryNodes.push(nodeData);
            });
            
            // 4. 통계 정보 수집
            const statsElements = document.querySelectorAll('.stat, .statistic, [data-stat]');
            statsElements.forEach(stat => {
                const statName = stat.getAttribute('data-stat') || stat.className;
                const statValue = stat.textContent?.trim() || stat.getAttribute('data-value');
                if (statName && statValue) {
                    data.stats[statName] = statValue;
                }
            });
            
            // 5. 규칙 및 제약사항 수집
            const ruleElements = document.querySelectorAll('.rule, .constraint, .requirement, [data-rule]');
            ruleElements.forEach(rule => {
                const ruleData = {
                    text: rule.textContent?.trim(),
                    type: rule.getAttribute('data-rule-type'),
                    className: rule.className
                };
                if (ruleData.text && ruleData.text.length > 0) {
                    data.rules.push(ruleData);
                }
            });
            
            // 6. API 엔드포인트 찾기
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                const content = script.textContent || script.innerHTML;
                if (content.includes('api') || content.includes('endpoint') || content.includes('url')) {
                    // API URL 패턴 찾기
                    const apiMatches = content.match(/['"`]([^'"`]*\/api\/[^'"`]*)['"`]/g);
                    if (apiMatches) {
                        apiMatches.forEach(match => {
                            const url = match.replace(/['"`]/g, '');
                            if (!data.apiEndpoints.includes(url)) {
                                data.apiEndpoints.push(url);
                            }
                        });
                    }
                }
            });
            
            // 7. 잔여 포인트 정보
            const remainingPoints = document.querySelector('.remaining-points, .points-remaining, [data-remaining-points]');
            if (remainingPoints) {
                data.remainingPoints = remainingPoints.textContent?.trim();
            }
            
            // 8. 빌드 저장 관련 정보
            const saveElements = document.querySelectorAll('.save-build, .build-save, [data-save]');
            saveElements.forEach(element => {
                data.saveInfo = {
                    text: element.textContent?.trim(),
                    className: element.className,
                    href: element.href
                };
            });
            
            return data;
        });
        
        console.log('수집된 마스터리 빌더 데이터:');
        console.log(`- 무기 타입: ${masteryData.weaponTypes.length}개`);
        console.log(`- 마스터리 노드: ${masteryData.masteryNodes.length}개`);
        console.log(`- 빌드 타입: ${masteryData.buildTypes.length}개`);
        console.log(`- 규칙: ${masteryData.rules.length}개`);
        console.log(`- API 엔드포인트: ${masteryData.apiEndpoints.length}개`);
        
        // 추가로 네트워크 요청 모니터링
        const apiResponses = [];
        page.on('response', async (response) => {
            const responseUrl = response.url();
            if (responseUrl.includes('mastery') || responseUrl.includes('skill') || responseUrl.includes('build')) {
                try {
                    const responseData = await response.json();
                    apiResponses.push({
                        url: responseUrl,
                        data: responseData,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`API 응답 수집: ${responseUrl}`);
                } catch (error) {
                    // JSON이 아닌 경우 텍스트로 수집
                    try {
                        const textData = await response.text();
                        apiResponses.push({
                            url: responseUrl,
                            data: textData,
                            timestamp: new Date().toISOString()
                        });
                    } catch (e) {
                        console.log(`응답 수집 실패: ${responseUrl}`);
                    }
                }
            }
        });
        
        // 페이지에서 클릭 이벤트 시뮬레이션하여 더 많은 데이터 수집
        console.log('마스터리 노드 클릭 시뮬레이션 중...');
        
        // 무기 타입 변경 시뮬레이션
        for (let i = 0; i < Math.min(masteryData.weaponTypes.length, 3); i++) {
            try {
                const weaponTab = document.querySelector(`[data-weapon-type="${masteryData.weaponTypes[i].id}"]`);
                if (weaponTab) {
                    await weaponTab.click();
                    await page.waitForTimeout(2000);
                    console.log(`무기 타입 변경: ${masteryData.weaponTypes[i].name}`);
                }
            } catch (error) {
                console.log(`무기 타입 변경 실패: ${masteryData.weaponTypes[i].name}`);
            }
        }
        
        // 마스터리 노드 클릭 시뮬레이션
        const clickableNodes = masteryData.masteryNodes.filter(node => !node.isLocked);
        for (let i = 0; i < Math.min(clickableNodes.length, 5); i++) {
            try {
                const nodeElement = document.querySelector(`[data-node-id="${clickableNodes[i].id}"]`);
                if (nodeElement) {
                    await nodeElement.click();
                    await page.waitForTimeout(1000);
                    console.log(`마스터리 노드 클릭: ${clickableNodes[i].name}`);
                }
            } catch (error) {
                console.log(`마스터리 노드 클릭 실패: ${clickableNodes[i].name}`);
            }
        }
        
        // 최종 데이터 통합
        const finalData = {
            masteryBuilder: masteryData,
            apiResponses: apiResponses,
            collectedAt: new Date().toISOString()
        };
        
        // 데이터 저장
        fs.writeFileSync('mastery_builder_data.json', JSON.stringify(finalData, null, 2), 'utf8');
        console.log('마스터리 빌더 데이터 저장 완료: mastery_builder_data.json');
        
        // 페이지 소스 저장
        const pageContent = await page.content();
        fs.writeFileSync('mastery_builder_source.html', pageContent, 'utf8');
        
        // 스크린샷 저장
        await page.screenshot({ path: 'mastery_builder_screenshot.png', fullPage: true });
        
        return finalData;
        
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        const data = await collectMasteryBuilderData();
        console.log('\n=== 마스터리 빌더 데이터 수집 완료 ===');
        console.log('수집된 데이터 구조:');
        console.log(JSON.stringify(data.masteryBuilder, null, 2));
    } catch (error) {
        console.error('마스터리 빌더 데이터 수집 중 오류:', error.message);
    }
}

main();
