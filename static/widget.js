// ── 셀렉띵 할인율 표시 보장 ──
(function(){var s=document.createElement('script');s.src='https://selectthing.com/select/fix_discount.js';document.head.appendChild(s);})();

/**
 * 카페24 쇼핑몰 챗봇 위젯
 *
 * 사용법: 카페24 관리자 > 디자인 > 스마트디자인 편집 > 레이아웃 하단에 아래 코드 삽입
 *
 * <script>
 *   window.CS_CHATBOT_URL = "https://your-server-url.com";
 *   window.CS_CHATBOT_MEMBER_ID = "{$member_id}";
 * </script>
 * <script src="https://your-server-url.com/static/widget.js"></script>
 */
(function () {
    const SERVER = window.CS_CHATBOT_URL || '';
    const MEMBER_ID = (window.CS_CHATBOT_MEMBER_ID || '').trim();
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

        /* 배경 오버레이 */
        #cs-chat-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            z-index: 99997;
            display: none;
        }
        #cs-chat-overlay.open { display: block; }

        #cs-chat-window {
            position: fixed;
            bottom: 96px;
            right: 24px;
            width: 380px;
            height: 70vh;
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

        /* 모바일 반응형: 전체화면 */
        @media (max-width: 500px) {
            #cs-chat-window {
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                border-radius: 0;
            }
        }

        #cs-chat-iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 16px;
        }
        @media (max-width: 500px) {
            #cs-chat-iframe { border-radius: 0; }
        }

        /* 채팅 열렸을 때 body 스크롤 방지 */
        body.cs-chat-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
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

    // 로그인 안내 오버레이
    const loginOverlay = document.createElement('div');
    loginOverlay.id = 'cs-chat-login';
    loginOverlay.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">🔒</div>
            <h2 style="font-size:18px;font-weight:600;color:#333;margin-bottom:8px;">로그인이 필요합니다</h2>
            <p style="font-size:14px;color:#666;margin-bottom:24px;line-height:1.6;">
                챗봇 상담은 회원 전용 서비스입니다.<br>로그인 후 이용해 주세요.
            </p>
            <a href="/member/login.html" style="
                display:inline-block;padding:12px 32px;
                background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                color:white;border-radius:24px;text-decoration:none;
                font-size:14px;font-weight:600;
            ">로그인하기</a>
        </div>
    `;
    loginOverlay.style.cssText = 'width:100%;height:100%;background:white;border-radius:16px;';

    // 비로그인 시 iframe 대신 로그인 안내 표시
    if (!MEMBER_ID) {
        chatWindow.removeChild(iframe);
        chatWindow.appendChild(loginOverlay);
    }

    // 배경 오버레이
    const overlay = document.createElement('div');
    overlay.id = 'cs-chat-overlay';
    document.body.appendChild(overlay);

    let scrollY = 0;

    function openChat() {
        isOpen = true;
        scrollY = window.scrollY;
        chatWindow.classList.add('open');
        overlay.classList.add('open');
        document.body.classList.add('cs-chat-open');
        document.body.style.top = -scrollY + 'px';
        toggleBtn.innerHTML = '✕';
        toggleBtn.setAttribute('aria-label', '고객 상담 챗봇 닫기');
    }

    function closeChat() {
        isOpen = false;
        chatWindow.classList.remove('open');
        overlay.classList.remove('open');
        document.body.classList.remove('cs-chat-open');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
        toggleBtn.innerHTML = '💬';
        toggleBtn.setAttribute('aria-label', '고객 상담 챗봇 열기');
    }

    toggleBtn.addEventListener('click', function () {
        isOpen ? closeChat() : openChat();
    });

    overlay.addEventListener('click', closeChat);
})();
