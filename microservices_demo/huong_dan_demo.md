# 🚀 BÍ KÍP DEMO ĐỒ ÁN MICROSERVICES (CẬP NHẬT MỚI)

Tài liệu này lưu trữ lại toàn bộ các bước quan trọng để bạn thực hiện buổi báo cáo đồ án thành công nhất. Hệ thống này bao gồm 3 services rời rạc kết nối với nhau kèm theo giao diện UI để đáp ứng kỹ thuật "Microservices Architecture".

## 1. Cấu trúc thư mục (Architecture)
* **`product_service/`**: Quản lý hàng hóa (Port 8001 nội bộ).
* **`order_service/`**: Quản lý đặt hàng (Port 8002 nội bộ). Nhận request tạo hoá đơn độc lập.
* **`api_gateway/`**: Cổng thông tin duy nhất (Port 8000). Routing giao tiếp giữa người dùng và các hệ thống nhỏ bên dưới. Nó cũng nhận nhiệm vụ phục vụ giao diện (Frontend Serving).
* **`frontend/`**: Giao diện HTML/JS tĩnh của toàn bộ hệ thống.

## 2. Cách khởi động (Start System)

Hệ thống cung cấp cho bạn 2 phương pháp chạy (Tuỳ chọn 1 trong 2 để gây ấn tượng với Giảng viên):

### Phương pháp 1: Môi trường cục bộ (Script Local)
1. Mở thư mục chứa dự án.
2. Nhấp đúp vào chạy file **`run_all.bat`**. Sẽ có 3 màn hình đen (console) hiện lên đối với các backend. Hãy để nguyên chúng chạy ngầm.
3. Mở trình duyệt truy cập ứng dụng: **[http://localhost:8000](http://localhost:8000)** (Giao diện Frontend hiện nay đã được phục vụ trực tiếp qua cổng Gateway).

### Phương pháp 2: Kiến trúc Đám Mây tiêu chuẩn (Docker Container) - Khuyên dùng!
*Đây là cách lấy điểm cao nhất vì nó thoả tiêu chí tích hợp Cloud / Đóng gói độc lập!*
1. Đảm bảo máy tính đã cài đặt **Docker Desktop** và đang mở hoạt động.
2. Mở Terminal / CMD tại thư mục gốc của dự án, gõ lệnh: 
   ```bash
   docker-compose up --build -d
   ```
3. Chờ quá trình tải hệ điều hành và build thư viện khoảng 1-2 phút. Xong xuôi, truy cập **[http://localhost:8000](http://localhost:8000)**. Các services lúc này đang giao tiếp với nhau hoàn toàn ở mạng lưu trữ ảo bên trong Docker.

## 3. Kịch bản thuyết trình ăn điểm (Demo Script)

👉 **Bước 1: Giới thiệu Kiến trúc qua trang Giao diện chính**
* Mở trình duyệt [http://localhost:8000](http://localhost:8000).
* **Nói với giảng viên**: *"Thưa thầy/cô, đây là cổng API Gateway đang đảm nhận phục vụ 1 web tĩnh Frontend cho Client. Từ đây, giao diện Client không hề biết sự tồn tại của 2 cụm Server Product và Order bên trong mà chỉ giao tiếp duy nhất qua Cổng uỷ quyền (Gateway)."*
* Bấm qua lại giữa 2 tab **Sản phẩm** và **Đơn hàng** trên giao diện để load dữ liệu AJAX.

👉 **Bước 2: Gây ấn tượng bằng Dịch vụ luân chuyển API chéo**
* Chuyển sang Tab "Sản Phẩm". Bạn sẽ thấy danh sách hiển thị tên, giá và nút mua.
* Click vào nút **"Đặt mua ngay"** trên một sản phẩm bất kỳ.
* Phía trên màn hình sẽ hiển thị Toast thông báo "🎉 Đặt hàng thành công!".
* **Giải thích ngầm**: *"Yêu cầu POST từ trang Web được bắn vào Gateway, Gateway phân loại theo URL và dùng Asynchronous Client chọc thẳng lên Server Đơn Hàng (Order) đang đợi sẵn ở Port nội bộ."*

👉 **Bước 3: Khoảnh khắc kết bài (Chứng minh Data tách biệt)**
* Chuyển sang thẻ **Đơn Hàng** ngay trên ứng dụng web tại cổng Gateway đấy.
* Ngay lập tức đơn hàng mà bạn vừa nhấn nút lúc nãy sẽ hiện ra trên danh sách. 
* **(Mẹo Showoff - Bật API Docs chuyên nghiệp):** Mở 1 tab trình duyệt mới gõ **[http://localhost:8000/docs](http://localhost:8000/docs)** để show trang thư viện lệnh (Swagger Backend). 
* **Nói với giảng viên**: *"Với cấu trúc tách rời bằng file docker-compose.yml như thế này, nếu sau này app nổi tiếng, lượng User nhảy vào xem trang danh sách sản phẩm quá đông tới mức sập server đi nữa, thì dữ liệu Order của những đơn đã đặt vẫn nguyên vẹn nằm ở Server Order. Hoặc nếu muốn scale riêng Dịch Vụ Đặt Đơn lên thêm 10 lần sức mạnh cũng vô cùng dễ dàng mà không cồng kềnh như Monolithic."*

👉 **Bước 4: Demo Tính năng Bảo mật - Trang Quản trị (Admin)**
* Mở một tab trình duyệt chạy đường dẫn **[http://localhost:8080/admin.html](http://localhost:8080/admin.html)**.
* Giao diện bảo mật đăng nhập sẽ hiện ra chặn lại. Bạn có thể gõ sai mật khẩu thử 1 lần để hệ thống hiển thị cảnh báo đỏ từ chối truy cập.
* Sau đó nhập chuẩn xác Tài khoản: `admin`, mật khẩu: `123456` và nhấn Đăng nhập.
* Bảng điều khiển (Dashboard) sẽ mở ra, hiển thị các đơn hàng người dùng vừa mua ở Bước 2. Bấm lướt qua các Tab "Kho hàng" và "Đơn lệnh".
* **Nói với giảng viên**: *"Để đảm bảo tính bảo mật thống kê, ngay trên API Gateway có tích hợp sẵn Router cho tính năng phân quyền. Frontend có giao diện trang Quản trị áp dụng mã token, chỉ có chủ cửa hàng hiểu mật khẩu mới vào kiểm tra doanh thu được."*

---
Chúc cả nhóm qua môn với con điểm tuyệt đối! 🎉 Nhớ rủ nhau thực tập thao tác mượt mà vài lần cho nhuần nhuyễn kịch bản nhé.
