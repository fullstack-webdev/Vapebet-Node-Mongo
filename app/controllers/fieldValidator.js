/**
 * Validator for fields
 */

exports.validateUsername = function(username) {
    if (username.length < 3) {
        return {valid: false, message: "Username should be more than 2 characters."};
    }
    if (username.length > 15) {
        return {valid: false, message: "Username can't be more than 15 characters."};
    }
    if (username.indexOf("vapebet") != -1 || username.indexOf("admin") != -1) {
        return {valid: false, message: "Your username can't contain 'vapebet' or 'admin'."};
    }
    if (!(/^[A-Za-z0-9_-]+$/.test(username))) {
        return {valid: false, message: "Username can contain only letters, numbers and underscores."};
    }

    return {valid: true};
};

exports.validateEmail = function(email) {
    var pattern = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    var valid = pattern.test(email);
    if (valid) {
        return {valid: true};
    }
    else {
        return {valid: false, message: "Invalid email address"};
    }
};

exports.validatePassword = function(password, confirm) {
    if (password !== confirm) {
        return {valid: false, message: "Passwords do not match."};
    }
    if (password.length < 6) {
        return {valid: false, message: "Passwords must be at least 6 characters."};
    }
    return {valid: true};
};