const fs = require('fs');

// 마스터리 데이터 구조 디버깅
function debugMasteryData() {
    console.log('=== 마스터리 데이터 구조 디버깅 ===');
    
    const data = JSON.parse(fs.readFileSync('mastery_builder_final.json', 'utf8'));
    
    console.log('최상위 키들:', Object.keys(data));
    
    if (data.masteryBuilder) {
        console.log('masteryBuilder 키들:', Object.keys(data.masteryBuilder));
        
        if (data.masteryBuilder.masterySystem) {
            console.log('masterySystem 키들:', Object.keys(data.masteryBuilder.masterySystem));
            
            if (data.masteryBuilder.masterySystem.buildVars) {
                console.log('buildVars 개수:', data.masteryBuilder.masterySystem.buildVars.length);
                console.log('buildVars 샘플:');
                data.masteryBuilder.masterySystem.buildVars.slice(0, 3).forEach((item, index) => {
                    console.log(`${index + 1}. ${item.substring(0, 100)}...`);
                });
            }
            
            if (data.masteryBuilder.masterySystem.masteryVars) {
                console.log('masteryVars 개수:', data.masteryBuilder.masterySystem.masteryVars.length);
                console.log('masteryVars 샘플:');
                data.masteryBuilder.masterySystem.masteryVars.slice(0, 3).forEach((item, index) => {
                    console.log(`${index + 1}. ${item.substring(0, 100)}...`);
                });
            }
        }
    }
    
    // 스킬 데이터가 포함된 부분 찾기
    const dataString = JSON.stringify(data);
    const skillPatterns = [
        /"101\d{3}"/g,
        /"102\d{3}"/g,
        /"103\d{3}"/g,
        /"var.*mastery/g,
        /"var.*skill/g,
        /"var.*build/g
    ];
    
    console.log('\n=== 스킬 데이터 패턴 검색 ===');
    skillPatterns.forEach((pattern, index) => {
        const matches = dataString.match(pattern);
        if (matches) {
            console.log(`패턴 ${index + 1} 발견: ${matches.length}개 매치`);
            console.log('샘플:', matches.slice(0, 5));
        } else {
            console.log(`패턴 ${index + 1}: 매치 없음`);
        }
    });
    
    // 큰 문자열에서 스킬 데이터 찾기
    console.log('\n=== 큰 문자열에서 스킬 데이터 검색 ===');
    const largeStrings = dataString.match(/"[^"]{1000,}"/g);
    if (largeStrings) {
        console.log(`큰 문자열 ${largeStrings.length}개 발견`);
        largeStrings.forEach((str, index) => {
            if (str.includes('101') || str.includes('102') || str.includes('103')) {
                console.log(`문자열 ${index + 1}에서 스킬 데이터 발견:`);
                console.log(str.substring(0, 200) + '...');
            }
        });
    }
}

debugMasteryData();
