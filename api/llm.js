const axios = require('axios');

// LLM 서버 설정
const LLM_API_BASE = process.env.LLM_API_BASE || 'http://172.20.92.48:30410/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-local';
const LLM_MODEL = process.env.LLM_MODEL || 'Qwen2.5-72B';

// LLM 클라이언트 생성
class LLMClient {
    constructor() {
        this.apiBase = LLM_API_BASE;
        this.apiKey = LLM_API_KEY;
        this.model = LLM_MODEL;
    }

    async generateRecommendation(characterData, userRequest, recommendations) {
        try {
            const prompt = this.buildRecommendationPrompt(characterData, userRequest, recommendations);
            
            const response = await axios.post(`${this.apiBase}/chat/completions`, {
                model: this.model,
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
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30초 타임아웃
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('LLM API 오류:', error);
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

    async analyzeCharacter(characterData) {
        try {
            const prompt = `
캐릭터 분석 요청:
- 서버: ${characterData.server}
- 이름: ${characterData.name}
- 레벨: ${characterData.level}
- 클래스: ${characterData.class}
- 현재 장비: ${characterData.equipment.length}개 착용

이 캐릭터의 현재 상태를 분석하고, 클래스와 레벨에 맞는 최적화 포인트를 제시해주세요.
            `;

            const response = await axios.post(`${this.apiBase}/chat/completions`, {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "당신은 Throne and Liberty 게임의 캐릭터 분석 전문가입니다. 캐릭터의 현재 상태를 분석하고 개선점을 제시해주세요."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 500
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('LLM 분석 오류:', error);
            return "캐릭터 분석을 완료할 수 없습니다.";
        }
    }
}

module.exports = new LLMClient();
