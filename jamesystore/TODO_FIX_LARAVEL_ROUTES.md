# TODO_FIX_LARAVEL_ROUTES.md

- [x] Fix syntax in DashboardController.php (remove injected `use` garbage; add missing imports if needed)

- [x] Fix syntax in Kernel.php (repair middleware array)

- [x] Fix syntax in orders migration: 2026_06_17_000004_create_orders_table.php
- [x] Fix syntax in order_line_items migration: 2026_06_17_000005_create_order_line_items_table.php
- [x] Fix syntax in routes/api.php (remove injected garbage and restore valid route groups)
- [x] Fix syntax in routes/web.php (remove trailing injected garbage)

- [x] Fix syntax in AuthController.php (Request import + validation credentials)


- [x] Fix frontend compile errors:
  - [x] AdminAddOrder.jsx
  - [x] AdminAddOrder.css

- [x] Run lint/tests:
  - [x] PHP syntax check on repaired files
  - [x] npm build / typecheck for frontend


