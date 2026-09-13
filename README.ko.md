# EzDeck

Android, 태블릿 또는 브라우저에서 Windows 컴퓨터를 제어하는 로컬 바로 가기 패널입니다. EzDeck은 [Dokke](https://github.com/felipenalves/Dokke)에서 영감을 받은 독립적인 Windows/Android 적응판이며 원래 MIT 라이선스와 크레딧을 보존합니다.

![EzDeck 로고](public/ezdeck-logo.png)

## 포함된 기능

- 트레이 아이콘, PIN, 변경 가능한 포트, Windows 시작, 바탕 화면 바로 가기가 있는 네이티브 Windows 호스트.
- 로컬 네트워크 검색, PIN 페어링, WebSocket 업데이트를 지원하는 Android APK와 브라우저 PWA.
- 앱, 웹사이트, 키보드 바로 가기 버튼, 사용자 아이콘, 여러 페이지, 드래그 앤 드롭 및 라이트/다크 테마.
- 11개 인터페이스 언어. Windows 호스트에서 선택한 언어가 Android와 브라우저에도 적용됩니다.

## 설치

공식 릴리스에서 `EzDeck-Setup.exe`를 내려받아 실행한 뒤 바탕 화면 바로 가기를 여세요. Android/PWA companion은 PIN, WebSocket 및 로컬 네트워크 검색으로 연결됩니다.

[사용 설명서](MANUAL_DE_USO.md)와 [마인드맵](MAPA_MENTAL.md)을 참고하세요. 로컬 포트를 인터넷에 노출하지 마세요.

## 문서와 개발

[사용 설명서](MANUAL_DE_USO.md)에는 설치, 페어링, 문제 해결이, [마인드맵](MAPA_MENTAL.md)에는 호스트, 클라이언트, 로컬 네트워크가 설명되어 있습니다. 개발에는 Windows 10/11 및 Node.js 20 이상이 필요합니다: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, `.\windows\run-dev.ps1`.

## 전체 사용 방법

1. [공식 Releases](https://github.com/eddesignerez/EzDeck/releases)에서 `EzDeck-Setup.exe`를 내려받아 설치하고 바탕 화면의 **EzDeck**을 여세요. 필요한 런타임이 포함되어 있어 일반 사용자는 Node.js가 필요하지 않습니다.
2. Windows Firewall이 요청하면 **개인 네트워크**에서만 허용하세요. 창을 닫으면 호스트는 알림 영역으로 이동하며, **EzDeck 종료**는 완전히 중지합니다.
3. PC와 휴대폰/태블릿을 같은 Wi‑Fi에 연결합니다. Windows 창의 **접속** 주소와 네 자리 PIN을 사용하세요. APK가 호스트를 자동 검색하며 실패하면 IP와 포트를 입력합니다.
4. 같은 주소를 Chrome, Safari 또는 Edge에서 열어 홈 화면에 추가할 수도 있습니다. iPhone/iPad에는 이 방식이 권장됩니다.

## 패널 만들기와 동기화

- 앱을 빈 위치로 끌어 놓고, 카드를 드래그해 정렬하며 **X**로 제거합니다.
- `+ 페이지`는 페이지를 추가하고 `− 페이지`는 마지막 빈 페이지를 삭제합니다.
- 키보드 버튼으로 `Ctrl+C` 같은 명령을 만들고, `+`로 `.exe`, `.lnk`, `.bat`, `.cmd`를 추가합니다.
- 카드를 눌러 사용자 아이콘을 고르고 **저장**을 눌러 Android/PWA에 변경 사항을 보냅니다.

키보드 명령은 활성 Windows 창으로 전송됩니다. 관리자 권한으로 실행한 앱은 자동화를 막을 수 있습니다.

## 설정, 보안 및 호환성

- **PIN**으로 코드를 설정하고 **AUTO**로 새 코드를 만들며 **포트**는 EzDeck 재시작 후 바뀝니다.
- **Windows와 함께 시작**을 켜고 해/달 버튼으로 테마를 바꾸며 언어는 Windows 호스트에서만 선택합니다. Android/PWA가 그 설정을 따릅니다.
- PIN을 공유하거나 포트를 인터넷에 노출하지 마세요. 검색 실패 시 호스트에 표시된 IP와 포트를 사용하세요.
- Windows 10/11, Android 5.0 이상 및 같은 네트워크의 최신 브라우저를 지원합니다.

개발에는 Windows 10/11과 Node.js 20 이상이 필요합니다: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, `.\windows\run-dev.ps1`.

## 크레딧

EzDeck은 Felipe Alves의 [Dokke](https://github.com/felipenalves/Dokke)에서 영감을 받은 독립 Windows/Android 적응판이며 MIT 라이선스를 따릅니다. 원래 라이선스와 크레딧은 [LICENSE](LICENSE)에 보존됩니다. macOS는 원본 Dokke를 내려받으세요.
