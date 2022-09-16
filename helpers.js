function getSubDomain(url) {
    return url.substring(0, url.indexOf(".")) || "www";
}

module.exports = {
    getSubDomain
}
