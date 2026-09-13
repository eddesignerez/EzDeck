# EzDeck

Bảng phím tắt cục bộ để điều khiển máy tính Windows từ Android, máy tính bảng hoặc trình duyệt. EzDeck là bản điều chỉnh độc lập cho Windows/Android lấy cảm hứng từ [Dokke](https://github.com/felipenalves/Dokke), vẫn giữ giấy phép MIT và ghi công ban đầu.

![Logo EzDeck](public/ezdeck-logo.png)

## Thành phần gồm có

- Máy chủ Windows gốc với biểu tượng khay hệ thống, PIN, cổng tùy chỉnh, khởi động cùng Windows và lối tắt trên màn hình.
- APK Android và PWA trình duyệt có tìm máy chủ trong mạng nội bộ, ghép đôi bằng PIN và cập nhật WebSocket.
- Nút cho ứng dụng, trang web và phím tắt; biểu tượng tùy chỉnh, nhiều trang, kéo thả và giao diện sáng/tối.
- Mười một ngôn ngữ giao diện. Ngôn ngữ chọn trong EzDeck Windows sẽ được dùng trên Android và trình duyệt.

## Cài đặt

Tải `EzDeck-Setup.exe` từ bản phát hành chính thức, chạy trình cài đặt và mở lối tắt trên màn hình. Ứng dụng đồng hành Android/PWA kết nối bằng PIN, WebSocket và phát hiện mạng cục bộ.

Xem [sổ tay sử dụng](MANUAL_DE_USO.md) và [sơ đồ tư duy](MAPA_MENTAL.md). Không đưa cổng cục bộ ra Internet.

## Tài liệu và phát triển

[Sổ tay sử dụng](MANUAL_DE_USO.md) trình bày cài đặt, ghép đôi và xử lý sự cố; [sơ đồ tư duy](MAPA_MENTAL.md) tóm tắt máy chủ, các client và mạng nội bộ. Để phát triển cần Windows 10/11 và Node.js 20+: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, sau đó `.\windows\run-dev.ps1`.

## Hướng dẫn đầy đủ

1. Tải `EzDeck-Setup.exe` từ [Releases chính thức](https://github.com/eddesignerez/EzDeck/releases), cài đặt rồi mở **EzDeck** trên Desktop. Runtime đã có sẵn nên người dùng không cần Node.js.
2. Nếu Windows Firewall hỏi, chỉ cho phép trên **mạng riêng tư**. Đóng cửa sổ sẽ đưa host vào khay hệ thống; **Tắt EzDeck** sẽ dừng hoàn toàn.
3. Kết nối PC và điện thoại/máy tính bảng vào cùng Wi‑Fi. Dùng địa chỉ sau **Truy cập** và mã PIN bốn số trên Windows. APK tự tìm host; nếu thất bại hãy nhập IP và cổng.
4. Có thể mở cùng địa chỉ trong Chrome, Safari hoặc Edge và thêm vào màn hình chính; cách này phù hợp cho iPhone/iPad.

## Tạo và đồng bộ bảng điều khiển

- Kéo ứng dụng vào ô trống, kéo thẻ để sắp xếp và dùng **X** để xóa.
- Dùng `+ Trang` để thêm trang và `− Trang` để xóa trang trống cuối cùng.
- Nút bàn phím tạo lệnh như `Ctrl+C`; `+` thêm `.exe`, `.lnk`, `.bat` hoặc `.cmd`.
- Nhấp thẻ để chọn biểu tượng tùy chỉnh và bấm **Lưu** để gửi thay đổi tới Android/PWA.

Lệnh bàn phím được gửi tới cửa sổ Windows đang hoạt động. Ứng dụng chạy quyền quản trị có thể chặn tự động hóa.

## Cài đặt, bảo mật và tương thích

- **PIN** đặt mã, **AUTO** tạo mã mới và **CỔNG** đổi sau khi EzDeck khởi động lại.
- Bật **Khởi động cùng Windows**, dùng mặt trời/mặt trăng cho giao diện và chọn ngôn ngữ chỉ tại host Windows; Android/PWA sẽ theo ngôn ngữ đó.
- Không chia sẻ PIN hoặc đưa cổng ra Internet. Nếu không tìm thấy host, dùng IP và cổng hiển thị trên host.
- Tương thích Windows 10/11, Android 5.0 trở lên và trình duyệt hiện đại trong cùng mạng.

Phát triển cần Windows 10/11 và Node.js 20+: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, `.\windows\run-dev.ps1`.

## Ghi công

EzDeck là bản điều chỉnh độc lập Windows/Android lấy cảm hứng từ [Dokke](https://github.com/felipenalves/Dokke) của Felipe Alves, theo giấy phép MIT. Giấy phép và ghi công gốc có trong [LICENSE](LICENSE). Người dùng macOS nên tải Dokke gốc.
