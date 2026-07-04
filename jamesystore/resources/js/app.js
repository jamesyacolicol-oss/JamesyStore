import './bootstrap';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('[data-sidebar]');
    const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
    const sidebarClose = document.querySelector('[data-sidebar-close]');
    const sidebarBackdrop = document.querySelector('[data-sidebar-backdrop]');

    const setSidebarState = (isOpen) => {
        if (!sidebar) {
            return;
        }

        sidebar.classList.toggle('is-open', isOpen);
        sidebarBackdrop?.classList.toggle('is-visible', isOpen);
        document.body.classList.toggle('sidebar-open', isOpen);
    };

    const closeSidebar = () => setSidebarState(false);

    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            setSidebarState(!sidebar.classList.contains('is-open'));
        });

        sidebarClose?.addEventListener('click', closeSidebar);
        sidebarBackdrop?.addEventListener('click', closeSidebar);

        sidebar.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1040) {
                    closeSidebar();
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1040) {
                closeSidebar();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeSidebar();
            }
        });
    }

    const builder = document.querySelector('[data-order-builder]');

    if (!builder) {
        return;
    }

    const tableBody = builder.querySelector('[data-order-items-body]');
    const template = builder.querySelector('#order-item-template');
    const addButton = builder.querySelector('[data-add-order-item]');
    const subtotalNode = builder.querySelector('[data-order-subtotal]');
    const totalNode = builder.querySelector('[data-order-total]');
    const paidAmountInput = builder.querySelector('[data-paid-amount]');
    const changeNode = builder.querySelector('[data-change-amount]');
    const paymentStatusDisplay = builder.querySelector('[data-payment-status]');
    const paymentStatusInput = builder.querySelector('[data-payment-status-input]');
    const paymentErrorNode = builder.querySelector('[data-payment-error]');

    const formatCurrency = (value) => `₱${value.toFixed(2)}`;

    const setPaymentError = (message) => {
        if (!paymentErrorNode) {
            return;
        }

        paymentErrorNode.textContent = message || '';
        paymentErrorNode.classList.toggle('is-visible', !!message);
    };

    const validatePayment = () => {
        const total = Number(totalNode?.textContent.replace(/[₱,]/g, '')) || 0;
        const paid = Number(paidAmountInput?.value || 0);

        if (total > 0 && paid > 0 && paid < total) {
            const shortfall = formatCurrency(total - paid);
            setPaymentError(`Insufficient amount. Add at least ${shortfall} more or enter ₱0 for an unpaid order.`);
            changeNode?.classList.add('negative');
            return true;
        }

        setPaymentError('');
        changeNode?.classList.remove('negative');
        return false;
    };

    const lineTotal = (row) => {
        const quantity = Number(row.querySelector('[data-item-quantity]')?.value || 0);
        const price = Number(row.querySelector('[data-item-price]')?.value || 0);
        return quantity * price;
    };

    const updateRowLabel = (row) => {
        const lineNode = row.querySelector('[data-item-line-total]');
        if (lineNode) {
            lineNode.textContent = formatCurrency(lineTotal(row));
        }
    };

    const updatePaymentStatus = (total = Number(totalNode?.textContent) || 0) => {
        if (!paymentStatusDisplay && !paymentStatusInput) {
            return;
        }

        const paid = Number(paidAmountInput?.value || 0);
        let status = 'unpaid';

        if (total > 0 && paid >= total) {
            status = 'paid';
        } else if (paid > 0 && paid < total) {
            status = 'partial';
        }

        if (paymentStatusDisplay) {
            paymentStatusDisplay.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            paymentStatusDisplay.classList.remove('badge-success', 'badge-warning', 'badge-muted');
            paymentStatusDisplay.classList.add(
                status === 'paid' ? 'badge-success' : status === 'partial' ? 'badge-warning' : 'badge-muted'
            );
        }

        if (paymentStatusInput) {
            paymentStatusInput.value = status;
        }
    };

    const updateChange = (total = Number(totalNode?.textContent.replace(/[₱,]/g, '')) || 0) => {
        if (!changeNode || !paidAmountInput) {
            return;
        }

        const paid = Number(paidAmountInput.value || 0);
        const change = paid - total;
        changeNode.textContent = change >= 0
            ? formatCurrency(change)
            : `Need ${formatCurrency(Math.abs(change))}`;
        changeNode.classList.toggle('negative', change < 0);
        updatePaymentStatus(total);
        validatePayment();
    };

    const updateTotals = () => {
        const rows = [...tableBody.querySelectorAll('[data-order-item-row]')];
        const subtotal = rows.reduce((carry, row) => {
            updateRowLabel(row);
            return carry + lineTotal(row);
        }, 0);

        subtotalNode.textContent = formatCurrency(subtotal);
        totalNode.textContent = formatCurrency(subtotal);
        updateChange(subtotal);
    };

    const syncPriceFromProduct = (row) => {
        const productSelect = row.querySelector('[data-item-product]');
        const priceInput = row.querySelector('[data-item-price]');
        const selectedOption = productSelect?.selectedOptions?.[0];

        if (!selectedOption || !priceInput) {
            return;
        }

        if (!priceInput.value || priceInput.dataset.autofill === 'true') {
            priceInput.value = selectedOption.dataset.price || '';
            priceInput.dataset.autofill = 'true';
        }

        updateTotals();
    };

    const bindRow = (row) => {
        row.querySelector('[data-item-product]')?.addEventListener('change', () => {
            syncPriceFromProduct(row);
        });

        row.querySelector('[data-item-quantity]')?.addEventListener('input', updateTotals);

        row.querySelector('[data-item-price]')?.addEventListener('input', (event) => {
            event.currentTarget.dataset.autofill = 'false';
            updateTotals();
        });

        row.querySelector('[data-remove-order-item]')?.addEventListener('click', () => {
            row.remove();
            if (!tableBody.querySelector('[data-order-item-row]')) {
                addRow();
            }
            updateTotals();
        });

        syncPriceFromProduct(row);
    };

    const nextIndex = () => Number(builder.dataset.rowIndex || tableBody.children.length);

    const addRow = () => {
        const index = nextIndex();
        const html = template.innerHTML.replace(/__INDEX__/g, String(index));
        tableBody.insertAdjacentHTML('beforeend', html);
        builder.dataset.rowIndex = String(index + 1);
        bindRow(tableBody.lastElementChild);
        updateTotals();
    };

    addButton?.addEventListener('click', addRow);

    [...tableBody.querySelectorAll('[data-order-item-row]')].forEach(bindRow);
    updateTotals();

    if (paidAmountInput) {
        paidAmountInput.addEventListener('input', () => updateChange());
    }

    builder.addEventListener('submit', (event) => {
        if (validatePayment()) {
            event.preventDefault();
            paidAmountInput?.focus();
        }
    });
});
