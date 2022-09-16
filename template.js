const fs = require("fs");

function makeTemplate(json, path) {
    let file = fs.readFileSync(path, "utf-8");
    file = file.replaceAll("{{id}}",json.id);
    file = file.replaceAll("{{themebg}}",json.theme_bg);
    file = file.replaceAll("{{themecolor}}",json.theme_color);
    file = file.replaceAll("{{name}}",json.name);
    file = file.replaceAll("{{subdomain}}",json.subdomain);
    file = file.replaceAll("{{about}}",json.description);
    file = file.replaceAll("{{logo}}",json.logo);
    file = file.replaceAll("{{cover}}",json.cover_photo);
    file = file.replaceAll("{{location}}",json.location);
    file = file.replaceAll("{{verified}}",json.verified);
    return file;
}

module.exports = {
    makeTemplate
}
