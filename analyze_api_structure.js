const fs = require('fs');

// 원본 API 응답 구조 분석
function analyzeAPIStructure() {
    console.log('=== API 응답 구조 분석 ===');
    
    // questlog_all_data.json에서 빌드 데이터 확인
    const allData = JSON.parse(fs.readFileSync('questlog_all_data.json', 'utf8'));
    
    console.log('수집된 데이터:');
    Object.keys(allData).forEach(category => {
        console.log(`${category}: ${allData[category].length}개`);
    });
    
    // 빌드 데이터 샘플 분석
    if (allData.builds.length > 0) {
        console.log('\n=== 빌드 데이터 구조 분석 ===');
        const build = allData.builds[0];
        console.log('빌드 ID:', build.id);
        console.log('빌드 이름:', build.name);
        console.log('속성:', build.attributes);
        console.log('장비 슬롯들:', Object.keys(build.equipment || {}));
        
        // 장비 상세 정보
        if (build.equipment) {
            const firstEquipment = Object.values(build.equipment)[0];
            console.log('\n첫 번째 장비 정보:');
            console.log('ID:', firstEquipment.id);
            console.log('룬:', firstEquipment.runes);
            console.log('특성:', firstEquipment.traits);
            console.log('강화 레벨:', firstEquipment.enhLvl);
        }
    }
    
    // 캐릭터 데이터 샘플 분석
    if (allData.characters.length > 0) {
        console.log('\n=== 캐릭터 데이터 구조 분석 ===');
        const character = allData.characters[0];
        console.log('캐릭터 이름:', character.name);
        console.log('레벨:', character.level);
        console.log('역할 태그:', character.roleTags);
        console.log('평점:', character.ratingAverage);
        console.log('조회수:', character.ratingAmount);
    }
}

// API 응답 원본 파일이 있는지 확인
function checkRawAPIResponses() {
    console.log('\n=== 원본 API 응답 파일 확인 ===');
    
    const files = fs.readdirSync('.');
    const apiFiles = files.filter(f => f.includes('questlog') && f.endsWith('.json'));
    
    console.log('발견된 파일들:');
    apiFiles.forEach(file => {
        const stats = fs.statSync(file);
        console.log(`${file}: ${(stats.size / 1024).toFixed(2)} KB`);
    });
}

analyzeAPIStructure();
checkRawAPIResponses();
