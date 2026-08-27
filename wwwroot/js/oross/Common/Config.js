var config = {
    serverPath: GetPath()
}


function GetPath() {
    if (location.toString().indexOf("localhost") === -1) {
        return "/OROSS/";
    }
    else {
        return "/";
    }


}

