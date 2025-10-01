const axios = require('axios');

// Claude API 설정
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'your-claude-api-key';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307';

class ClaudeLLMClient {
    async generateRecommendation(characterData, userRequest, recommendations) {
        try {
            const prompt = this.buildRecommendationPrompt(characterData, userRequest, recommendations);
            
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: CLAUDE_MODEL,
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: `당신은 Throne and Liberty 게임의 빌드 추천 전문가입니다.

${prompt}

위 정보를 바탕으로 캐릭터의 현재 상태를 분석하고, 사용자의 요청사항에 맞는 구체적인 개선 방안을 제시해주세요.
특히 현재 장비와 추천 아이템의 차이점과 예상되는 개선 효과를 수치적으로 설명해주세요.`
                    }
                ]
            }, {
                headers: {
                    'x-api-key': CLAUDE_API_KEY,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                timeout: 15000
            });

            return response.data.content[0].text;
        } catch (error) {
            console.error('Claude API 오류:', error);
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
        `;
    }
}

module.exports = new ClaudeLLMClient();
