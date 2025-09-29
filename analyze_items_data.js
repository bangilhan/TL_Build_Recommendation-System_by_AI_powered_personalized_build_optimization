const fs = require('fs');

// 아이템 데이터 분석
function analyzeItemsData() {
    console.log('=== 아이템 데이터 분석 ===');
    
    const data = JSON.parse(fs.readFileSync('mastery_builder_final.json', 'utf8'));
    const buildVars = data.masteryBuilder.masterySystem.buildVars || [];
    
    // builder_data 변수 찾기
    const builderDataVar = buildVars.find(varString => 
        varString.includes('var builder_data=')
    );

    if (builderDataVar) {
        try {
            const jsonStart = builderDataVar.indexOf('var builder_data=') + 'var builder_data='.length;
            const jsonString = builderDataVar.substring(jsonStart);
            const builderData = JSON.parse(jsonString);
            
            console.log('=== 아이템 데이터 상세 분석 ===');
            if (builderData.items) {
                console.log('총 아이템 개수:', Object.keys(builderData.items).length);
                
                Object.entries(builderData.items).forEach(([itemId, itemData]) => {
                    console.log(`\n아이템 ID: ${itemId}`);
                    console.log('데이터:', itemData);
                    
                    if (Array.isArray(itemData) && itemData.length >= 2) {
                        const itemName = itemData[0];
                        const itemGrade = itemData[1];
                        const itemIcon = itemData[2];
                        
                        console.log(`이름: ${itemName}`);
                        console.log(`등급: ${itemGrade}`);
                        console.log(`아이콘: ${itemIcon}`);
                        
                        // 스킬 관련 키워드 확인
                        const skillKeywords = ['스킬', 'skill', '마스터리', 'mastery', '원소', 'element', '원석', 'gem'];
                        const hasSkillKeyword = skillKeywords.some(keyword => 
                            itemName.toLowerCase().includes(keyword.toLowerCase())
                        );
                        
                        console.log(`스킬 관련 키워드 포함: ${hasSkillKeyword}`);
                    }
                });
            }
            
            console.log('\n=== 노드 아이템 데이터 샘플 ===');
            if (builderData.nodeitems) {
                const nodeEntries = Object.entries(builderData.nodeitems);
                console.log('총 노드 개수:', nodeEntries.length);
                
                // 처음 10개 노드만 출력
                nodeEntries.slice(0, 10).forEach(([nodeId, nodeData]) => {
                    console.log(`\n노드 ID: ${nodeId}`);
                    console.log('필요 아이템:', nodeData);
                });
            }
            
        } catch (error) {
            console.log('데이터 파싱 실패:', error.message);
        }
    }
}

analyzeItemsData();
