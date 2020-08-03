$(document).ready(function () {

    $("#btnUpdateBook").click(function () {
        updateBook();
    });

    function updateBook() {
        $.ajax({
            method: "POST",
            url: "/bookManager",
            dataType: "json",
            data: {
                title: $("#title").val(),
                author: $("#author").val(),
                ISBN: $("#ISBN").val(),
                genre: $("#genre").val(),
                year: $("#year").val(),
                imageURI: $("#imageURI").val(),
                stock: $("#stock").val()
            },
            success: function (result, status) {
                console.log(result.status)
            }
        });
        
    }

});