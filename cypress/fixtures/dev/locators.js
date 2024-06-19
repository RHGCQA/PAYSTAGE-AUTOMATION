
const loginpage_locators = {
    //login poage
    email_field: "#emailAddress",
    pass_field: "#password",
    submit_button: ".rs-btn",

    //Text
    login_login_text_loc: ".mb-6",
    login_email_text_loc: "#emailAddress-control-label",
    login_password_text_loc: "#password-control-label",
    login_forgotpass_text_loc: ".rs-flex-box-grid > :nth-child(1)",
    login_createacc_text_loc: ".rs-flex-box-grid > :nth-child(2)",
    
    //login page error message
    login_error_message_header: ".mb-6 > .font-medium",
    login_error_message_1: ".mt-3 > :nth-child(1)",
    login_error_message_2: ".mt-3 > :nth-child(2)" 
}

const dashboardpage_locators = {
    //Text
    dashboard_header: ".rs-panel-title > :nth-child(1)",

    //Elements
    dashboard_export_btn: ":nth-child(2) > .rs-btn > div",
    dashboard_account_number: ":nth-child(2) > .rs-table-cell > .rs-table-cell-content",
    dashboard_merchant_name: ":nth-child(3) > .rs-table-cell > .rs-table-cell-content",
    dashboard_type: ":nth-child(4) > .rs-table-cell > .rs-table-cell-content",
    dashboard_pagination: ".rs-pagination",
    dashboard_pagination_next: '[aria-label="Next"]',
    dashboard_pagination_prev: '[aria-label="Previous"]',
    dashboard_pagepicker: ".rs-picker-toggle",
    dashboard_gotosearch: ".rs-pagination-group-skip"
}

const merchantspage_locators = {
    //Text
    merchants_header: ".flex-1",

    //Elements
    merchants_export_btn: ":nth-child(2) > .rs-btn > div",
    merchants_addmerchant_btn: ".mb-4 > :nth-child(2) > .rs-btn",
    merchnats_search_filter: ".space-y-1",
    merchants_number: ":nth-child(2) > .rs-table-cell > .rs-table-cell-content",
    merchants_name: ":nth-child(3) > .rs-table-cell > .rs-table-cell-content",
    merchants_email: ":nth-child(4) > .rs-table-cell > .rs-table-cell-content",
    merchants_company_name: ":nth-child(5) > .rs-table-cell > .rs-table-cell-content",
    merchants_registered_date: ":nth-child(6) > .rs-table-cell > .rs-table-cell-content",
    merchants_pagination: ".rs-pagination",
    merchants_pagination_next: '[aria-label="Next"]',
    merchants_pagination_prev: '[aria-label="Previous"]',
    merchants_pagepicker: ".rs-picker-toggle",
    merchants_gotosearch: ".rs-pagination-group-skip"
}

const accountspage_locators = {
    //Text
    accounts_header: ".flex-1",

    //Elements
    accounts_export_btn: ".rs-flex-box-grid > :nth-child(2) > .rs-btn > div",
    accounts_createaccount_btn: ".mb-4 > :nth-child(2) > .rs-btn",
    accounts_search_filter: ".rs-form > :nth-child(1)",
    accounts_type_filter: ".rs-form > :nth-child(2)",
    accounts_kyc_filter: ".rs-form > :nth-child(3)",
    accounts_integration_filter: ".rs-form > :nth-child(4)",

    accounts_account_number: ".rs-table-cell-group > :nth-child(1) > .rs-table-cell > .rs-table-cell-content",
    accounts_merchant_name: ":nth-child(2) > .rs-table-cell > .rs-table-cell-content",
    accounts_type: ":nth-child(3) > .rs-table-cell > .rs-table-cell-content",
    accounts_kyc: ":nth-child(4) > .rs-table-cell > .rs-table-cell-content",
    accounts_integration: ":nth-child(5) > .rs-table-cell > .rs-table-cell-content",
    accounts_registered_date: ":nth-child(6) > .rs-table-cell > .rs-table-cell-content",
    
    accounts_pagination: ".rs-pagination",
    accounts_pagination_next: '[aria-label="Next"]',
    accounts_pagination_prev: '[aria-label="Previous"]',
    accounts_pagepicker: ".rs-picker-toggle",
    accounts_gotosearch: ".rs-pagination-group-skip"
}

const sidebarmenu_locators = {
    transaction_module: ":nth-child(5) > .rs-dropdown-toggle",
    transaction_submodule: ".rs-dropdown-expand > .rs-dropdown-menu > :nth-child(1) > .rs-dropdown-item",
    type_dropdown: ":nth-child(2) > .w-full > .rs-picker-toggle",
    type_withdrawal: '[data-key="withdrawal"] > .rs-picker-select-menu-item',
    vendor_dropdown: ":nth-child(4) > .w-full > .rs-picker-toggle",
    vendor_jpay: '[data-key="jpay"] > .rs-picker-select-menu-item',
    // Admin submodule
    admin_module: ":nth-child(10) > .rs-dropdown-toggle",
    default_fee_module: ".cursor-pointer.rs-dropdown-expand > .rs-dropdown-menu > :nth-child(3) > .rs-dropdown-item"
}

const transactionpage_locators = {
    type_dropdown: ":nth-child(2) > .w-full > .rs-picker-toggle",
    type_withdrawal: '[data-key="withdrawal"] > .rs-picker-select-menu-item',
    type_deposit: '[data-key="deposit"] > .rs-picker-select-menu-item',

    vendor_dropdown: ":nth-child(4) > .w-full > .rs-picker-toggle",
    vendor_jpay: '[data-key="jpay"] > .rs-picker-select-menu-item',
    vendor_allbank: '[data-key="all_bank"] > .rs-picker-select-menu-item',

    solution_dropdown: ":nth-child(5) > .w-full > .rs-picker-toggle",
    solution_QRPH: '[data-key="qrph"] > .rs-picker-select-menu-item'
    
    //a[normalize-space()='2471171455']
}


module.exports = {loginpage_locators, dashboardpage_locators, merchantspage_locators,
                    accountspage_locators, sidebarmenu_locators, transactionpage_locators}



// module.exports = {dashboardpage_locators}