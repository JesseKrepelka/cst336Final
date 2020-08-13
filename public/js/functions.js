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

    $(".addToCart").click(function(){
        //let id = this.querySelectorAll('.bookID');
        let id = $(this).siblings(".bookID").val();
        console.log(id);
        console.log('Add to Cart clicked on Book ID ' + id);
        
        $.ajax({
            method: "POST",
            url: "/addToCart",
            dataType: "json",
            data: {
                id: $(this).siblings(".bookID").val()
            },
            success: function (result, status, jqXHR) {
                if (typeof result.redirect == 'string')
                    window.location = result.redirect;
            }
        });
        
    });

    $("#buyCart").click(function(){
        $.ajax({
            method: "POST",
            url: "/buyCart",
            dataType: "json",
            data: {
                id: $(this).siblings(".bookID").val()
            },
            success: function (result, status, jqXHR) {
                if (typeof result.redirect == 'string')
                    window.location = result.redirect;
            }
        });
    });

    if(flagSuccess == 1){

          Swal.fire({
            title: 'Success!',
            text: 'Object Added to Shopping Cart',
            icon: 'success',
            confirmButtonText: 'Ok'
          })
    }

    if(flagSuccess == 2){

        Swal.fire({
          title: 'Success!',
          text: 'Thank you for your purchase.',
          icon: 'success',
          confirmButtonText: 'Ok'
        })
  }

});