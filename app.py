import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from anthropic import Anthropic
from dotenv import load_dotenv
from store_config import STORE_INFO, TEMPLATES

load_dotenv()

app = Flask(__name__, static_folder="static")
CORS(app)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# 대화 세션 저장 (프로덕션에서는 Redis 등 사용 권장)
sessions: dict[str, list] = {}

SYSTEM_PROMPT = f"""당신은 "{STORE_INFO['name']}"의 친절한 고객 상담 챗봇입니다.
아래 쇼핑몰 정보를 바탕으로 고객 문의에 정확하고 친절하게 답변하세요.

## 쇼핑몰 정보
- 상호: {STORE_INFO['name']}
- 영업시간: {STORE_INFO['business_hours']}
- 전화: {STORE_INFO['phone']}
- 이메일: {STORE_INFO['email']}
- 주소: {STORE_INFO['address']}

## 배송 정책
- 택배사: {STORE_INFO['shipping']['method']}
- 배송비: {STORE_INFO['shipping']['cost']}
- 출고: {STORE_INFO['shipping']['processing_days']}
- 배송 소요: {STORE_INFO['shipping']['delivery_days']}

## 반품/교환/환불 정책
- 신청 기간: {STORE_INFO['return_policy']['period']}
- 반품 가능 조건: {', '.join(STORE_INFO['return_policy']['conditions'])}
- 반품 불가 사유: {', '.join(STORE_INFO['return_policy']['non_returnable'])}
- 반품 배송비: {STORE_INFO['return_policy']['return_shipping_cost']}
- 환불 방법: {STORE_INFO['return_policy']['refund_method']}

## 응대 규칙
1. 항상 존댓말을 사용하고, 친절하고 공감하는 어조로 답변하세요.
2. 정확한 정보만 제공하세요. 모르는 내용은 고객센터({STORE_INFO['phone']})를 안내하세요.
3. 답변은 간결하게 핵심만 전달하세요 (3~4문장 이내).
4. 주문번호, 송장번호 등 구체적인 조회가 필요한 경우 마이페이지 확인 또는 고객센터 연락을 안내하세요.
5. 불만이나 컴플레인에는 먼저 사과하고 공감한 후 해결 방안을 안내하세요.
6. 쇼핑몰과 관련 없는 질문에는 정중히 쇼핑몰 관련 문의만 가능하다고 안내하세요.
"""


def match_template(message: str) -> str | None:
    """키워드 매칭으로 템플릿 답변을 찾는다. 매칭되면 답변 문자열, 없으면 None."""
    msg = message.lower().replace(" ", "")
    for tpl in TEMPLATES:
        for kw in tpl["keywords"]:
            if kw.replace(" ", "") in msg:
                return tpl["answer"]
    return None


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")

    if not user_message:
        return jsonify({"error": "메시지를 입력해주세요."}), 400

    if session_id not in sessions:
        sessions[session_id] = []

    sessions[session_id].append({"role": "user", "content": user_message})

    # 1단계: 템플릿 매칭 시도 (무료, 즉시 응답)
    template_reply = match_template(user_message)
    if template_reply:
        sessions[session_id].append({"role": "assistant", "content": template_reply})
        return jsonify({"reply": template_reply, "source": "template"})

    # 2단계: 템플릿에 없으면 AI 호출 (유료)
    conversation = sessions[session_id][-10:]

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=conversation,
        )
        assistant_message = response.content[0].text
        sessions[session_id].append(
            {"role": "assistant", "content": assistant_message}
        )
        return jsonify({"reply": assistant_message, "source": "ai"})

    except Exception as e:
        return jsonify({"error": f"응답 생성 중 오류가 발생했습니다: {str(e)}"}), 500


@app.route("/api/reset", methods=["POST"])
def reset():
    data = request.get_json()
    session_id = data.get("session_id", "default")
    sessions.pop(session_id, None)
    return jsonify({"message": "대화가 초기화되었습니다."})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
