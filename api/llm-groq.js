const axios = require('axios');

// Groq API 설정 (빠르고 무료 크레딧 제공)
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-groq-api-key';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

class GroqLLMClient {
    async generateRecommendation(characterData, userRequest, recommendations) {
        try {
            const prompt = this.buildRecommendationPrompt(characterData, userRequest, recommendations);
            
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
                timeout: 15000
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Groq API 오류:', error);
            throw new Error('LLM 추천 생성 중 오류가 발생했습니다.');
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
}

module.exports = new GroqLLMClient();
