function get_video(url) {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200)
            callback(request.response)
    }
}