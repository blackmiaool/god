function registerCheck(mode, name, password, password2) {
    if (typeof name !== "string") {
        return {
            key: "name",
            message: `Invalid name type`
        }
    }

    if (encodeURIComponent(name).length > 32) {
        return {
            key: "name",
            message: `Username too long(exceeds ${encodeURIComponent(name).length - 32}) chars`
        }
    }
    if (name.length < 2) {
        return {
            key: "name",
            message: "Username should be longer than 1"
        }
    }

    if (typeof password !== "string") {
        return {
            key: "password",
            message: `Invalid password type`
        }
    }
    if (mode === "server") {
        if (encodeURIComponent(password).length !== 32) {
            return {
                key: "password",
                message: `Invalid password length`
            }
        }
    }

    if (password2 && password2 !== password) {
        return {
            key: "password2",
            message: "Should be same with password"
        }
    }
    return false;
}
module.exports = {
    registerCheck
}