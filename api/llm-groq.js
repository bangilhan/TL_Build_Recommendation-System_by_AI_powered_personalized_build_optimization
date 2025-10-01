const axios = require('axios');

// Groq API 설정 (빠르고 무료 크레딧 제공)
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-groq-api-key';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

class GroqLLMClient {
    async generateRecommendation(characterData, userRequest, recommendations) {
        // API 키 확인 및 디버깅
        console.log('=== 환경 변수 디버깅 ===');
        console.log('process.env.GROQ_API_KEY:', process.env.GROQ_API_KEY ? '존재함' : '없음');
        console.log('process.env.GROQ_MODEL:', process.env.GROQ_MODEL);
        console.log('GROQ_API_KEY 변수:', GROQ_API_KEY ? '설정됨' : '설정되지 않음');
        console.log('GROQ_MODEL 변수:', GROQ_MODEL);
        console.log('========================');
        
        if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key' || GROQ_API_KEY === 'gsk_test_key_placeholder') {
            console.log('Groq API 키가 설정되지 않음, 로컬 분석 사용');
            return this.generateLocalRecommendation(characterData, userRequest, recommendations);
        }

        try {
            const prompt = this.buildRecommendationPrompt(characterData, userRequest, recommendations);
            
            console.log('Groq API 호출 시도...');
            
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `당신은 Throne and Liberty 게임의 빌드 추천 전문가입니다.
                        사용자의 캐릭터 정보와 현재 장비를 분석하여 최적의 개선 방안을 제시해야 합니다.
                        
                        분석 기준:
                        1. 캐릭터 클래스와 레벨에 맞는 최적화
                        2. 사용자 요청사항에 맞는 개선점
                        3. 현재 장비와 추천 장비의 비교 분석
                        4. 구체적인 수치적 개선 효과
                        
                        응답 형식:
                        - 문제점 분석
                        - 추천 아이템과 이유
                        - 예상 개선 효과
                        - 구체적인 실행 방안`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('Groq API 응답 성공');
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Groq API 오류:', error.response?.data || error.message);
            console.log('로컬 분석으로 대체');
            
            // Groq API 실패 시 로컬 분석으로 대체
            return this.generateLocalRecommendation(characterData, userRequest, recommendations);
        }
    }

    buildRecommendationPrompt(characterData, userRequest, recommendations) {
        const equipmentList = characterData.equipment.map(item => 
            `- ${item.slot}: ${item.itemName} (${item.grade}) - ${item.option}: ${item.value}`
        ).join('\n');

        const recommendationList = recommendations.map(rec => 
            `- ${rec.slot}: ${rec.recommendedItem} (${rec.grade}) - ${rec.option}: +${rec.improvement}`
        ).join('\n');

        return `
캐릭터 정보:
- 서버: ${characterData.server}
- 이름: ${characterData.name}
- 레벨: ${characterData.level}
- 클래스: ${characterData.class}

현재 장비:
${equipmentList}

사용자 요청: ${userRequest}

추천 아이템:
${recommendationList}

위 정보를 바탕으로 캐릭터의 현재 상태를 분석하고, 사용자의 요청사항에 맞는 구체적인 개선 방안을 제시해주세요.
특히 현재 장비와 추천 아이템의 차이점과 예상되는 개선 효과를 수치적으로 설명해주세요.
        `;
    }

    // 로컬 분석 함수 (Groq API 실패 시 사용)
    generateLocalRecommendation(characterData, userRequest, recommendations) {
        const characterClass = characterData.class;
        const characterLevel = characterData.level;
        const equipmentCount = characterData.equipment.length;
        
        let analysis = `📊 캐릭터 분석 결과\n\n`;
        analysis += `• 캐릭터: ${characterData.name} (${characterClass}, Lv.${characterLevel})\n`;
        analysis += `• 현재 장비: ${equipmentCount}개 착용\n`;
        analysis += `• 요청사항: ${userRequest}\n\n`;
        
        analysis += `🎯 개선 방안\n\n`;
        
        if (userRequest.includes('공격') || userRequest.includes('딜')) {
            analysis += `• 공격력 향상을 위해 무기와 액세서리 업그레이드 권장\n`;
            analysis += `• 현재 무기: ${characterData.equipment.find(e => e.slot === '무기')?.itemName || '미착용'}\n`;
            analysis += `• 추천 무기: 더 높은 등급의 무기로 교체\n`;
            analysis += `• 공격력 관련 옵션 아이템 우선 고려\n\n`;
        }
        
        if (userRequest.includes('생존') || userRequest.includes('방어')) {
            analysis += `• 생존력 향상을 위해 방어구 강화 권장\n`;
            analysis += `• 방어구 세트 효과 확인 필요\n`;
            analysis += `• 체력 관련 옵션 아이템 우선 고려\n`;
            analysis += `• 방어력과 체력 회복 옵션 균형 맞추기\n\n`;
        }
        
        if (userRequest.includes('마나') || userRequest.includes('스킬')) {
            analysis += `• 마나 관리 개선을 위한 아이템 옵션 확인\n`;
            analysis += `• 스킬 쿨다운 감소 옵션 아이템 추천\n`;
            analysis += `• 마나 재생 관련 액세서리 고려\n`;
            analysis += `• 지능 스탯과 마나 효율성 균형\n\n`;
        }
        
        analysis += `💡 구체적 실행 방안\n`;
        analysis += `1. 추천된 ${recommendations.length}개 아이템 중 우선순위별로 교체\n`;
        analysis += `2. 각 아이템의 옵션 효과를 캐릭터 빌드에 맞게 조정\n`;
        analysis += `3. 아이템 강화를 통한 추가 스탯 향상 고려\n`;
        analysis += `4. 정기적인 장비 점검으로 최적화 유지\n`;
        analysis += `5. 클래스별 특성에 맞는 아이템 조합 고려\n`;
        
        return analysis;
    }
}

module.exports = new GroqLLMClient();
