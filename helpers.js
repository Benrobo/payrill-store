function getSubDomain(url) {
    let subdomain = url.substring(0, url.indexOf(".")) || "www";
    if(subdomain == "192"){
        return "amazon";
    }
    return subdomain;
}

module.exports = {
    getSubDomain
}
