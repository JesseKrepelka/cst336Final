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
                stock: $("#stock").val(),
                price: $("#price").val()
            },
            success: function (result, status) {
                console.log(result.status)
            }
        });
        
    }

    $(document).on("click", ".addToCart", function(){
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

    $(".mainForm").on("submit", function(e) { 
        e.preventDefault();
        var form = $(this);
        var url = form.attr('action');
        $.ajax({
            type: "GET",
            dataType: 'JSON',
            url: url,
            data: form.serialize(), 
            success: function(data) {
                $(".card-group").empty();
                $("#countItems").empty();
                data.forEach(function (img, index) {
                    $('<div class="card' + index +  '"style="width: 18rem;">').appendTo(".card-group");
                    $('<img style="width: 18rem; height: 18rem;" src="' + img.imageUrl + '">').appendTo(".card" + index );
                    $('<div class="card-body"><h5 class="card-title">Title: ' + img.title + '</h5>').appendTo(".card" + index);
                    $('<h5 class="card-title">Author: ' + img.auth_name + '</h5>').appendTo(".card" + index);
                    $('<p class="card-text">Price: ' + img.price + '</p></div>').appendTo(".card" + index);
                    $('<input type="hidden" class="bookID" value="' + img.books_id + '">').appendTo(".card" + index);
                    $('<button class="btn btn-grad addToCart" type="button"><i class="fas fa-shopping-cart"></i>Add to Cart</button>').appendTo(".card" + index);
                });
                let name = "";
                if (data.length == 1) { 
                    name = data[0].title;
                }
                else if (genre) { 
                    name = data[0].genre;
                }
                else if (author) { 
                    name = data[0].author;
                }

                $("#countItems").html("Number of " + name + " books: " + data.length);
                form[0].reset();
            }
        });
    })

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