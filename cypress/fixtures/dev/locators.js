
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

module.exports = {loginpage_locators, dashboardpage_locators}



// module.exports = {dashboardpage_locators}