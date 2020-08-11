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
                console.log(result.status);
            }
        });
        
    }
    
    function loadCart(){
        var passCart = JSON.parse(localStorage.getItem("cart"));
        $.ajax({
           method: "GET",
           url: "/cartContents",
           data: {
               cart: passCart
           },
           success: function (result, status){
               $("#cart").html(result);
           }
        });
    }
    loadCart();
    
    $(".btnAddToCart").click(function(e){
        console.log(e.target.id);
        addToCart(e.target.id);
        console.log(localStorage.cartSize);
    });
    
    function addToCart(idToAdd){
        var tempCart = [];
        if(typeof(Storage) !== "undefined"){
            if(localStorage.cartSize){
                if(localStorage.cart){
                    tempCart = JSON.parse(localStorage.getItem("cart"));
                    tempCart[localStorage.cartSize] = idToAdd;
                    localStorage.cartSize = Number(localStorage.cartSize)+1;
                    localStorage.setItem("cart", JSON.stringify(tempCart));
                    console.log("item added");
                }
            } else {
                tempCart[0] = idToAdd;
                localStorage.setItem("cartSize", 1);
                localStorage.setItem("cart", JSON.stringify(tempCart));
                console.log("cart created");
            }
        }
    }
    
    /*
    $("#btnRemoveFromCart").click (function(){
        removeFromCart();
    });
    
    function removeFromCart(){
        
    }
    */
});