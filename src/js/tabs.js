function open_horizontal_tab(evt, tab) {
    // Declare all variables
    let i, tab_content, tab_links;

    // Get all elements with class="tab_horizontal" and hide them
    tab_content = document.getElementsByClassName("tab_horizontal");
    for (i = 0; i < tab_content.length; i++) {
        tab_content[i].style.display = "none";
    }

    // Get all elements with class="tab_links" and remove the class "active"
    tab_links = document.getElementsByClassName("tab_h_links");
    for (i = 0; i < tab_links.length; i++) {
        tab_links[i].className = tab_links[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";
}


function open_vertical_tab(tab) {
    let tab_number = tab.replace("sample", "");
    let number = parseInt(tab_number);
    document.getElementById("clip_number").value = number;
    console.log("Switching to sample", number.toString());
    // Declare all variables
    let i, tab_content, tab_links;

    // Get all elements with class="tab_content" and hide them
    // tab_content = document.getElementsByClassName("tab_vertical");
    // for (i = 0; i < tab_content.length; i++) {
    //     tab_content[i].style.display = "none";
    // }

    // Get all elements with class="tab_links" and remove the class "active"
    tab_links = document.getElementsByClassName("tab_v_links");
    for (i = 0; i < tab_links.length; i++) {
        tab_links[i].className = tab_links[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(tab).className += " active";
    on_switch();

}