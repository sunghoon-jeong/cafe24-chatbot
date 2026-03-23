/**
 * 카페24 쇼핑몰 챗봇 위젯
 *
 * 사용법: 카페24 관리자 > 디자인 > 스마트디자인 편집 > 레이아웃 하단에 아래 코드 삽입
 *
 * <script>
 *   window.CS_CHATBOT_URL = "https://your-server-url.com";
 * </script>
 * <script src="https://your-server-url.com/static/widget.js"></script>
 */
(function () {
    const SERVER = window.CS_CHATBOT_URL || '';
    const SESSION_ID = 'session_' + Math.random().toString(36).substring(2, 10);
    let isOpen = false;

    // 스타일 삽입
    const style = document.createElement('style');
    style.textContent = `
        #cs-chat-toggle {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(102,126,234,0.4);
            z-index: 99999;
            transition: transform 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #cs-chat-toggle:hover { transform: scale(1.1); }

        #cs-chat-window {
            position: fixed;
            bottom: 96px;
            right: 24px;
            width: 380px;
            height: 520px;
            max-width: calc(100vw - 32px);
            max-height: calc(100vh - 120px);
            border: none;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            z-index: 99998;
            display: none;
            background: white;
            overflow: hidden;
        }
        #cs-chat-window.open { display: block; }

        #cs-chat-iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 16px;
        }
    `;
    document.head.appendChild(style);

    // 토글 버튼
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cs-chat-toggle';
    toggleBtn.innerHTML = '💬';
    toggleBtn.setAttribute('aria-label', '고객 상담 챗봇 열기');
    document.body.appendChild(toggleBtn);

    // 채팅 창
    const chatWindow = document.createElement('div');
    chatWindow.id = 'cs-chat-window';
    const iframe = document.createElement('iframe');
    iframe.id = 'cs-chat-iframe';
    iframe.src = SERVER + '/';
    iframe.title = '고객 상담 챗봇';
    chatWindow.appendChild(iframe);
    document.body.appendChild(chatWindow);

    toggleBtn.addEventListener('click', function () {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        toggleBtn.innerHTML = isOpen ? '✕' : '💬';
        toggleBtn.setAttribute('aria-label',
            isOpen ? '고객 상담 챗봇 닫기' : '고객 상담 챗봇 열기');
    });
})();
