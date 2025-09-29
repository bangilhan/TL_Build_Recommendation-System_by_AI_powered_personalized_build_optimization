const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectMasteryBuilderData() {
    console.log('=== 무기 마스터리 빌더 최종 데이터 수집 시작 ===');
    
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
        
        // 네트워크 요청 모니터링
        const apiResponses = [];
        page.on('response', async (response) => {
            const responseUrl = response.url();
            if (responseUrl.includes('mastery') || responseUrl.includes('skill') || responseUrl.includes('build') || responseUrl.includes('api')) {
                try {
                    const responseData = await response.json();
                    apiResponses.push({
                        url: responseUrl,
                        data: responseData,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`API 응답 수집: ${responseUrl}`);
                } catch (error) {
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
        
        // 마스터리 빌더 데이터 수집
        const masteryData = await page.evaluate(() => {
            const data = {
                buildTypes: [],
                weaponTypes: [],
                masterySystem: {},
                rules: [],
                stats: {},
                canvasInfo: {},
                formData: {}
            };
            
            // 1. 빌드 타입 수집
            const buildTypeInputs = document.querySelectorAll('input[name="build_type"]');
            buildTypeInputs.forEach(input => {
                const buildType = {
                    id: input.id,
                    value: input.value,
                    checked: input.checked,
                    name: input.name
                };
                data.buildTypes.push(buildType);
            });
            
            // 2. 빌드 제목 및 설명 수집
            const buildTitle = document.querySelector('input[name="build_name"]');
            const buildDesc = document.querySelector('textarea[name="build_desc"]');
            
            if (buildTitle) {
                data.formData.buildTitle = {
                    name: buildTitle.name,
                    value: buildTitle.value,
                    placeholder: buildTitle.placeholder
                };
            }
            
            if (buildDesc) {
                data.formData.buildDesc = {
                    name: buildDesc.name,
                    value: buildDesc.value,
                    placeholder: buildDesc.placeholder
                };
            }
            
            // 3. Canvas 정보 수집 (마스터리 트리)
            const canvas = document.querySelector('canvas');
            if (canvas) {
                data.canvasInfo = {
                    width: canvas.width,
                    height: canvas.height,
                    className: canvas.className,
                    id: canvas.id,
                    style: canvas.style.cssText
                };
            }
            
            // 4. 통계 정보 수집
            const statElements = document.querySelectorAll('.stat, .statistic, [data-stat]');
            statElements.forEach(stat => {
                const statName = stat.getAttribute('data-stat') || stat.className;
                const statValue = stat.textContent?.trim() || stat.getAttribute('data-value');
                if (statName && statValue) {
                    data.stats[statName] = statValue;
                }
            });
            
            // 5. 잔여 포인트 정보
            const remainingPoints = document.querySelector('.remaining-points, .points-remaining, [data-remaining-points]');
            if (remainingPoints) {
                data.remainingPoints = remainingPoints.textContent?.trim();
            }
            
            // 6. JavaScript 변수들 수집
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                const content = script.textContent || script.innerHTML;
                if (content.includes('mastery') || content.includes('skill') || content.includes('build')) {
                    // 마스터리 관련 변수들 찾기
                    const masteryVars = content.match(/var\s+(\w*[Mm]astery\w*)\s*=\s*[^;]+/g);
                    const skillVars = content.match(/var\s+(\w*[Ss]kill\w*)\s*=\s*[^;]+/g);
                    const buildVars = content.match(/var\s+(\w*[Bb]uild\w*)\s*=\s*[^;]+/g);
                    
                    if (masteryVars) {
                        data.masterySystem.masteryVars = masteryVars;
                    }
                    if (skillVars) {
                        data.masterySystem.skillVars = skillVars;
                    }
                    if (buildVars) {
                        data.masterySystem.buildVars = buildVars;
                    }
                }
            });
            
            // 7. 폼 데이터 수집
            const form = document.querySelector('form');
            if (form) {
                data.formData.action = form.action;
                data.formData.method = form.method;
                data.formData.className = form.className;
            }
            
            // 8. 버튼 정보 수집
            const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
            buttons.forEach(button => {
                const buttonInfo = {
                    type: button.type || 'button',
                    text: button.textContent?.trim() || button.value,
                    className: button.className,
                    id: button.id
                };
                if (!data.formData.buttons) {
                    data.formData.buttons = [];
                }
                data.formData.buttons.push(buttonInfo);
            });
            
            return data;
        });
        
        console.log('수집된 마스터리 빌더 데이터:');
        console.log(`- 빌드 타입: ${masteryData.buildTypes.length}개`);
        console.log(`- 무기 타입: ${masteryData.weaponTypes.length}개`);
        console.log(`- Canvas 정보: ${Object.keys(masteryData.canvasInfo).length > 0 ? '있음' : '없음'}`);
        console.log(`- 폼 데이터: ${Object.keys(masteryData.formData).length}개 필드`);
        
        // 빌드 타입 클릭 시뮬레이션
        console.log('\n빌드 타입 클릭 시뮬레이션 중...');
        for (let i = 0; i < masteryData.buildTypes.length; i++) {
            try {
                const buildTypeInput = document.querySelector(`input[name="build_type"][value="${masteryData.buildTypes[i].value}"]`);
                if (buildTypeInput) {
                    await buildTypeInput.click();
                    await page.waitForTimeout(1000);
                    console.log(`빌드 타입 ${masteryData.buildTypes[i].value} 클릭`);
                }
            } catch (error) {
                console.log(`빌드 타입 ${masteryData.buildTypes[i].value} 클릭 실패`);
            }
        }
        
        // Canvas에서 마스터리 노드 클릭 시뮬레이션
        console.log('\n마스터리 노드 클릭 시뮬레이션 중...');
        try {
            const canvas = await page.$('canvas');
            if (canvas) {
                // Canvas의 중앙 부분 클릭
                const canvasBox = await canvas.boundingBox();
                if (canvasBox) {
                    await page.mouse.click(
                        canvasBox.x + canvasBox.width / 2,
                        canvasBox.y + canvasBox.height / 2
                    );
                    await page.waitForTimeout(1000);
                    console.log('Canvas 중앙 클릭');
                    
                    // Canvas의 다른 부분들도 클릭
                    const clickPoints = [
                        { x: canvasBox.x + canvasBox.width * 0.3, y: canvasBox.y + canvasBox.height * 0.3 },
                        { x: canvasBox.x + canvasBox.width * 0.7, y: canvasBox.y + canvasBox.height * 0.3 },
                        { x: canvasBox.x + canvasBox.width * 0.3, y: canvasBox.y + canvasBox.height * 0.7 },
                        { x: canvasBox.x + canvasBox.width * 0.7, y: canvasBox.y + canvasBox.height * 0.7 }
                    ];
                    
                    for (const point of clickPoints) {
                        await page.mouse.click(point.x, point.y);
                        await page.waitForTimeout(500);
                        console.log(`Canvas 클릭: (${point.x}, ${point.y})`);
                    }
                }
            }
        } catch (error) {
            console.log('Canvas 클릭 실패:', error.message);
        }
        
        // 최종 데이터 통합
        const finalData = {
            masteryBuilder: masteryData,
            apiResponses: apiResponses,
            collectedAt: new Date().toISOString()
        };
        
        // 데이터 저장
        fs.writeFileSync('mastery_builder_final.json', JSON.stringify(finalData, null, 2), 'utf8');
        console.log('마스터리 빌더 최종 데이터 저장 완료: mastery_builder_final.json');
        
        // 페이지 소스 저장
        const pageContent = await page.content();
        fs.writeFileSync('mastery_builder_final.html', pageContent, 'utf8');
        
        // 스크린샷 저장
        await page.screenshot({ path: 'mastery_builder_final.png', fullPage: true });
        
        return finalData;
        
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        const data = await collectMasteryBuilderData();
        console.log('\n=== 마스터리 빌더 최종 데이터 수집 완료 ===');
        console.log('수집된 데이터 구조:');
        console.log(JSON.stringify(data.masteryBuilder, null, 2));
    } catch (error) {
        console.error('마스터리 빌더 데이터 수집 중 오류:', error.message);
    }
}

main();
