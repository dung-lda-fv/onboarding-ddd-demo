# AGENTS.md: Order Management 
**Version:** 1.0 | **Last Updated:** 2026-04-23 | **Project Stage:** Production

## BẮT ĐẦU MỖI SESSION (đọc trước, làm sau)
PHẢI LÀM theo thứ tự này:
1. Chạy `./init.sh` để setup môi trường. DỪNG NẾU init.sh fail.
2. Đọc `claude-progress.md` (chỉ 50-80 dòng cuối) để biết ngữ cảnh phiên trước.
3. Kiểm tra `feature_list.json` để tìm feature đang pending.
4. Chọn 1 feature có priority cao nhất và ghi vào progress log.

## PROJECT OVERVIEW
**Mục đích:** Ứng dụng Desktop quản lý tài liệu.
**Tech Stack:** Javascripit, Typescript, SQLite.
**Kiến trúc chi tiết:** Xem file `docs/architecture.md`

## INVARIANTS (KHÔNG BAO GIỜ VI PHẠM)
1. ONE FEATURE/SESSION: Không bao giờ làm nhiều hơn 1 tính năng trong 1 phiên.
2. NO FALSE DONE: Không đánh dấu `passes: true` nếu chưa chạy test thủ công.
3. NO BROKEN COMMITS: Không được commit nếu `./verify.sh` thất bại.
4. NO SILENT SCOPE CREEP: Phát hiện lỗi ngoài phạm vi -> Ghi chú lại (Stop-and-Note), tuyệt đối không tự ý sửa.

## DEFINITION OF DONE
Một tính năng là DONE khi VÀ CHỈ KHI:
- Chạy `./verify.sh` trả về exit code 0 (pass tất cả test, build, lint).
- Thực hiện thủ công thành công TẤT CẢ `test_steps` trong `feature_list.json`.
- Đã xử lý các trường hợp ngoại lệ (loading, error state, empty state).
- Đã cập nhật nhật ký phiên vào `claude-progress.md` và bằng chứng vào `feature_list.json`.

## COMMANDS
./init.sh         # Khởi tạo môi trường
./verify.sh       # Chạy luồng kiểm tra toàn diện
npm run lint      # Kiểm tra code style
npm test          # Chạy Unit tests
npm run dev       # Khởi chạy server phát triển

## TÀI LIỆU CHI TIẾT (Chỉ đọc khi cần)
- Hiểu API contracts: Đọc `docs/api-contracts.md`
- Viết test như thế nào: Đọc `docs/testing-guide.md`
- Gặp lỗi lạ: Đọc `docs/troubleshooting.md`